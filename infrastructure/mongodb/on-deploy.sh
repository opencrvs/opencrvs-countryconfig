
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# This file is run on each deployment with the sole purpose of updating
# passwords of MongoDB users to passwords given to this service as environment varibles

apt-get update
apt-get install -y curl

curl -L https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait --output /wait
chmod +x /wait

# Check if REPLICAS is a number and greater than 0
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]] || [ "$REPLICAS" -lt 1 ]; then
  echo "Script must be passed a positive integer number of replicas"
  exit 1
fi

# Initialize WAIT_HOSTS
WAIT_HOSTS=""

# Construct the WAIT_HOSTS string based on the number of replicas
for (( i=1; i<=REPLICAS; i++ )); do
  if [ $i -gt 1 ]; then
    WAIT_HOSTS="${WAIT_HOSTS},"
  fi
  WAIT_HOSTS="${WAIT_HOSTS}mongo${i}:27017"
done


mongo_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
  else
    echo "";
  fi
}

# Construct the members array based on the number of replicas
# The output is a JSON array with the following format:
# [{_id:0,host:"mongo1:27017"},{_id:1,host:"mongo2:27017"},...]

MEMBERS="["
for (( i=1; i<=REPLICAS; i++ )); do
  if [ $i -gt 1 ]; then
    MEMBERS="${MEMBERS},"
  fi
  MEMBERS="${MEMBERS}{_id:$(($i - 1)),host:\"mongo${i}:27017\"}"
done
MEMBERS="${MEMBERS}]"

# Initiate the replica set
mongo $(mongo_credentials) --host mongo1 --eval "rs.initiate({_id:\"rs0\",members:${MEMBERS}})"

# Construct the HOST string rs0/mongo1,mongo2... based on the number of replicas
HOST="rs0/"
for (( i=1; i<=REPLICAS; i++ )); do
  if [ $i -gt 1 ]; then
    HOST="${HOST},"
  fi
  HOST="${HOST}mongo${i}"
done


function checkIfUserExists {
  local user=$1
  local JSON="{\"user\": \"$user\"}"
  CMD='mongo admin --host $HOST $(mongo_credentials) --quiet --eval "db.getCollection(\"system.users\").find($JSON).length() > 0 ? \"FOUND\" : \"NOT_FOUND\""'
  eval $CMD
}

# Rotate passwords to match the ones given to this script or create new users

CONFIG_USER=$(echo $(checkIfUserExists "config"))
if [[ $CONFIG_USER != "FOUND" ]]; then
  echo "config user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use application-config
  db.createUser({
    user: 'config',
    pwd: '$CONFIG_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'application-config' }]
  })
EOF
else
  echo "config user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use application-config
  db.updateUser('config', {
    pwd: '$CONFIG_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'application-config' }]
  })
EOF
fi

HEARTH_USER=$(echo $(checkIfUserExists "hearth"))
if [[ $HEARTH_USER != "FOUND" ]]; then
  echo "hearth user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use hearth-dev
  db.createUser({
    user: 'hearth',
    pwd: '$HEARTH_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'hearth' }, { role: 'readWrite', db: 'performance' }, { role: 'readWrite', db: 'hearth-dev' }]
  })
EOF
else
  echo "hearth user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use hearth-dev
  db.updateUser('hearth', {
    pwd: '$HEARTH_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'hearth' }, { role: 'readWrite', db: 'performance' }, { role: 'readWrite', db: 'hearth-dev' }]
  })
EOF
fi

USER_MGNT_USER=$(echo $(checkIfUserExists "user-mgnt"))
if [[ $USER_MGNT_USER != "FOUND" ]]; then
  echo "user-mgnt user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use user-mgnt
  db.createUser({
    user: 'user-mgnt',
    pwd: '$USER_MGNT_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'user-mgnt' }]
  })
EOF
else
  echo "user-mgnt user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use user-mgnt
  db.updateUser('user-mgnt', {
    pwd: '$USER_MGNT_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'user-mgnt' }]
  })
EOF
fi

OPENHIM_USER=$(echo $(checkIfUserExists "openhim"))
if [[ $OPENHIM_USER != "FOUND" ]]; then
  echo "openhim user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use openhim-dev
  db.createUser({
    user: 'openhim',
    pwd: '$OPENHIM_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'openhim' }, { role: 'readWrite', db: 'openhim-dev' }]
  })
EOF
else
  echo "openhim user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use openhim-dev
  db.updateUser('openhim', {
    pwd: '$OPENHIM_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'openhim' }, { role: 'readWrite', db: 'openhim-dev' }]
  })
EOF
fi

PERFORMANCE_USER=$(echo $(checkIfUserExists "performance"))
if [[ $PERFORMANCE_USER != "FOUND" ]]; then
  echo "performance user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use performance
  db.createUser({
    user: 'performance',
    pwd: '$PERFORMANCE_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'performance' }]
  })
EOF
else
  echo "performance user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use performance
  db.updateUser('performance', {
    pwd: '$PERFORMANCE_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'performance' }]
  })
EOF
fi

METRICS_USER=$(echo $(checkIfUserExists "metrics"))
if [[ $METRICS_USER != "FOUND" ]]; then
  echo "metrics user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use metrics
  db.createUser({
    user: 'metrics',
    pwd: '$METRICS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'metrics' }]
  })
EOF
else
  echo "metrics user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use metrics
  db.updateUser('metrics', {
    pwd: '$METRICS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'metrics' }]
  })
EOF
fi

WEBHOOKS_USER=$(echo $(checkIfUserExists "webhooks"))
if [[ $WEBHOOKS_USER != "FOUND" ]]; then
  echo "webhooks user not found"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use webhooks
  db.createUser({
    user: 'webhooks',
    pwd: '$WEBHOOKS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'webhooks' }]
  })
EOF
else
  echo "webhooks user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use webhooks
  db.updateUser('webhooks', {
    pwd: '$WEBHOOKS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'webhooks' }]
  })
EOF
fi
