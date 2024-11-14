import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { formMessageDescriptors } from '../common/messages'
import { Conditional, SerializedFormField } from '../types/types'
import { genderOptions } from '../common/select-options'

/**
 *
 * @param event
 * @param sectionId
 * @returns hidden field to store QR scanned data
 */
export function getQRCodeField(
  event: string,
  sectionId: string,
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'qrCode'
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'QR_SCANNER',
    label: {
      id: 'form.field.label.empty',
      description: 'empty string',
      defaultMessage: ''
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    conditionals
  }
}

/** To bypass config validation */
export function getGenderCustom(
  event: string,
  sectionId: string,
  initialValue: { dependsOn: string[]; expression: string } | string = ''
) {
  const fieldName: string = 'gender'
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_OPTIONS',
    customQuestionMappingId: fieldId,
    custom: true,
    label: formMessageDescriptors.sex,
    required: false,
    initialValue,
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    mapping: getCustomFieldMapping(fieldId),
    options: genderOptions
  } satisfies SerializedFormField
}
