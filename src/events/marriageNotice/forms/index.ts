import { defineDeclarationForm } from '@opencrvs/toolkit/events'
import { noticeDetails } from './pages/noticeDetails'
import { bridegroom } from './pages/bridegroom'
import { bride } from './pages/bride'
import { informant } from './pages/informant'
import { collect } from './pages/collect'
import { documents } from './pages/documents'

export const MARRIAGE_NOTICE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Marriage Notice declaration form',
    id: 'event.marriageNotice.action.declare.form.label',
    description: 'This is what this form is referred to as in the system'
  },
  pages: [noticeDetails, bridegroom, bride, informant, collect, documents]
})
