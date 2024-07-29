#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -eu
set -o pipefail

source "$(dirname "${BASH_SOURCE[0]}")/setup-helpers.sh"

echo "-------- $(date) --------"

log 'Waiting for availability of Elasticsearch'
wait_for_elasticsearch


log 'Scaling down Elastalert'
docker service scale opencrvs_elastalert=0
log 'Deleting Elastalert indices'
delete_elastalert_indices
log 'Scaling up Elastalert'
docker service scale opencrvs_elastalert=1

