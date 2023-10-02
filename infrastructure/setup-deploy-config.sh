# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e
echo
echo "Setting up deployment config for $1 - `date --iso-8601=ns`"

# Set hostname in openhim-console config
sed -i "s/{{hostname}}/$1/g" /opt/opencrvs/infrastructure/openhim-console-config.deploy.json

# Set hostname in compose file
sed -i "s/{{hostname}}/$1/g" /opt/opencrvs/docker-compose.deploy.yml

# Setup an encryption key for Kibana
KIBANA_ENCRYPTION_KEY=`uuidgen`
sed -i "s/{{KIBANA_ENCRYPTION_KEY}}/$KIBANA_ENCRYPTION_KEY/g" /opt/opencrvs/infrastructure/monitoring/kibana/kibana.yml

# Replace environment variables from all alert definition files
for file in /opt/opencrvs/infrastructure/monitoring/elastalert/rules/*.yaml; do
    sed -i -e "s%{{HOST}}%$1%" $file
    sed -i -e "s%{{SMTP_HOST}}%$SMTP_HOST%" $file
    sed -i -e "s%{{SMTP_PORT}}%$SMTP_PORT%" $file
    sed -i -e "s%{{ALERT_EMAIL}}%$ALERT_EMAIL%" $file
done
sed -i -e "s%{{SMTP_USERNAME}}%$SMTP_USERNAME%" /opt/opencrvs/infrastructure/monitoring/elastalert/auth.yaml
sed -i -e "s%{{SMTP_PASSWORD}}%$SMTP_PASSWORD%" /opt/opencrvs/infrastructure/monitoring/elastalert/auth.yaml
sed -i -e "s%{{MINIO_ROOT_USER}}%$MINIO_ROOT_USER%" /opt/opencrvs/infrastructure/mc-config/config.json
sed -i -e "s%{{MINIO_ROOT_PASSWORD}}%$MINIO_ROOT_PASSWORD%" /opt/opencrvs/infrastructure/mc-config/config.json

echo "DONE - `date --iso-8601=ns`"
echo
