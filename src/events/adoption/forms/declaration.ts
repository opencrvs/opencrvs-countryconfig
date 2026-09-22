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
import { child } from './pages/child'
import { documents } from './pages/documents'
import { consenter } from './pages/consenter'
import { adoptiveMother } from './pages/adoptiveMother'
import { adoptiveFather } from './pages/adoptiveFather'
import { adoptionOrder } from './pages/adoptionOrder'

export const dontShowToHealthAdmin = hasNonHealthNotifierRole

export const ADOPTION_DECLARATION_REVIEW = {
  title: {
    id: 'event.adoption.action.declare.form.review.title',
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'Title of the form to show in review page'
  },
  fields: []
}

export const ADOPTION_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Adoption declaration form',
    id: 'event.adoption.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    child,
    consenter,
    adoptiveMother,
    adoptiveFather,
    adoptionOrder,
    documents
  ]
})
