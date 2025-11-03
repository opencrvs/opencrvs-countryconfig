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

get_abs_filename() {
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

echo "Auditing translation keys..."
echo ""

# Get the absolute path to opencrvs-core (assumed to be alongside this repo)
CORE_PATH="$(get_abs_filename "../opencrvs-core")"

if [[ ! -d "${CORE_PATH}" ]]; then
  echo "Error: opencrvs-core directory not found at: ${CORE_PATH}"
  echo ""
  echo "This script expects opencrvs-core to be at the same level as this country config repository."
  echo "Expected structure:"
  echo "  /parent-directory/"
  echo "    ├── opencrvs-core/"
  echo "    └── opencrvs-countryconfig/ (or your country config)"
  exit 1
fi

echo "Using opencrvs-core at: ${CORE_PATH}"
echo ""

# Check if we're in the country config root (should have src/translations/client.csv)
if [[ ! -f "src/translations/client.csv" ]]; then
  echo "Error: src/translations/client.csv not found in current directory"
  echo "Please run this script from the root of your country config repository"
  exit 1
fi

# Run the TypeScript script using node_modules from opencrvs-core
cd "${CORE_PATH}/packages/client"
yarn run ts-node -- --compiler-options='{"module": "commonjs", "moduleResolution": "node"}' -r tsconfig-paths/register "$(get_abs_filename "$OLDPWD/src/audit-translations.ts")"

echo ""
echo "Done!"