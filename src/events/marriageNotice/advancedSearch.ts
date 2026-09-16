import {
  AdvancedSearchConfig,
  event,
  field
} from '@opencrvs/toolkit/events'

const bridegroomPrefix = {
  id: 'marriageNotice.search.criteria.label.prefix.bridegroom',
  defaultMessage: "Bridegroom's",
  description: "Bridegroom's search criteria prefix"
}

const bridePrefix = {
  id: 'marriageNotice.search.criteria.label.prefix.bride',
  defaultMessage: "Bride's",
  description: "Bride's search criteria prefix"
}

export const advancedSearchMarriageNotice = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'Title of Registration details search group',
      id: 'advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.acceptedAt').range(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'Title of Event details search group',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('noticeOfIntendedMarriageDetails.dateOfMarriage').range(),
      field('noticeOfIntendedMarriageDetails.placeOfMarriage').fuzzy(),
      field('noticeOfIntendedMarriageDetails.venueName').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Bridegroom details',
      description: 'Title of Bridegroom details search group',
      id: 'advancedSearch.form.bridegroomDetails'
    },
    fields: [
      field('brideGroom.name', {
        searchCriteriaLabelPrefix: bridegroomPrefix,
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('brideGroom.dob', {
        searchCriteriaLabelPrefix: bridegroomPrefix
      }).range()
    ]
  },
  {
    title: {
      defaultMessage: 'Bride details',
      description: 'Title of Bride details search group',
      id: 'advancedSearch.form.brideDetails'
    },
    fields: [
      field('bride.name', {
        searchCriteriaLabelPrefix: bridePrefix,
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('bride.dob', {
        searchCriteriaLabelPrefix: bridePrefix
      }).range()
    ]
  }
] satisfies AdvancedSearchConfig[]
