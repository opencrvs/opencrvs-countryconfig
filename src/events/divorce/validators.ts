import { defineFormConditional } from '@opencrvs/toolkit/conditionals'

export const passportIdValidator = (fieldId: string) => ({
  message: {
    defaultMessage: 'Passport number must be alphanumeric, no spaces',
    description: 'Validation error for passport number',
    id: 'error.invalidPassportId'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[A-Za-z0-9]+$',
        description: 'Must be alphanumeric, no spaces.'
      }
    }
  })
})

export const otherIdValidator = (fieldId: string) => ({
  message: {
    defaultMessage:
      'ID must be alphanumeric, no spaces, and may include "/" or "-"',
    description: 'Validation error for other ID',
    id: 'error.invalidOtherId'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[A-Za-z0-9/-]+$',
        description: 'Must be alphanumeric, no spaces, and may include / or -.'
      }
    }
  })
})
