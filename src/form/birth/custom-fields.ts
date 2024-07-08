import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { Conditional, SerializedFormField } from '../types/types'
import { MessageDescriptor } from 'react-intl'
import { formMessageDescriptors } from '../common/messages'

/**
 *  Handlebar field: birthChildBirthTime
 */
export function getTimeOfBirth(): SerializedFormField {
  const fieldName: string = 'birthTime'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TIME', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.childTimeOfBirth',
      description: 'A form field that asks for child birth time',
      defaultMessage: 'Birth Time'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields: birthMotherBirthPlace / birthFatherBirthPlace
 */
export function getPlaceOfBirth(
  subject: 'mother' | 'father',
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = 'birthPlace'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.birthPlace',
      description: 'A form field that asks for the persons birthPlace',
      defaultMessage: 'Place of birth'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 255
  }
}

/**
 *  Handlebar fields: birthChildLegacyBirthRegistrationNumber
 */
export function getLegacyBirthRegistrationNumber(
  subject: 'child'
): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationNumber'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationNumber',
      description:
        'A form field that asks for legacy birth registration number',
      defaultMessage: 'Legacy birth registration number'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    maxLength: 6
  }
}

/**
 *  Handlebar field: birthChildLegacyBirthRegistrationDate
 */
export function getLegacyBirthRegistrationDate(): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationDate'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'DATE', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationDate',
      description: 'A form field that asks for legacy birth registration date',
      defaultMessage: 'Legacy birth registration date'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar field: birthChildLegacyBirthRegistrationTime
 */
export function getLegacyBirthRegistrationTime(): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationTime'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'TIME', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationTime',
      description: 'A form field that asks for legacy birth registration time',
      defaultMessage: 'Legacy birth registration time'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields:
 *  birthMotherYearOfBirth / birthFatherYearOfBirth / birthInformantYearOfBirth
 */
export function getYearOfBirth(
  subject: 'mother' | 'father' | 'informant',
  conditionals: Conditional[] = []
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
    validator: [
      {
        operation: 'range',
        parameters: [1883, 2060]
      },
      {
        operation: 'maxLength',
        parameters: [4]
      },
      {
        operation: 'isValidParentsBirthDate',
        parameters: [10, true]
      }
    ], // EDIT VALIDATORS AS YOU SEE FIT
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
  subject: 'child' | 'mother' | 'father' | 'informant',
  conditionals: Conditional[] = [],
  labelOfFokontanyCustomAddress: MessageDescriptor
): SerializedFormField {
  const fieldName: string = 'fokontanyCustomAddress'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: labelOfFokontanyCustomAddress,
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 255
  }
}

export const exactDateOfBirthUnknown = (
  section: 'mother' | 'father' | 'informant',
  conditionalCase: Conditional[]
): SerializedFormField => {
  const fieldName = 'exactDateOfBirthUnknown'
  const fieldId: string = `birth.${section}.${section}-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'CHECKBOX',
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'Checkbox for exact date of birth unknown',
      id: 'form.field.label.exactDateOfBirthUnknown'
    },
    hideInPreview: true,
    required: false,
    custom: true,
    customQuestionMappingId: fieldId,
    hideHeader: true,
    initialValue: false,
    validator: [],
    conditionals: conditionalCase,
    mapping: getCustomFieldMapping(fieldId)
  }
}
