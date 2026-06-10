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

import { defineDeclarationForm, FieldType } from '@opencrvs/toolkit/events'
import { deceased } from './pages/deceased'
import { informant } from './pages/informant'
import { deathIntroduction } from './pages/introduction'
import { documents } from './pages/documents'
import { spouse } from './pages/spouse'
import { eventDetails } from './pages/eventDetails'
import { burial } from './pages/burial'
import { father } from './pages/father'
import { mother } from './pages/mother'
import { livingChildren } from './pages/livingChildren'
import { icd10 } from './pages/icd10'

export const DEATH_DECLARATION_REVIEW = {
  title: {
    id: 'event.death.action.declare.form.review.title',
    defaultMessage:
      '{deceased.name.firstname, select, __EMPTY__ {Death declaration} other {{deceased.name.surname, select, __EMPTY__ {Death declaration for {deceased.name.firstname}} other {Death declaration for {deceased.name.firstname} {deceased.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
  ]
}

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    deathIntroduction,
    deceased,
    eventDetails,
    burial,
    father,
    mother,
    spouse,
    livingChildren,
    informant,
    documents,
    icd10
  ]
})
