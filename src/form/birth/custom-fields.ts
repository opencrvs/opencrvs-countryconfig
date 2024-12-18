import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { formMessageDescriptors } from '../common/messages'
import { Conditional, SerializedFormField } from '../types/types'
import { genderOptions } from '../common/select-options'
import { MessageDescriptor } from 'react-intl'

/**
 *
 * @param event
 * @param sectionId
 * @returns hidden field to store QR scanned data
 */
export function getIDReaderField(
  event: string,
  sectionId: string,
  conditionals: Conditional[],
  label: MessageDescriptor
): SerializedFormField {
  const fieldName: string = 'informantIDReadeer'
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'ID_READER',
    label,
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    conditionals,
    dividerLabel: {
      id: 'id.divider.label',
      defaultMessage: 'Or'
    },
    manualInputInstructionLabel: {
      id: 'id.manualInputInstruction.label',
      defaultMessage: 'Complete fields below'
    },
    readers: [
      {
        type: 'QR',
        labels: {
          button: {
            id: 'id.qr.button.label',
            defaultMessage: 'Scan ID QR code'
          },
          scannerDialogSupportingCopy: {
            id: 'id.qr.scanner.supportingCopy',
            defaultMessage:
              "Place the Notifier's ID card in front of the camera."
          },
          tutorial: {
            cameraCleanliness: {
              id: 'id.qr.tutorial.cameraCleanliness',
              defaultMessage: 'Ensure your camera is clean and functional.'
            },
            distance: {
              id: 'id.qr.tutorial.distance',
              defaultMessage:
                'Hold the device steadily 6-12 inches away from the QR code.'
            },
            lightBalance: {
              id: 'id.qr.tutorial.lightBalance',
              defaultMessage:
                'Ensure the QR code is well-lit and not damaged or blurry.'
            }
          }
        }
      },
      {
        name: 'redirect',
        validator: [],
        type: 'REDIRECT',
        label: {
          id: 'redirect.id',
          defaultMessage: 'E-signet'
        },
        options: {
          url: 'test',
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
