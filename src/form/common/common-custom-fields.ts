import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { Conditional, SerializedFormField } from '../types/types'
import { Validator } from '../types/validators'
import { formMessageDescriptors } from './messages'
import { MessageDescriptor } from 'react-intl'
import { sentenceCase } from '@countryconfig/utils/address-utils'

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

/**
 *  Handlebar fields:
 *  birthMotherCustomizedExactDateOfBirthUnknown / birthFatherCustomizedExactDateOfBirthUnknown / birthInformantCustomizedExactDateOfBirthUnknown
 */
export function getCustomizedExactDateOfBirthUnknown(
  subject: 'mother' | 'father' | 'informant' | 'spouse',
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = 'customizedExactDateOfBirthUnknown'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    hideHeader: true,
    hideInPreview: true,
    type: 'CHECKBOX', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'Checkbox for exact date of birth unknown',
      id: 'form.field.label.exactDateOfBirthUnknown'
    },
    checkedValue: 'true',
    uncheckedValue: 'false',
    initialValue: 'false',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields:
 *  birthMotherYearOfBirth / birthFatherYearOfBirth / birthInformantYearOfBirth
 */
export function getYearOfBirth(
  subject: 'mother' | 'father' | 'informant' | 'spouse',
  conditionals: Conditional[] = [],
  validators: Validator[]
): SerializedFormField {
  const fieldName: string = 'yearOfBirth'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'NUMBER', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: formMessageDescriptors.yearOfBirth,
    initialValue: '',
    validator: validators, // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    prefix: 'vers', //formMessageDescriptors.prefixAround,
    inputFieldWidth: '78px'
  }
}

/**
 *  Handlebar fields:
 *  birthChildFokontanyCustomAddress / birthMotherFokontanyCustomAddress
 *  birthFatherFokontanyCustomAddress / birthInformantFokontanyCustomAddress
 */
export function getFokontanyCustomAdress(
  event: 'birth' | 'death',
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
    required: required,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: labelOfFokontanyCustomAddress,
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 255
  }
}

export function getFatherIsDeceased(
  event: 'birth' | 'death',
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
  event: 'birth' | 'death',
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
