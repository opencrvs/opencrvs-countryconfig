import {
  defineActionForm,
  FieldType,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionFormRequesters } from './requester'

export const CORRECTION_FORM = defineActionForm({
  label: {
    id: 'v2.event.birth.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the birth correction form'
  },
  pages: [
    {
      id: 'requester',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.form.section.requester.title',
        defaultMessage: 'Correction requester',
        description: 'This is the title of the section'
      },
      fields: [
        {
          type: FieldType.PARAGRAPH,
          id: 'requester.paragraph',
          label: {
            id: 'v2.event.birth.action.correction.form.section.requester.paragraph.label',
            defaultMessage: 'Correction requester',
            description:
              'This is the label for the correction requester paragraph'
          }
        },
        ...correctionFormRequesters
      ]
    }
  ]
})
