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

print_usage_and_exit () {
    echo 'Usage: ./restore-backup.sh --path_to_core=XXX'
    echo "This script restores OpenCRVS from a factory reset backup zip.  To run it you must pass the directory path to opencrvs-core."
    echo "cd into opencrvs-core and run the command pwd to get this value."
    echo "  --path_to_core must be subitted.  This is the path to your opencrvs-core directory with no trailing slash. E.G. /home/root/Documents/opencrvs-core"
    exit 1
}

for i in "$@"; do
  case $i in
    --path_to_core=*)
      path_to_core="${i#*=}"
      shift
      ;;
    -*|--*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      ;;
  esac
done

if [ -z $path_to_core ]; then
    echo "MISSING OR INCORRECT PARAMETER: --path_to_core"
    echo
    print_usage_and_exit
fi

DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_default mongo:4.4 bash \
 -c "mongorestore --host mongo1 --drop --gzip --archive=/backups/hearth-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_default mongo:4.4 bash \
 -c "mongorestore --host mongo1 --drop --gzip --archive=/backups/openhim-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_default mongo:4.4 bash \
 -c "mongorestore --host mongo1 --drop --gzip --archive=/backups/user-mgnt.gz"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_default mongo:4.4 bash \
 -c "mongorestore --host mongo1 --drop --gzip --archive=/backups/application-config.gz"

echo "Running migrations after restoring from backups"
echo
source $path_to_core/packages/migration/runMigrations.sh $path_to_core/packages/migration