import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import {
  AddressType,
  ConditionalType,
  defineFormPage,
  defineConditional,
  field,
  FieldType,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'

const ConjugalStatus = {
  BACHELOR: 'BACHELOR',
  DIVORCED: 'DIVORCED',
  WIDOWER: 'WIDOWER'
}
const conjugalStatusMessageDescriptors = {
  BACHELOR: {
    defaultMessage: 'Bachelor',
    description: 'Label for conjugal status bachelor',
    id: 'form.field.label.conjugalStatus.bachelor'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Label for conjugal status divorced',
    id: 'form.field.label.conjugalStatus.divorced'
  },
  WIDOWER: {
    defaultMessage: 'Widower',
    description: 'Label for conjugal status widower',
    id: 'form.field.label.conjugalStatus.widower'
  }
}
const conjugalStatusOptions = createSelectOptions(
  ConjugalStatus,
  conjugalStatusMessageDescriptors
)

const conjugalStatusMessageDescriptorsFemale = {
  SPINSTER: {
    defaultMessage: 'Spinster',
    description: 'Label for conjugal status spinster',
    id: 'form.field.label.conjugalStatus.spinster'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Label for conjugal status divorced',
    id: 'form.field.label.conjugalStatus.divorced'
  },
  WIDOW: {
    defaultMessage: 'Widow',
    description: 'Label for conjugal status widow',
    id: 'form.field.label.conjugalStatus.widow'
  }
}

const ConjugalStatusFemale = {
  SPINSTER: 'SPINSTER',
  DIVORCED: 'DIVORCED',
  WIDOW: 'WIDOW'
}

const conjugalStatusOptionsFemale = createSelectOptions(
  ConjugalStatusFemale,
  conjugalStatusMessageDescriptorsFemale
)

export const marriageDetails = defineFormPage({
  id: 'marriageDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Marriage Registration Details',
    description: 'Form section title for marriage details',
    id: 'event.divorce.action.declare.form.section.marriageDetails.title'
  },
  fields: [
    // Hint text for marriage registration search
    {
      id: 'marriageDetails.registrationHint',
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          'Search for an existing marriage registration record. If a match is found, the details below will auto-fill. If no record is found, continue by entering the details manually.',
        description: 'Hint text for marriage registration search field',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.registrationHint.label'
      },
      configuration: { styles: { fontVariant: 'reg14' } }
    },
    // Marriage Info
    {
      id: 'marriageDetails.marriageRegistrationSearch',
      type: FieldType.SEARCH,
      required: true,
      label: emptyMessage,
      placeholder: {
        defaultMessage: 'Enter marriage registration number',
        description:
          'Placeholder for marriage registration number search field',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.placeholder'
      },
      configuration: {
        validation: {
          validator: defineConditional({
            type: 'string',
            minLength: 1
          }),
          message: {
            defaultMessage: 'Please enter a Marriage registration number',
            description:
              'Validation error message for Marriage registration field',
            id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.validation'
          }
        },
        indicators: {
          confirmButton: {
            defaultMessage: 'Search',
            description: 'Button text for search',
            id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.search'
          },
          loading: {
            defaultMessage: 'Searching for marriage record...',
            description: 'Loading message while searching',
            id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.loading'
          },
          noResultsError: {
            defaultMessage:
              'No marriage record found with this registration number',
            description: 'Error message when no results found',
            id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.noResults'
          }
        },
        query: {
          type: 'and',
          clauses: [
            {
              eventType: 'marriage-registration',
              status: {
                type: 'anyOf',
                terms: ['REGISTERED']
              }
            },
            {
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            }
          ]
        },
        limit: 1,
        offset: 0
      }
    },
    {
      id: 'marriageDetails.marriageRegistrationNumber',
      type: FieldType.TEXT,
      label: {
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.marriageRegistrationSearch.label',
        description: 'Label for marriage registration number',
        defaultMessage: 'Marriage Registration Number'
      },
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      required: true
    },
    {
      id: 'marriageDetails.dateOfMarriage',
      type: FieldType.DATE,
      analytics: true,
      required: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.dateOfMarriage'
      ]),
      label: {
        defaultMessage: 'Date of marriage',
        description: 'Label for date of marriage',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.dateOfMarriage.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date of marriage',
            description: 'This is the error message for invalid date',
            id: 'event.divorce.action.declare.form.section.marriageDetails.field.dateOfMarriage.error'
          },
          validator: field('marriageDetails.dateOfMarriage').isBefore().now()
        }
      ]
    },
    {
      id: 'marriageDetails.placeOfMarriage',
      type: FieldType.TEXT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'Label for place of marriage',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.placeOfMarriage.label'
      }
    },
    {
      id: 'marriageDetails.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'marriageDetails.h1',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Husband's details",
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.h1.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    // Name
    {
      id: 'marriageDetails.bridegroomGivenNames',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomName'
      ]),
      label: {
        defaultMessage: 'Given name(s)',
        description: 'Label for bridegroom given names',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomGivenNames.label'
      },
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
      }
    },
    // dob
    {
      id: 'marriageDetails.bridegroomDob',
      type: FieldType.DATE,
      analytics: true,
      required: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomDob'
      ]),
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for bridegroom date of birth',
        id: 'form.field.label.dateOfBirth'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.bridegroomDob').isBefore().now()
        }
      ]
    },
    // POB
    {
      id: 'marriageDetails.bridegroompob',
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomPlaceOfBirth'
      ]),
      required: true,
      type: FieldType.TEXT,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for bridegroom place of birth',
        id: 'form.field.label.placeOfBirthFormField'
      }
    },
    // Occupation
    {
      id: 'marriageDetails.bridegroomOccupation',
      type: FieldType.TEXT,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomOccupation'
      ]),
      required: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for bridegroom occupation',
        id: 'form.field.label.occupation'
      }
    },
    // bridegroomConjugalStatus
    {
      id: 'marriageDetails.bridegroomConjugalStatus',
      type: FieldType.SELECT,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomConjugalStatus'
      ]),
      required: true,
      label: {
        defaultMessage: 'Conjugal status at time of marriage',
        description: 'Label for bridegroom conjugal status',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomConjugalStatus.label'
      },
      options: conjugalStatusOptions
    },
    {
      id: 'marriageDetails.bridegroomDecreeAbsoluteDate',
      type: FieldType.DATE,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomDateOfDecreeAbsolute'
      ]),
      required: true,
      label: {
        defaultMessage: 'Date of Decree Absolute',
        description: 'Label for bridegroom decree absolute date',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomDecreeAbsoluteDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            'marriageDetails.bridegroomConjugalStatus'
          ).isEqualTo(ConjugalStatus.DIVORCED)
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.bridegroomDecreeAbsoluteDate')
            .isBefore()
            .now()
        }
      ]
    },
    {
      id: 'marriageDetails.bridegroomFormerWifeDeathDate',
      type: FieldType.DATE,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomDateOfDeathFormerWife'
      ]),
      required: true,
      label: {
        defaultMessage: 'Date of death of former wife',
        description: 'Label for bridegroom former wife death date',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomFormerWifeDeathDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            'marriageDetails.bridegroomConjugalStatus'
          ).isEqualTo(ConjugalStatus.WIDOWER)
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.bridegroomFormerWifeDeathDate')
            .isBefore()
            .now()
        }
      ]
    },
    // divider
    {
      id: 'marriageDetails.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'marriageDetails.h2',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'form.field.label.usualResidence'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    {
      id: 'marriageDetails.residence',
      type: FieldType.ADDRESS,
      analytics: true,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridegroomAddress'
      ]),
      label: {
        defaultMessage: 'Residence',
        description: 'Label for informant residence',
        id: 'form.field.label.residence'
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

    // Divider
    {
      id: 'marriageDetails.divider.4',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'marriageDetails.h4',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Wife's details",
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.h4.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    // Bride Details
    {
      id: 'marriageDetails.brideName',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideName'
      ]),
      label: {
        defaultMessage: 'Given name(s)',
        description: 'Label for bride given names',
        id: 'form.field.label.firstNames'
      },
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
      }
    },
    // dob
    {
      id: 'marriageDetails.brideDob',
      type: FieldType.DATE,
      analytics: true,
      required: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideDob'
      ]),
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for bride date of birth',
        id: 'form.field.label.dob'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.brideDob').isBefore().now()
        }
      ]
    },
    // POB
    {
      id: 'marriageDetails.bridePlaceOfBirth',
      type: FieldType.TEXT,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.bridePlaceOfBirth'
      ]),
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for bride place of birth',
        id: 'form.field.label.placeOfBirthFormField'
      }
    },
    // occupation
    {
      id: 'marriageDetails.brideOccupation',
      type: FieldType.TEXT,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideOccupation'
      ]),
      required: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for bride occupation',
        id: 'form.field.label.occupation'
      }
    },
    {
      id: 'marriageDetails.brideConjugalStatus',
      type: FieldType.SELECT,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideConjugalStatus'
      ]),
      required: true,
      label: {
        defaultMessage: 'Conjugal status at time of marriage',
        description: 'Label for bride conjugal status',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomConjugalStatus.label'
      },
      options: conjugalStatusOptionsFemale
    },
    // brideDecreeAbsoluteDate
    {
      id: 'marriageDetails.brideDecreeAbsoluteDate',
      type: FieldType.DATE,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideDateOfDecreeAbsolute'
      ]),
      required: true,
      label: {
        defaultMessage: 'Date of Decree Absolute',
        description: 'Label for bride decree absolute date',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.bridegroomDecreeAbsoluteDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('marriageDetails.brideConjugalStatus').isEqualTo(
            ConjugalStatusFemale.DIVORCED
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.brideDecreeAbsoluteDate')
            .isBefore()
            .now()
        }
      ]
    },
    {
      id: 'marriageDetails.brideFormerHusbandDeathDate',
      type: FieldType.DATE,
      analytics: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideDateOfDeathFormerHusband'
      ]),
      required: true,
      label: {
        defaultMessage: 'Date of death of former husband',
        description: 'Label for bride former husband death date',
        id: 'event.divorce.action.declare.form.section.marriageDetails.field.brideFormerHusbandDeathDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('marriageDetails.brideConjugalStatus').isEqualTo(
            ConjugalStatusFemale.WIDOW
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'validations.invalidDate'
          },
          validator: field('marriageDetails.brideFormerHusbandDeathDate')
            .isBefore()
            .now()
        }
      ]
    },
    {
      id: 'marriageDetails.divider.6',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'marriageDetails.h8',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'form.field.label.usualResidence'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    {
      id: 'marriageDetails.brideResidence',
      type: FieldType.ADDRESS,
      analytics: true,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.marriageRegistrationSearch'),
      value: field('marriageDetails.marriageRegistrationSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.brideAddress'
      ]),
      label: {
        defaultMessage: 'Residence',
        description: 'Label for informant place of residence',
        id: 'form.field.label.residence'
      },
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    }
  ]
})
