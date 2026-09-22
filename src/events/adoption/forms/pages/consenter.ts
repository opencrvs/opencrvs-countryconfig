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
  field,
  ConditionalType,
  and,
  not,
  user
} from '@opencrvs/toolkit/events'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { emptyMessage } from '@countryconfig/events/utils'
import { invalidNameValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const consenter = defineFormPage({
  id: 'consenter',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Consent from Natural Parent(s) or Legal Guardian(s)',
    description: 'Form section title for consenter',
    id: 'event.adoption.action.declare.form.section.consenter.title'
  },
  fields: [
    // B1 — Consent not provided / waived by court order
    {
      id: 'consent.notProvidedOrWaived',
      type: FieldType.CHECKBOX,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Consent not provided / consent waived by court order',
        description: 'Checkbox when consent is not provided or waived',
        id: 'event.adoption.consenter.b1.label'
      }
    },

    // B2 — Number of consenting parties
    {
      id: 'consent.numberOfParties',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Number of consenting parties',
        description: 'Select number of consenting parties',
        id: 'event.adoption.consenter.b2.label'
      },
      options: [
        {
          value: '1',
          label: {
            defaultMessage: '1',
            id: 'event.adoption.consenter.b2.opt.1',
            description: ''
          }
        },
        {
          value: '2',
          label: {
            defaultMessage: '2',
            id: 'event.adoption.consenter.b2.opt.2',
            description: ''
          }
        }
      ],
      defaultValue: '2',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // Divider
    {
      id: 'consenter.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true))
          )
        }
      ]
    },

    // ----------------------- Consenting party 1 -------------------------------

    // H3
    {
      id: 'consenter.cp1.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Consenting party 1',
        description: 'Section header for consenting party 1',
        id: 'event.adoption.consenter.cp1.header'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // B3 and B4 — Given name(s) and Surname
    {
      id: 'consenter.cp1.name',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for form field: First names',
              id: 'form.field.label.firstNames'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for family name text input',
              id: 'form.field.label.familyName'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Given name(s)',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.cp1.field.name.label'
      },
      validation: [invalidNameValidator('consenter.cp1.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // B5 — Relationship to child
    {
      id: 'consenter.cp1.relationship',
      type: FieldType.SELECT,
      analytics: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'Relationship of consenting party 1 to the child',
        id: 'event.adoption.consenter.cp1.relationship.label'
      },
      options: [
        {
          value: 'mother',
          label: {
            defaultMessage: 'Mother (Birth)',
            id: 'event.adoption.consenter.relationship.mother',
            description: ''
          }
        },
        {
          value: 'father',
          label: {
            defaultMessage: 'Father (Birth)',
            id: 'event.adoption.consenter.relationship.father',
            description: ''
          }
        },
        {
          value: 'other',
          label: {
            defaultMessage: 'Other (please specify)',
            id: 'event.adoption.consenter.relationship.other',
            description: ''
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // B5.1 — Specify relationship (only when 'other')
    {
      id: 'consenter.cp1.relationshipSpecify',
      required: true,
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Specify relationship',
        description: 'Specify relationship of consenting party 1',
        id: 'event.adoption.consenter.cp1.relationshipSpecify.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consenter.cp1.relationship').isEqualTo('other')
          )
        }
      ]
    },

    // B6 — Date of birth
    {
      id: 'consenter.cp1.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Date of birth of consenting party 1',
        id: 'event.adoption.consenter.cp1.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            not(field('consenter.cp1.dobUnknown').isEqualTo(true))
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ]
    },

    // B6.1 — Exact date unknown
    {
      id: 'consenter.cp1.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'Checkbox for exact date unknown',
        id: 'event.adoption.consenter.cp1.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // B6.2 — Age in years
    {
      id: 'consenter.cp1.age',
      type: FieldType.AGE,
      analytics: true,
      label: {
        defaultMessage: 'Age in years',
        description: 'Age in years of consenting party 1',
        id: 'event.adoption.consenter.cp1.age.label'
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
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consenter.cp1.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },

    // Divider + H4 Residence
    {
      id: 'consenter.cp1.divider.res',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('1')
          )
        }
      ]
    },
    {
      id: 'consenter.cp1.res.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence heading for consenting party 1',
        id: 'event.adoption.consenter.cp1.res.header'
      },
      configuration: { styles: { fontVariant: 'h4' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // B7–B11 — Residence (ADDRESS) — Consenting party 1
    {
      id: 'consenter.cp1.residence',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence address for consenting party 1',
        id: 'event.adoption.consenter.cp1.residence.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'consenter.cp1.residence'
          ).isValidAdministrativeLeafLevel()
        }
      ],
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },

    // Divider + Occupation
    {
      id: 'consenter.cp1.divider.occ',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('1')
          )
        }
      ]
    },

    // B12 — Occupation
    {
      id: 'consenter.cp1.occupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Occupation of consenting party 1',
        id: 'event.adoption.consenter.cp1.occupation.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('consent.notProvidedOrWaived').isEqualTo(true))
        }
      ]
    },

    // Divider
    {
      id: 'consenter.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // ----------------------- Consenting party 2 -------------------------------

    // H3
    {
      id: 'consenter.cp2.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Consenting party 2',
        description: 'Section header for consenting party 2',
        id: 'event.adoption.consenter.cp2.header'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B13 and B14 — Given name(s) and Surname
    {
      id: 'consenter.cp2.name',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for form field: First names',
              id: 'form.field.label.firstNames'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for family name text input',
              id: 'form.field.label.familyName'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Given name(s)',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.cp2.field.name.label'
      },
      validation: [invalidNameValidator('consenter.cp2.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B15 — Relationship to child
    {
      id: 'consenter.cp2.relationship',
      required: true,
      type: FieldType.SELECT,
      analytics: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'Relationship of consenting party 2 to the child',
        id: 'event.adoption.consenter.cp2.relationship.label'
      },
      options: [
        {
          value: 'mother',
          label: {
            defaultMessage: 'Mother (Birth)',
            id: 'event.adoption.consenter.relationship.mother',
            description: ''
          }
        },
        {
          value: 'father',
          label: {
            defaultMessage: 'Father (Birth)',
            id: 'event.adoption.consenter.relationship.father',
            description: ''
          }
        },
        {
          value: 'other',
          label: {
            defaultMessage: 'Other (please specify)',
            id: 'event.adoption.consenter.relationship.other',
            description: ''
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B15.1 — Specify relationship (only when 'other')
    {
      id: 'consenter.cp2.relationshipSpecify',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Specify relationship',
        description: 'Specify relationship of consenting party 2',
        id: 'event.adoption.consenter.cp2.relationshipSpecify.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2'),
            field('consenter.cp2.relationship').isEqualTo('other')
          )
        }
      ]
    },

    // B16 — Date of birth
    {
      id: 'consenter.cp2.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Date of birth of consenting party 2',
        id: 'event.adoption.consenter.cp2.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2'),
            not(field('consenter.cp2.dobUnknown').isEqualTo(true))
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ]
    },

    // B16.1 — Exact date unknown
    {
      id: 'consenter.cp2.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'Checkbox for exact date unknown',
        id: 'event.adoption.consenter.cp2.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B16.2 — Age in years
    {
      id: 'consenter.cp2.age',
      type: FieldType.AGE,
      analytics: true,
      label: {
        defaultMessage: 'Age in years',
        description: 'Age in years of consenting party 2',
        id: 'event.adoption.consenter.cp2.age.label'
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
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2'),
            field('consenter.cp2.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },

    // Divider + H4 Residence
    {
      id: 'consenter.cp2.divider.res',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },
    {
      id: 'consenter.cp2.res.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence heading for consenting party 2',
        id: 'event.adoption.consenter.cp2.res.header'
      },
      configuration: { styles: { fontVariant: 'h4' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B17–B21 — Residence (ADDRESS) — Consenting party 2
    {
      id: 'consenter.cp2.residence',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence address for consenting party 2',
        id: 'event.adoption.consenter.cp2.residence.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
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
          validator: field(
            'consenter.cp2.residence'
          ).isValidAdministrativeLeafLevel()
        }
      ],
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea:
          user('primaryOfficeId').locationLevel('locationLevel3')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },

    // Divider + Occupation
    {
      id: 'consenter.cp2.divider.occ',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    },

    // B22 — Occupation
    {
      id: 'consenter.cp2.occupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Occupation of consenting party 2',
        id: 'event.adoption.consenter.cp2.occupation.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('consent.notProvidedOrWaived').isEqualTo(true)),
            field('consent.numberOfParties').isEqualTo('2')
          )
        }
      ]
    }
  ]
})
