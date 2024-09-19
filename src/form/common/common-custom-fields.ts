import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { Conditional, Event, SerializedFormField } from '../types/types'
import { Validator } from '../types/validators'
import { formMessageDescriptors } from './messages'
import { MessageDescriptor } from 'react-intl'
import { sentenceCase } from '@countryconfig/utils/address-utils'
import { REGULAR_TEXT_MAX_LENGTH } from '@countryconfig/constants'

export function getNUI(
  conditionals: Conditional[],
  fieldSpecificValidators: Validator[] = [],
  required: boolean = true,
  certificateHandlebar: string
): SerializedFormField {
  return {
    name: 'iD',
    type: 'TEXT',
    label: formMessageDescriptors.nui,
    required,
    custom: true,
    initialValue: '',
    maxLength: 10,
    conditionals,
    validator: [
      {
        operation: 'validIDNumberCustom' as const,
        parameters: ['NATIONAL_ID']
      },
      ...fieldSpecificValidators
    ],
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      mutation: {
        operation: 'fieldToIdentityTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      query: {
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      }
    }
  }
}

export function getCustomizedExactDateOfBirthUnknown(
  event: Event,
  subject: 'mother' | 'father' | 'informant' | 'spouse' | 'deceased',
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = 'customizedExactDateOfBirthUnknown'
  const fieldId: string = `${event}.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    hideHeader: true,
    hideInPreview: true,
    type: 'CHECKBOX',
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'Checkbox for exact date of birth unknown',
      id: 'form.field.label.exactDateOfBirthUnknown'
    },
    checkedValue: 'true',
    uncheckedValue: 'false',
    initialValue: 'false',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}

export function getYearOfBirth(
  event: Event,
  subject: 'mother' | 'father' | 'informant' | 'spouse' | 'deceased',
  conditionals: Conditional[] = [],
  validators: Validator[]
): SerializedFormField {
  const fieldName: string = 'yearOfBirth'
  const fieldId: string = `${event}.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'NUMBER',
    label: formMessageDescriptors.yearOfBirth,
    initialValue: '',
    validator: validators,
    mapping: getCustomFieldMapping(fieldId),
    conditionals,
    prefix: 'vers'
  }
}

export function getFokontanyCustomAddress(
  event: Event,
  section:
    | 'child'
    | 'mother'
    | 'father'
    | 'informant'
    | 'deceased'
    | 'deathEvent',
  conditionals: Conditional[] = [],
  required: boolean,
  labelOfFokontanyCustomAddress: MessageDescriptor,
  previewGroup: string,
  useCase?: string
): SerializedFormField {
  const fieldName: string = useCase
    ? `fokontanyCustomAddress${sentenceCase(useCase)}`
    : 'fokontanyCustomAddress'
  const fieldId: string = `${event}.${section}.${section}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required,
    type: 'TEXT',
    label: labelOfFokontanyCustomAddress,
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals,
    previewGroup,
    maxLength: REGULAR_TEXT_MAX_LENGTH
  }
}

export function getFatherIsDeceased(
  event: Event,
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'fatherIsDeceased'
  const fieldId: string = `${event}.father.father-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    hideHeader: true,
    hideInPreview: true,
    type: 'CHECKBOX',
    label: {
      defaultMessage: 'Father is deceased',
      description: 'Label for form field Father is deceased',
      id: 'form.field.label.fatherIsDeceased'
    },
    checkedValue: 'true',
    uncheckedValue: 'false',
    initialValue: 'false',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}

export function getMotherIsDeceased(
  event: Event,
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'motherIsDeceased'
  const fieldId: string = `${event}.mother.mother-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    hideHeader: true,
    hideInPreview: true,
    type: 'CHECKBOX',
    label: {
      defaultMessage: 'Mother is deceased',
      description: 'Label for form field Mother is deceased',
      id: 'form.field.label.motherIsDeceased'
    },
    checkedValue: 'true',
    uncheckedValue: 'false',
    initialValue: 'false',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}
