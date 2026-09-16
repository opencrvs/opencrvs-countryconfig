import {
  ConditionalType,
  FieldType,
  ImageMimeType,
  DocumentMimeType,
  field,
  now,
  not
} from '@opencrvs/toolkit/events'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

export const MARRIAGE_NOTICE_DECLARATION_REVIEW = {
  title: {
    id: 'event.marriageNotice.action.declare.form.review.title',
    defaultMessage:
      '{brideGroom.name.firstname, select, __EMPTY__ {Marriage Notice declaration} other {{brideGroom.name.surname, select, __EMPTY__ {Marriage Notice declaration for {brideGroom.name.firstname}} other {Marriage Notice declaration for {brideGroom.name.firstname} {brideGroom.name.surname}}}}}',
    description: 'Title of the review page for the Marriage Notice event'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        description: 'Label for the review comment field',
        id: 'event.marriageNotice.action.declare.form.review.comment.label'
      }
    }
  ]
}

