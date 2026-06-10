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
  AddressType,
  and,
  ConditionalType,
  defineFormPage,
  FieldType,
  never,
  or,
  TranslationConfig,
  field,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  tuvaluNameConfig,
  invalidNameValidator,
} from '@countryconfig/events/birth/validators'

import {
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  createSelectOptions,
  BirthIdType,
  birthIdTypeOptions,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'

export const InformantType = {
  MOTHER_AND_FATHER: 'MOTHER_AND_FATHER',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  GRANDFATHER: 'GRANDFATHER',
  GRANDMOTHER: 'GRANDMOTHER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',
  OTHER: 'OTHER'
} as const
export type InformantTypeKey = keyof typeof InformantType

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
const informantMessageDescriptors = {
  MOTHER_AND_FATHER: {
    defaultMessage: 'Mother and Father',
    description: 'Label for option mother and father',
    id: 'form.field.label.informantRelation.motherAndFather'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  GRANDFATHER: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.informantRelation.grandfather'
  },
  GRANDMOTHER: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.informantRelation.grandmother'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  OTHER: {
    defaultMessage: 'Other (please specify)',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const birthInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

const informantOtherThanParent = and(
  not(
    field('informant.relation').inArray([
      InformantType.MOTHER_AND_FATHER,
      InformantType.MOTHER,
      InformantType.FATHER
    ])
  ),
  not(field('informant.relation').isFalsy())
)

export const informant = defineFormPage({
  id: 'informant',
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.relation.label'
      },
      options: birthInformantTypeOptions
    },
    {
      id: 'informant.other.relation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Relationship to the child',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.other.relation.label'
      },
      helperText: {
        defaultMessage: 'Please describe relationship to the child',
        description: 'This is the helper text for the field',
        id: 'event.birth.action.declare.form.section.informant.field.other.relation.helperText'
      },
      placeholder: {
        defaultMessage: 'Eg. Uncle',
        description: 'This is the placeholder for the field',
        id: 'event.birth.action.declare.form.section.informant.field.other.relation.placeholder'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(
            InformantType.OTHER
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      defaultValue: 'TUV',
      parent: field('informant.relation')
    },
    {
      id: 'informant.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Form of ID',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.idType.label'
      },
      options: birthIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.brn',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(BirthIdType.BIRTH_CERTIFICATE),
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(BirthIdType.PASSPORT),
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.nid',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(BirthIdType.OTHER),
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.name',
      type: FieldType.NAME,
      required: true,
      configuration: tuvaluNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Informant's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation'),
      validation: [invalidNameValidator('informant.name')]
    },
    {
      id: 'informant.dob',
      type: 'DATE',
      required: false,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('informant.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('informant.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.dobUnknown').isEqualTo(true)),
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.age',
      type: FieldType.AGE,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Age of informant (at the time of event)',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.age.label'
      },
      configuration: {
        asOfDate: field('child.dob'),
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'event.birth.action.declare.form.section.person.field.age.postfix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.dobUnknown').isEqualTo(true),
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      validation: [
        {
          validator: field('informant.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('informant.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'informant.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      },
      parent: field('informant.relation')
    },
    {
      id: 'informant.address.divider.end',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            informantOtherThanParent,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.pointOfContactHeading',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.pointOfContactHeading.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.PHONE,
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.birth.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Email address',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      },
      parent: field('informant.relation')
    }
  ]
})
