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
  ActionType,
  ConditionalType,
  defineConfig,
  defineForm
} from '@opencrvs/toolkit/events'
import {
  event,
  user,
  or,
  and,
  not,
  field
} from '@opencrvs/toolkit/conditionals'

import { Event } from './types/types'
import { MAX_NAME_LENGTH } from './v2/utils'
import { SCOPES } from '@opencrvs/toolkit/scopes'

const TENNIS_CLUB_FORM = defineForm({
  label: {
    id: 'v2.event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.declare.form.review.title',
      defaultMessage: 'Member declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: [
      {
        id: 'review.comment',
        type: 'TEXTAREA',
        label: {
          defaultMessage: 'Comment',
          id: 'v2.event.birth.action.declare.form.review.comment.label',
          description: 'Label for the comment field in the review section'
        }
      },
      {
        type: 'SIGNATURE',
        id: 'review.signature',
        required: false,
        label: {
          defaultMessage: 'Signature of informant',
          id: 'v2.event.birth.action.declare.form.review.signature.label',
          description: 'Label for the signature field in the review section'
        },
        signaturePromptLabel: {
          id: 'v2.signature.upload.modal.title',
          defaultMessage: 'Draw signature',
          description: 'Title for the modal to draw signature'
        }
      }
    ]
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'applicant',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'applicant.firstname',
          type: 'TEXT',
          configuration: { maxLength: MAX_NAME_LENGTH },
          required: true,
          label: {
            defaultMessage: "Applicant's first name",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'applicant.surname',
          type: 'TEXT',
          configuration: { maxLength: MAX_NAME_LENGTH },
          required: true,
          label: {
            defaultMessage: "Applicant's surname",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
          }
        },
        {
          id: 'applicant.dob',
          type: 'DATE',
          required: true,
          validation: [
            {
              message: {
                defaultMessage: 'Please enter a valid date',
                description: 'This is the error message for invalid date',
                id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.error'
              },
              validator: field('applicant.dob').isBefore().now()
            }
          ],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        },
        {
          id: 'applicant.image',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: "Applicant's profile picture",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        },
        {
          id: 'applicant.image.label',
          type: 'TEXT',
          required: false,
          label: {
            defaultMessage: "Applicant's profile picture description",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      title: {
        id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.title',
        defaultMessage: 'Who is recommending the applicant?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'recommender.none',
          type: 'CHECKBOX',
          required: false,
          conditionals: [],
          label: {
            defaultMessage: 'No recommender',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.none.label'
          }
        },
        {
          id: 'recommender.firstname',
          configuration: { maxLength: MAX_NAME_LENGTH },
          type: 'TEXT',
          required: true,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's first name",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
          }
        },
        {
          id: 'recommender.surname',
          configuration: { maxLength: MAX_NAME_LENGTH },
          type: 'TEXT',
          required: true,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's surname",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label'
          }
        },
        {
          id: 'recommender.id',
          type: 'TEXT',
          required: true,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            }
          ],
          label: {
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        }
      ]
    }
  ]
})

const TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM = defineForm({
  label: {
    id: 'v2.event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.review.title',
      defaultMessage: 'Member certificate collector for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: []
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'collector',
      title: {
        id: 'v2.event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.requesterId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Requester',
            description: 'This is the label for the field',
            id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.label'
          },
          options: [
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              },
              value: 'INFORMANT'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              },
              value: 'PRINT_IN_ADVANCE'
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID',
            id: 'v2.event.tennis-club-membership.action.form.section.idType.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ],
          options: [
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              },
              value: 'PASSPORT'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              },
              value: 'DRIVING_LICENSE'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              },
              value: 'REFUGEE_NUMBER'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              },
              value: 'ALIEN_NUMBER'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              },
              value: 'NO_ID'
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details',
            id: 'v2.event.tennis-club-membership.action.form.section.passportDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').inArray(['PASSPORT'])
            }
          ]
        },
        {
          id: 'collector.DRIVING_LICENSE.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details',
            id: 'v2.event.tennis-club-membership.action.form.section.drivingLicenseDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').inArray([
                'DRIVING_LICENSE'
              ])
            }
          ]
        },
        {
          id: 'collector.REFUGEE_NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details',
            id: 'v2.event.tennis-club-membership.action.form.section.refugeeNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').inArray([
                'REFUGEE_NUMBER'
              ])
            }
          ]
        },
        {
          id: 'collector.ALIEN_NUMBER.details',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details',
            id: 'v2.event.tennis-club-membership.action.form.section.alienNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').inArray([
                'ALIEN_NUMBER'
              ])
            }
          ]
        },
        {
          id: 'collector.OTHER.idTypeOther',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected',
            id: 'v2.event.tennis-club-membership.action.form.section.idTypeOther.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').inArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.firstName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field',
            id: 'v2.event.tennis-club-membership.action.form.section.firstName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.lastName',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field',
            id: 'v2.event.tennis-club-membership.action.form.section.lastName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field',
            id: 'v2.event.tennis-club-membership.action.form.section.relationshipToMember.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit',
            id: 'v2.event.tennis-club-membership.action.form.section.signedAffidavit.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').inArray(['OTHER'])
            }
          ]
        }
      ]
    }
  ]
})

export const tennisClubMembershipEvent = defineConfig({
  id: Event.TENNIS_CLUB_MEMBERSHIP,
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.tennis-club-membership.label'
  },
  summary: {
    title: {
      id: '',
      label: {
        defaultMessage: '{applicant.firstname} {applicant.surname}',
        description: 'This is the title of the summary',
        id: 'v2.event.tennis-club-membership.summary.title'
      }
    },
    fields: [
      {
        id: 'applicant.firstname',
        emptyValueMessage: {
          defaultMessage: "Applicant's first name missing",
          description:
            "Shown when the applicant's first name is missing in summary",
          id: 'v2.event.tennis-club-membership.summary.field.applicant.firstname.empty'
        },
        label: {
          defaultMessage: "Applicant's First Name",
          description: "Label for the applicant's first name field",
          id: 'v2.event.tennis-club-membership.summary.field.applicant.firstname.label'
        },
        value: {
          defaultMessage: '{applicant.firstname}',
          description: "Value for the applicant's first name field",
          id: 'v2.event.tennis-club-membership.summary.field.applicant.firstname.value'
        }
      },
      {
        id: 'applicant.surname',
        emptyValueMessage: {
          defaultMessage: "Applicant's surname missing",
          description: 'Shown when the surname is missing in summary',
          id: 'v2.event.tennis-club-membership.summary.field.applicant.surname.empty'
        },
        label: {
          defaultMessage: "Applicant's Surname",
          description: 'Label for the applicant’s surname field',
          id: 'v2.event.tennis-club-membership.summary.field.applicant.surname.label'
        },
        value: {
          defaultMessage: '{applicant.surname}',
          description: 'Value for the applicant’s surname field',
          id: 'v2.event.tennis-club-membership.summary.field.applicant.surname.value'
        }
      },
      {
        id: 'recommender.firstname',
        emptyValueMessage: {
          defaultMessage: "Recommender's first name missing",
          description:
            'Shown when the recommender first name is missing in summary',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.firstname.empty'
        },
        label: {
          defaultMessage: "Recommender's First Name",
          description: 'Label for the recommender’s first name field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.firstname.label'
        },
        value: {
          defaultMessage: '{recommender.firstname}',
          description: 'Value for the recommender’s first name field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.firstname.value'
        }
      },
      {
        id: 'recommender.surname',
        emptyValueMessage: {
          defaultMessage: "Recommender's surname missing",
          description:
            'Shown when the recommender surname is missing in summary',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.surname.empty'
        },
        label: {
          defaultMessage: "Recommender's Surname",
          description: 'Label for the recommender’s surname field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.surname.label'
        },
        value: {
          defaultMessage: '{recommender.surname}',
          description: 'Value for the recommender’s surname field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.surname.value'
        }
      },
      {
        id: 'recommender.id',
        emptyValueMessage: {
          defaultMessage: "Recommender's id missing",
          description: 'Shown when the recommender id is missing in summary',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.id.empty'
        },
        label: {
          defaultMessage: "Recommender's ID",
          description: 'Label for the recommender’s ID field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.id.label'
        },
        value: {
          defaultMessage: '{recommender.id}',
          description: 'Value for the recommender’s ID field',
          id: 'v2.event.tennis-club-membership.summary.field.recommender.id.value'
        }
      }
    ]
  },
  workqueues: [
    {
      id: 'all',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.all.name.label'
          }
        }
      ],
      filters: []
    },
    {
      id: 'ready-for-review',

      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.readyForReview.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['DECLARED']
        }
      ]
    },
    {
      id: 'registered',

      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{applicant.firstname} {applicant.surname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.tennis-club-membership.workqueue.registered.name.label'
          }
        }
      ],
      filters: [
        {
          status: ['REGISTERED']
        }
      ]
    }
  ],
  actions: [
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.declare.label'
      },
      forms: [TENNIS_CLUB_FORM],
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            not(event.hasAction(ActionType.DECLARE)),
            user.hasScope(SCOPES.RECORD_DECLARE)
          )
        }
      ]
    },
    {
      type: ActionType.DELETE,
      label: {
        defaultMessage: 'Delete draft',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.delete.label'
      },
      forms: [],
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            not(event.hasAction(ActionType.DECLARE)),
            user.hasScope(SCOPES.RECORD_DECLARE)
          )
        }
      ]
    },
    {
      type: ActionType.VALIDATE,
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.validate.label'
      },
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            event.hasAction(ActionType.DECLARE),
            not(event.hasAction(ActionType.VALIDATE)),
            user.hasScope(SCOPES.RECORD_SUBMIT_FOR_APPROVAL)
          )
        }
      ],
      forms: []
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.register.label'
      },
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            or(
              event.hasAction(ActionType.VALIDATE),
              and(event.hasAction('DECLARE'), user.hasScope('register'))
            ),
            not(event.hasAction(ActionType.REGISTER)),
            user.hasScope(SCOPES.RECORD_REGISTER)
          )
        }
      ],
      forms: [TENNIS_CLUB_FORM]
    },
    {
      type: 'PRINT_CERTIFICATE',
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.collect-certificate.label'
      },
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            event.hasAction(ActionType.REGISTER),
            user.hasScope(SCOPES.RECORD_DECLARATION_PRINT)
          )
        }
      ],
      forms: [TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM]
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.tennis-club-membership.action.requestCorrection.label'
      },
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            event.hasAction(ActionType.REGISTER),
            user.hasScope(SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION)
          )
        }
      ],
      forms: [TENNIS_CLUB_FORM],
      onboardingForm: [
        {
          id: 'correction-requester',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.corrector',
            defaultMessage: 'Correction requester',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.requester.relationshop.intro',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.requester.relationshop.intro.label',
                defaultMessage:
                  'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.requester.relationship',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              initialValue: '',
              options: [
                {
                  value: 'INFORMANT',
                  label: {
                    id: 'v2.correction.corrector.informant',
                    defaultMessage: 'Informant',
                    description:
                      'Label for informant option in certificate correction form'
                  }
                },
                {
                  value: 'ANOTHER_AGENT',
                  label: {
                    id: 'v2.correction.corrector.anotherAgent',
                    defaultMessage: 'Another registration agent or field agent',
                    description:
                      'Label for another registration or field agent option in certificate correction form'
                  }
                },
                {
                  value: 'REGISTRAR',
                  label: {
                    id: 'v2.correction.corrector.me',
                    defaultMessage: 'Me (Registrar)',
                    description:
                      'Label for registrar option in certificate correction form'
                  }
                },
                {
                  value: 'OTHER',
                  label: {
                    id: 'v2.correction.corrector.others',
                    defaultMessage: 'Someone else',
                    description:
                      'Label for someone else option in certificate correction form'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'identity-check',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.verify',
            defaultMessage: 'Verify their identity',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.identity-check.instructions',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.corrector.identity.instruction',
                defaultMessage:
                  'Please verify the identity of the person making this request',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.identity-check.verified',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.identity.verified.label',
                defaultMessage: 'Identity verified',
                description: 'The title for the corrector form'
              },
              initialValue: '',
              required: true,
              options: [
                {
                  value: 'VERIFIED',
                  label: {
                    id: 'v2.correction.corrector.identity.verified',
                    defaultMessage: 'I have verified their identity',
                    description:
                      'Label for verified option in corrector identity check page'
                  }
                }
              ]
            }
          ]
        }
      ],
      additionalDetailsForm: [
        {
          id: 'correction-request.supporting-documents',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.verify',
            defaultMessage: 'Upload supporting documents',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.supportingDocs.introduction',
              type: 'PAGE_HEADER',
              label: {
                id: 'v2.correction.corrector.paragraph.title',
                defaultMessage:
                  'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.supportingDocs',
              type: 'FILE',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Upload supporting documents',
                description: 'The title for the corrector form'
              }
            },
            {
              id: 'correction.request.supportingDocuments',
              type: 'RADIO_GROUP',
              label: {
                id: 'v2.correction.corrector.title',
                defaultMessage: 'Who is requesting a change to this record?',
                description: 'The title for the corrector form'
              },
              initialValue: '',
              configuration: {
                styles: {
                  size: 'NORMAL'
                }
              },
              options: [
                {
                  value: 'ATTEST',
                  label: {
                    id: 'v2.correction.supportingDocuments.attest.label',
                    defaultMessage:
                      'I attest to seeing supporting documentation and have a copy filed at my office',
                    description: ''
                  }
                },
                {
                  value: 'NOT_NEEDED',
                  label: {
                    id: 'v2.correction.supportingDocuments.notNeeded.label',
                    defaultMessage: 'No supporting documents required',
                    description: ''
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'correction-request.additional-details',
          title: {
            id: 'v2.event.tennis-club-membership.action.requestCorrection.form.section.corrector',
            defaultMessage: 'Reason for correction',
            description: 'This is the title of the section'
          },
          fields: [
            {
              id: 'correction.request.reason',
              type: 'TEXT',
              label: {
                id: 'v2.correction.reason.title',
                defaultMessage: 'Reason for correction?',
                description: 'The title for the corrector form'
              }
            }
          ]
        }
      ]
    }
  ],
  advancedSearch: [
    {
      id: 'RANDOM',
      title: {
        defaultMessage: 'Tennis club registration search',
        description: 'This is what this event is referred as in the system',
        id: 'v2.event.tennis-club-membership.search'
      },
      fields: [
        {
          fieldId: 'applicant.dob'
        }
      ]
    }
  ]
})
