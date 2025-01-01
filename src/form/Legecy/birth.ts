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

import { defineConfig, defineForm } from '@opencrvs/toolkit/events'
import {
  defineConditional,
  eventHasAction,
  not,
  field
} from '@opencrvs/toolkit/conditionals'

const BIRTH_FORM = defineForm({
  label: {
    id: 'event.birth.action.declare.form.label',
    defaultMessage: 'Birth decalration form',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'event.birth.action.declare.form.review.title',
      defaultMessage: 'Birth declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.birth.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'introduction',
      title: {
        defaultMessage:
          'Introduce the birth registration process to the informant',
        description: 'Event information title for the birth',
        id: 'register.eventInfo.birth.title'
      },
      fields: [
        {
          type: 'BULLET_LIST',
          id: 'form.section.information.birth.bulletList',
          label: {
            id: 'form.section.information.birth.bulletList.label',
            defaultMessage: 'Birth Information',
            description: 'Label for the birth information bullet list'
          },
          items: [
            {
              defaultMessage:
                'I am going to help you make a declaration of birth.',
              description: 'Form information for birth',
              id: 'form.section.information.birth.bullet1'
            },
            {
              defaultMessage:
                'As the legal Informant it is important that all the information provided by you is accurate.',
              description: 'Form information for birth',
              id: 'form.section.information.birth.bullet2'
            },
            {
              defaultMessage:
                'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
              description: 'Form information for birth',
              id: 'form.section.information.birth.bullet3'
            },
            {
              defaultMessage:
                'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
              description: 'Form information for birth',
              id: 'form.section.information.birth.bullet4'
            }
          ],
          font: 'h3'
        }
      ]
    },
    {
      id: 'child',
      title: {
        defaultMessage: "Child's details",
        description: 'Form section title for Child',
        id: 'form.birth.child.title'
      },
      fields: [
        {
          id: 'child.firstname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'First name',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.firstname.label'
          }
        },
        {
          id: 'child.surname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Surname',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.surname.label'
          }
        },
        {
          id: 'child.gender',
          type: 'TEXT', // @Todo: Change to SELECT_WITH_OPTIONS
          required: true,
          label: {
            defaultMessage: 'Gender',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.gender.label'
          }
        },
        {
          id: 'child.dob',
          type: 'DATE',
          required: true,
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'event.birth.action.declare.form.section.child.field.dob.error'
              },
              validator: field('child.dob').isBeforeNow()
            }
          ],
          label: {
            defaultMessage: 'Date of birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.dob.label'
          }
        },
        {
          id: 'child.attendantAtBirth',
          type: 'TEXT', // @Todo: Change to SELECT_WITH_OPTIONS
          required: true,
          label: {
            defaultMessage: 'Attendant at birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
          }
        },
        {
          id: 'child.birthType',
          type: 'TEXT', // @Todo: Change to SELECT_WITH_OPTIONS
          required: true,
          label: {
            defaultMessage: 'Birth type',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.birthType.label'
          }
        },
        {
          id: 'child.weightAtBirth',
          type: 'TEXT', // @Todo: Change to NUMBER
          required: true,
          label: {
            defaultMessage: 'Weight at birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.label'
          }
        }
      ]
    }
  ]
})

export const BirthEvent = defineConfig({
  id: 'BIRTH',
  label: {
    defaultMessage: 'Birth declaration',
    description: 'This is what this event is referred as in the system',
    id: 'event.birth.label'
  },
  summary: {
    title: {
      defaultMessage: '{applicant.firstname} {applicant.surname}',
      description: 'This is the title of the summary',
      id: 'event.birth.summary.title'
    },
    fields: []
  },
  workqueues: [],
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [BIRTH_FORM],
      allowedWhen: defineConditional(not(eventHasAction('DECLARE')))
    }
  ]
})
