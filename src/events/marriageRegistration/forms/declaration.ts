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

import {
  and,
  ConditionalType,
  defineDeclarationForm,
  FieldType
} from '@opencrvs/toolkit/events'
import { hasNonHealthNotifierRole } from '@countryconfig/events/utils'
import { marriageDetails } from './pages/marriage'
import { informantDetails } from './pages/informant'
import { supportingDocuments } from './pages/documents'

export const dontShowToHealthAdmin = hasNonHealthNotifierRole

export const MARRIAGE_REGISTRATION_REVIEW = {
  title: {
    id: 'event.marriageRegistration.action.declare.form.review.title',
    defaultMessage:
      '{marriageDetails.officiantFullName, select, __EMPTY__ {Marriage registration} other {{marriageDetails.name.surname, select, __EMPTY__ {Marriage registration for {marriageDetails.officiantFullName}} other {Marriage registration for {marriageDetails.officiantFullName} {marriageDetails.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.marriageRegistration.registration.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      }
    }
  ]
}

export const MARRIAGE_REGISTRATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Marriage registration form',
    id: 'event.marriageRegistration.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [marriageDetails, informantDetails, supportingDocuments]
})
