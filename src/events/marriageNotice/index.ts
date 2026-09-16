import {
  ActionType,
  defineConfig,
  field
} from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import { MARRIAGE_NOTICE_DECLARATION_FORM } from './forms'
import { MARRIAGE_NOTICE_DECLARATION_REVIEW } from './forms/declaration'
import { advancedSearchMarriageNotice } from './advancedSearch'
import { dedupConfig } from './dedupConfig'
import { MARRIAGE_NOTICE_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { MARRIAGE_NOTICE_CORRECTION_FORM } from './forms/correctionForm'

export const marriageNoticeEvent = defineConfig({
  id: Event.MarriageNotice,
  analytics: true,
  declaration: MARRIAGE_NOTICE_DECLARATION_FORM,
  label: {
    defaultMessage: 'Marriage Notice',
    description: 'This is what this event is referred to as in the system',
    id: 'event.marriageNotice.label'
  },
  dateOfEvent: field('noticeOfIntendedMarriageDetails.dateOfMarriage'),
  placeOfEvent: field('noticeOfIntendedMarriageDetails.placeOfMarriage'),
  title: {
    defaultMessage:
      '{brideGroom.name.firstname, select, __EMPTY__ {Marriage Notice} other {{brideGroom.name.surname, select, __EMPTY__ {Marriage Notice for {brideGroom.name.firstname}} other {Marriage Notice for {brideGroom.name.firstname} {brideGroom.name.surname}}}}}',
    description: 'This is the title of the summary',
    id: 'event.marriageNotice.title'
  },
  fallbackTitle: {
    id: 'event.marriageNotice.fallbackTitle',
    defaultMessage: 'No names provided',
    description: 'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'noticeOfIntendedMarriageDetails.dateOfMarriage',
        emptyValueMessage: {
          defaultMessage: 'No date of marriage',
          description: 'This is shown when there is no marriage date information',
          id: 'event.marriageNotice.summary.noticeOfIntendedMarriageDetails.dateOfMarriage.empty'
        }
      },
      {
        fieldId: 'noticeOfIntendedMarriageDetails.placeOfMarriage',
        emptyValueMessage: {
          defaultMessage: 'No place of marriage provided',
          description: 'This is shown when there is no place of marriage information',
          id: 'event.marriageNotice.summary.noticeOfIntendedMarriageDetails.placeOfMarriage.empty'
        },
        label: {
          defaultMessage: 'Place of marriage',
          description: 'Label for the place of marriage summary field',
          id: 'event.marriageNotice.summary.noticeOfIntendedMarriageDetails.placeOfMarriage.label'
        }
      },
      {
        fieldId: 'noticeOfIntendedMarriageDetails.venueName',
        emptyValueMessage: {
          defaultMessage: 'No venue provided',
          description: 'This is shown when there is no venue information',
          id: 'event.marriageNotice.summary.noticeOfIntendedMarriageDetails.venueName.empty'
        },
        label: {
          defaultMessage: 'Venue',
          description: 'Label for the venue summary field',
          id: 'event.marriageNotice.summary.noticeOfIntendedMarriageDetails.venueName.label'
        }
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.marriageNotice.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.marriageNotice.summary.informant.contact.label'
        },
        value: {
          defaultMessage:
            '{informantDetails.phoneNumber, select, __EMPTY__ {{informantDetails.email, select, __EMPTY__ {} other {{informantDetails.email}}}} other {{informantDetails.phoneNumber}{informantDetails.email, select, __EMPTY__ {} other { | {informantDetails.email}}}}}',
          description: 'This is the contact value of the informant',
          id: 'event.marriageNotice.summary.informant.contact.value'
        }
      }
    ]
  },
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description: 'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.marriageNotice.action.Read.label'
      },
      review: MARRIAGE_NOTICE_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description: 'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.marriageNotice.action.Declare.label'
      },
      review: MARRIAGE_NOTICE_DECLARATION_REVIEW,
      deduplication: {
        id: 'marriage-notice-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description: 'Label for Marriage Notice duplicate detection',
          id: 'event.marriageNotice.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description: 'Label for the Marriage Notice registration action',
        id: 'event.marriageNotice.action.register.label'
      },
      deduplication: {
        id: 'marriage-notice-registration-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description: 'Label for Marriage Notice registration duplicate detection',
          id: 'event.marriageNotice.action.register.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print',
        description: 'Label for the Marriage Notice certificate printing action',
        id: 'event.marriageNotice.action.print.label'
      },
      printForm: MARRIAGE_NOTICE_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description: 'Label for the Marriage Notice correction action',
        id: 'event.marriageNotice.action.requestCorrection.label'
      },
      correctionForm: MARRIAGE_NOTICE_CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchMarriageNotice
})
