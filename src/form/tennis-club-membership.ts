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

import { defineConfig, defineForm } from '@opencrvs/toolkit/events'
import {
  defineConditional,
  or,
  eventHasAction,
  userHasScope,
  and,
  not,
  field
} from '@opencrvs/toolkit/conditionals'

const TENNIS_CLUB_FORM = defineForm({
  label: {
    id: 'event.tennis-club-membership.action.declare.form.label',
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'event.tennis-club-membership.action.declare.form.review.title',
      defaultMessage: 'Member declaration for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.tennis-club-membership.action.declare.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'applicant',
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.who.title',
        defaultMessage: 'Who is applying for the membership?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'applicant.firstname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: "Applicant's first name",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
          }
        },
        {
          id: 'applicant.surname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: "Applicant's surname",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
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
                id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.error'
              },
              validator: field('applicant.dob').isBeforeNow()
            }
          ],
          label: {
            defaultMessage: "Applicant's date of birth",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.dob.label'
          }
        },
        {
          id: 'applicant.image',
          type: 'FILE',
          required: false,
          label: {
            defaultMessage: "Applicant's profile picture",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        },
        {
          id: 'applicant.image.label',
          type: 'TEXT',
          required: false,
          label: {
            defaultMessage: "Applicant's profile picture description",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.who.field.image.label'
          }
        }
      ]
    },
    {
      id: 'recommender',
      title: {
        id: 'event.tennis-club-membership.action.declare.form.section.recommender.title',
        defaultMessage: 'Who is recommending the applicant?',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'recommender.firstname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: "Recommender's first name",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
          }
        },
        {
          id: 'recommender.surname',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: "Recommender's surname",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.surname.label'
          }
        },
        {
          id: 'recommender.id',
          type: 'TEXT',
          required: true,
          label: {
            defaultMessage: "Recommender's membership ID",
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
          }
        }
      ]
    }
  ]
})

const TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM = defineForm({
  label: {
    id: 'event.tennis-club-membership.action.certificate.form.label',
    defaultMessage: 'Tennis club membership certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'event.tennis-club-membership.action.certificate.form.review.title',
      defaultMessage: 'Member certificate collector for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    }
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'event.tennis-club-membership.action.certificate.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'collector',
      title: {
        id: 'event.tennis-club-membership.action.certificate.form.section.who.title',
        defaultMessage: 'Print certified copy',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.certificateTemplateId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Select Certificate Template',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.certificate.form.section.who.field.surname.label'
          },
          validation: [
            {
              message: {
                id: '',
                defaultMessage: '',
                description: ''
              }
              // validator: field
            }
          ],
          options: [
            {
              label: {
                id: 'certificates.tennis-club-membership.certificate.copy',
                defaultMessage: 'Tennis Club Membership Certificate copy',
                description:
                  'The label for a tennis-club-membership certificate'
              },
              value: 'tennis-club-membership-certificate'
            },
            {
              label: {
                id: 'certificates.tennis-club-membership.certificate.certified-copy',
                defaultMessage:
                  'Tennis Club Membership Certificate certified copy',
                description:
                  'The label for a tennis-club-membership certificate'
              },
              value: 'tennis-club-membership-certified-certificate'
            }
          ]
        },
        {
          id: 'collector.requesterId',
          type: 'SELECT',
          required: true,
          label: {
            defaultMessage: 'Requester',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.certificate.form.section.requester.label'
          },
          options: [
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              },
              value: 'INFORMANT'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              },
              value: 'OTHER'
            },
            {
              label: {
                id: 'event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              },
              value: 'PRINT_IN_ADVANCE'
            }
          ]
        }
      ]
    }
  ]
})

export const tennisClubMembershipEvent = defineConfig({
  id: 'TENNIS_CLUB_MEMBERSHIP',
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  summary: {
    title: {
      id: '',
      label: {
        defaultMessage: '{applicant.firstname} {applicant.surname}',
        description: 'This is the title of the summary',
        id: 'event.tennis-club-membership.summary.title'
      }
    },
    fields: [
      {
        id: 'applicant.firstname',
        emptyValueMessage: {
          defaultMessage: "Applicant's first name missing",
          description:
            "Shown when the applicant's first name is missing in summary",
          id: 'event.tennis-club-membership.summary.field.applicant.firstname.empty'
        },
        label: {
          defaultMessage: "Applicant's First Name",
          description: "Label for the applicant's first name field",
          id: 'event.tennis-club-membership.summary.field.applicant.firstname.label'
        },
        value: {
          defaultMessage: 'First Name',
          description: "Value for the applicant's first name field",
          id: 'event.tennis-club-membership.summary.field.applicant.firstname.value'
        }
      },
      {
        id: 'applicant.surname',
        emptyValueMessage: {
          defaultMessage: "Applicant's surname missing",
          description: 'Shown when the surname is missing in summary',
          id: 'event.tennis-club-membership.summary.field.applicant.surname.empty'
        },
        label: {
          defaultMessage: "Applicant's Surname",
          description: 'Label for the applicant’s surname field',
          id: 'event.tennis-club-membership.summary.field.applicant.surname.label'
        },
        value: {
          defaultMessage: 'Surname',
          description: 'Value for the applicant’s surname field',
          id: 'event.tennis-club-membership.summary.field.applicant.surname.value'
        }
      },
      {
        id: 'recommender.firstname',
        emptyValueMessage: {
          defaultMessage: "Recommender's first name missing",
          description:
            'Shown when the recommender first name is missing in summary',
          id: 'event.tennis-club-membership.summary.field.recommender.firstname.empty'
        },
        label: {
          defaultMessage: "Recommender's First Name",
          description: 'Label for the recommender’s first name field',
          id: 'event.tennis-club-membership.summary.field.recommender.firstname.label'
        },
        value: {
          defaultMessage: 'First Name',
          description: 'Value for the recommender’s first name field',
          id: 'event.tennis-club-membership.summary.field.recommender.firstname.value'
        }
      },
      {
        id: 'recommender.surname',
        emptyValueMessage: {
          defaultMessage: "Recommender's surname missing",
          description:
            'Shown when the recommender surname is missing in summary',
          id: 'event.tennis-club-membership.summary.field.recommender.surname.empty'
        },
        label: {
          defaultMessage: "Recommender's Surname",
          description: 'Label for the recommender’s surname field',
          id: 'event.tennis-club-membership.summary.field.recommender.surname.label'
        },
        value: {
          defaultMessage: 'Surname',
          description: 'Value for the recommender’s surname field',
          id: 'event.tennis-club-membership.summary.field.recommender.surname.value'
        }
      },
      {
        id: 'recommender.id',
        emptyValueMessage: {
          defaultMessage: "Recommender's id missing",
          description: 'Shown when the recommender id is missing in summary',
          id: 'event.tennis-club-membership.summary.field.recommender.id.empty'
        },
        label: {
          defaultMessage: "Recommender's ID",
          description: 'Label for the recommender’s ID field',
          id: 'event.tennis-club-membership.summary.field.recommender.id.label'
        },
        value: {
          defaultMessage: 'ID',
          description: 'Value for the recommender’s ID field',
          id: 'event.tennis-club-membership.summary.field.recommender.id.value'
        }
      }
    ]
  },
  workqueues: [
    {
      id: 'all',
      title: {
        defaultMessage: 'All events',
        description: 'Label for in progress workqueue',
        id: 'event.tennis-club-membership.workqueue.all.label'
      },
      fields: [
        {
          id: 'applicant.firstname'
        },
        {
          id: 'applicant.surname'
        }
      ],
      filters: []
    },
    {
      id: 'ready-for-review',
      title: {
        defaultMessage: 'Ready for review',
        description: 'Label for in review workqueue',
        id: 'event.tennis-club-membership.workqueue.in-review.label'
      },
      fields: [
        {
          id: 'applicant.firstname'
        },
        {
          id: 'event.type'
        },
        {
          id: 'event.createdAt'
        },
        {
          id: 'event.modifiedAt'
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
      title: {
        defaultMessage: 'Ready to print',
        description: 'Label for registered workqueue',
        id: 'event.tennis-club-membership.workqueue.registered.label'
      },
      fields: [
        {
          id: 'applicant.firstname'
        },
        {
          id: 'event.type'
        },
        {
          id: 'event.createdAt'
        },
        {
          id: 'event.modifiedAt'
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
      type: 'DECLARE',
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.declare.label'
      },
      forms: [TENNIS_CLUB_FORM],
      allowedWhen: defineConditional(not(eventHasAction('DECLARE')))
    },
    {
      type: 'DELETE',
      label: {
        defaultMessage: 'Delete draft',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.delete.label'
      },
      forms: [],
      allowedWhen: defineConditional(not(eventHasAction('DECLARE')))
    },
    {
      type: 'VALIDATE',
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.validate.label'
      },
      allowedWhen: defineConditional(eventHasAction('DECLARE')),
      forms: [TENNIS_CLUB_FORM]
    },
    {
      type: 'REGISTER',
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.register.label'
      },
      allowedWhen: defineConditional(
        and(
          or(
            eventHasAction('VALIDATE'),
            and(eventHasAction('DECLARE'), userHasScope('register'))
          ),
          not(eventHasAction('REGISTER'))
        )
      ),
      forms: [TENNIS_CLUB_FORM]
    },
    {
      type: 'COLLECT_CERTIFICATE',
      label: {
        defaultMessage: 'Collect certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.collect-certificate.label'
      },
      allowedWhen: defineConditional(
        and(
          eventHasAction('REGISTER'),
          not(eventHasAction('COLLECT_CERTIFICATE'))
        )
      ),
      forms: [TENNIS_CLUB_MEMBERSHIP_CERTIFICATE_COLLECTOR_FORM]
    },
    {
      type: 'CUSTOM',
      label: {
        defaultMessage: 'My custom action',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.tennis-club-membership.action.sdf.label'
      },
      allowedWhen: defineConditional(
        or(
          eventHasAction('VALIDATE'),
          and(eventHasAction('DECLARE'), userHasScope('register'))
        )
      ),
      forms: []
    }
  ]
})
