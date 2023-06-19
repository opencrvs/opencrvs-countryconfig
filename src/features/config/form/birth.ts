/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { ISerializedForm } from './types'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from './options'
import { formMessageDescriptors } from './formatjs-messages'
import {
  childNameInEnglish,
  getBirthDate,
  getDetailsExist,
  getFamilyNameField,
  getFirstNameField,
  getGender,
  getNationalID,
  getNationality,
  getPlaceOfBirthFields,
  getReasonNotExisting,
  informantType,
  otherInformantType
} from './birth/required-fields'
import {
  attendantAtBirth,
  birthType,
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  getNIDVerificationButton,
  registrationEmail,
  registrationPhone,
  weightAtBirth
} from './birth/optional-fields'
import {
  isValidChildBirthDate,
  informantFamilyNameConditionals,
  informantFirstNameConditionals,
  informantBirthDateConditionals,
  hideIfNidIntegrationEnabled,
  nationalIDValidators,
  hideIfNidIntegrationDisabled,
  mothersDetailsExistConditionals,
  getNationalIDValidators,
  motherNationalIDVerfication
} from './validations-and-conditionals'
import { informantNameInEnglish } from './birth/preview-groups'
import {
  AddressCases,
  AddressSubsections,
  EventLocationAddressCases
} from './address-utils'
import { getAddress, getAddressSubsection } from './addresses'

export const birthRegisterForms: ISerializedForm = {
  sections: [
    {
      id: 'registration', // A hidden 'registration' section must be included to store identifiers in a form draft that are used in certificates
      viewType: 'form',
      name: {
        defaultMessage: 'Registration',
        description: 'Form section name for Registration',
        id: 'form.section.declaration.name'
      },
      groups: [],
      mapping: {
        template: [
          {
            fieldName: 'registrationNumber',
            operation: 'registrationNumberTransformer'
          },
          {
            fieldName: 'qrCode',
            operation: 'QRCodeTransformerTransformer'
          },
          {
            fieldName: 'mosipAid',
            operation: 'mosipAidTransformer'
          },
          {
            fieldName: 'mosipAIDLabel',
            operation: 'mosipAidLabelTransformer'
          },
          {
            fieldName: 'certificateDate',
            operation: 'certificateDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrar',
            operation: 'userTransformer',
            parameters: ['REGISTERED']
          },
          {
            fieldName: 'registrationAgent',
            operation: 'userTransformer',
            parameters: ['VALIDATED']
          },
          // backward compatibility
          {
            fieldName: 'registrarName',
            operation: 'registrarNameUserTransformer'
          },
          {
            fieldName: 'role',
            operation: 'roleUserTransformer'
          },
          {
            fieldName: 'registrarSignature',
            operation: 'registrarSignatureUserTransformer'
          },
          {
            fieldName: 'registrationDate',
            operation: 'registrationDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrationLocation',
            operation: 'registrationLocationUserTransformer'
          }
        ],
        mutation: {
          operation: 'setBirthRegistrationSectionTransformer'
        },
        query: {
          operation: 'getBirthRegistrationSectionTransformer'
        }
      }
    },
    {
      id: 'information',
      viewType: 'form',
      name: {
        defaultMessage: 'Information',
        description: 'Form section name for Information',
        id: 'form.section.information.name'
      },
      groups: [
        {
          id: 'information-group',
          title: {
            defaultMessage:
              'Introduce the birth registration process to the informant',
            description: 'Event information title for the birth',
            id: 'register.eventInfo.birth.title'
          },
          conditionals: [
            {
              action: 'hide',
              expression: 'window.config.HIDE_BIRTH_EVENT_REGISTER_INFORMATION'
            }
          ],
          fields: [
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: {
                defaultMessage:
                  'I am going to help you make a declaration of birth.',
                description: 'Form information for birth',
                id: 'form.section.information.birth.bullet1'
              },
              initialValue: '',
              validator: []
            },
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: {
                defaultMessage:
                  'As the legal Informant it is important that all the information provided by you is accurate.',
                description: 'Form information for birth',
                id: 'form.section.information.birth.bullet2'
              },
              initialValue: '',
              validator: []
            },
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: {
                defaultMessage:
                  'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                description: 'Form information for birth',
                id: 'form.section.information.birth.bullet3'
              },
              initialValue: '',
              validator: []
            },
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: {
                defaultMessage:
                  'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
                description: 'Form information for birth',
                id: 'form.section.information.birth.bullet4'
              },
              initialValue: '',
              validator: []
            }
          ]
        }
      ]
    },
    {
      id: 'child',
      viewType: 'form',
      name: formMessageDescriptors.childTab,
      title: formMessageDescriptors.childTitle,
      hasDocumentSection: true,
      groups: [
        {
          id: 'child-view-group',
          fields: [
            getFirstNameField('childNameInEnglish', [], 'childFirstName'), // Required field.  Names in Latin characters must be provided for international passport
            getFamilyNameField('childNameInEnglish', [], 'childFamilyName'), // Required field.  Names in Latin characters must be provided for international passport
            getGender('childGender'), // Required field.
            getBirthDate(
              'childBirthDate',
              [],
              isValidChildBirthDate,
              'eventDate'
            ), // Required field.
            {
              name: 'seperator',
              type: 'SUBSECTION',
              label: {
                defaultMessage: ' ',
                description: 'empty string',
                id: 'form.field.label.empty'
              },
              initialValue: '',
              ignoreBottomMargin: true,
              validator: [],
              conditionals: []
            },
            ...getPlaceOfBirthFields(), // Required fields.
            attendantAtBirth,
            birthType,
            weightAtBirth
          ],
          previewGroups: [childNameInEnglish] // Preview groups are used to structure data nicely in Review Page UI
        }
      ]
    },
    {
      id: 'informant',
      viewType: 'form',
      name: {
        defaultMessage: 'Informant',
        description: 'Form section name for Informant',
        id: 'form.section.informant.name'
      },
      title: formMessageDescriptors.birthInformantTitle,
      hasDocumentSection: true,
      groups: [
        {
          id: 'informant-view-group',
          conditionals: [
            {
              action: 'hide',
              expression:
                "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
            }
          ],
          fields: [
            informantType, // Required field.
            otherInformantType, // Required field.
            registrationPhone,
            registrationEmail,
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals,
              'informantFirstName'
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals,
              'informantFamilyName'
            ), // Required field.
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals,
              [],
              'eventDate'
            ), // Required field.
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(formMessageDescriptors.ageOfInformant),
            getNationality('informantNationality'), // Required field.
            getNationalID(
              'informantID',
              hideIfNidIntegrationEnabled,
              getNationalIDValidators('informant'),
              'informantNID'
            ),
            getNIDVerificationButton(
              'informantNidVerification',
              hideIfNidIntegrationDisabled,
              []
            ),
            ...getAddressSubsection(
              AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
              formMessageDescriptors.primaryAddress
            ),
            ...getAddress(AddressCases.PRIMARY_ADDRESS) // Required field. Its possible to capture 2 addresses: PRIMARY_ADDRESS & SECONDARY_ADDRESS per individual
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
    },
    {
      id: 'mother',
      viewType: 'form',
      name: formMessageDescriptors.motherName,
      title: formMessageDescriptors.motherTitle,
      hasDocumentSection: true,
      groups: [
        {
          id: 'mother-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.mothersDetailsExist,
              mothersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getReasonNotExisting('motherReasonNotApplying'), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getNationality('motherNationality'),
            getNationalID(
              'iD',
              hideIfNidIntegrationEnabled,
              getNationalIDValidators('mother'),
              'motherNID'
            ),
            getNIDVerificationButton(
              'informantNidVerification',
              hideIfNidIntegrationDisabled.concat(motherNationalIDVerfication),
              []
            ),
            {
              name: 'motherBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                },
                {
                  action: 'disable',
                  expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('motherBirthDate')`
                }
              ],
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [5]
                }
              ],
              mapping: {
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'motherBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy']
                },
                mutation: {
                  operation: 'longDateTransformer',
                  parameters: ['birthDate']
                },
                query: {
                  operation: 'fieldValueTransformer',
                  parameters: ['birthDate']
                }
              }
            },
            {
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!window.config.DATE_OF_BIRTH_UNKNOWN || (!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfMother,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [12, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [5, true]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.exactDateOfBirthUnknown || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'motherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
                }
              ],
              mapping: {
                template: {
                  fieldName: 'motherFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'firstNames']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'motherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
                }
              ],
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'motherFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'familyName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                }
              }
            },
            {
              name: 'seperator',
              type: 'SUBSECTION',
              label: {
                defaultMessage: ' ',
                description: 'empty string',
                id: 'form.field.label.empty'
              },
              initialValue: '',
              ignoreBottomMargin: true,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ]
            },
            {
              name: 'maritalStatus',
              type: 'SELECT_WITH_OPTIONS',
              label: {
                defaultMessage: 'Marital status',
                description: 'Label for form field: Marital status',
                id: 'form.field.label.maritalStatus'
              },
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                template: {
                  fieldName: 'motherMaritalStatus',
                  operation: 'selectTransformer'
                }
              },
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              options: [
                {
                  value: 'SINGLE',
                  label: {
                    defaultMessage: 'Single',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusSingle'
                  }
                },
                {
                  value: 'MARRIED',
                  label: {
                    defaultMessage: 'Married',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusMarried'
                  }
                },
                {
                  value: 'WIDOWED',
                  label: {
                    defaultMessage: 'Widowed',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusWidowed'
                  }
                },
                {
                  value: 'DIVORCED',
                  label: {
                    defaultMessage: 'Divorced',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusDivorced'
                  }
                },
                {
                  value: 'SEPARATED',
                  label: {
                    id: 'form.field.label.maritalStatusSeparated',
                    defaultMessage: 'Separated',
                    description: 'Option for form field: Marital status'
                  }
                },
                {
                  value: 'NOT_STATED',
                  label: {
                    defaultMessage: 'Not stated',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusNotStated'
                  }
                }
              ]
            },
            {
              name: 'multipleBirth',
              type: 'NUMBER',
              label: {
                defaultMessage: 'No. of previous births',
                description: 'Label for form field: multipleBirth',
                id: 'form.field.label.multipleBirth'
              },
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              required: false,
              initialValue: '',
              validator: [
                {
                  operation: 'greaterThanZero'
                },
                {
                  operation: 'maxLength',
                  parameters: [2]
                }
              ],
              mapping: {
                template: {
                  fieldName: 'multipleBirth',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'occupation',
              type: 'TEXT',
              label: {
                defaultMessage: 'Occupation',
                description: 'text for occupation form field',
                id: 'form.field.label.occupation'
              },
              required: false,
              initialValue: '',
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'motherOccupation',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'educationalAttainment',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.educationAttainment,
              required: false,
              initialValue: '',
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: [
                {
                  value: 'NO_SCHOOLING',
                  label: {
                    defaultMessage: 'No schooling',
                    description: 'Option for form field: no education',
                    id: 'form.field.label.educationAttainmentNone'
                  }
                },
                {
                  value: 'PRIMARY_ISCED_1',
                  label: {
                    defaultMessage: 'Primary',
                    description: 'Option for form field: ISCED1 education',
                    id: 'form.field.label.educationAttainmentISCED1'
                  }
                },
                {
                  value: 'POST_SECONDARY_ISCED_4',
                  label: {
                    defaultMessage: 'Secondary',
                    description: 'Option for form field: ISCED4 education',
                    id: 'form.field.label.educationAttainmentISCED4'
                  }
                },
                {
                  value: 'FIRST_STAGE_TERTIARY_ISCED_5',
                  label: {
                    defaultMessage: 'Tertiary',
                    description: 'Option for form field: ISCED5 education',
                    id: 'form.field.label.educationAttainmentISCED5'
                  }
                }
              ],
              mapping: {
                template: {
                  fieldName: 'motherEducationalAttainment',
                  operation: 'selectTransformer'
                }
              }
            }
            // PRIMARY ADDRESS SUBSECTION
            // PRIMARY ADDRESS
            // SECONDARY ADDRESS SAME AS PRIMARY
            // SECONDARY ADDRESS SUBSECTION
            // SECONDARY ADDRESS
          ],
          previewGroups: [
            {
              id: 'motherNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: "Group label for mother's name in english",
                id: 'form.preview.group.label.mother.english.name'
              },
              fieldToRedirect: 'familyNameEng',
              delimiter: ' '
            }
          ]
        }
      ],
      mapping: {
        query: {
          operation: 'emptyMotherSectionTransformer'
        }
      }
    },
    {
      id: 'father',
      viewType: 'form',
      name: {
        defaultMessage: 'Father',
        description: 'Form section name for Father',
        id: 'form.section.father.name'
      },
      title: {
        defaultMessage: "Father's details",
        description: 'Form section title for Father',
        id: 'form.section.father.title'
      },
      hasDocumentSection: true,
      groups: [
        {
          id: 'father-view-group',
          fields: [
            {
              name: 'detailsExist',
              type: 'CHECKBOX',
              label: formMessageDescriptors.fathersDetailsExist,
              required: true,
              checkedValue: false,
              uncheckedValue: true,
              hideHeader: true,
              initialValue: true,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: 'fathersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'hideInPreview',
                  expression: 'values.detailsExist'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                }
              }
            },
            {
              name: 'reasonNotApplying',
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    'fathersDetailsExistBasedOnContactAndInformant || values.detailsExist'
                }
              ],
              type: 'TEXT',
              label: formMessageDescriptors.reasonNA,
              validator: [],
              initialValue: '',
              required: true,
              mapping: {
                template: {
                  fieldName: 'fatherReasonNotApplying',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'nationality',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.nationality,
              required: true,
              initialValue: 'FAR',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: {
                resource: 'countries'
              },
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatherNationality',
                  operation: 'nationalityTransformer'
                },
                mutation: {
                  operation: 'fieldToArrayTransformer'
                },
                query: {
                  operation: 'arrayToFieldTransformer'
                }
              }
            },
            {
              name: 'iD',
              type: 'TEXT',
              label: formMessageDescriptors.iDTypeNationalID,
              required: false,
              initialValue: '',
              validator: [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['mother.iD']
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                },
                nidIntegrationConditionals.hideIfNidIntegrationEnabled
              ],
              mapping: {
                template: {
                  fieldName: 'fatherNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                mutation: {
                  operation: 'fieldToIdentityTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                query: {
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                }
              }
            },
            {
              name: 'fatherNidVerification',
              type: 'NID_VERIFICATION_BUTTON',
              label: formMessageDescriptors.iDTypeNationalID,
              required: true,
              initialValue: '',
              validator: [],
              conditionals: [
                nidIntegrationConditionals.hideIfNidIntegrationDisabled,
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: `values.fatherNidVerification`
                }
              ],
              mapping: {
                mutation: {
                  operation: 'nidVerificationFieldToIdentityTransformer'
                },
                query: {
                  operation: 'identityToNidVerificationFieldTransformer'
                }
              },
              labelForVerified: formMessageDescriptors.nidVerified,
              labelForUnverified: formMessageDescriptors.nidNotVerified,
              labelForOffline: formMessageDescriptors.nidOffline
            },
            {
              name: 'fatherBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [10]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                },
                {
                  action: 'disable',
                  expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('fatherBirthDate')`
                }
              ],
              mapping: {
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'fatherBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy']
                },
                mutation: {
                  operation: 'longDateTransformer',
                  parameters: ['birthDate']
                },
                query: {
                  operation: 'fieldValueTransformer',
                  parameters: ['birthDate']
                }
              }
            },
            {
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!window.config.DATE_OF_BIRTH_UNKNOWN || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfFather,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [12, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                },
                {
                  operation: 'isValidParentsBirthDate',
                  parameters: [10, true]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.exactDateOfBirthUnknown || (!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant)'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'fatherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatherFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'firstNames']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'fatherNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                },
                {
                  action: 'disable',
                  expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatherFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'familyName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                }
              }
            },
            {
              name: 'seperator',
              type: 'SUBSECTION',
              label: {
                defaultMessage: ' ',
                description: 'empty string',
                id: 'form.field.label.empty'
              },
              initialValue: '',
              ignoreBottomMargin: true,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ]
            },
            {
              name: 'maritalStatus',
              type: 'SELECT_WITH_OPTIONS',
              label: {
                defaultMessage: 'Marital status',
                description: 'Label for form field: Marital status',
                id: 'form.field.label.maritalStatus'
              },
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatherMaritalStatus',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'SINGLE',
                  label: {
                    defaultMessage: 'Unmarried',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusSingle'
                  }
                },
                {
                  value: 'MARRIED',
                  label: {
                    defaultMessage: 'Married',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusMarried'
                  }
                },
                {
                  value: 'WIDOWED',
                  label: {
                    defaultMessage: 'Widowed',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusWidowed'
                  }
                },
                {
                  value: 'DIVORCED',
                  label: {
                    defaultMessage: 'Divorced',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusDivorced'
                  }
                },
                {
                  value: 'SEPARATED',
                  label: {
                    id: 'form.field.label.maritalStatusSeparated',
                    defaultMessage: 'Separated',
                    description: 'Option for form field: Marital status'
                  }
                },
                {
                  value: 'NOT_STATED',
                  label: {
                    defaultMessage: 'Not stated',
                    description: 'Option for form field: Marital status',
                    id: 'form.field.label.maritalStatusNotStated'
                  }
                }
              ]
            },
            {
              name: 'occupation',
              type: 'TEXT',
              label: {
                defaultMessage: 'Occupation',
                description: 'text for occupation form field',
                id: 'form.field.label.occupation'
              },
              required: false,
              initialValue: '',
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatheroccupation',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'educationalAttainment',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.educationAttainment,
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    '!values.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              options: [
                {
                  value: 'NO_SCHOOLING',
                  label: {
                    defaultMessage: 'No schooling',
                    description: 'Option for form field: no education',
                    id: 'form.field.label.educationAttainmentNone'
                  }
                },
                {
                  value: 'PRIMARY_ISCED_1',
                  label: {
                    defaultMessage: 'Primary',
                    description: 'Option for form field: ISCED1 education',
                    id: 'form.field.label.educationAttainmentISCED1'
                  }
                },
                {
                  value: 'POST_SECONDARY_ISCED_4',
                  label: {
                    defaultMessage: 'Secondary',
                    description: 'Option for form field: ISCED4 education',
                    id: 'form.field.label.educationAttainmentISCED4'
                  }
                },
                {
                  value: 'FIRST_STAGE_TERTIARY_ISCED_5',
                  label: {
                    defaultMessage: 'Tertiary',
                    description: 'Option for form field: ISCED5 education',
                    id: 'form.field.label.educationAttainmentISCED5'
                  }
                }
              ],
              mapping: {
                template: {
                  fieldName: 'fatherEducationalAttainment',
                  operation: 'selectTransformer'
                }
              }
            }
            // PRIMARY ADDRESS SAME AS MOTHER
            // PRIMARY ADDRESS SUBSECTION
            // PRIMARY ADDRESS
            // SECONDARY ADDRESS SAME AS MOTHER
            // SECONDARY ADDRESS SUBSECTION
            // SECONDARY ADDRESS
          ],
          previewGroups: [
            {
              id: 'fatherNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: "Group label for father's name in english",
                id: 'form.preview.group.label.father.english.name'
              },
              fieldToRedirect: 'familyNameEng',
              delimiter: ' '
            }
          ]
        }
      ],
      mapping: {
        query: {
          operation: 'emptyFatherSectionTransformer'
        }
      }
    },
    {
      id: 'documents',
      viewType: 'form',
      name: formMessageDescriptors.documentsName,
      title: {
        defaultMessage: 'Attaching supporting documents',
        description: 'Form section title for Documents',
        id: 'form.section.documents.title'
      },
      groups: [
        {
          id: 'documents-view-group',
          fields: [
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: formMessageDescriptors.documentsParagraph,
              initialValue: '',
              validator: []
            },
            {
              name: 'uploadDocForChildDOB',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfBirth,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.CHILD,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: birthDocumentTypeFhirMapping.NOTIFICATION_OF_BIRTH,
                  label: formMessageDescriptors.docTypeChildBirthProof
                }
              ],
              mapping: {
                mutation: {
                  operation: 'birthFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'birthAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForMother',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfMothersID,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.MOTHER,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: birthDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: birthDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              conditionals: [
                {
                  description: 'Hidden for Parent Details none or Mother only',
                  action: 'hide',
                  expression:
                    'draftData && draftData.mother && !draftData.mother.detailsExist && !mothersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'birthFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'birthAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForFather',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfFathersID,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.FATHER,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: birthDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: birthDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              conditionals: [
                {
                  description: 'Hidden for Parent Details none or Father only',
                  action: 'hide',
                  expression:
                    'draftData && draftData.father && !draftData.father.detailsExist && !fathersDetailsExistBasedOnContactAndInformant'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'birthFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'birthAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForInformant',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfInformantsID,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.INFORMANT_ID_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: birthDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: birthDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: birthDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: birthDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
                }
              ],
              mapping: {
                mutation: {
                  operation: 'birthFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'birthAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForProofOfLegarGuardian',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.otherBirthSupportingDocuments,
              initialValue: '',
              extraValue: birthDocumentForWhomFhirMapping.LEGAL_GUARDIAN_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value:
                    birthDocumentTypeFhirMapping.PROOF_OF_LEGAL_GUARDIANSHIP,
                  label: formMessageDescriptors.legalGuardianProof
                },
                {
                  value:
                    birthDocumentTypeFhirMapping.PROOF_OF_ASSIGNED_RESPONSIBILITY,
                  label: formMessageDescriptors.assignedResponsibilityProof
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
                }
              ],
              mapping: {
                mutation: {
                  operation: 'birthFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'birthAttachmentToFieldTransformer'
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
