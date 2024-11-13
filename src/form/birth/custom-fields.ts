import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { formMessageDescriptors } from '../common/messages'
import { SerializedFormField } from '../types/types'

/**
 *
 * @param event
 * @param sectionId
 * @returns hidden field to store QR scanned data
 */
export function getQRCodeField(
  event: string,
  sectionId: string
): SerializedFormField {
  const fieldName: string = 'qrCode'
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'HIDDEN',
    label: {
      id: 'form.field.label.empty',
      description: 'empty string',
      defaultMessage: ''
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    conditionals: []
  }
}
