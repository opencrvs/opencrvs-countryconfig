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

import {
  formMessageDescriptors,
  informantMessageDescriptors
} from './formatjs-messages'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from './options'
import { ISerializedForm, IntegratingSystemType, TEXTAREA } from './types/types'

const nidIntegrationConditionals = {
  hideIfNidIntegrationEnabled: {
    action: 'hide',
    expression: `const nationalIdSystem =
    offlineCountryConfig &&
    offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
        nationalIdSystem &&
        nationalIdSystem.settings.openIdProviderBaseUrl &&
        nationalIdSystem.settings.openIdProviderClientId &&
        nationalIdSystem.settings.openIdProviderClaims;
    `
  },
  hideIfNidIntegrationDisabled: {
    action: 'hide',
    expression: `const nationalIdSystem =
    offlineCountryConfig &&
    offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
      !nationalIdSystem ||
      !nationalIdSystem.settings.openIdProviderBaseUrl ||
      !nationalIdSystem.settings.openIdProviderClientId ||
      !nationalIdSystem.settings.openIdProviderClaims;
    `
  }
} as const

export const deathRegisterForms = {
  sections: [
    {
      id: 'registration',
      viewType: 'form',
      name: formMessageDescriptors.registrationName,
      title: formMessageDescriptors.registrationTitle,
      groups: [
        {
          id: 'who-is-applying-view-group',
          title: informantMessageDescriptors.deathInformantTitle,
          conditionals: [],
          preventContinueIfError: true,
          showExitButtonOnly: true,
          fields: [
            {
              name: 'informantType',
              type: 'SELECT_WITH_OPTIONS',
              label: informantMessageDescriptors.birthInformantTitle,
              required: true,
              hideInPreview: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.informantType']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.informantType']
                },
                template: {
                  fieldName: 'informantType',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'SPOUSE',
                  label: informantMessageDescriptors.SPOUSE
                },
                {
                  value: 'SON',
                  label: informantMessageDescriptors.SON
                },
                {
                  value: 'DAUGHTER',
                  label: informantMessageDescriptors.DAUGHTER
                },
                {
                  value: 'SON_IN_LAW',
                  label: informantMessageDescriptors.SON_IN_LAW
                },
                {
                  value: 'DAUGHTER_IN_LAW',
                  label: informantMessageDescriptors.DAUGHTER_IN_LAW
                },
                {
                  value: 'MOTHER',
                  label: informantMessageDescriptors.MOTHER
                },
                {
                  value: 'FATHER',
                  label: informantMessageDescriptors.FATHER
                },
                {
                  value: 'GRANDSON',
                  label: informantMessageDescriptors.GRANDSON
                },
                {
                  value: 'GRANDDAUGHTER',
                  label: informantMessageDescriptors.GRANDDAUGHTER
                },
                {
                  value: 'OTHER',
                  label: informantMessageDescriptors.OTHER
                }
              ]
            },
            {
              name: 'otherInformantType',
              type: 'TEXT',
              label: formMessageDescriptors.informantsRelationWithChild,
              placeholder: formMessageDescriptors.relationshipPlaceHolder,
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
                  expression: 'values.informantType !== "OTHER"'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.otherInformantType']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.otherInformantType']
                }
              }
            }
          ]
        },
        {
          id: 'contact-view-group',
          title: informantMessageDescriptors.selectContactPoint,
          conditionals: [],
          preventContinueIfError: true,
          showExitButtonOnly: true,
          previewGroups: [
            {
              id: 'contactPointGroup',
              label: formMessageDescriptors.reviewLabelMainContact,
              required: false,
              initialValue: '',
              fieldToRedirect: 'contactPoint'
            }
          ],
          fields: [
            {
              name: 'contactPoint',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.selectContactPoint,
              required: true,
              previewGroup: 'contactPointGroup',
              hideInPreview: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.contact']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.contact']
                },
                template: {
                  fieldName: 'contactPoint',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'SPOUSE',
                  label: informantMessageDescriptors.SPOUSE
                },
                {
                  value: 'SON',
                  label: informantMessageDescriptors.SON
                },
                {
                  value: 'DAUGHTER',
                  label: informantMessageDescriptors.DAUGHTER
                },
                {
                  value: 'SON_IN_LAW',
                  label: informantMessageDescriptors.SON_IN_LAW
                },
                {
                  value: 'DAUGHTER_IN_LAW',
                  label: informantMessageDescriptors.DAUGHTER_IN_LAW
                },
                {
                  value: 'MOTHER',
                  label: informantMessageDescriptors.MOTHER
                },
                {
                  value: 'FATHER',
                  label: informantMessageDescriptors.FATHER
                },
                {
                  value: 'GRANDSON',
                  label: informantMessageDescriptors.GRANDSON
                },
                {
                  value: 'GRANDDAUGHTER',
                  label: informantMessageDescriptors.GRANDDAUGHTER
                },
                {
                  value: 'OTHER',
                  label: informantMessageDescriptors.OTHER
                }
              ]
            },
            {
              name: 'registrationPhone',
              type: 'TEL',
              label: formMessageDescriptors.phoneNumber,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'phoneNumberFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: 'values.contactPoint !== "OTHER"'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.contactPhoneNumber']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.contactPhoneNumber']
                },
                template: {
                  fieldName: 'contactPhoneNumber',
                  operation: 'selectTransformer'
                }
              }
            }
          ]
        }
      ],
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
          operation: 'setDeathRegistrationSectionTransformer'
        },
        query: {
          operation: 'getDeathRegistrationSectionTransformer'
        }
      }
    },
    {
      id: 'deceased',
      viewType: 'form',
      name: formMessageDescriptors.deceasedName,
      title: formMessageDescriptors.deceasedTitle,
      groups: [
        {
          id: 'deceased-view-group',
          fields: [
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
              mapping: {
                template: {
                  fieldName: 'deceasedNationality',
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
                  parameters: ['informant.informantID']
                }
              ],
              mapping: {
                template: {
                  fieldName: 'deceasedNID',
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
              name: 'birthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                },
                {
                  action: 'disable',
                  expression: `draftData?.deceased?.fieldsModifiedByNidUserInfo?.includes('birthDate')`
                }
              ],
              validator: [
                {
                  operation: 'isValidBirthDate'
                }
              ],
              mapping: {
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'deceasedBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy']
                },
                mutation: {
                  operation: 'longDateTransformer',
                  parameters: []
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
              hideInPreview: true,
              required: false,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
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
              label: formMessageDescriptors.ageOfDeceased,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'range',
                  parameters: [1, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!values.exactDateOfBirthUnknown'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'deceasedNameInEnglish',
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
              mapping: {
                template: {
                  fieldName: 'deceasedFirstName',
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
              },
              conditionals: [
                {
                  action: 'disable',
                  expression: `draftData?.deceased?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
                }
              ]
            },
            {
              name: 'familyNameEng',
              previewGroup: 'deceasedNameInEnglish',
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
              mapping: {
                template: {
                  fieldName: 'deceasedFamilyName',
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
              },
              conditionals: [
                {
                  action: 'disable',
                  expression: `draftData?.deceased?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
                }
              ]
            },
            {
              name: 'gender',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.sex,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                template: {
                  fieldName: 'deceasedGender',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'male',
                  label: formMessageDescriptors.sexMale
                },
                {
                  value: 'female',
                  label: formMessageDescriptors.sexFemale
                },
                {
                  value: 'unknown',
                  label: formMessageDescriptors.sexUnknown
                }
              ]
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
              conditionals: []
            },
            {
              name: 'maritalStatus',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.maritalStatus,
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                template: {
                  fieldName: 'deceasedMaritalStatus',
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
            }
            // PRIMARY ADDRESS SUBSECTION
            // PRIMARY ADDRESS
            // SECONDARY ADDRESS SAME AS PRIMARY
            // SECONDARY ADDRESS SUBSECTION
            // SECONDARY ADDRESS
          ],
          previewGroups: [
            {
              id: 'deceasedNameInEnglish',
              label: formMessageDescriptors.nameInEnglishPreviewGroup,
              fieldToRedirect: 'familyNameEng',
              delimiter: ' '
            }
          ]
        }
      ]
    },
    {
      id: 'deathEvent',
      viewType: 'form',
      name: formMessageDescriptors.deathEventName,
      title: formMessageDescriptors.deathEventTitle,
      groups: [
        {
          id: 'death-event-details',
          fields: [
            {
              name: 'deathDate',
              type: 'DATE',
              label: formMessageDescriptors.deathEventDate,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'isValidDeathOccurrenceDate'
                }
              ],
              mapping: {
                template: {
                  operation: 'deceasedDateFormatTransformation',
                  fieldName: 'eventDate',
                  parameters: ['en', 'do MMMM yyyy', 'deceased']
                },
                mutation: {
                  operation: 'fieldToDeceasedDateTransformation',
                  parameters: [
                    'deceased',
                    {
                      operation: 'longDateTransformer',
                      parameters: []
                    }
                  ]
                },
                query: {
                  operation: 'deceasedDateToFieldTransformation',
                  parameters: ['deceased']
                }
              }
            },
            {
              name: 'mannerOfDeath',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.manner,
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: [
                {
                  value: 'NATURAL_CAUSES',
                  label: formMessageDescriptors.mannerNatural
                },
                {
                  value: 'ACCIDENT',
                  label: formMessageDescriptors.mannerAccident
                },
                {
                  value: 'SUICIDE',
                  label: formMessageDescriptors.mannerSuicide
                },
                {
                  value: 'HOMICIDE',
                  label: formMessageDescriptors.mannerHomicide
                },
                {
                  value: 'MANNER_UNDETERMINED',
                  label: formMessageDescriptors.mannerUndetermined
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['mannerOfDeath']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['mannerOfDeath']
                },
                template: {
                  fieldName: 'mannerOfDeath',
                  operation: 'selectTransformer'
                }
              }
            },
            {
              name: 'causeOfDeathEstablished',
              type: 'CHECKBOX',
              label: formMessageDescriptors.causeOfDeathEstablished,
              required: true,
              checkedValue: 'true',
              uncheckedValue: 'false',
              hideHeader: true,
              initialValue: 'false',
              validator: [],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['causeOfDeathEstablished']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['causeOfDeathEstablished']
                },
                template: {
                  fieldName: 'causeOfDeathEstablished',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'causeOfDeathMethod',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.causeOfDeathMethod,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              conditionals: [
                {
                  action: 'hide',
                  expression: 'values.causeOfDeathEstablished !== "true"'
                }
              ],
              options: [
                {
                  value: 'PHYSICIAN',
                  label: formMessageDescriptors.physician
                },
                {
                  value: 'LAY_REPORTED',
                  label: formMessageDescriptors.layReported
                },
                {
                  value: 'VERBAL_AUTOPSY',
                  label: formMessageDescriptors.verbalAutopsy
                },
                {
                  value: 'MEDICALLY_CERTIFIED',
                  label: formMessageDescriptors.medicallyCertified
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['causeOfDeathMethod']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['causeOfDeathMethod']
                },
                template: {
                  fieldName: 'causeOfDeathMethod',
                  operation: 'selectTransformer'
                }
              }
            },
            {
              name: 'deathDescription',
              type: TEXTAREA,
              label: formMessageDescriptors.deathDescription,
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    'values.causeOfDeathEstablished !== "true" || values.causeOfDeathMethod !== "LAY_REPORTED" && values.causeOfDeathMethod !== "VERBAL_AUTOPSY"'
                }
              ],
              initialValue: '',
              validator: [],
              required: true,
              maxLength: 500,
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['deathDescription']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['deathDescription']
                },
                template: {
                  fieldName: 'deathDescription',
                  operation: 'plainInputTransformer'
                }
              }
            },
            {
              name: 'placeOfDeath',
              type: 'SELECT_WITH_OPTIONS',
              previewGroup: 'placeOfDeath',
              ignoreFieldLabelOnErrorMessage: true,
              label: formMessageDescriptors.placeOfDeath,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: [
                {
                  value: 'HEALTH_FACILITY',
                  label: formMessageDescriptors.healthInstitution
                },
                {
                  value: 'DECEASED_USUAL_RESIDENCE',
                  label: formMessageDescriptors.placeOfDeathSameAsPrimary
                },
                {
                  value: 'OTHER',
                  label: formMessageDescriptors.otherInstitution
                }
              ],
              mapping: {
                mutation: {
                  operation: 'deathEventLocationMutationTransformer',
                  parameters: [{}]
                },
                query: {
                  operation: 'eventLocationTypeQueryTransformer',
                  parameters: []
                }
              }
            },

            {
              name: 'deathLocation',
              type: 'LOCATION_SEARCH_INPUT',
              label: {
                defaultMessage: 'Health institution',
                description: 'Label for form field: Health Institution',
                id: 'form.field.label.healthInstitution'
              },
              previewGroup: 'placeOfDeath',
              required: true,
              initialValue: '',
              searchableResource: ['facilities'],
              searchableType: ['HEALTH_FACILITY'],
              dynamicOptions: {
                resource: 'facilities'
              },
              validator: [
                {
                  operation: 'facilityMustBeSelected'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: '(values.placeOfDeath!="HEALTH_FACILITY")'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'placeOfDeath',
                  operation: 'eventLocationNameQueryOfflineTransformer',
                  parameters: ['facilities', 'placeOfDeath']
                },
                mutation: {
                  operation: 'deathEventLocationMutationTransformer',
                  parameters: [{}]
                },
                query: {
                  operation: 'eventLocationIDQueryTransformer',
                  parameters: []
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 'informant',
      viewType: 'form',
      name: formMessageDescriptors.informantName,
      title: formMessageDescriptors.deathInformantTitle,
      groups: [
        {
          id: 'informant-view-group',
          fields: [
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
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToArrayTransformer'
                    }
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'arrayToFieldTransformer'
                    }
                  ]
                },
                template: {
                  fieldName: 'informantNationality',
                  operation: 'nationalityTransformer'
                }
              }
            },
            {
              name: 'informantID',
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
                  parameters: ['deceased.iD']
                }
              ],
              conditionals: [
                nidIntegrationConditionals.hideIfNidIntegrationEnabled
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToIdentityTransformer',
                      parameters: ['id', 'NATIONAL_ID']
                    }
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'identityToFieldTransformer',
                      parameters: ['id', 'NATIONAL_ID']
                    }
                  ]
                },
                template: {
                  fieldName: 'informantNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID', 'individual']
                }
              }
            },
            {
              name: 'informantNidVerification',
              type: 'NID_VERIFICATION_BUTTON',
              label: formMessageDescriptors.iDTypeNationalID,
              required: true,
              initialValue: '',
              validator: [],
              conditionals: [
                nidIntegrationConditionals.hideIfNidIntegrationDisabled,
                {
                  action: 'disable',
                  expression: `values.informantNidVerification`
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nidVerificationFieldToIdentityTransformer'
                    }
                  ]
                },
                query: {
                  operation: 'nestedIdentityValueToFieldTransformer',
                  parameters: ['individual']
                }
              },
              labelForVerified: formMessageDescriptors.nidVerified,
              labelForUnverified: formMessageDescriptors.nidNotVerified,
              labelForOffline: formMessageDescriptors.nidOffline
            },
            {
              name: 'informantBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              required: true,
              initialValue: '',
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                },
                {
                  action: 'disable',
                  expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('informantBirthDate')`
                }
              ],
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'longDateTransformer',
                      parameters: ['birthDate']
                    },
                    'birthDate'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldValueTransformer',
                      parameters: ['birthDate']
                    }
                  ]
                },
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'informantBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy', 'individual']
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
              hideInPreview: true,
              required: false,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'ignoreFieldTransformer'
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'booleanTransformer'
                    }
                  ]
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfInformant,
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
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!values.exactDateOfBirthUnknown'
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px',
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: ['individual']
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: ['individual']
                }
              }
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'informantNameInEnglish',
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
                  action: 'disable',
                  expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'firstNames']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'firstNames']
                    }
                  ]
                },
                template: {
                  fieldName: 'informantFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames', 'informant', 'individual']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'informantNameInEnglish',
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
                  action: 'disable',
                  expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'familyName']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'familyName']
                    }
                  ]
                },
                template: {
                  fieldName: 'informantFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName', 'informant', 'individual']
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
              id: 'informantNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: "Label for informant's name in english",
                id: 'form.preview.group.label.informant.english.name'
              },
              fieldToRedirect: 'informantFamilyNameEng',
              delimiter: ' '
            }
          ]
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
      id: 'documents',
      viewType: 'form',
      name: formMessageDescriptors.documentsName,
      title: formMessageDescriptors.documentsTitle,
      groups: [
        {
          id: 'documents-view-group',
          fields: [
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: formMessageDescriptors.deceasedParagraph,
              initialValue: '',
              validator: []
            },
            {
              name: 'uploadDocForDeceased',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.deceasedIDProof,
              initialValue: '',
              extraValue: deathDocumentForWhomFhirMapping.DECEASED_ID_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: deathDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: deathDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: deathDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: deathDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForInformant',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfInformantsID,
              initialValue: '',
              extraValue: deathDocumentForWhomFhirMapping.INFORMANT_ID_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: deathDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: deathDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: deathDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: deathDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForDeceasedDeath',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.deceasedDeathProof,
              initialValue: '',
              extraValue: deathDocumentForWhomFhirMapping.DECEASED_DEATH_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: deathDocumentTypeFhirMapping.ATTESTED_LETTER_OF_DEATH,
                  label: formMessageDescriptors.docTypeLetterOfDeath
                },
                {
                  value:
                    deathDocumentTypeFhirMapping.POLICE_CERTIFICATE_OF_DEATH,
                  label: formMessageDescriptors.docTypePoliceCertificate
                },
                {
                  value:
                    deathDocumentTypeFhirMapping.HOSPITAL_CERTIFICATE_OF_DEATH,
                  label: formMessageDescriptors.docTypeHospitalDeathCertificate
                },
                {
                  value: deathDocumentTypeFhirMapping.CORONERS_REPORT,
                  label: formMessageDescriptors.docTypeCoronersReport
                },
                {
                  value: deathDocumentTypeFhirMapping.BURIAL_RECEIPT,
                  label: formMessageDescriptors.docTypeCopyOfBurialReceipt
                },
                {
                  value: deathDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForCauseOfDeath',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.causeOfDeathProof,
              initialValue: '',
              extraValue:
                deathDocumentForWhomFhirMapping.DECEASED_DEATH_CAUSE_PROOF,
              hideAsterisk: true,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression:
                    'draftData?.deathEvent?.causeOfDeathEstablished !== "true"'
                }
              ],
              options: [
                {
                  value:
                    deathDocumentTypeFhirMapping.MEDICALLY_CERTIFIED_CAUSE_OF_DEATH,
                  label: formMessageDescriptors.medicallyCertified
                },
                {
                  value: deathDocumentTypeFhirMapping.VERBAL_AUTOPSY_REPORT,
                  label: formMessageDescriptors.verbalAutopsyReport
                },
                {
                  value: deathDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            }
          ]
        }
      ]
    }
  ]
} satisfies ISerializedForm
