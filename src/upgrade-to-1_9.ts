import {
  InferredInput,
  PageTypes,
  defineConfig,
  defineFormPage
} from '@opencrvs/toolkit/events'
import { birthForm } from './form/birth'
import {
  ISerializedForm,
  ISerializedFormSectionGroup,
  SerializedFormField
} from './form/types/types'
import assert from 'assert'
import { Event } from '@countryconfig/form/types/types'

const BIRTH_FORM_V1 = JSON.parse(JSON.stringify(birthForm)) as ISerializedForm

const defineLegacyField = (field: SerializedFormField) => {
  return {} satisfies InferredInput
}

const defineLegacyFormPage = (group: ISerializedFormSectionGroup) => {
  assert(group.title !== undefined, 'group.title must be defined')
  assert(
    typeof group.title.defaultMessage === 'string',
    'group.title.defaultMessage must be a string'
  )
  assert(
    typeof group.title.description === 'string',
    'group.title.description must be a string'
  )
  assert(typeof group.title.id === 'string', 'group.title.id must be a string')

  return defineFormPage({
    id: group.id,
    type: PageTypes.enum.FORM,
    title: {
      defaultMessage: group.title.defaultMessage,
      description: group.title.description,
      id: group.title.id
    },
    fields: group.fields.map((field) => defineLegacyField(field))
  })
}

/** Data that may not be available in the old form and needs to be added. */
interface NewParameters {
  /** The identifier of the new form */
  id: string
  label: {
    /** Translation id for the event, e.g. `v2.event.birth.label` */
    id: string
    /** This is what this event is referred as in the system, e.g. `Birth` or `Marriage` */
    defaultMessage: string
  }
  declaration: {
    label: {
      /** Translation id for the form, e.g. `v2.event.birth.action.declare.form.label` */
      id: string
      /** This is what this form is referred as in the system, e.g. `Birth declaration form` */
      defaultMessage: string
    }
  }
}

const defineLegacyEvent = (form: ISerializedForm, params: NewParameters) => {
  const sections = form.sections
    .filter(
      /*
       * Form is the only ViewType that matters in the context of `declaration.pages[]`
       *
       * type ViewType = 'form' | 'preview' | 'review' | 'hidden'
       */
      (section) => section.viewType === 'form'
    )
    .map(({ groups }) => {
      // @TODO: Is this true?
      /* Groups have been a redundant layer, country config doesn't have multiple groups */
      assert(groups.length === 1, 'groups.length must be 1')

      return groups[0]
    })

  return defineConfig({
    id: params.id,
    label: {
      defaultMessage: params.label.defaultMessage,
      description: 'This is what this event is referred as in the system',
      id: params.label.id
    },
    declaration: {
      label: {
        defaultMessage: params.declaration.label.defaultMessage,
        description: 'This is what this form is referred as in the system',
        id: params.declaration.label.id
      },
      pages: sections.map((section) => defineLegacyFormPage(section))
    },
    actions: [],
    summary: {},
    workqueues: []
  })
}

const convertedBirthForm = defineLegacyEvent(BIRTH_FORM_V1, {
  id: Event.V2_BIRTH,
  label: {
    id: 'v2.event.birth.label',
    defaultMessage: 'Birth'
  },
  declaration: {
    label: {
      id: 'v2.event.birth.action.declare.form.label',
      defaultMessage: 'Birth declaration form'
    }
  }
})
