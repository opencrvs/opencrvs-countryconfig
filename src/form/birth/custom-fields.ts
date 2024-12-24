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
export function getIDReaderField(
  event: string,
  sectionId: string,
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'idReader'
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'ID_READER',
    label: {
      id: 'form.field.label.empty',
      defaultMessage: ''
    },
    hideInPreview: true,
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    conditionals,
    dividerLabel: {
      id: 'views.idReader.label.or',
      defaultMessage: 'Or'
    },
    manualInputInstructionLabel: {
      id: 'views.idReader.label.manualInput',
      defaultMessage: 'Complete fields below'
    },
    readers: [
      {
        type: 'QR'
      },
      {
        name: 'redirect',
        validator: [],
        icon: {
          desktop: 'Globe',
          mobile: 'Fingerprint'
        },
        type: 'REDIRECT',
        label: {
          id: 'views.idReader.label.eSignet',
          defaultMessage: 'E-signet'
        },
        options: {
          url: 'https://docs.esignet.io/',
          callback: {
            params: {
              authorized: 'true'
            },
            trigger: 'someHTTPField'
          }
        }
      }
    ]
  }
}

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
