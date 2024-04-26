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
# Create a temporary directory and assign the path to BACKUP_FILES_PATH
BACKUP_FILES_PATH=$(mktemp -d)
FINAL_BACKUP_FILENAME=$(date +"%Y-%m-%d_%H-%M-%S")

OUT="$FINAL_BACKUP_FILENAME.tar.gz"


if docker node ls > /dev/null 2>&1; then
  IS_LOCAL=false
  IS_PRODUCTION=true
else
  REPLICAS="0"
  IS_LOCAL=true
  IS_PRODUCTION=false
fi

# Reading Named parameters
for i in "$@"; do
  case $i in
  --replicas=*)
    REPLICAS="${i#*=}"
    shift
    ;;
  --passphrase=*)
    PASSPHRASE="${i#*=}"
    shift
    ;;
  --out=*)
    OUT="${i#*=}"
    shift
    ;;
  *) ;;
  esac
done

print_usage_and_exit() {
  echo 'Usage: ./backup.sh --replicas=XXX'
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

if [ "$IS_PRODUCTION" = true ]; then
  if [ -z "$REPLICAS" ]; then
    echo "Error: Argument for the --replicas is required."
    print_usage_and_exit
  fi

  # Check if REPLICAS is a number and greater than 0
  if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]]; then
    echo "Script must be passed a positive integer number of replicas"
    exit 1
  fi

  if [ -z "$PASSPHRASE" ]; then
    echo "Error: Argument for the --passphrase is required."
    print_usage_and_exit
  fi
fi


echo "Backup files path: $BACKUP_FILES_PATH"
echo "Data path: $BACKUP_FILES_PATH"


# Select docker network and replica set in production
#----------------------------------------------------
if [ "$IS_LOCAL" = true ] || [ "$REPLICAS" = "0" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in a local environment"
else
  # Construct the HOST string rs0/mongo1,mongo2... based on the number of replicas
  HOST="rs0/"
  NETWORK=opencrvs_overlay_net
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

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m          MONGODB          \e[0m"
echo -e "\e[33m---------------------------\e[0m"

mkdir -p $BACKUP_FILES_PATH/mongo

docker run --rm -v $BACKUP_FILES_PATH/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash -c \
  "function get_databases() {
     mongo $(mongo_credentials) --host $HOST --quiet --eval \"db.adminCommand('listDatabases').databases.map(db => db.name).filter(name => !['admin', 'local', 'config'].includes(name)).join(' ')\"
   }
   databases=\$(get_databases)
   for db in \$databases; do
     mongodump $(mongo_credentials) --host $HOST -d \$db --gzip --archive=/data/backups/mongo/\${db}-\${LABEL:-\$(date +%Y%m%d%H%M%S)}.gz
   done"

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m       ELASTICSEARCH       \e[0m"
echo -e "\e[33m---------------------------\e[0m"

mkdir -p $BACKUP_FILES_PATH/elasticsearch
docker run --rm \
  -v $BACKUP_FILES_PATH/elasticsearch:/data \
  --network=$NETWORK \
  elasticdump/elasticsearch-dump --input=http://$(elasticsearch_host)/ocrvs --output=/data/ocrvs.json --type=data

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m          INFLUXDB         \e[0m"
echo -e "\e[33m---------------------------\e[0m"

mkdir -p $BACKUP_FILES_PATH/influxdb
docker run --rm \
  --network=$NETWORK \
  -v $BACKUP_FILES_PATH/influxdb:/var/lib/influxdb/backup \
  influxdb:1.8.10 influxd backup -database ocrvs -host influxdb:8088 /var/lib/influxdb/backup

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m           MINIO           \e[0m"
echo -e "\e[33m---------------------------\e[0m"

mkdir -p $BACKUP_FILES_PATH/minio
container_id=$(docker ps --filter "name=minio" --format "{{.ID}} {{.Names}}" | grep -v "minio-mc" | grep "minio" | awk '{print $1}')

if [ -z "$container_id" ]; then
  echo "No MinIO container found that matches the criteria."
  exit 1
else
  echo "Found MinIO container with ID: $container_id"
fi

docker cp "$container_id:/data" "$BACKUP_FILES_PATH/minio"

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m         METABASE          \e[0m"
echo -e "\e[33m---------------------------\e[0m"

container_id=$(docker ps --filter "name=metabase" --format "{{.ID}}")

if [ -z "$container_id" ]; then
  echo "No Metabase container found that matches the criteria."

  if [ "$IS_LOCAL" = false ]; then
    exit 1
  fi
  echo "Continuing with the backup process as this is a local environment"
else
  mkdir -p $BACKUP_FILES_PATH/metabase
  echo "Found Metabase container with ID: $container_id"
  docker cp "$container_id:/data" "$BACKUP_FILES_PATH/metabase"
fi

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m         VSEXPORTS         \e[0m"
echo -e "\e[33m---------------------------\e[0m"

container_id=$(docker ps --filter "name=metrics" --format "{{.ID}}")

if [ -z "$container_id" ]; then
  echo "No Metrics container found that matches the criteria."
  if [ "$IS_LOCAL" = false ]; then
    exit 1
  fi
  echo "Continuing with the backup process as this is a local environment"
else
  echo "Found Metrics container with ID: $container_id"
  mkdir -p $BACKUP_FILES_PATH/vsexport
  docker cp "$container_id:/usr/src/app/packages/metrics/src/scripts" "$BACKUP_FILES_PATH/vsexport"
fi

echo
echo -e "\e[33m---------------------------\e[0m"
echo -e "\e[33m   INTEGRITY VERIFICATION  \e[0m"
echo -e "\e[33m---------------------------\e[0m"

du -s $BACKUP_FILES_PATH/* | while read -r size dir; do
  if [ $size -gt 0 ]; then
    echo "✅ Directory '$(basename $dir)' is not empty"
  else
    echo "❌ Directory '$(basename $dir)' is has no content"
    exit 1
  fi
done

TEMPORARY_BACKUP_FILENAME=$(mktemp)


# Package all files to a temporary file
tar -czf $TEMPORARY_BACKUP_FILENAME -C $BACKUP_FILES_PATH .

if [ -v PASSPHRASE ]; then
  echo
  echo "🔒 Encrypting backup file"
  # Encrypt file and write it to the current directory
  openssl enc -aes-256-cbc -salt -pbkdf2 -in $TEMPORARY_BACKUP_FILENAME -out $OUT -pass pass:$PASSPHRASE
else
  mv $TEMPORARY_BACKUP_FILENAME $OUT
fi
echo
echo "Backup completed successfully. File written to $OUT"

rm $TEMPORARY_BACKUP_FILENAME
rm -r $BACKUP_FILES_PATH