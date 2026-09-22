import {
  defineFormPage,
  FieldType,
  PageTypes,
  ConditionalType,
  field
} from '@opencrvs/toolkit/events'

export const applicationDetails = defineFormPage({
  id: 'applicationDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Divorce application details',
    description: 'Form section title for divorce application',
    id: 'event.divorce.action.declare.form.section.applicationDetails.title'
  },
  fields: [
    {
      id: 'applicationDetails.typeOfApplication',
      type: FieldType.RADIO_GROUP,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Type of divorce application',
        description: 'Label for type of divorce application',
        id: 'event.divorce.action.declare.form.section.applicationDetails.field.typeOfApplication.label'
      },
      options: [
        {
          value: 'JOINT',
          label: {
            defaultMessage: 'Joint application (both parties)',
            description: 'Option for joint divorce application',
            id: 'event.divorce.action.declare.form.section.applicationDetails.field.typeOfApplication.option.joint'
          }
        },
        {
          value: 'SOLE',
          label: {
            defaultMessage: 'Sole application (by one party)',
            description: 'Option for sole divorce application',
            id: 'event.divorce.action.declare.form.section.applicationDetails.field.typeOfApplication.option.sole'
          }
        }
      ]
    },
    {
      id: 'applicationDetails.applicantParty',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Which party is the applicant?',
        description: 'Label for selecting applicant party',
        id: 'event.divorce.action.declare.form.section.applicationDetails.field.applicantParty.label'
      },
      options: [
        {
          value: 'HUSBAND',
          label: {
            defaultMessage: 'Husband',
            description: 'Option for husband as applicant',
            id: 'event.divorce.action.declare.form.section.applicationDetails.field.applicantParty.option.husband'
          }
        },
        {
          value: 'WIFE',
          label: {
            defaultMessage: 'Wife',
            description: 'Option for wife as applicant',
            id: 'event.divorce.action.declare.form.section.applicationDetails.field.applicantParty.option.wife'
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('applicationDetails.typeOfApplication').isEqualTo(
            'SOLE'
          )
        }
      ]
    }
  ]
})
