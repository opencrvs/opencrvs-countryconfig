# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

#------------------------------------------------------------------------------------------------------------------
# By default OpenCRVS saves a backup of all data on a cron job every day in case of an emergency data loss incident
# This cron job is already configured in the Ansible playbook.yml in the infrastructure > server-setup directory.
# Change SSH connection settings and IPs to suit your deployment, and re-run the Ansible script to update.
# A version string i.e. 'v1.0.1' can also be provided to the script to be appended to the filenames
#------------------------------------------------------------------------------------------------------------------
set -e

WORKING_DIR=$(pwd)

if docker service ls > /dev/null 2>&1; then
  IS_LOCAL=false
else
  IS_LOCAL=true
fi

# Reading Named parameters
for i in "$@"; do
  case $i in
  --ssh_user=*)
    SSH_USER="${i#*=}"
    shift
    ;;
  --ssh_host=*)
    SSH_HOST="${i#*=}"
    shift
    ;;
  --ssh_port=*)
    SSH_PORT="${i#*=}"
    shift
    ;;
  --production_ip=*)
    PRODUCTION_IP="${i#*=}"
    shift
    ;;
  --remote_dir=*)
    REMOTE_DIR="${i#*=}"
    shift
    ;;
  --replicas=*)
    REPLICAS="${i#*=}"
    shift
    ;;
  --version=*)
    VERSION="${i#*=}"
    shift
    ;;
  *) ;;
  esac
done

print_usage_and_exit() {
  echo 'Usage: ./emergency-backup-metadata.sh --ssh_user=XXX --ssh_host=XXX --ssh_port=XXX --production_ip=XXX --remote_dir=XXX --replicas=XXX --version=XXX'
  echo "Script must receive SSH details and a target directory of a remote server to copy backup files to."
  echo "Optionally a VERSION i.e. 'v1.0.1' can be provided to be appended to the backup file labels"
  echo "7 days of backup data will be retained in the manager node"
  echo ""
  echo "If your MongoDB is password protected, an admin user's credentials can be given as environment variables:"
  echo "MONGODB_ADMIN_USER=your_user MONGODB_ADMIN_PASSWORD=your_pass"
  echo ""
  echo "If your Elasticsearch is password protected, an admin user's credentials can be given as environment variables:"
  echo "ELASTICSEARCH_ADMIN_USER=your_user ELASTICSEARCH_ADMIN_PASSWORD=your_pass"
  exit 1
}

if [ "$IS_LOCAL" = false ]; then
  ROOT_PATH=${ROOT_PATH:-/data}
  if [ -z "$SSH_USER" ]; then
    echo "Error: Argument for the --ssh_user is required."
    print_usage_and_exit
  fi
  if [ -z "$SSH_HOST" ]; then
    echo "Error: Argument for the --ssh_host is required."
    print_usage_and_exit
  fi
  if [ -z "$SSH_PORT" ]; then
    echo "Error: Argument for the --ssh_port is required."
    print_usage_and_exit
  fi
  if [ -z "$PRODUCTION_IP" ]; then
    echo "Error: Argument for the --production_ip is required."
    print_usage_and_exit
  fi
  if [ -z "$REMOTE_DIR" ]; then
    echo "Error: Argument for the --remote_dir is required."
    print_usage_and_exit
  fi
  if [ -z "$REPLICAS" ]; then
    echo "Error: Argument for the --replicas is required."
    print_usage_and_exit
  fi
  # In this example, we load the MONGODB_ADMIN_USER, MONGODB_ADMIN_PASSWORD, ELASTICSEARCH_ADMIN_USER & ELASTICSEARCH_ADMIN_PASSWORD database access secrets from a file.
  # We recommend that the secrets are served via a secure API from a Hardware Security Module
  source /data/secrets/opencrvs.secrets
else
  ROOT_PATH=${ROOT_PATH:-../opencrvs-core/data}

  if [ ! -d "$ROOT_PATH" ]; then
    echo "Error: ROOT_PATH ($ROOT_PATH) doesn't exist"
    print_usage_and_exit
  fi

  ROOT_PATH=$(cd "$ROOT_PATH" && pwd)
fi

mkdir -p $ROOT_PATH/backups/elasticsearch
mkdir -p $ROOT_PATH/backups/influxdb
mkdir -p $ROOT_PATH/backups/mongo
mkdir -p $ROOT_PATH/backups/minio
mkdir -p $ROOT_PATH/backups/metabase
mkdir -p $ROOT_PATH/backups/vsexport

# Select docker network and replica set in production
#----------------------------------------------------
if [ "$IS_LOCAL" = true ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in a local environment"
elif [ "$REPLICAS" = "0" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working with no replicas"
elif [ "$REPLICAS" = "1" ]; then
  HOST=rs0/mongo1
  NETWORK=opencrvs_overlay_net
  echo "Working with 1 replica"
elif [ "$REPLICAS" = "3" ]; then
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
  echo "Working with 3 replicas"
elif [ "$REPLICAS" = "5" ]; then
  HOST=rs0/mongo1,mongo2,mongo3,mongo4,mongo5
  NETWORK=opencrvs_overlay_net
  echo "Working with 5 replicas"
else
  echo "Script must be passed an understandable number of replicas: 0,1,3 or 5"
  exit 1
fi

mongo_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin"
  else
    echo ""
  fi
}

elasticsearch_host() {
  if [ ! -z ${ELASTICSEARCH_ADMIN_USER+x} ] || [ ! -z ${ELASTICSEARCH_ADMIN_PASSWORD+x} ]; then
    echo "$ELASTICSEARCH_ADMIN_USER:$ELASTICSEARCH_ADMIN_PASSWORD@elasticsearch:9200"
  else
    echo "elasticsearch:9200"
  fi
}

# Today's date is used for filenames if VERSION is not provided
#-----------------------------------
BACKUP_DATE=$(date +%Y-%m-%d)

# Backup Hearth, OpenHIM, User, Application-config and any other service related Mongo databases into a mongo sub folder
# ---------------------------------------------------------------------------------------------
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d hearth-dev --gzip --archive=/data/backups/mongo/hearth-dev-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d openhim-dev --gzip --archive=/data/backups/mongo/openhim-dev-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d user-mgnt --gzip --archive=/data/backups/mongo/user-mgnt-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d application-config --gzip --archive=/data/backups/mongo/application-config-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d metrics --gzip --archive=/data/backups/mongo/metrics-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d webhooks --gzip --archive=/data/backups/mongo/webhooks-${VERSION:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d performance --gzip --archive=/data/backups/mongo/performance-${VERSION:-$BACKUP_DATE}.gz"

# Register backup folder as an Elasticsearch repository for backing up the search data
#-------------------------------------------------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X PUT -H "Content-Type: application/json;charset=UTF-8" "http://$(elasticsearch_host)/_snapshot/ocrvs" -d '{ "type": "fs", "settings": { "location": "/data/backups/elasticsearch", "compress": true }}'

sleep 10
# Backup Elasticsearch as a set of snapshot files into an elasticsearch sub folder
#---------------------------------------------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X PUT -H "Content-Type: application/json;charset=UTF-8" "http://$(elasticsearch_host)/_snapshot/ocrvs/snapshot_${VERSION:-$BACKUP_DATE}?wait_for_completion=true&pretty" -d '{ "indices": "ocrvs" }'

# Get the container ID and host details of any running InfluxDB container, as the only way to backup is by using the Influxd CLI inside a running opencrvs_metrics container
#---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
if  [ "$IS_LOCAL" = true ]; then
  INFLUXDB_CONTAINER_ID=$(docker ps -aqf "name=influxdb")
else
  INFLUXDB_CONTAINER_ID=$(echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}')
  INFLUXDB_CONTAINER_NAME=$(echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}')
  INFLUXDB_HOSTNAME=$(echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}')
  INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
  INFLUXDB_SSH_USER=${INFLUXDB_SSH_USER:-root}
  OWN_IP=$(hostname -I | cut -d' ' -f1)
fi

# If required, SSH into the node running the opencrvs_metrics container and backup the metrics data into an influxdb subfolder
#-----------------------------------------------------------------------------------------------------------------------------

if [ "$IS_LOCAL" = true ]; then
  echo "Backing up Influx locally $INFLUXDB_CONTAINER_ID"
  docker exec $INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /home/user/${VERSION:-$BACKUP_DATE}
  docker cp $INFLUXDB_CONTAINER_ID:/home/user/${VERSION:-$BACKUP_DATE} $ROOT_PATH/backups/influxdb/${VERSION:-$BACKUP_DATE}
elif [[ "$OWN_IP" = "$INFLUXDB_HOST" ]]; then
  echo "Backing up Influx on own node"
  docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /home/user/${VERSION:-$BACKUP_DATE}
  docker cp $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/home/user/${VERSION:-$BACKUP_DATE} $ROOT_PATH/backups/influxdb/${VERSION:-$BACKUP_DATE}
else
  echo "Backing up Influx on other node $INFLUXDB_HOST"
  rsync -a -r --ignore-existing --progress --rsh="ssh -p$SSH_PORT" $ROOT_PATH/backups/influxdb $INFLUXDB_SSH_USER@$INFLUXDB_HOST:/data/backups/influxdb
  ssh $INFLUXDB_SSH_USER@$INFLUXDB_HOST "docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /home/user/${VERSION:-$BACKUP_DATE}"
  ssh $INFLUXDB_SSH_USER@$INFLUXDB_HOST "docker cp $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/home/user/${VERSION:-$BACKUP_DATE} /data/backups/influxdb/${VERSION:-$BACKUP_DATE}"
  echo "Replacing backup for influxdb on manager node with new backup"
  rsync -a -r --ignore-existing --progress --rsh="ssh -p$SSH_PORT" $INFLUXDB_SSH_USER@$INFLUXDB_HOST:/data/backups/influxdb $ROOT_PATH/backups/influxdb
fi

echo "Creating a backup for Minio"
mkdir -p $ROOT_PATH/backups/minio
cd $ROOT_PATH/minio && tar -zcvf $ROOT_PATH/backups/minio/ocrvs-${VERSION:-$BACKUP_DATE}.tar.gz . && cd /

echo "Creating a backup for Metabase"
mkdir -p $ROOT_PATH/backups/metabase
cd $ROOT_PATH/metabase && tar -zcvf $ROOT_PATH/backups/metabase/ocrvs-${VERSION:-$BACKUP_DATE}.tar.gz . && cd /

echo "Creating a backup for VSExport"
mkdir -p $ROOT_PATH/backups/vsexport
cd $ROOT_PATH/vsexport && tar -zcvf $ROOT_PATH/backups/vsexport/ocrvs-${VERSION:-$BACKUP_DATE}.tar.gz . && cd /

if [[ "$IS_LOCAL" = true ]]; then
  echo $WORKING_DIR
  cd $ROOT_PATH/backups && tar -zcvf $WORKING_DIR/ocrvs-${VERSION:-$BACKUP_DATE}.tar.gz .
  exit 0
fi

# Copy the backups to an offsite server in production
#----------------------------------------------------
if [[ "$OWN_IP" = "$PRODUCTION_IP" || "$OWN_IP" = "$(dig $PRODUCTION_IP +short)" ]]; then
  script -q -c "rsync -a -r --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/elasticsearch/ $SSH_USER@$SSH_HOST:$REMOTE_DIR/elasticsearch" && echo "Copied elasticsearch backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/minio/${VERSION:-$BACKUP_DATE} $SSH_USER@$SSH_HOST:$REMOTE_DIR/minio" && echo "Copied minio backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/metabase/${VERSION:-$BACKUP_DATE} $SSH_USER@$SSH_HOST:$REMOTE_DIR/metabase" && echo "Copied Metabase backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/influxdb/${VERSION:-$BACKUP_DATE} $SSH_USER@$SSH_HOST:$REMOTE_DIR/influxdb" && echo "Copied influx backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/hearth-dev-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied hearth backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/user-mgnt-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied user backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/openhim-dev-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied openhim backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/application-config-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied application-config backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/metrics-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied metrics backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/webhooks-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied webhooks backup files to remote server."
  script -q -c "rsync -a -r --ignore-existing --progress --rsh='ssh -p$SSH_PORT' $ROOT_PATH/backups/mongo/performance-${VERSION:-$BACKUP_DATE}.gz $SSH_USER@$SSH_HOST:$REMOTE_DIR/mongo" && echo "Copied performance backup files to remote server."
fi

# Cleanup any old backups from influx or mongo. Keep previous 7 days of data and all elastic data
# Elastic snapshots require a random selection of files in the data/backups/elasticsearch/indices
# folder
#------------------------------------------------------------------------------------------------
find $ROOT_PATH/backups/influxdb -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/mongo -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/minio -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/metabase -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/vsexport -mtime +7 -exec rm {} \;
