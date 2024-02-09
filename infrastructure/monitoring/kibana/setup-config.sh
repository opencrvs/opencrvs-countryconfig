# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash
set -e

# Define Docker command with the image and network
docker_command="docker run --rm -v /opt/opencrvs/infrastructure/monitoring/kibana/config.ndjson:/config.ndjson --network=opencrvs_overlay_net curlimages/curl"

# First delete all alerts. This is because the import doesn't remove alerts that are no longer in the config
$docker_command --connect-timeout 60 -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} http://kibana:5601/api/alerting/rules/_find\?page\=1\&per_page\=100\&default_search_operator\=AND\&sort_field\=name\&sort_order\=asc | docker run --rm -i --network=opencrvs_overlay_net stedolan/jq -r '.data[].id' | while read -r id; do
  $docker_command --connect-timeout 60 -X DELETE -H 'kbn-xsrf: true' -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} "http://kibana:5601/api/alerting/rule/$id"
done

$docker_command --connect-timeout 60 -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} -X POST http://kibana:5601/api/saved_objects/_import?overwrite=true -H 'kbn-xsrf: true' --form file=@/config.ndjson > /dev/null

# Re-enable all alerts. This is because after importing a config, all alerts are disabled by default
$docker_command --connect-timeout 60 -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} http://kibana:5601/api/alerting/rules/_find\?page\=1\&per_page\=100\&default_search_operator\=AND\&sort_field\=name\&sort_order\=asc | docker run --rm -i --network=opencrvs_overlay_net stedolan/jq -r '.data[].id' | while read -r id; do
  $docker_command --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} "http://kibana:5601/api/alerting/rule/$id/_disable"
  $docker_command --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:${ELASTICSEARCH_SUPERUSER_PASSWORD} "http://kibana:5601/api/alerting/rule/$id/_enable"
done