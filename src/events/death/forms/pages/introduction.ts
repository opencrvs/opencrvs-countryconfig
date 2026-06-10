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
  defineFormPage,
  FieldType,
  PageTypes,
  ConditionalType
} from '@opencrvs/toolkit/events'
import {
  hasHealthNotifierRole,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'

export const deathIntroduction = defineFormPage({
  id: 'introduction',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Introduction',
    description: 'Event information title for the death',
    id: 'register.eventInfo.death.title'
  },
  fields: [
    {
      type: FieldType.BULLET_LIST,
      id: 'form.section.information.death.healthNotifier.bulletList',
      label: {
        defaultMessage: 'Guidance: Explaining death notification and next steps to the family',
        id: 'form.section.information.death.healthNotifier.bulletList.label',
        description: 'Guidance for health notifiers (hospital clerks)'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasHealthNotifierRole
        }
      ],
      items: [
        {
          defaultMessage:
            'Explain to the family that the hospital or health facility is required to record the medical details of the death, including the cause of death, to support the legal registration process.',
          description: 'Health notifier guidance bullet 1',
          id: 'form.section.information.death.healthNotifier.bullet1'
        },
        {
          defaultMessage:
            'Explain that this notification does not complete the official registration of the death.',
          description: 'Health notifier guidance bullet 2',
          id: 'form.section.information.death.healthNotifier.bullet2'
        },
        {
          defaultMessage:
            'Advise the family or authorised informant that they must attend the Civil Registration Office to formally register the death and provide the required information about the deceased and their family.',
          description: 'Health notifier guidance bullet 3',
          id: 'form.section.information.death.healthNotifier.bullet3'
        },
        {
          defaultMessage:
            'Explain that once the death is formally registered, the Civil Registration Office can issue a death certificate, which may be needed by the family for future legal, family, inheritance, land, or other official matters.',
          description: 'Health notifier guidance bullet 4',
          id: 'form.section.information.death.healthNotifier.bullet4'
        }
      ],
      configuration: {
        styles: {
          fontVariant: 'reg16'
        }
      }
    },
    {
      type: FieldType.BULLET_LIST,
      id: 'form.section.information.death.registrar.bulletList',
      label: {
        defaultMessage: 'Guidance: Explaining death registration to the informant',
        id: 'form.section.information.death.registrar.bulletList.label',
        description: 'Guidance for registration officers'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ],
      items: [
        {
          defaultMessage:
            'Explain that you will now complete the formal registration of the death in the official civil registration system.',
          description: 'Registration officer guidance bullet 1',
          id: 'form.section.information.death.registrar.bullet1'
        },
        {
          defaultMessage:
            'Explain that you will need to confirm important details about the deceased, including their identity, family details, date and place of death, and other registration information required by law.',
          description: 'Registration officer guidance bullet 2',
          id: 'form.section.information.death.registrar.bullet2'
        },
        {
          defaultMessage:
            'Confirm the relationship of the informant to the deceased and ensure they are authorised to provide the information.',
          description: 'Registration officer guidance bullet 3',
          id: 'form.section.information.death.registrar.bullet3'
        },
        {
          defaultMessage:
            'Explain that once registration is completed and approved, a death certificate can be issued by the Civil Registration Office and may be needed by the family for future legal, family, inheritance, land, or other official matters.',
          description: 'Registration officer guidance bullet 4',
          id: 'form.section.information.death.registrar.bullet4'
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
