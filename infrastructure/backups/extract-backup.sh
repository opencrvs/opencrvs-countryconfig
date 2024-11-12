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
# This script downloads all the data based on --label (defaults to current day)
#------------------------------------------------------------------------------------------------------------------

set -e

for i in "$@"; do
    case $i in
    --label=*)
        LABEL="${i#*=}"
        shift
        ;;
    --backup_raw_files_dir=*)
        BACKUP_RAW_FILES_DIR="${i#*=}"
        shift
        ;;
    esac
done

print_usage_and_exit() {
    echo 'Usage: ./extract-backup.sh --label=XXX --backup_raw_files_dir=XXX'
    exit 1
}

if [ -z "$LABEL" ]; then
    echo "Error: Argument for --label is required."
    print_usage_and_exit
fi

if [ -z "$BACKUP_RAW_FILES_DIR" ]; then
    echo "Error: Argument for --backup_raw_files_dir is required."
    print_usage_and_exit
fi

mkdir -p $BACKUP_RAW_FILES_DIR/extract
tar -xvf $BACKUP_RAW_FILES_DIR/${LABEL}.tar.gz -C $BACKUP_RAW_FILES_DIR/extract

# Delete previous restore(s) and replace with the extracted backup
for BACKUP_DIR in /data/backups/*; do
    if [ -d "$BACKUP_DIR" ]; then
        sudo rm -rf $BACKUP_DIR/*
    fi
done

mv $BACKUP_RAW_FILES_DIR/extract/elasticsearch/* /data/backups/elasticsearch/
mv $BACKUP_RAW_FILES_DIR/extract/influxdb /data/backups/influxdb/${LABEL}
mv $BACKUP_RAW_FILES_DIR/extract/minio/ocrvs-${LABEL}.tar.gz /data/backups/minio/
mv $BACKUP_RAW_FILES_DIR/extract/metabase/ocrvs-${LABEL}.tar.gz /data/backups/metabase/
mv $BACKUP_RAW_FILES_DIR/extract/vsexport/ocrvs-${LABEL}.tar.gz /data/backups/vsexport/
mv $BACKUP_RAW_FILES_DIR/extract/mongo/* /data/backups/mongo/

echo "Data extracted successfully!"
