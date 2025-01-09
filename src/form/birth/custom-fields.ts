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

/** To bypass config validation */
export function getGenderCustom(
  event: string,
  sectionId: string,
  conditionals: Conditional[],
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
    conditionals,
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    mapping: getCustomFieldMapping(fieldId),
    options: genderOptions
  } satisfies SerializedFormField
}
