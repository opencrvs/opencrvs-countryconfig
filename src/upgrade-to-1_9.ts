import {
  PageTypes,
  defineConfig,
  defineFormPage,
  fieldTypes as ALL_SUPPORTED_FIELD_TYPES,
  defineDeclarationForm,
  EventConfig
} from '@opencrvs/toolkit/events'
import {
  ISerializedForm,
  ISerializedFormSection,
  SerializedFormField
} from './form/types/types'
import { defineTextField } from './upgrade-field-to-1_9'
import { compact as removeUndefineds } from 'lodash'
import prompts from 'prompts'
import fs from 'fs/promises'
import path from 'path'

const defineLegacyField = (field: SerializedFormField) => {
  // @TODO: Prompt the user to input the field id, and use a good default? Or just always default without prompt?

  if (field.type === 'TEXT') {
    return defineTextField(field)
  }

  console.warn(
    `Field type ${field.type} is not supported. Supported types are: ${ALL_SUPPORTED_FIELD_TYPES.join(
      ', '
    )}. Please file an issue explaining your use case for this field type.`
  )

  return undefined
}

const defineLegacyFormPage = (section: ISerializedFormSection) => {
  /* Groups in V1 are a redundant layer, country config doesn't have multiple groups */
  const group = section.groups[0]

  const title = section.title ?? section.name
  const fields = group.fields.map((field) => defineLegacyField(field))

  return defineFormPage({
    id: group.id,
    type: PageTypes.enum.FORM,
    title: {
      /*
       * Asserting the values as string, as Zod is eventually anyway validating these. This upgrade script is 'convert' and not 'validate'.
       */
      defaultMessage: title.defaultMessage as string,
      description: title.description as string,
      id: title.id as string
    },
    fields: removeUndefineds(fields)
  })
}

/** Data that may not be available in the old form and needs to be added. */

/** @TODO: Look into if we can figure out which event type is in question */
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
  summary: EventConfig['summary']
}

const defineLegacyEvent = (form: ISerializedForm, params: NewParameters) => {
  const sections = form.sections.filter(
    /*
     * Form is the only ViewType that matters in the context of `declaration.pages[]`
     *
     * type ViewType = 'form' | 'preview' | 'review' | 'hidden'
     */
    (section) => section.viewType === 'form'
  )

  return defineConfig({
    id: params.id,
    label: {
      defaultMessage: params.label.defaultMessage,
      description: 'This is what this event is referred as in the system',
      id: params.label.id
    },
    declaration: defineDeclarationForm({
      label: {
        defaultMessage: params.declaration.label.defaultMessage,
        description: 'This is what this form is referred as in the system',
        id: params.declaration.label.id
      },
      pages: sections.map((section) => defineLegacyFormPage(section))
    }),
    actions: [],
    summary: params.summary,
    workqueues: []
  })
}

const validEvents = ['birth', 'death', 'marriage'] as const

async function main() {
  const { event } = await prompts({
    type: 'select',
    name: 'event',
    message: 'Choose an event',
    choices: validEvents.map((e) => ({
      title: e[0].toUpperCase() + e.slice(1),
      value: e
    }))
  })

  const forms = await fs.readFile(path.join(__dirname, './forms.json'))
  const eventForm = JSON.parse(forms.toString())[event]

  const newForm = defineLegacyEvent(eventForm, {
    id: event,
    label: {
      id: `event.${event}.label`,
      defaultMessage: event[0].toUpperCase() + event.slice(1)
    },
    declaration: {
      label: {
        id: `event.${event}.action.declare.form.label`,
        defaultMessage: `${event[0].toUpperCase() + event.slice(1)} declaration form`
      }
    },
    summary: {
      title: {
        id: 'event.birth.summary.title',
        label: {
          defaultMessage: '{child.firstname} {child.surname}',
          description: 'This is the title of the summary',
          id: 'v2.event.birth.summary.title'
        }
      },
      // @TODO: Add fields to summary
      fields: []
    }
  })

  await fs.writeFile('new-form.json', JSON.stringify(newForm, null, 2))
}
main()
