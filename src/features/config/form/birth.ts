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

import { ISerializedForm } from './types/types'
import {
  birthDocumentForWhomFhirMapping,
  birthDocumentTypeFhirMapping
} from './options'
import { formMessageDescriptors } from './formatjs-messages'
import {
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
  getEducation,
  getMaritalStatus,
  getNIDVerificationButton,
  getOccupation,
  multipleBirth,
  registrationEmail,
  registrationPhone,
  weightAtBirth
} from './birth/optional-fields'
import {
  childNameInEnglish,
  fatherNameInEnglish,
  informantNameInEnglish,
  motherNameInEnglish
} from './birth/preview-groups'
import {
  isValidChildBirthDate,
  informantFirstNameConditionals,
  hideIfInformantMotherOrFather,
  informantFamilyNameConditionals,
  informantBirthDateConditionals,
  exactDateOfBirthUnknownConditional,
  hideIfNidIntegrationEnabled,
  getNationalIDValidators,
  hideIfNidIntegrationDisabled,
  mothersDetailsExistConditionals,
  mothersBirthDateConditionals,
  parentsBirthDateValidators,
  detailsExist,
  motherFirstNameConditionals,
  motherFamilyNameConditionals,
  motherNationalIDVerfication,
  fathersDetailsExistConditionals,
  fathersBirthDateConditionals,
  fatherFirstNameConditionals,
  fatherFamilyNameConditionals,
  fatherNationalIDVerfication
} from './birth/utils'

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
              name: 'list',
              type: 'BULLET_LIST',
              items: [
                {
                  defaultMessage:
                    'I am going to help you make a declaration of birth.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet1'
                },
                {
                  defaultMessage:
                    'As the legal Informant it is important that all the information provided by you is accurate.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet2'
                },
                {
                  defaultMessage:
                    'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet3'
                },
                {
                  defaultMessage:
                    'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet4'
                }
              ],
              // this is to set the title of the page
              label: {
                id: 'register.eventInfo.birth.title'
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
            ...getPlaceOfBirthFields(),
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
      groups: [
        {
          id: 'informant-view-group',
          fields: [
            informantType, // Required field.
            otherInformantType, // Required field.
            registrationPhone,
            registrationEmail,
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              'informantFirstName'
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              'informantFamilyName'
            ), // Required field.
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              [],
              'eventDate'
            ), // Required field.
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantMotherOrFather
              )
            ),
            getNationality(
              'informantNationality',
              hideIfInformantMotherOrFather
            ),
            getNationalID(
              'informantID',
              hideIfNidIntegrationEnabled.concat(hideIfInformantMotherOrFather),
              getNationalIDValidators('informant'),
              'informantNID'
            ),
            getNIDVerificationButton(
              'informantNidVerification',
              hideIfNidIntegrationDisabled.concat(
                hideIfInformantMotherOrFather
              ),
              []
            )
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
      groups: [
        {
          id: 'mother-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.mothersDetailsExist,
              mothersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getReasonNotExisting('motherReasonNotApplying'), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getBirthDate(
              'motherBirthDate',
              mothersBirthDateConditionals,
              parentsBirthDateValidators,
              'motherBirthDate'
            ), // Required field.
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfMother,
              exactDateOfBirthUnknownConditional
            ),
            getFirstNameField(
              'motherNameInEnglish',
              motherFirstNameConditionals,
              'motherFirstName'
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'motherNameInEnglish',
              motherFamilyNameConditionals,
              'motherFamilyName'
            ), // Required field.
            getNationality('motherNationality', detailsExist), // Required field.
            getNationalID(
              'iD',
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('mother'),
              'motherNID'
            ),
            getNIDVerificationButton(
              'motherNidVerification',
              hideIfNidIntegrationDisabled.concat(motherNationalIDVerfication),
              []
            ),
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
                  expression: '!values.detailsExist'
                }
              ]
            },
            getMaritalStatus('motherMaritalStatus'),
            multipleBirth,
            getOccupation('motherOccupation'),
            getEducation('motherEducationalAttainment')
          ],
          previewGroups: [motherNameInEnglish]
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
      groups: [
        {
          id: 'father-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.fathersDetailsExist,
              fathersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getReasonNotExisting('fatherReasonNotApplying'), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getBirthDate(
              'fatherBirthDate',
              fathersBirthDateConditionals,
              parentsBirthDateValidators,
              'fatherBirthDate'
            ), // Required field.
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfFather,
              exactDateOfBirthUnknownConditional
            ),
            getFirstNameField(
              'fatherNameInEnglish',
              fatherFirstNameConditionals,
              'fatherFirstName'
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'fatherNameInEnglish',
              fatherFamilyNameConditionals,
              'fatherFamilyName'
            ), // Required field.
            getNationality('fatherNationality', detailsExist), // Required field.
            getNationalID(
              'iD',
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('father'),
              'fatherNID'
            ),
            getNIDVerificationButton(
              'fatherNidVerification',
              hideIfNidIntegrationDisabled.concat(fatherNationalIDVerfication),
              []
            ),
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
                  expression: '!values.detailsExist'
                }
              ]
            },
            getMaritalStatus('fatherMaritalStatus'),
            multipleBirth,
            getOccupation('fatherOccupation'),
            getEducation('fatherEducationalAttainment')
          ],
          previewGroups: [fatherNameInEnglish]
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
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
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
                    'draftData && draftData.mother && !draftData.mother.detailsExist'
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
                    'draftData && draftData.father && !draftData.father.detailsExist'
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
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForProofOfLegalGuardian',
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
}
