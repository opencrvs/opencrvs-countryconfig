/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

const scheme = window.location.protocol; // "http:" or "https:"
const hostname = "{{hostname}}"; // Replace dynamically if needed
const sentry = "{{sentry}}"; // Replace dynamically if needed
window.config = {
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  LANGUAGES: ['en', 'fr'],
  LOGIN_BACKGROUND: { backgroundColor: '36304E' },
  SENTRY: sentry
};