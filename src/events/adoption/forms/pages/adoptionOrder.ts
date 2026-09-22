import {
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  ConditionalType
} from '@opencrvs/toolkit/events'
import { emptyMessage } from '@countryconfig/events/utils'
import { invalidNameValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const adoptionOrder = defineFormPage({
  id: 'adoptionOrder',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Adoption order details',
    description: 'Form section title for adoption order details',
    id: 'event.adoption.action.declare.form.section.adoptionOrder.title'
  },
  fields: [
    // E1 — Adoption order number
    {
      id: 'adoptionOrder.number',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Adoption order number',
        description: 'Adoption order or case reference number',
        id: 'event.adoption.adoptionOrder.e1.number.label'
      },
      configuration: { maxLength: 64 }
    },

    // E2 — Issuing court / authority
    {
      id: 'adoptionOrder.issuingAuthority',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Issuing court / authority',
        description:
          'Court or competent authority that issued the adoption order',
        id: 'event.adoption.adoptionOrder.e2.issuingAuthority.label'
      },
      defaultValue: 'high-court-of-the-cook-islands',
      options: [
        {
          value: 'high-court-of-the-cook-islands',
          label: {
            defaultMessage: 'High Court of the Cook Islands, Rarotonga',
            id: 'adoptionOrder.issuing.highCourt',
            description: ''
          }
        }
      ]
    },

    // E3 — Date of order
    {
      id: 'adoptionOrder.date',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of order',
        description: 'Date when the adoption order was issued',
        id: 'event.adoption.adoptionOrder.e3.date.label'
      }
      // Optional validation example:
      // validation: [{
      //   message: { defaultMessage: 'Must be a date in the past', id: 'event.adoption.adoptionOrder.e3.date.error' },
      //   validator: field('adoptionOrder.date').isBefore().now()
      // }]
    },

    // Divider
    {
      id: 'adoptionOrder.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },

    // E4 — Does the adoption order change the child's legal name? (Radio)
    {
      id: 'adoptionOrder.changesChildLegalName',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage:
          "Does the adoption order change the child's legal name?",
        description: 'Radio group to determine if child’s legal name changes',
        id: 'event.adoption.adoptionOrder.e4.changeName.label'
      },
      options: [
        {
          value: 'yes',
          label: {
            defaultMessage: 'Yes',
            id: 'yes',
            description: ''
          }
        },
        {
          value: 'no',
          label: {
            defaultMessage: 'No',
            id: 'no',
            description: ''
          }
        }
      ]
    },

    // E5 and E6 — Child's new legal given name(s) (only when E4 = Yes)
    {
      id: 'adoptionOrder.childNewName',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: "Child's new legal given name(s)",
              description: "Child's new legal given names as per order",
              id: 'event.adoption.adoptionOrder.e5.childNewGivenNames.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: "Child's new legal surname",
              description: "Child's new legal surname as per order",
              id: 'event.adoption.adoptionOrder.e6.childNewSurname.label'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: "Child's New Name",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.newName.label'
      },
      validation: [invalidNameValidator('adoptionOrder.childNewName')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('adoptionOrder.changesChildLegalName').isEqualTo(
            'yes'
          )
        }
      ]
    }
  ]
})
