import { defineDeclarationForm, FieldType } from '@opencrvs/toolkit/events'
import { introduction } from './pages/introduction'
import { deceased } from './pages/deceased'
import { details } from './pages/details'
import { informant } from './pages/infomant'
import { spouse } from './pages/spouse'
import { documents } from './pages/documents'

export const DEATH_DECLARATION_REVIEW = {
  title: {
    id: 'v2.event.death.action.declare.form.review.title',
    defaultMessage:
      '{deceased.firstname, select, __EMPTY__ {Death declaration} other {{deceased.surname, select, __EMPTY__ {Death declaration} other {Death declaration for {deceased.firstname} {deceased.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'v2.event.death.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      },
      required: true
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of informant',
        id: 'v2.event.death.action.declare.form.review.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'v2.signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    }
  ]
}

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'v2.event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [introduction, deceased, details, informant, spouse, documents]
})
