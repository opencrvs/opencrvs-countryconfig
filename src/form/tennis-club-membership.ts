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

export const tennisClubMembershipEvent = defineConfig({
  id: 'TENNIS_CLUB_MEMBERSHIP',
  label: {
    defaultMessage: 'Tennis club membership application',
    description: 'This is what this event is referred as in the system',
    id: 'event.tennis-club-membership.label'
  },
  summary: {
    title: {
      defaultMessage: '{applicant.firstname} {applicant.surname}',
      description: 'This is the title of the summary',
      id: 'event.tennis-club-membership.summary.title'
    },
    fields: [
      {
        id: 'applicant.firstname'
      },
      {
        id: 'applicant.surname'
      },
      {
        id: 'recommender.firstname'
      },
      {
        id: 'recommender.surname'
      },
      {
        id: 'recommender.id'
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
