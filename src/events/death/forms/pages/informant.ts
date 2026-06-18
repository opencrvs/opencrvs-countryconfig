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
  field,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

import {
  yesNoRadioOptions,
  YesNoTypes,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  emptyMessage,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'

export const InformantType = {
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  SPOUSE: 'SPOUSE',
  SON: 'SON',
  DAUGHTER: 'DAUGHTER',
  OTHER: 'OTHER'
} as const
export type InformantTypeKey = keyof typeof InformantType

const InformantIdType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const informantIdTypeOptions = [
  {
    value: InformantIdType.BIRTH_CERTIFICATE,
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for ID type: birth certificate',
      id: 'event.death.action.declare.form.section.informant.field.idType.option.birthCertificate'
    }
  },
  {
    value: InformantIdType.PASSPORT,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for ID type: passport',
      id: 'event.death.action.declare.form.section.informant.field.idType.option.passport'
    }
  },
  {
    value: InformantIdType.OTHER,
    label: {
      defaultMessage: 'Other',
      description: 'Option for ID type: other',
      id: 'event.death.action.declare.form.section.informant.field.idType.option.other'
    }
  }
]

const deathInformantTypeOptions = [
  {
    value: InformantType.FATHER,
    label: {
      defaultMessage: 'Father',
      description: 'Label for option father',
      id: 'form.field.label.informantRelation.father'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(field('father.detailsNotAvailable').isEqualTo(true))
      }
    ]
  },
  {
    value: InformantType.MOTHER,
    label: {
      defaultMessage: 'Mother',
      description: 'Label for option mother',
      id: 'form.field.label.informantRelation.mother'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(field('mother.detailsNotAvailable').isEqualTo(true))
      }
    ]
  },
  {
    value: InformantType.SPOUSE,
    label: {
      defaultMessage: 'Spouse',
      description: 'Label for option spouse',
      id: 'form.field.label.informantRelation.spouse'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('deceased.maritalStatus').isEqualTo('MARRIED'),
          not(field('spouse.detailsNotAvailable').isEqualTo(true))
        )
      }
    ]
  },
  {
    value: InformantType.SON,
    label: {
      defaultMessage: 'Son',
      description: 'Label for option son',
      id: 'form.field.label.informantRelation.son'
    }
  },
  {
    value: InformantType.DAUGHTER,
    label: {
      defaultMessage: 'Daughter',
      description: 'Label for option daughter',
      id: 'form.field.label.informantRelation.daughter'
    }
  },
  {
    value: InformantType.OTHER,
    label: {
      defaultMessage: 'Other (please specify)',
      description: 'Label for option someone else',
      id: 'form.field.label.informantRelation.others'
    }
  }
]

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'

const isNotSpecialInformant = and(
  not(
    field('informant.relation').inArray([
      InformantType.SPOUSE,
      InformantType.MOTHER,
      InformantType.FATHER
    ])
  ),
  not(field('informant.relation').isFalsy())
)

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.relation.label'
      },
      options: deathInformantTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'informant.other.relation',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to deceased',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.other.relation.label'
      },
      helperText: {
        defaultMessage: 'Please describe relationship to the deceased',
        description: 'Helper text for informant relation when "Other" is selected',
        id: 'event.death.action.declare.form.section.informant.field.other.relation.helperText'
      },
      placeholder: {
        defaultMessage: 'Eg. Nephew',
        description: 'Placeholder for informant relation when "Other" is selected',
        id: 'event.death.action.declare.form.section.informant.field.other.relation.placeholder'
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
    // ---- Nationality (hidden from hospital clerks) ----
    {
      id: 'informant.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(isNotSpecialInformant, hasNonHealthNotifierRole)
        }
      ],
      defaultValue: 'TUV',
      parent: field('informant.relation')
    },
    // ---- ID type (hidden from hospital clerks) ----
    {
      id: 'informant.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.idType.label'
      },
      options: informantIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(isNotSpecialInformant, hasNonHealthNotifierRole)
        }
      ],
      parent: field('informant.relation')
    },
    // ---- Birth certificate number ----
    {
      id: 'informant.brn',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(
              InformantIdType.BIRTH_CERTIFICATE
            ),
            isNotSpecialInformant,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    // ---- Passport number ----
    {
      id: 'informant.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(InformantIdType.PASSPORT),
            isNotSpecialInformant,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    // ---- Other ID number ----
    {
      id: 'informant.otherId',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.otherId.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(InformantIdType.OTHER),
            isNotSpecialInformant,
            hasNonHealthNotifierRole
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.detailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(isNotSpecialInformant, hasNonHealthNotifierRole)
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.name',
      configuration: tuvaluNameConfig,
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Informant's name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isNotSpecialInformant
        }
      ],
      parent: field('informant.relation'),
      validation: [invalidNameValidator('informant.name')]
    },
    {
      id: 'informant.dob',
      type: FieldType.DATE,
      required: false,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.informant.field.dob.error'
          },
          validator: field('informant.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.dobUnknown').isEqualTo(true)),
            isNotSpecialInformant
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
        id: 'event.death.action.declare.form.section.informant.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isNotSpecialInformant
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
      required: false,
      label: {
        defaultMessage: 'Age of informant',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: ' years',
          description: 'This is the postfix for age field',
          id: 'event.death.action.declare.form.section.informant.field.age.postfix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.dobUnknown').isEqualTo(true),
            isNotSpecialInformant
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
      id: 'informant.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isNotSpecialInformant,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.addressHelper.label'
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
            isNotSpecialInformant,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
          )
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.addressSameAs',
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: false,
      label: {
        defaultMessage: "Same as deceased's usual place of residence?",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.address.addressSameAs.label'
      },
      defaultValue: YesNoTypes.YES,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isNotSpecialInformant
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('informant.addressSameAs').isEqualTo(
            YesNoTypes.YES
          )
        }
      ]
    },
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      required: false,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isNotSpecialInformant,
            field('informant.addressSameAs').isEqualTo(YesNoTypes.NO)
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
      id: 'informant.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isNotSpecialInformant
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.contactHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact(Next of kin/Informant)',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.contactHelper.label'
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
        id: 'event.death.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.death.action.declare.form.section.informant.field.phoneNo.error'
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
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      },
      parent: field('informant.relation')
    }
  ]
})
