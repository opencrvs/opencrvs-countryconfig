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
import {
  and,
  defineConditional,
  field,
  or
} from '@opencrvs/toolkit/conditionals'
import { childPage } from './child'
import { informantPage, InformantTypes } from './informant'
import { appendConditionalsToFields, emptyMessage } from '../../utils'
import { getPersonInputFields, PersonType } from '../../person'

export const BIRTH_DECLARE_FORM = defineForm({
  label: {
    defaultMessage: 'Birth decalration form',
    id: 'v2.event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      defaultMessage: 'Birth declaration for {firstname} {surname}',
      id: 'v2.event.birth.action.declare.form.review.title',
      description: 'Title of the form to show in review page'
    }
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
  pages: [
    {
      id: 'introduction',
      title: {
        defaultMessage:
          'Introduce the birth registration process to the informant',
        description: 'Event information title for the birth',
        id: 'v2.register.eventInfo.birth.title'
      },
      fields: [
        {
          type: 'BULLET_LIST',
          id: 'form.section.information.birth.bulletList',
          label: {
            defaultMessage: 'Birth Information',
            id: 'v2.form.section.information.birth.bulletList.label',
            description: 'Label for the birth information bullet list'
          },
          hideLabel: true,
          items: [
            {
              defaultMessage:
                'I am going to help you make a declaration of birth.',
              description: 'Form information for birth',
              id: 'v2.form.section.information.birth.bullet1'
            },
            {
              defaultMessage:
                'As the legal Informant it is important that all the information provided by you is accurate.',
              description: 'Form information for birth',
              id: 'v2.form.section.information.birth.bullet2'
            },
            {
              defaultMessage:
                'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
              description: 'Form information for birth',
              id: 'v2.form.section.information.birth.bullet3'
            },
            {
              defaultMessage:
                'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
              description: 'Form information for birth',
              id: 'v2.form.section.information.birth.bullet4'
            }
          ],
          font: 'reg16'
        }
      ]
    },
    childPage,
    informantPage,
    {
      id: 'mother',
      title: {
        defaultMessage: "Mother's details",
        description: 'Form section title for mothers details',
        id: 'v2.form.section.mother.title'
      },
      fields: [
        ...appendConditionalsToFields({
          inputFields: [
            {
              id: 'mother.detailsNotAvailable',
              type: 'CHECKBOX',
              required: true,
              label: {
                defaultMessage: "Mother's details are not available",
                description: 'This is the label for the field',
                id: `event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label`
              }
            },
            {
              id: 'mother.details.divider',
              type: 'DIVIDER',
              label: emptyMessage
            }
          ],
          newConditionals: [
            {
              type: 'HIDE',
              conditional: field('informant.relation')
                .inArray([InformantTypes.MOTHER])
                .apply()
            }
          ]
        }),

        {
          id: 'mother.reason',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.mother.field.reason.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: defineConditional(
                or(
                  field('mother.detailsNotAvailable')
                    .or((field) => field.isUndefined().inArray(['false']))
                    .apply(),
                  field('informant.relation')
                    .inArray([InformantTypes.MOTHER])
                    .apply()
                )
              )
            }
          ]
        },
        ...appendConditionalsToFields({
          inputFields: [
            ...getPersonInputFields(PersonType.mother),
            {
              id: 'mother.previousBirths',
              type: 'TEXT',
              required: false,
              label: {
                defaultMessage: 'No. of previous births',
                description: 'This is the label for the field',
                id: 'v2.event.birth.action.declare.form.section.mother.field.previousBirths.label'
              }
            }
          ],
          newConditionals: [
            {
              type: 'HIDE',
              conditional: defineConditional(
                and(
                  field('mother.detailsNotAvailable').inArray(['true']).apply(),
                  field('informant.relation')
                    .or((field) =>
                      field.isUndefined().not.inArray([InformantTypes.MOTHER])
                    )
                    .apply()
                )
              )
            }
          ]
        })
      ]
    },

    {
      id: 'father',
      title: {
        defaultMessage: "Father's details",
        description: 'Form section title for fathers details',
        id: 'v2.form.section.father.title'
      },
      fields: [
        ...appendConditionalsToFields({
          inputFields: [
            {
              id: 'father.detailsNotAvailable',
              type: 'CHECKBOX',
              required: true,
              label: {
                defaultMessage: "Father's details are not available",
                description: 'This is the label for the field',
                id: `event.birth.action.declare.form.section.father.field.detailsNotAvailable.label`
              }
            },
            {
              id: 'father.details.divider',
              type: 'DIVIDER',
              label: emptyMessage
            }
          ],
          newConditionals: [
            {
              type: 'HIDE',
              conditional: field('informant.relation')
                .inArray([InformantTypes.FATHER])
                .apply()
            }
          ]
        }),
        {
          id: 'father.reason',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.father.field.reason.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: or(
                field('father.detailsNotAvailable')
                  .or((field) => field.isUndefined().inArray(['false']))
                  .apply(),
                field('informant.relation')
                  .inArray([InformantTypes.FATHER])
                  .apply()
              )
            }
          ]
        },
        ...appendConditionalsToFields({
          inputFields: getPersonInputFields(PersonType.father),
          newConditionals: [
            {
              type: 'HIDE',
              conditional: defineConditional(
                and(
                  field('father.detailsNotAvailable').inArray(['true']).apply(),
                  field('informant.relation')
                    .or((field) =>
                      field.isUndefined().not.inArray([InformantTypes.FATHER])
                    )
                    .apply()
                )
              )
            }
          ]
        })
      ]
    },
    {
      id: 'documents',
      title: {
        defaultMessage: 'Upload supporting documents',
        description: 'Form section title for documents',
        id: 'v2.form.section.documents.title'
      },
      fields: [
        {
          id: `documents.helper`,
          type: 'PARAGRAPH',
          label: {
            defaultMessage: 'The following documents are required',
            description: 'This is the label for the field',
            id: `event.birth.action.declare.form.section.documents.field.helper.label`
          },
          options: { fontVariant: 'reg16' }
        },
        {
          id: 'documents.proofOfBirth',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: 'Proof of birth',
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
          }
        },
        {
          id: 'documents.proofOfMother',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: "Proof of mother's ID",
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfMother.label'
          }
        },

        {
          id: 'documents.proofOfFather',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: "Proof of father's ID",
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfFather.label'
          }
        },

        {
          id: 'documents.proofOther',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: 'Other',
            description: 'This is the label for the field',
            id: 'v2.event.birth.action.declare.form.section.documents.field.proofOther.label'
          }
        }
      ]
    }
  ]
})
