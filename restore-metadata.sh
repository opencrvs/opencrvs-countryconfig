# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
set -e

DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

if [ "$REPLICAS" = "0" ]; then
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
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
  else
    echo "";
  fi
}

docker run --rm -v $DIR/data/backups/prod-backups/mongo:/backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore $(mongo_credentials) --host $HOST --drop --gzip --archive=/backups/hearth-dev-$1.gz"

docker run --rm -v $DIR/data/backups/prod-backups/mongo:/backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore $(mongo_credentials) --host $HOST --drop --gzip --archive=/backups/openhim-dev-$1.gz"

docker run --rm -v $DIR/data/backups/prod-backups/mongo:/backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore $(mongo_credentials) --host $HOST --drop --gzip --archive=/backups/user-mgnt-$1.gz"

docker run --rm -v $DIR/data/backups/prod-backups/mongo:/backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore $(mongo_credentials) --host $HOST --drop --gzip --archive=/backups/application-config-$1.gz"

# Register backup folder as an Elasticsearch repository for restoring the search data
#-------------------------------------------------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -XPUT -H "Content-Type: application/json;charset=UTF-8" "http://elasticsearch:9200/_snapshot/ocrvs" -d '{ "type": "fs", "settings": { "location": "/Users/euanmillar/Clients/Plan/Development/opencrvs-farajaland/data/backups/prod-backups/elasticsearch", "compress": true }}'

# Restore all data from a backup into search
#-------------------------------------------

docker run --rm --network=$NETWORK appropriate/curl curl -X POST "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$1/_restore?pretty" -H 'Content-Type: application/json' -d '{ "indices": "ocrvs" }'

# Get the container ID and host details of any running InfluxDB container, as the only way to restore is by using the Influxd CLI inside a running opencrvs_metrics container
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
INFLUXDB_CONTAINER_ID=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'`
INFLUXDB_CONTAINER_NAME=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'`
INFLUXDB_HOSTNAME=`echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'`
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
INFLUXDB_SSH_USER=${INFLUXDB_SSH_USER:-root}

# If required, SSH into the node running the opencrvs_metrics container and restore the metrics data from an influxdb subfolder
#------------------------------------------------------------------------------------------------------------------------------
OWN_IP=`echo $(hostname -I | cut -d' ' -f1)`
if [[ "$OWN_IP" = "$INFLUXDB_HOST" ]]; then
  docker cp /Users/euanmillar/Clients/Plan/Development/opencrvs-farajaland/data/backups/prod-backups/influxdb/$1 $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/data/backups/influxdb/$1
  docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /data/backups/influxdb/$1
else
  scp -r /data/backups/influxdb $INFLUXDB_SSH_USER@$INFLUXDB_HOST:/data/backups/influxdb
  ssh $INFLUXDB_SSH_USER@$INFLUXDB_HOST "docker cp /data/backups/influxdb/$1 $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/data/backups/influxdb/$1 && docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /data/backups/influxdb/$1"
fi
