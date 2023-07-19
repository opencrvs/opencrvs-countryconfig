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
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  getMaritalStatus,
  registrationEmail,
  registrationPhone,
  seperatorSubsection
} from './common-optional-fields'
import {
  getGender,
  getBirthDate,
  getFamilyNameField,
  getFirstNameField,
  getNationalID,
  getNationality,
  otherInformantType
} from './common-required-fields'
import {
  deathInformantType,
  getCauseOfDeath,
  getCauseOfDeathMethod,
  getDeathDate,
  getDeathDescription,
  getMannerOfDeath,
  getPlaceOfDeathFields
} from './death/required-fields'
import { formMessageDescriptors } from './formatjs-messages'
import {
  deathDocumentForWhomFhirMapping,
  deathDocumentTypeFhirMapping
} from './options'
import { Event, ISerializedForm } from './types/types'
import {
  getNationalIDValidators,
  hideIfNidIntegrationEnabled,
  informantBirthDateConditionals,
  informantFamilyNameConditionals,
  informantFirstNameConditionals,
  exactDateOfBirthUnknownConditional,
  isValidBirthDate
} from './common-utils'

export const deathRegisterForms = {
  sections: [
    {
      id: 'registration',
      viewType: 'hidden',
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
              'Introduce the death registration process to the informant',
            description: 'Event information title for the birth',
            id: 'register.eventInfo.death.title'
          },
          conditionals: [
            {
              action: 'hide',
              expression: 'window.config.HIDE_DEATH_EVENT_REGISTER_INFORMATION'
            }
          ],
          fields: [
            {
              name: 'list',
              type: 'BULLET_LIST',
              items: [
                {
                  defaultMessage:
                    'I am going to help you make a declaration of death.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet1'
                },
                {
                  defaultMessage:
                    'As the legal Informant it is important that all the information provided by you is accurate.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet2'
                },
                {
                  defaultMessage:
                    'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet3'
                },
                {
                  defaultMessage:
                    'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet4'
                }
              ],
              label: {
                id: 'register.eventInfo.death.title'
              },
              initialValue: '',
              validator: []
            }
          ]
        }
      ]
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
            getFirstNameField('deceasedNameInEnglish', [], 'deceasedFirstName'), // Required field.  Names in Latin characters must be provided for international passport
            getFamilyNameField(
              'deceasedNameInEnglish',
              [],
              'deceasedFamilyName'
            ), // Required field.  Names in Latin characters must be provided for international passport
            getGender('deceasedGender'), // Required field.
            getBirthDate(
              'deceasedBirthDate',
              [],
              isValidBirthDate,
              'eventDate'
            ), // Required field.,
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional
            ),
            getNationality('deceasedNationality', []),
            getNationalID(
              'deceasedID',
              [],
              getNationalIDValidators('deceased'),
              'deceasedNID'
            ),
            seperatorSubsection,
            getMaritalStatus('deceasedMaritalStatus')
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
            getDeathDate(
              'deathDate',
              [],
              [
                {
                  operation: 'isValidDeathOccurrenceDate'
                }
              ],
              'eventDate'
            ),
            getMannerOfDeath,
            getCauseOfDeath,
            getCauseOfDeathMethod,
            getDeathDescription,
            ...getPlaceOfDeathFields()
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
            deathInformantType,
            otherInformantType(Event.Death),
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
              [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                }
              ],
              'eventDate'
            ), // Required field.
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional
            ),
            getNationality('informantNationality', []),
            getNationalID(
              'informantID',
              hideIfNidIntegrationEnabled,
              getNationalIDValidators('informant'),
              'informantNID'
            ),
            seperatorSubsection,
            registrationPhone,
            registrationEmail
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
