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
import { subjects } from './pages/subjects'
import { newName } from './pages/newName'
import { informant } from './pages/informant'
import { witness } from './pages/witness'
import { feeCollection } from './pages/feeCollection'
import { documents } from './pages/documents'
import { reviewAndSign } from './pages/reviewAndSign'

export const dontShowToHealthAdmin = hasNonHealthNotifierRole

export const NAME_CHANGE_DECLARATION_REVIEW = {
  title: {
    id: 'event.nameChange.action.declare.form.review.title',
    defaultMessage:
      '{subjects.name.firstname, select, __EMPTY__ {Name Change declaration} other {{subjects.name.surname, select, __EMPTY__ {Name Change declaration for {subjects.name.firstname}} other {Name change declaration for {subjects.name.firstname} {subjects.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: []
}

export const NAME_CHANGE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Name change declaration form',
    id: 'event.nameChange.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [subjects, newName, informant, witness, feeCollection, documents]
})
