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

export const conditionals = {
  childHasNUI: {
    action: 'hide',
    expression: 'draftData?.template?.childNID'
  },
  hide: {
    whenFieldAgent: {
      action: 'hide',
      expression: '$user?.systemRole === "FIELD_AGENT"'
    },
    whenRegistrationAgent: {
      action: 'hide',
      expression: '$user?.systemRole === "REGISTRATION_AGENT"'
    },
    whenNotFieldAgent: {
      action: 'hide',
      expression: '$user?.systemRole !== "FIELD_AGENT"'
    },
    whenNUIUnavailable: {
      action: 'hide',
      expression: '!$form?.createNUI?.data || !window.navigator.onLine'
    }
  },
  disable: {
    whenNUIDataMissing: {
      action: 'disable',
      expression: '$form?.createNUI?.data'
    }
  }
}
