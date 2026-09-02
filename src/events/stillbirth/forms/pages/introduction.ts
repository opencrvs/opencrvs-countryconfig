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
import { defineFormPage, FieldType, PageTypes } from '@opencrvs/toolkit/events'

export const introduction = defineFormPage({
  id: 'introduction',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Introduction',
    description: 'Event information title for the stillbirth',
    id: 'register.eventInfo.stillbirth.title'
  },
  fields: [
    {
      id: 'introduction.guidance',
      type: FieldType.BULLET_LIST,
      required: false,
      label: {
        defaultMessage:
          'Guidance: Explaining stillbirth notification to family',
        description:
          'Guidance for explaining stillbirth notification to the family',
        id: 'event.stillbirth.action.declare.form.section.introduction.field.guidance.label'
      },
      items: [
        {
          defaultMessage:
            'Explain to the parent(s) that you are required to notify the Civil Registry Office of the stillbirth.',
          description: 'Stillbirth guidance bullet 1',
          id: 'event.stillbirth.action.declare.form.section.introduction.field.guidance.bullet1'
        },
        {
          defaultMessage:
            'Explain that under the Civil Registration Act 2025, a stillbirth means a baby born with no signs of life at or after 28 weeks gestation.',
          description: 'Stillbirth guidance bullet 2',
          id: 'event.stillbirth.action.declare.form.section.introduction.field.guidance.bullet2'
        },
        {
          defaultMessage:
            'Explain that stillbirth registration is required by law and creates an official civil record. It also helps health and civil registration agencies understand pregnancy outcomes and improve care.',
          description: 'Stillbirth guidance bullet 3',
          id: 'event.stillbirth.action.declare.form.section.introduction.field.guidance.bullet3'
        },
        {
          defaultMessage:
            'Let the parent(s) or qualified informant know that the health team will collect the required details for the notification and registration process. If all required information can be submitted by the health team, they will not need to visit the Civil Registry Office. If any information is missing or CRO needs to confirm details, they may be asked to attend or may be contacted directly.',
          description: 'Stillbirth guidance bullet 4',
          id: 'event.stillbirth.action.declare.form.section.introduction.field.guidance.bullet4'
        }
      ],
      configuration: {
        styles: {
          fontVariant: 'reg16'
        }
      }
    }
  ]
})
