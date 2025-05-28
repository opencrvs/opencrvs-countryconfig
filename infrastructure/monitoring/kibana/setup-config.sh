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
set -o pipefail

# Define common variables
kibana_alerting_api_url="http://kibana:5601/api/alerting/rules/_find?page=1&per_page=100&default_search_operator=AND&sort_field=name&sort_order=asc"

docker pull ghcr.io/jqlang/jq
docker pull curlimages/curl

http_status_from_curl_output() {
  echo "$1" | tail -n1
}

response_text_from_curl_output() {
  echo "$1" | head -n-1
}

curl_raw() {
  docker run --rm -v /opt/opencrvs/infrastructure/monitoring/kibana/config.ndjson:/config.ndjson --network=opencrvs_overlay_net curlimages/curl -s -w "\n%{http_code}" "$@"
}

parse_url_from_string() {
  local input_string="$1"

  local url
  url=$(echo "$input_string" | grep -oP '(http|https)://[^\s]+')

  echo "$url"
}

parse_method_from_string() {
  local input_string="$1"

  local method
  method=$(echo "$input_string" | grep -oP '(?<=-X\s)[A-Z]+' || echo "GET")

  echo "$method"
}


curl() {
  result=$(curl_raw "$@")
  params="$@"
  method=$(parse_method_from_string "$params")
  request_url=$(parse_url_from_string "$params")

  http_status=$(http_status_from_curl_output "$result")
  response=$(response_text_from_curl_output "$result")

  if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
    if [ -z "$response" ]; then
      echo "$method $request_url – $http_status"
    else
      echo $response
    fi
  else
    echo "$method $request_url – $http_status" >&2
    echo "Error: HTTP request failed with status code $http_status" >&2
    exit 1
  fi
}

jq() {
  docker run --rm -i --network=opencrvs_overlay_net ghcr.io/jqlang/jq "$@"
}

# Initial API status check to ensure Kibana is ready
response=$(curl_raw --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -o /dev/null -w '%{http_code}' "$kibana_alerting_api_url")
status_code=$(http_status_from_curl_output $response)

if [ "$status_code" -ne 200 ]; then
  echo "Kibana is not ready yet! HTTP status $status_code"
  exit 1
fi

# Delete all alerts
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | jq -r '.data[].id' | while read -r id; do
  curl --connect-timeout 60 -X DELETE -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id"
done

# Import configuration
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" -H 'kbn-xsrf: true' --form file=@/config.ndjson > /dev/null

# Re-enable all alerts
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | jq -r '.data[].id' | while read -r id; do
  curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id/_disable"
  curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id/_enable"
done