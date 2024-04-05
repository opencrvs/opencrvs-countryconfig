#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

for i in "$@"; do
  case $i in
  --backup_root_path=*)
    ROOT_PATH="${i#*=}"
    shift
    ;;
  *) ;;
  esac
done

if [ -z "$ROOT_PATH" ]; then
  ROOT_PATH="/data"
fi

# Cleanup any old backups from datastores. Keep previous 7 days of data and all elastic data
# Elastic snapshots require a random selection of files in the data/backups/elasticsearch/indices
# folder
#------------------------------------------------------------------------------------------------

# Allow deletion of dirs for influx as we maintain subdirs per day for it
find $ROOT_PATH/backups/influxdb -mindepth 1 -mtime +7 -exec rm -rf {} \;
find $ROOT_PATH/backups/mongo -mindepth 1 -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/minio -mindepth 1 -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/metabase -mindepth 1 -mtime +7 -exec rm {} \;
find $ROOT_PATH/backups/vsexport -mindepth 1 -mtime +7 -exec rm {} \;
