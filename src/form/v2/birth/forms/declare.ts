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

import { defineForm } from '@opencrvs/toolkit/events'
import { child } from './pages/child'
import { informant } from './pages/informant'
import { introduction } from './pages/introduction'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { documents } from './pages/documents'

export const BIRTH_DECLARE_FORM = defineForm({
  label: {
    defaultMessage: 'Birth decalration form',
    id: 'v2.event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'v2.event.birth.action.declare.form.review.title',
      defaultMessage:
        '{child.firstname, select, __EMPTY__ {Birth declaration} other {{child.surname, select, __EMPTY__ {Birth declaration} other {Birth declaration for {child.firstname} {child.surname}}}}}',
      description: 'Title of the form to show in review page'
    },
    fields: [
      {
        id: 'review.comment',
        type: 'TEXTAREA',
        label: {
          defaultMessage: 'Comment',
          id: 'v2.event.birth.action.declare.form.review.comment.label',
          description: 'Label for the comment field in the review section'
        },
        required: true
      },
      {
        type: 'SIGNATURE',
        id: 'review.signature',
        required: true,
        label: {
          defaultMessage: 'Signature of informant',
          id: 'v2.event.birth.action.declare.form.review.signature.label',
          description: 'Label for the signature field in the review section'
        },
        signaturePromptLabel: {
          id: 'v2.signature.upload.modal.title',
          defaultMessage: 'Draw signature',
          description: 'Title for the modal to draw signature'
        }
      }
    ]
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      defaultMessage: 'Version 1',
      id: 'v2.event.birth.action.declare.form.version.1',
      description: 'This is the first version of the form'
    }
  },
  pages: [introduction, child, informant, mother, father, documents]
})
