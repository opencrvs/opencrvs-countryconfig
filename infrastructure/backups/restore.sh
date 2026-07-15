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
# This script clears all data and restores a specific day's data.  It is irreversable, so use with caution.
#------------------------------------------------------------------------------------------------------------------

set -e

if docker service ls > /dev/null 2>&1; then
  IS_LOCAL=false
else
  IS_LOCAL=true
fi

# Reading Named parameters
for i in "$@"; do
  case $i in
  --replicas=*)
    REPLICAS="${i#*=}"
    shift
    ;;
  --label=*)
    LABEL="${i#*=}"
    shift
    ;;
  *) ;;
  esac
done

print_usage_and_exit() {
  echo 'Usage: ./restore.sh --replicas=XXX'
  echo "This script CLEARS ALL DATA and RESTORES A SPECIFIC DAY'S or label's data. This process is irreversible, so USE WITH CAUTION."
  echo "Script must receive a label parameter to restore data from that specific day in format +%Y-%m-%d i.e. 2019-01-01 or that label"
  echo "The Hearth, Events and User db backup zips you would like to restore from: hearth-dev-{label}.gz, events-{label}.gz, user-mgnt-{label}.gz must exist in /data/backups/mongo/ folder"
  echo ""
  echo "If your MongoDB is password protected, an admin user's credentials can be given as environment variables:"
  echo "MONGODB_ADMIN_USER=your_user MONGODB_ADMIN_PASSWORD=your_pass"
  exit 1
}

if [ -z "$LABEL" ]; then
  LABEL=$(date +%Y-%m-%d)
fi

# Check if REPLICAS is a number and greater than 0
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]]; then
  echo "Script must be passed a positive integer number of replicas"
  exit 1
fi

if [ "$IS_LOCAL" = false ]; then
  ROOT_PATH=${ROOT_PATH:-/data}

  if [ -z "$REPLICAS" ]; then
    echo "Error: Argument for the --replicas is required."
    print_usage_and_exit
  fi
  # In this example, we load the MONGODB_ADMIN_USER, MONGODB_ADMIN_PASSWORD, POSTGRES_USER & POSTGRES_PASSWORD database access secrets from a file.
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

# Select docker network and replica set in production
#----------------------------------------------------
if [ "$IS_LOCAL" = true ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in local environment"
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

#####
#
#
#
# CLEAR ALL DATA
#
#
#
#####


##
# ------ MINIO -------
##


rm -rf $ROOT_PATH/minio/ocrvs
mkdir -p $ROOT_PATH/minio/ocrvs

##
# ------ VSEXPORTS -------
##

rm -rf $ROOT_PATH/vsexport
mkdir -p $ROOT_PATH/vsexport

##
# ------ MONGODB -------
##

# Delete all data from Hearth, Events, User and any other service related Mongo databases
#-----------------------------------------------------------------------------------

docker run --rm --network=$NETWORK mongo:4.4 mongo $(mongo_credentials) --host $HOST --eval "\
db.getSiblingDB('hearth-dev').dropDatabase();\
db.getSiblingDB('events').dropDatabase();\
db.getSiblingDB('user-mgnt').dropDatabase();\
db.getSiblingDB('metrics').dropDatabase();\
db.getSiblingDB('performance').dropDatabase();"

##
# ------ POSTGRESQL -------
##

# Check if PostgreSQL backup exists before dropping database
if [ -f "$ROOT_PATH/backups/postgres/events-${LABEL}.dump" ]; then
  echo "PostgreSQL backup found. Dropping existing events database..."
  docker run --rm \
    -e PGPASSWORD=$POSTGRES_PASSWORD \
    --network=$NETWORK \
    postgres:17.6 \
    bash -c "psql -h postgres -U $POSTGRES_USER -c 'DROP DATABASE IF EXISTS events WITH (FORCE);'"
else
  echo "PostgreSQL backup not found for label ${LABEL}. Skipping PostgreSQL database drop..."
fi

#####
#
#
#
# RESTORE FROM BACKUP
#
#
#
#####

##
# ------ MONGODB -------
##

# Restore all data from a backup into Hearth, Events, User and any other service related Mongo databases
#--------------------------------------------------------------------------------------------------
docker run --rm -v $ROOT_PATH/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
-c "for db in hearth-dev events user-mgnt metrics performance; \
      do mongorestore $(mongo_credentials) --host $HOST --drop --gzip --archive=/data/backups/mongo/\${db}-$LABEL.gz; \
    done"

##
# ------ POSTGRESQL -------
##

# Check if PostgreSQL backup exists before restoring
if [ -f "$ROOT_PATH/backups/postgres/events-${LABEL}.dump" ]; then
  echo "PostgreSQL backup found. Restoring PostgreSQL 'events' database..."
  docker run --rm \
    -e PGPASSWORD=$POSTGRES_PASSWORD \
    -v $ROOT_PATH/backups/postgres:/backups \
    --network=$NETWORK \
    postgres:17.6 \
    bash -c "createdb -h postgres -U $POSTGRES_USER events && \
             psql -h postgres -U $POSTGRES_USER -d events -c 'CREATE SCHEMA app AUTHORIZATION events_migrator; GRANT USAGE ON SCHEMA app TO events_app;' && \
             pg_restore -h postgres -U $POSTGRES_USER -d events --schema=app /backups/events-${LABEL}.dump"
  echo "Update credentials in Postgres on restore"
  docker service update --force opencrvs_postgres-on-update
else
  echo "PostgreSQL backup not found for label ${LABEL}. Skipping PostgreSQL database restore..."
fi

##
# ------ MINIO -----
##
tar -xzvf $ROOT_PATH/backups/minio/ocrvs-$LABEL.tar.gz -C $ROOT_PATH/minio

# Restart minio again so it picks up the updated files
docker service update --force opencrvs_minio

##
# ------ VSEXPORT -----
##
tar -xzvf $ROOT_PATH/backups/vsexport/ocrvs-$LABEL.tar.gz -C $ROOT_PATH/vsexport

# Run migrations by restarting migration service
if [ "$IS_LOCAL" = false ]; then
  docker service update --force --update-parallelism 1 opencrvs_migration
fi

##
# ------ REINDEX -----
##
docker run --rm \
  -v /opt/opencrvs/infrastructure/deployment:/workspace \
  -w /workspace \
  --network $NETWORK \
  -e 'AUTH_URL=http://auth:4040/' \
  -e 'EVENTS_URL=http://events:5555/' \
  alpine \
  sh -c 'apk add --no-cache curl jq && sh reindex.sh'