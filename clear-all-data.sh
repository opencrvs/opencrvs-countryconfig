# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
print_usage_and_exit () {
    echo 'Usage: ./clear-all-data.sh --path_to_core=XXX'
    echo "This script clears all OpenCRVS data locally.  To run it you must pass the directory path to opencrvs-core."
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


# It's fine if these fail as it might be that the databases do not exist at this point
docker run --rm --network=opencrvs_default mongo:4.4 mongo hearth-dev --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo openhim-dev --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo user-mgnt --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo application-config --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo metrics --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo reports --host mongo1 --eval "db.dropDatabase()"
docker run --rm --network=opencrvs_default mongo:4.4 mongo webhooks --host mongo1 --eval "db.dropDatabase()"

docker run --rm --network=opencrvs_default appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v
docker run --rm --network=opencrvs_default appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
PATH_TO_MINIO_DIR="$path_to_core/data/minio/ocrvs"
# Clear Minio Data
if [ -d $PATH_TO_MINIO_DIR ] ; then
 # Locally, as this script is called from the country config repo, the path to core is unknown
 # So we delete the data from the running shared volume location
  docker exec opencrvs_minio_1 rm -rf /data/minio/ocrvs
  docker exec opencrvs_minio_1 mkdir -p /data/minio/ocrvs
  echo "**** Removed minio data ****"
fi
