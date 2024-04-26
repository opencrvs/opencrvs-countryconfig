#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#------------------------------------------------------------------------------------------------------------------
# By default OpenCRVS saves a backup of all data on a cron job every day in case of an emergency data loss incident
# This cron job is already configured in the Ansible playbook.yml in the infrastructure > server-setup directory.
# Change SSH connection settings and IPs to suit your deployment, and re-run the Ansible script to update.
# A label string i.e. 'v1.0.1' can also be provided to the script to be appended to the filenames
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
  --remote_dir=*)
    REMOTE_DIR="${i#*=}"
    shift
    ;;
  --replicas=*)
    REPLICAS="${i#*=}"
    shift
    ;;
  --label=*)
    LABEL="${i#*=}"
    shift
    ;;
  --passphrase=*)
    PASSPHRASE="${i#*=}"
    shift
    ;;
  *) ;;
  esac
done

print_usage_and_exit() {
  echo 'Usage: ./backup.sh --passphrase=XXX --ssh_user=XXX --ssh_host=XXX --ssh_port=XXX --remote_dir=XXX --replicas=XXX --label=XXX'
  echo "Script must receive SSH details and a target directory of a remote server to copy backup files to."
  echo "Optionally a LABEL i.e. 'v1.0.1' can be provided to be appended to the backup file labels"
  echo "7 days of backup data will be retained in the manager node"
  echo ""
  echo "If your MongoDB is password protected, an admin user's credentials can be given as environment variables:"
  echo "MONGODB_ADMIN_USER=your_user MONGODB_ADMIN_PASSWORD=your_pass"
  echo ""
  echo "If your Elasticsearch is password protected, an admin user's credentials can be given as environment variables:"
  echo "ELASTICSEARCH_ADMIN_USER=your_user ELASTICSEARCH_ADMIN_PASSWORD=your_pass"
  exit 1
}

# Check if REPLICAS is a number and greater than 0
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]]; then
  echo "Script must be passed a positive integer number of replicas"
  exit 1
fi

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
  if [ -z "$REMOTE_DIR" ]; then
    echo "Error: Argument for the --remote_dir is required."
    print_usage_and_exit
  fi
  if [ -z "$REPLICAS" ]; then
    echo "Error: Argument for the --replicas is required."
    print_usage_and_exit
  fi
  if [ -z "$PASSPHRASE" ]; then
    echo "Error: Argument for the --passphrase is required."
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

# Find and remove all empty subdirectories under the top-level directories
for BACKUP_DIR in $ROOT_PATH/backups/*; do
  if [ -d "$BACKUP_DIR" ]; then
    rm -rf $BACKUP_DIR/*
  fi
done

mkdir -p $ROOT_PATH/backups/elasticsearch
mkdir -p $ROOT_PATH/backups/elasticsearch/indices
mkdir -p $ROOT_PATH/backups/influxdb
mkdir -p $ROOT_PATH/backups/mongo
mkdir -p $ROOT_PATH/backups/minio
mkdir -p $ROOT_PATH/backups/metabase
mkdir -p $ROOT_PATH/backups/vsexport
mkdir -p $ROOT_PATH/backups/metabase

# This enables root-created directory to be writable by the docker user
chown -R 1000:1000 $ROOT_PATH/backups

# This might not exist if project is empty
mkdir -p $ROOT_PATH/metabase
chown -R 1000:1000 $ROOT_PATH/metabase


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
else
  NETWORK=opencrvs_overlay_net
  # Construct the HOST string rs0/mongo1,mongo2... based on the number of replicas
  HOST="rs0/"
  for (( i=1; i<=REPLICAS; i++ )); do
    if [ $i -gt 1 ]; then
      HOST="${HOST},"
    fi
    HOST="${HOST}mongo${i}"
  done
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

# Do not include OpenHIM transactions for local snapshots
excluded_collections() {
  if [ "$IS_LOCAL" = true ]; then
    echo "--excludeCollection=transactions"
  else
    echo ""
  fi
}

# Today's date is used for filenames if LABEL is not provided
#-----------------------------------
BACKUP_DATE=$(date +%Y-%m-%d)
REMOTE_DIR="$REMOTE_DIR/${LABEL:-$BACKUP_DATE}"

# Backup Hearth, OpenHIM, User, Application-config and any other service related Mongo databases into a mongo sub folder
# ---------------------------------------------------------------------------------------------
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d hearth-dev --gzip --archive=/data/backups/mongo/hearth-dev-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d openhim-dev $(excluded_collections) --gzip --archive=/data/backups/mongo/openhim-dev-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d user-mgnt --gzip --archive=/data/backups/mongo/user-mgnt-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d application-config --gzip --archive=/data/backups/mongo/application-config-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d metrics --gzip --archive=/data/backups/mongo/metrics-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d webhooks --gzip --archive=/data/backups/mongo/webhooks-${LABEL:-$BACKUP_DATE}.gz"
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
  -c "mongodump $(mongo_credentials) --host $HOST -d performance --gzip --archive=/data/backups/mongo/performance-${LABEL:-$BACKUP_DATE}.gz"


#-------------------------------------------------------------------------------------

echo ""
echo "Delete all currently existing snapshots"
echo ""
docker run --rm --network=$NETWORK appropriate/curl curl -a -X DELETE -H "Content-Type: application/json;charset=UTF-8" "http://$(elasticsearch_host)/_snapshot/ocrvs"

#-------------------------------------------------------------------------------------
echo ""
echo "Register backup folder as an Elasticsearch repository for backing up the search data"
echo ""

create_elasticsearch_snapshot_repository() {
  OUTPUT=$(docker run --rm --network=$NETWORK appropriate/curl curl -s -X PUT -H "Content-Type: application/json;charset=UTF-8" "http://$(elasticsearch_host)/_snapshot/ocrvs" -d '{ "type": "fs", "settings": { "location": "/data/backups/elasticsearch", "compress": true }}' 2>/dev/null)
  while [ "$OUTPUT" != '{"acknowledged":true}' ]; do
    echo "Failed to register backup folder as an Elasticsearch repository. Trying again in..."
    sleep 1
    create_elasticsearch_snapshot_repository
  done
}

create_elasticsearch_snapshot_repository

#---------------------------------------------------------------------------------

echo ""
echo "Backup Elasticsearch as a set of snapshot files into an elasticsearch sub folder"
echo ""

create_elasticsearch_backup() {
  OUTPUT=""
  OUTPUT=$(docker run --rm --network=$NETWORK appropriate/curl curl -s -X PUT -H "Content-Type: application/json;charset=UTF-8" "http://$(elasticsearch_host)/_snapshot/ocrvs/snapshot_${LABEL:-$BACKUP_DATE}?wait_for_completion=true&pretty" -d '{ "indices": "ocrvs" }' 2>/dev/null)
  if echo $OUTPUT | jq -e '.snapshot.state == "SUCCESS"' > /dev/null; then
    echo "Snapshot state is SUCCESS"
  else
    echo $OUTPUT
    echo "Failed to backup Elasticsearch. Trying again in..."
    create_elasticsearch_backup
  fi
}

create_elasticsearch_backup

# If required, SSH into the node running the opencrvs_metrics container and backup the metrics data into an influxdb subfolder
#-----------------------------------------------------------------------------------------------------------------------------

if [ "$IS_LOCAL" = true ]; then
  INFLUXDB_CONTAINER_ID=$(docker ps -aqf "name=influxdb")
  echo "Backing up Influx locally $INFLUXDB_CONTAINER_ID"
  docker exec $INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /home/user/${LABEL:-$BACKUP_DATE}
  docker cp $INFLUXDB_CONTAINER_ID:/home/user/${LABEL:-$BACKUP_DATE} $ROOT_PATH/backups/influxdb/${LABEL:-$BACKUP_DATE}
else
  echo "Backing up Influx in remote environment"
  docker run --rm -v $ROOT_PATH/backups/influxdb/${LABEL:-$BACKUP_DATE}:/backup --network=$NETWORK influxdb:1.8.0 influxd backup -portable -host influxdb:8088 /backup
fi

echo "Creating a backup for Minio"

LOCAL_MINIO_BACKUP=$ROOT_PATH/backups/minio/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz
cd $ROOT_PATH/minio && tar -zcvf $LOCAL_MINIO_BACKUP . && cd /

echo "Creating a backup for Metabase"

LOCAL_METABASE_BACKUP=$ROOT_PATH/backups/metabase/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz
cd $ROOT_PATH/metabase && tar -zcvf $LOCAL_METABASE_BACKUP . && cd /

echo "Creating a backup for VSExport"

LOCAL_VSEXPORT_BACKUP=$ROOT_PATH/backups/vsexport/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz
cd $ROOT_PATH/vsexport && tar -zcvf $LOCAL_VSEXPORT_BACKUP . && cd /

if [[ "$IS_LOCAL" = true ]]; then
  echo $WORKING_DIR
  cd $ROOT_PATH/backups && tar -zcvf $WORKING_DIR/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz .
  exit 0
fi

# Copy the backups to an offsite server in production
#----------------------------------------------------

# Create a temporary directory to store the backup files before packaging
BACKUP_RAW_FILES_DIR=/tmp/backup-${LABEL:-$BACKUP_DATE}/
mkdir -p $BACKUP_RAW_FILES_DIR

# Copy full directories to the temporary directory
cp -r $ROOT_PATH/backups/elasticsearch/ $BACKUP_RAW_FILES_DIR/elasticsearch/
cp -r $ROOT_PATH/backups/influxdb/${LABEL:-$BACKUP_DATE} $BACKUP_RAW_FILES_DIR/influxdb/


mkdir -p $BACKUP_RAW_FILES_DIR/minio/ && cp $ROOT_PATH/backups/minio/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz $BACKUP_RAW_FILES_DIR/minio/
mkdir -p $BACKUP_RAW_FILES_DIR/metabase/ && cp $ROOT_PATH/backups/metabase/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz $BACKUP_RAW_FILES_DIR/metabase/
mkdir -p $BACKUP_RAW_FILES_DIR/vsexport/ && cp $ROOT_PATH/backups/vsexport/ocrvs-${LABEL:-$BACKUP_DATE}.tar.gz $BACKUP_RAW_FILES_DIR/vsexport/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/hearth-dev-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/user-mgnt-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/openhim-dev-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/application-config-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/metrics-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/webhooks-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/
mkdir -p $BACKUP_RAW_FILES_DIR/mongo/ && cp $ROOT_PATH/backups/mongo/performance-${LABEL:-$BACKUP_DATE}.gz $BACKUP_RAW_FILES_DIR/mongo/

tar -czf /tmp/${LABEL:-$BACKUP_DATE}.tar.gz -C "$BACKUP_RAW_FILES_DIR" .

openssl enc -aes-256-cbc -salt -pbkdf2 -in /tmp/${LABEL:-$BACKUP_DATE}.tar.gz -out /tmp/${LABEL:-$BACKUP_DATE}.tar.gz.enc -pass pass:$PASSPHRASE

if [ "$IS_LOCAL" = false ]; then
  set +e
  rsync -a -r --rsync-path="mkdir -p $REMOTE_DIR/ && rsync" --progress --rsh="ssh -o StrictHostKeyChecking=no -p $SSH_PORT" /tmp/${LABEL:-$BACKUP_DATE}.tar.gz.enc $SSH_USER@$SSH_HOST:$REMOTE_DIR/
  if [ $? -eq 0 ]; then
    echo "Copied backup files to remote server."
  fi
  set -e
fi

rm /tmp/${LABEL:-$BACKUP_DATE}.tar.gz.enc
rm /tmp/${LABEL:-$BACKUP_DATE}.tar.gz
rm -r $BACKUP_RAW_FILES_DIR

