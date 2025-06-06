import { defineDeclarationForm } from '@opencrvs/toolkit/events'
import { introduction } from './pages/introduction'
import { deceased } from './pages/deceased'

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'v2.event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [introduction, deceased]
})
