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
  defineConfig,
  defineForm,
  SelectOption
} from '@opencrvs/toolkit/events'
import {
  defineConditional,
  eventHasAction,
  not,
  field,
  and
} from '@opencrvs/toolkit/conditionals'
import { formMessageDescriptors } from './messageDescriptors'
import {
  getAddressFields,
  getInformantFields,
  getPersonInputFields
} from './person'
import { appendConditionalsToFields } from './utils'

const informantTypes = {
  SPOUSE: 'SPOUSE',
  SON: 'SON',
  DAUGHTER: 'DAUGHTER',
  SON_IN_LAW: 'SON_IN_LAW',
  DAUGHTER_IN_LAW: 'DAUGHTER_IN_LAW',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  GRANDSON: 'GRANDSON',
  GRANDDAUGHTER: 'GRANDDAUGHTER',
  OTHER: 'OTHER',
  GROOM: 'GROOM',
  BRIDE: 'BRIDE',
  GRANDFATHER: 'GRANDFATHER',
  GRANDMOTHER: 'GRANDMOTHER',
  BROTHER: 'BROTHER',
  SISTER: 'SISTER',
  OTHER_FAMILY_MEMBER: 'OTHER_FAMILY_MEMBER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',
  HEAD_OF_GROOM_FAMILY: 'HEAD_OF_GROOM_FAMILY',
  HEAD_OF_BRIDE_FAMILY: 'HEAD_OF_BRIDE_FAMILY'
}

export const informantMessageDescriptors = {
  birthInformantTitle: {
    defaultMessage: 'Informant type',
    description: 'Who is applying for birth registration',
    id: 'register.selectInformant.birthInformantTitle'
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
  BROTHER: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.informantRelation.brother'
  },
  SISTER: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.informantRelation.sister'
  },
  OTHER_FAMILY_MEMBER: {
    defaultMessage: 'Other family member',
    description: 'Label for other family member relation',
    id: 'form.field.label.relationOtherFamilyMember'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  OTHER: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  },
  deathInformantTitle: {
    defaultMessage: 'Who is applying for death registration?',
    description: 'Who is applying for death registration',
    id: 'register.selectInformant.deathInformantTitle'
  },
  SPOUSE: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'form.field.label.informantRelation.spouse'
  },
  SON: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'form.field.label.informantRelation.son'
  },
  DAUGHTER: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'form.field.label.informantRelation.daughter'
  },
  SON_IN_LAW: {
    defaultMessage: 'Son in law',
    description: 'Label for option Son in law',
    id: 'form.field.label.informantRelation.sonInLaw'
  },
  DAUGHTER_IN_LAW: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option Daughter in law',
    id: 'form.field.label.informantRelation.daughterInLaw'
  },
  GRANDSON: {
    defaultMessage: 'Grandson',
    description: 'Label for option Grandson',
    id: 'form.field.label.informantRelation.grandson'
  },
  GRANDDAUGHTER: {
    defaultMessage: 'Granddaughter',
    description: 'Label for option Granddaughter',
    id: 'form.field.label.informantRelation.granddaughter'
  },
  // selectContactPoint: {},
  selectContactPoint: {
    defaultMessage: 'Contact Point',
    description: 'Label for option Contact point',
    id: 'form.field.label.informantRelation.contactPoint'
  },
  marriageInformantTitle: {
    defaultMessage: 'Who is applying for marriage registration?',
    description: 'Who is applying for marriage registration',
    id: 'register.selectInformant.marriageInformantTitle'
  },
  GROOM: {
    defaultMessage: 'Groom',
    description: 'Label for option groom',
    id: 'form.field.label.informantRelation.groom'
  },
  BRIDE: {
    defaultMessage: 'Bride',
    description: 'Label for option bride',
    id: 'form.field.label.informantRelation.bride'
  }
}

const genderOptions: SelectOption[] = [
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

const typeOfBirthOptions: SelectOption[] = [
  {
    value: 'SINGLE',
    label: formMessageDescriptors.birthTypeSingle
  },
  {
    value: 'TWIN',
    label: formMessageDescriptors.birthTypeTwin
  },
  {
    value: 'TRIPLET',
    label: formMessageDescriptors.birthTypeTriplet
  },
  {
    value: 'QUADRUPLET',
    label: formMessageDescriptors.birthTypeQuadruplet
  },
  {
    value: 'HIGHER_MULTIPLE_DELIVERY',
    label: formMessageDescriptors.birthTypeHigherMultipleDelivery
  }
]

const attendantAtBirthOptions: SelectOption[] = [
  {
    value: 'PHYSICIAN',
    label: formMessageDescriptors.physician
  },
  {
    value: 'NURSE',
    label: formMessageDescriptors.attendantAtBirthNurse
  },
  {
    value: 'MIDWIFE',
    label: formMessageDescriptors.attendantAtBirthMidwife
  },
  {
    value: 'OTHER_PARAMEDICAL_PERSONNEL',
    label: formMessageDescriptors.attendantAtBirthOtherParamedicalPersonnel
  },
  {
    value: 'LAYPERSON',
    label: formMessageDescriptors.attendantAtBirthLayperson
  },
  {
    value: 'TRADITIONAL_BIRTH_ATTENDANT',
    label: formMessageDescriptors.attendantAtBirthTraditionalBirthAttendant
  },
  {
    value: 'NONE',
    label: formMessageDescriptors.attendantAtBirthNone
  }
]

const birthInformantTypeOptions: SelectOption[] = [
  {
    value: informantTypes.MOTHER,
    label: informantMessageDescriptors.MOTHER
  },
  {
    value: informantTypes.FATHER,
    label: informantMessageDescriptors.FATHER
  },
  {
    value: informantTypes.GRANDFATHER,
    label: informantMessageDescriptors.GRANDFATHER
  },
  {
    value: informantTypes.GRANDMOTHER,
    label: informantMessageDescriptors.GRANDMOTHER
  },
  {
    value: informantTypes.BROTHER,
    label: informantMessageDescriptors.BROTHER
  },
  {
    value: informantTypes.SISTER,
    label: informantMessageDescriptors.SISTER
  },
  {
    value: informantTypes.LEGAL_GUARDIAN,
    label: informantMessageDescriptors.LEGAL_GUARDIAN
  },
  {
    value: informantTypes.OTHER,
    label: informantMessageDescriptors.OTHER
  }
]

export const placeOfBirthOptions: SelectOption[] = [
  {
    value: 'HEALTH_FACILITY',
    label: formMessageDescriptors.healthInstitution
  },
  {
    value: 'PRIVATE_HOME',
    label: formMessageDescriptors.privateHome
  },
  {
    value: 'OTHER',
    label: formMessageDescriptors.otherInstitution
  }
]
const BIRTH_FORM = defineForm({
  label: {
    id: 'event.birth.action.declare.form.label',
    defaultMessage: 'Birth decalration form',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'event.birth.action.declare.form.review.title',
      defaultMessage: 'Birth declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.birth.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'introduction',
      title: {
        defaultMessage:
          'Introduce the birth registration process to the informant',
        description: 'Event information title for the birth',
        id: 'register.eventInfo.birth.title'
      },
      fields: [
        {
          type: 'BULLET_LIST',
          id: 'form.section.information.birth.bulletList',
          label: {
            id: 'form.section.information.birth.bulletList.label',
            defaultMessage: 'Birth Information',
            description: 'Label for the birth information bullet list'
          },
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
                'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
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
          font: 'reg16'
        }
      ]
    },
    {
      id: 'child',
      title: {
        defaultMessage: "Child's details",
        description: 'Form section title for Child',
        id: 'form.birth.child.title'
      },
      fields: [
        {
          id: 'child.firstname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'First name(s)',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.firstname.label'
          }
        },
        {
          id: 'child.surname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Last name',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.surname.label'
          }
        },
        {
          id: 'child.gender',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Sex',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.gender.label'
          },
          options: genderOptions
        },
        {
          id: 'child.dob',
          type: 'DATE',
          required: true,
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'event.birth.action.declare.form.section.child.field.dob.error'
              },
              validator: field('child.dob').isBeforeNow()
            }
          ],
          label: {
            defaultMessage: 'Date of birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.dob.label'
          }
        },
        {
          id: 'child.placeOfBirth',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Place of delivery',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.placeOfBirth.label'
          },
          options: placeOfBirthOptions
        },
        {
          id: 'child.birthLocation',
          type: 'LOCATION',
          required: true,
          label: {
            defaultMessage: 'Health Institution',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
          },
          options: {
            type: 'HEALTH_FACILITY'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
                'HEALTH_FACILITY'
              ])
            }
          ]
        },
        ...appendConditionalsToFields({
          inputFields: getAddressFields('child.birthLocation'),
          newConditionals: [
            {
              type: 'HIDE',
              conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
                'PRIVATE_HOME'
              ])
            }
          ]
        }),
        ...appendConditionalsToFields({
          inputFields: getAddressFields('child.birthLocation'),
          newConditionals: [
            {
              type: 'HIDE',
              conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
                'OTHER'
              ])
            }
          ]
        }),
        {
          id: 'child.attendantAtBirth',
          type: 'SELECT',
          required: false,
          label: {
            defaultMessage: 'Attendant at birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
          },
          options: attendantAtBirthOptions
        },
        {
          id: 'child.birthType',
          type: 'SELECT',
          required: false,
          label: {
            defaultMessage: 'Type of birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.birthType.label'
          },
          options: typeOfBirthOptions
        },
        {
          id: 'child.weightAtBirth',
          type: 'TEXT',
          required: false,
          label: {
            defaultMessage: 'Weight at birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.label'
          },
          options: {
            type: 'number'
          }
        }
      ]
    },
    {
      id: 'informant',
      title: {
        defaultMessage: "Informant's details",
        description: 'Form section title for informants details',
        id: 'form.section.informant.title'
      },
      fields: [
        {
          id: 'informant.relation',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Relationship to child',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.informant.field.relation.label'
          },
          options: birthInformantTypeOptions
        },
        ...appendConditionalsToFields({
          inputFields: getInformantFields('informant'),
          newConditionals: [
            {
              type: 'HIDE',
              conditional: field('informant.relation').isUndefinedOrInArray([
                'MOTHER',
                'FATHER'
              ])
            }
          ]
        }),
        {
          id: 'informant.phoneNo',
          type: 'TEXT',
          required: false,
          label: {
            defaultMessage: 'Phone number',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.informant.field.phoneNo.label'
          }
        },
        {
          id: 'informant.email',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Email',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.informant.field.email.label'
          },
          options: {
            type: 'email'
          }
        }
      ]
    },
    {
      id: 'mother',
      title: {
        defaultMessage: "Mother's details",
        description: 'Form section title for mothers details',
        id: 'form.section.mother.title'
      },
      fields: [
        {
          id: 'mother.detailsNotAvailable',
          type: 'CHECKBOX',
          required: true,
          label: {
            defaultMessage: "Mother's details not available",
            description: 'This is the label for the field',
            id: `event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label`
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field('informant.relation').isInArray(['MOTHER'])
            }
          ]
        },
        {
          id: 'mother.reason',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.mother.field.reason.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'mother.detailsNotAvailable'
              ).isUndefinedOrInArray(['false'])
            }
          ]
        },
        ...appendConditionalsToFields({
          inputFields: [
            ...getPersonInputFields('mother'),
            {
              id: 'mother.previousBirths',
              type: 'TEXT',
              required: false,
              label: {
                defaultMessage: 'No. of previous births',
                description: 'This is the label for the field',
                id: 'event.birth.action.declare.form.section.mother.field.previousBirths.label'
              },
              conditionals: []
            }
          ],
          newConditionals: [
            {
              type: 'HIDE',
              conditional: and(
                field('mother.detailsNotAvailable').isInArray(['true']),
                field('informant.relation').isUndefinedOrNotInArray(['MOTHER'])
              )
            }
          ]
        })
      ]
    },
    {
      id: 'father',
      title: {
        defaultMessage: "Father's details",
        description: 'Form section title for fathers details',
        id: 'form.section.father.title'
      },
      fields: [
        {
          id: 'father.detailsNotAvailable',
          type: 'CHECKBOX',
          required: true,
          label: {
            defaultMessage: "Father's details not available",
            description: 'This is the label for the field',
            id: `event.birth.action.declare.form.section.father.field.detailsNotAvailable.label`
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field('informant.relation').isInArray(['FATHER'])
            }
          ]
        },
        {
          id: 'father.reason',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Reason',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.father.field.reason.label'
          },
          conditionals: [
            {
              type: 'HIDE',
              conditional: field(
                'father.detailsNotAvailable'
              ).isUndefinedOrInArray(['false'])
            }
          ]
        },
        ...appendConditionalsToFields({
          inputFields: getPersonInputFields('father'),
          newConditionals: [
            {
              type: 'HIDE',
              conditional: and(
                field('father.detailsNotAvailable').isInArray(['true']),
                field('informant.relation').isUndefinedOrNotInArray(['FATHER'])
              )
            }
          ]
        })
      ]
    },
    {
      id: 'documents',
      title: {
        defaultMessage: 'Upload supporting documents',
        description: 'Form section title for documents',
        id: 'form.section.documents.title'
      },
      fields: [
        {
          id: `documents.helper`,
          type: 'PARAGRAPH',
          label: {
            defaultMessage: 'The following documents are required',
            description: 'This is the label for the field',
            id: `event.birth.action.declare.form.section.documents.field.helper.label`
          },
          options: { fontVariant: 'reg16' },
          conditionals: []
        },
        {
          id: 'documents.proofOfBirth',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: 'Proof of birth',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
          }
        },
        {
          id: 'documents.proofOfMother',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: "Proof of mother's ID",
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.documents.field.proofOfMother.label'
          }
        },

        {
          id: 'documents.proofOfFather',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: "Proof of father's ID",
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.documents.field.proofOfFather.label'
          }
        },

        {
          id: 'documents.proofOther',
          type: 'FILE', // @ToDo File upload with options
          required: false,
          label: {
            defaultMessage: 'Other',
            description: 'This is the label for the field',
            id: 'event.birth.action.declare.form.section.documents.field.proofOther.label'
          }
        }
      ]
    }
  ]
})

export const BirthEvent = defineConfig({
  id: 'BIRTH',
  label: {
    defaultMessage: 'Birth declaration',
    description: 'This is what this event is referred as in the system',
    id: 'event.birth.label'
  },
  summary: {
    title: {
      defaultMessage: '{applicant.firstname} {applicant.surname}',
      description: 'This is the title of the summary',
      id: 'event.birth.summary.title'
    },
    fields: []
  },
  workqueues: [
    {
      id: 'all',
      title: {
        defaultMessage: 'All birth events',
        description: 'Label for all birth events workqueue',
        id: 'event.birth.workqueue.all.label'
      },
      fields: [
        {
          id: 'child.firstname'
        },
        {
          id: 'child.surname'
        }
      ],
      filters: []
    }
  ],
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.declare.label'
      },
      forms: [BIRTH_FORM],
      allowedWhen: defineConditional(not(eventHasAction('DECLARE')))
    }
  ]
})
