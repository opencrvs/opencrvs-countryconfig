import { defineDeclarationForm } from '@opencrvs/toolkit/events'
import { introduction } from './pages/introduction'
import { deceased } from './pages/deceased'
import { deceasedDetails } from './pages/deceasedDetails'
import { informantDetails } from './pages/infomantDetails'
import { spouse } from './pages/spouse'
import { documents } from './pages/documents'

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'v2.event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    introduction,
    deceased,
    deceasedDetails,
    informantDetails,
    spouse,
    documents
  ]
})
