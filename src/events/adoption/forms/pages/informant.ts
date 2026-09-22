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
  AddressType,
  user,
  TranslationConfig,
  ConditionalType,
  field,
  or
} from '@opencrvs/toolkit/events'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { idTypeOptions } from '@countryconfig/events/utils'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const InformantType = {
  ADOPTIVE_MOTHER: 'ADOPTIVE_MOTHER',
  ADOPTIVE_FATHER: 'ADOPTIVE_FATHER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',
  OTHER: 'OTHER'
} as const
export type InformantTypeKey = keyof typeof InformantType

const PHONE_NUMBER_REGEX = '^[0-9][0-9]{4}$'

const informantMessageDescriptors = {
  ADOPTIVE_MOTHER: {
    defaultMessage: 'Adoptive Mother',
    description: 'Label for option adoptive mother',
    id: 'form.field.label.informantRelation.adoptiveMother'
  },
  ADOPTIVE_FATHER: {
    defaultMessage: 'Adoptive Father',
    description: 'Label for option adoptive father',
    id: 'form.field.label.informantRelation.adoptiveFather'
  },
  OTHER: {
    defaultMessage: 'Other (please specify)',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const adoptionInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Informant Details',
    description: 'Form section title for informant',
    id: 'event.adoption.action.declare.form.section.informant.title'
  },
  fields: [
    // Informant Type
    {
      id: 'informant.informantType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'Label for informant type',
        id: 'event.adoption.action.declare.form.section.informant.field.informantType.label'
      },
      options: adoptionInformantTypeOptions
    },
    // Informant type other
    {
      id: 'informant.informantTypeOther',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Relationship to the child',
        description: 'Label for other informant type',
        id: 'event.adoption.action.declare.form.section.informant.field.informantTypeOther.label'
      },
      helperText: {
        defaultMessage: 'Please describe relationship to the child',
        description: 'Helper text for other informant type field',
        id: 'event.adoption.action.declare.form.section.informant.field.informantTypeOther.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.informantType').isEqualTo(
            InformantType.OTHER
          )
        }
      ]
    },
    // Divider
    {
      id: 'informant.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // Name
    {
      id: 'informant.name',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for informant given name(s)',
              id: 'event.adoption.action.declare.form.section.informant.field.name.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for informant surname',
              id: 'event.adoption.action.declare.form.section.informant.field.name.surname.label'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Informant Name',
        description: 'Label for informant name field',
        id: 'event.adoption.action.declare.form.section.informant.field.name.label'
      }
    },
    // DOB
    {
      id: 'informant.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for informant date of birth',
        id: 'event.adoption.action.declare.form.section.informant.field.dob.label'
      }
    },
    // DOB Unknown
    {
      id: 'informant.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'Label for informant exact date unknown checkbox',
        id: 'event.adoption.action.declare.form.section.informant.field.dobUnknown.label'
      }
    },
    // age
    {
      id: 'informant.age',
      type: FieldType.AGE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Age in years',
        description: 'Label for informant age in years',
        id: 'event.adoption.action.declare.form.section.informant.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: ' years',
          description: 'This is the postfix for age field',
          id: `v2.event.death.action.declare.form.section.informant.field.age.postfix`
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.dobUnknown').isEqualTo(true)
        }
      ]
    },
    {
      id: 'informant.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'Label for informant type of ID',
        id: 'event.adoption.action.declare.form.section.informant.field.idType.label'
      },
      options: idTypeOptions
    },
    {
      id: 'informant.idNumber',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID number',
        description: 'Label for informant ID number',
        id: 'event.adoption.action.declare.form.section.informant.field.idNumber.label'
      }
    },
    {
      id: 'informant.idOther',
      type: FieldType.TEXT,
      label: {
        defaultMessage: 'Other',
        description: 'Label for informant other ID',
        id: 'event.adoption.action.declare.form.section.informant.field.idOther.label'
      }
    },
    // divider
    {
      id: 'informant.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'informant.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.informant.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'Label for informant place of residence',
        id: 'event.adoption.action.declare.form.section.informant.field.address.label'
      },
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    // divider
    {
      id: 'informant.divider.3',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'informant.pointOfcontactHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.informant.field.pointOfcontactHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    {
      id: 'informant.phone',
      type: FieldType.PHONE,
      analytics: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'Label for informant phone number',
        id: 'event.adoption.action.declare.form.section.informant.field.phone.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid 5 digit number',
            description:
              'The error message that appears on phone numbers where length must be 5',
            id: 'event.adoption.action.declare.form.section.informant.field.phone.error'
          },
          validator: or(
            field('informant.phone').matches(PHONE_NUMBER_REGEX),
            field('informant.phone').isFalsy()
          )
        }
      ]
    },
    {
      id: 'informant.email',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Email',
        description: 'Label for informant email',
        id: 'event.adoption.action.declare.form.section.informant.field.email.label'
      }
    }
  ]
})
