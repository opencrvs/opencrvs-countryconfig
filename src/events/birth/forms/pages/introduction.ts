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
  defineFormPage,
  FieldType,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'
import { defineConditional, never } from '@opencrvs/toolkit/conditionals'
import {
  emptyMessage,
  hasHealthNotifierRole,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'

export const introduction = defineFormPage({
  id: 'introduction',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Introduction',
    description: 'Event information title for the birth',
    id: 'register.eventInfo.birth.title'
  },
  fields: [
    {
      id: 'introduction.guidance.healthNotifier',
      type: FieldType.BULLET_LIST,
      label: {
        defaultMessage: 'Guidance: Explaining birth notification to parents',
        description: 'Guidance for health notifier roles on birth notification',
        id: 'event.birth.action.declare.form.section.introduction.field.guidance.healthNotifier.label'
      },
      items: [
        {
          defaultMessage:
            "Explain to the parent(s) that you are notifying PMH Records and the Civil Registry / BDM Office of their child's birth.",
          description: 'Health notifier guidance bullet 1',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.healthNotifier.bullet1'
        },
        {
          defaultMessage:
            "Explain that birth notification starts the registration process, but does not complete official birth registration. Birth registration is important because it creates the child's legal proof of identity and supports access to healthcare, school enrolment, government services, travel documents, and other essential services.",
          description: 'Health notifier guidance bullet 2',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.healthNotifier.bullet2'
        },
        {
          defaultMessage:
            "Advise that a parent or qualified informant must complete the registration with the Civil Registry Office. Remind them to bring identification and let them know that other supporting documents may be requested by CRO. If the parents were not married and the father's details are to be included, both mother and father consent forms will need to be completed.",
          description: 'Health notifier guidance bullet 3',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.healthNotifier.bullet3'
        }
      ],
      configuration: {
        styles: {
          fontVariant: 'reg16'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.guidance.registrationOfficer',
      type: FieldType.BULLET_LIST,
      label: {
        defaultMessage:
          'Guidance: Explaining birth registration to parents or a qualified informant',
        description:
          'Guidance for registration officers on the birth registration process',
        id: 'event.birth.action.declare.form.section.introduction.field.guidance.registrationOfficer.label'
      },
      items: [
        {
          defaultMessage:
            'Thank the informant for coming to register the birth.',
          description: 'Registration officer guidance bullet 1',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.registrationOfficer.bullet1'
        },
        {
          defaultMessage:
            "Explain that they are the official informant and must provide complete and accurate details about the child, parent(s), place and date of birth, and any required supporting information. Emphasise that this information will form part of the child's legal birth record and may appear on the birth certificate.",
          description: 'Registration officer guidance bullet 2',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.registrationOfficer.bullet2'
        },
        {
          defaultMessage:
            'Explain that birth registration creates legal proof of identity and supports access to healthcare, school enrolment, government services, travel documents, and other essential services.',
          description: 'Registration officer guidance bullet 3',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.registrationOfficer.bullet3'
        },
        {
          defaultMessage:
            "If the parents were not married and the father's details are to be included, explain that written consent from both parents is required, using the approved forms witnessed before a Commissioner for Oaths. If required information or evidence is missing, the registration may need to be paused until it is provided.",
          description: 'Registration officer guidance bullet 4',
          id: 'event.birth.action.declare.form.section.introduction.field.guidance.registrationOfficer.bullet4'
        }
      ],
      configuration: {
        styles: {
          fontVariant: 'reg16'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.legacyRegistrationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.isLegacyRecord',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: false,
      defaultValue: false,
      label: {
        defaultMessage: 'Legacy record re-entry?',
        description: 'Checkbox indicating this is a legacy record re-entry',
        id: 'event.birth.action.declare.form.section.introduction.field.isLegacyRecord.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('introduction.isLegacyRecord').isEqualTo(true)
        },
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.effectiveRegistrationDate',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of registration',
        description: 'Manual registration date for legacy records',
        id: 'event.birth.action.declare.form.section.introduction.field.effectiveRegistrationDate.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Cannot be a future date',
            description:
              'Error shown when the registration date is in the future',
            id: 'event.birth.action.declare.form.section.introduction.field.effectiveRegistrationDate.error'
          },
          validator: field('introduction.effectiveRegistrationDate')
            .isBefore()
            .now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('introduction.isLegacyRecord').isEqualTo(true)
        },
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('introduction.isLegacyRecord').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'introduction.adoptionOrderDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.isBirthAfterAdoptionOrder',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: false,
      defaultValue: false,
      label: {
        defaultMessage: 'Birth record created after adoption order',
        description:
          'Checkbox indicating the birth record is being created after an adoption order',
        id: 'event.birth.action.declare.form.section.introduction.field.isBirthAfterAdoptionOrder.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field(
            'introduction.isBirthAfterAdoptionOrder'
          ).isEqualTo(true)
        },
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'introduction.adoptionOrderSearch',
      type: FieldType.SEARCH,
      required: false,
      label: {
        defaultMessage: 'Adoption order lookup',
        description: 'Label for the adoption order lookup search field',
        id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.label'
      },
      helperText: {
        defaultMessage:
          'Search for an adoption record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for the adoption order lookup search field',
        id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.helperText'
      },
      configuration: {
        query: {
          type: 'or',
          clauses: [
            {
              data: {
                declaration: {
                  'introduction.adoptionOrderNumber': {
                    term: '{term}',
                    type: 'exact'
                  }
                }
              }
            }
          ]
        },
        limit: 10,
        offset: 0,
        validation: {
          validator: defineConditional({
            type: 'string',
            minLength: 1,
            description: 'Must be a non-empty value'
          }),
          message: {
            defaultMessage: 'Please enter an adoption order number to search',
            description:
              'Validation message for the adoption order lookup search field',
            id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.validation'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Adoption record found',
            description: 'Indicator shown when an adoption record is found',
            id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.indicators.ok'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear adoption record?',
              description: 'Title for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.indicators.clearModal.title'
            },
            description: {
              defaultMessage:
                'This will remove the auto-filled adoption order number.',
              description:
                'Description for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderSearch.indicators.clearModal.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('introduction.isBirthAfterAdoptionOrder').isEqualTo(true)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'introduction.adoptionOrderNumber',
      type: FieldType.TEXT,
      required: false,
      parent: field('introduction.adoptionOrderSearch'),
      value: field('introduction.adoptionOrderSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'introduction.adoptionOrderNumber'
      ]),
      label: {
        defaultMessage: 'Adoption order number',
        description: 'Label for the adoption order number field',
        id: 'event.birth.action.declare.form.section.introduction.field.adoptionOrderNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('introduction.isBirthAfterAdoptionOrder').isEqualTo(true)
          )
        }
      ]
    }
  ]
})
