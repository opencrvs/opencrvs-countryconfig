import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'
import { correctionFormRequesters } from './requester'

export const correctionRequestFields: FieldConfig[] = [
  ...correctionFormRequesters,
  {
    id: 'reason.option',
    type: FieldType.SELECT,
    required: true,
    label: {
      id: 'event.death.action.correction.form.section.reason.title',
      defaultMessage: 'Reason for correction',
      description: 'This is the title of the section'
    },
    options: [
      {
        value: 'CLERICAL_ERROR',
        label: {
          defaultMessage: 'Myself or an agent made a mistake (Clerical error)',
          description: 'Label for the clerical error option',
          id: 'event.death.action.correction.reason.option.clericalError.label'
        }
      },
      {
        value: 'MATERIAL_ERROR',
        label: {
          defaultMessage:
            'Informant provided incorrect information (Material error)',
          description: 'Label for the material error option',
          id: 'event.death.action.correction.reason.option.materialError.label'
        }
      },
      {
        value: 'MATERIAL_OMISSION',
        label: {
          defaultMessage:
            'Informant did not provide this information (Material omission)',
          description: 'Label for the material omission option',
          id: 'event.death.action.correction.reason.option.materialOmission.label'
        }
      },
      {
        value: 'JUDICIAL_ORDER',
        label: {
          defaultMessage: 'Requested to do so by the court (Judicial order)',
          description: 'Label for the judicial order option',
          id: 'event.death.action.correction.reason.option.judicialOrder.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other (please specify)',
          description: 'Label for the other option',
          id: 'event.death.action.correction.reason.option.other.label'
        }
      }
    ]
  },
  {
    id: 'reason.other',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Specify reason',
      description: 'Label for the reason',
      id: 'event.death.action.correction.reason.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('reason.option').isEqualTo('OTHER')
      }
    ]
  }
]
