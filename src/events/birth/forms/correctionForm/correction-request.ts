import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

const fatherOption = {
  label: {
    id: 'event.birth.action.correction.form.section.requester.father.label',
    defaultMessage: 'Father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('father.detailsUnavailable').isEqualTo(true))
    }
  ]
}

const motherOption = {
  label: {
    id: 'event.birth.action.correction.form.section.requester.mother.label',
    defaultMessage: 'Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('mother.detailsUnavailable').isEqualTo(true))
    }
  ]
}

const commonOptions = [
  {
    value: 'CHILD',
    label: {
      id: 'event.birth.action.correction.form.requester.type.child',
      defaultMessage: 'Person named on the record',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'ANOTHER_AGENT',
    label: {
      id: 'event.birth.action.correction.form.requester.type.anotherAgent',
      defaultMessage: 'Registrar / Registration office',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'COURT',
    label: {
      id: 'event.birth.action.correction.form.requester.type.court',
      defaultMessage: 'Court',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'SOMEONE_ELSE',
    label: {
      id: 'event.birth.action.correction.form.requester.type.someoneElse',
      defaultMessage: 'Someone else',
      description: 'This is the label for the correction requester field'
    }
  }
]

const requesterTypeOptions = [fatherOption, motherOption, ...commonOptions]

export const correctionRequestFields: FieldConfig[] = [
  {
    id: 'requester.type',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.label'
    },
    options: requesterTypeOptions
  },
  {
    id: 'reason.option',
    type: FieldType.SELECT,
    required: true,
    label: {
      id: 'event.birth.action.correction.form.section.reason.title',
      defaultMessage: 'Reason for correction',
      description: 'This is the title of the section'
    },
    options: [
      {
        value: 'CLERICAL_ERROR',
        label: {
          defaultMessage: 'Myself or an agent made a mistake (Clerical error)',
          description: 'Label for the clerical error option',
          id: 'event.birth.action.correction.reason.option.clericalError.label'
        }
      },
      {
        value: 'MATERIAL_ERROR',
        label: {
          defaultMessage:
            'Informant provided incorrect information (Material error)',
          description: 'Label for the material error option',
          id: 'event.birth.action.correction.reason.option.materialError.label'
        }
      },
      {
        value: 'MATERIAL_OMISSION',
        label: {
          defaultMessage:
            'Informant did not provide this information (Material omission)',
          description: 'Label for the material omission option',
          id: 'event.birth.action.correction.reason.option.materialOmission.label'
        }
      },
      {
        value: 'JUDICIAL_ORDER',
        label: {
          defaultMessage: 'Requested to do so by the court (Judicial order)',
          description: 'Label for the judicial order option',
          id: 'event.birth.action.correction.reason.option.judicialOrder.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other (please specify)',
          description: 'Label for the other option',
          id: 'event.birth.action.correction.reason.option.other.label'
        }
      }
    ]
  },
  {
    id: 'reason.other',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Other reason (please specify)',
      description: 'Label for the reason',
      id: 'event.birth.action.correction.reason.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('reason.option').isEqualTo('OTHER')
      }
    ]
  }
]
