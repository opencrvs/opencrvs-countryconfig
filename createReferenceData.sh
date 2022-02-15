#! /bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

if [ -z "$1" ]
  then
    echo 'Error: Argument for the test users password for use in development only is required in position 1.'
    echo 'Error: Argument for environment code "DEV" or "PRODUCTION" is required in position 2.'
    echo 'Usage: db:populate {Test users password: e.g. "test"} {environment code "DEV" or "PRODUCTION"} '
    exit 1
fi

if [ -z "$2" ]
  then
    echo 'Error: Argument for environment code "DEV" or "PRODUCTION" is required in position 2.'
    echo 'Usage: db:populate {Test users password: e.g. "test"} {environment code "DEV" or "PRODUCTION"} '
    exit 1
fi

## Clear existing application data

HOST=mongo1
NETWORK=opencrvs_default

docker run --rm --network=$NETWORK mongo:3.6 mongo hearth-dev --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo user-mgnt --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v

docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v


## Populate new application data

ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/prepare-locations.ts
ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/assign-admin-structure-to-locations.ts
ts-node -r tsconfig-paths/register src/farajaland/features/facilities/scripts/prepare-source-facilities.ts
ts-node -r tsconfig-paths/register src/farajaland/features/facilities/scripts/assign-facilities-to-locations.ts
ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/add-statistical-data.ts
ts-node -r tsconfig-paths/register src/farajaland/features/employees/scripts/prepare-source-employees.ts
ts-node -r tsconfig-paths/register src/farajaland/features/employees/scripts/assign-employees-to-practitioners.ts -- $1 $2
ts-node -r tsconfig-paths/register src/farajaland/features/config/scripts/populate-default-config.ts