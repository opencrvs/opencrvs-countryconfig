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

docker compose build
docker compose push

# Push additional image tag if branch is develop
if [[ "$BRANCH_NAME" == "develop" ]]
then
  docker tag ${DOCKERHUB_ACCOUNT}/${DOCKERHUB_REPO}:${COUNTRY_CONFIG_VERSION} \
  ${DOCKERHUB_ACCOUNT}/${DOCKERHUB_REPO}:$BRANCH_NAME
  docker push ${DOCKERHUB_ACCOUNT}/${DOCKERHUB_REPO}:$BRANCH_NAME
fi
