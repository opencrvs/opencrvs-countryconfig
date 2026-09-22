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
import { documents } from './pages/documents'
import { applicationDetails } from './pages/application'
import { marriageDetails } from './pages/marriage'
import { divorceOrderDetails } from './pages/order'

export const dontShowToHealthAdmin = hasNonHealthNotifierRole

export const DIVORCE_DECLARATION_REVIEW = {
  title: {
    id: 'event.divorce.action.declare.form.review.title',
    defaultMessage:
      '{marriageDetails.bridegroomGivenNames.firstname, select, __EMPTY__ {Divorce declaration} other {{marriageDetails.brideName.firstname, select, __EMPTY__ {Divorce declaration for {marriageDetails.bridegroomGivenNames.firstname}} other {Divorce declaration for {marriageDetails.bridegroomGivenNames.surname} and {marriageDetails.brideName.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'event.divorce.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      },
      required: false
    }
  ]
}

export const DIVORCE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Divorce declaration form',
    id: 'event.divorce.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  pages: [applicationDetails, marriageDetails, divorceOrderDetails, documents]
})
