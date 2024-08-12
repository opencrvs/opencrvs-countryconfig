import { Conditional, SerializedFormField } from '../types/types'
import { Validator } from '../types/validators'
import { formMessageDescriptors } from './messages'

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
