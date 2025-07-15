/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

type JSONSchema = Record<string, any>

/**
 * Helper functions for creating certificate template conditionals
 *
 * These functions solve the core requirement: restricting certificate visibility
 * based on action history (especially print counts) and other common patterns.
 */

/**
 * Core requirement: Check if certificate has been printed before
 * This solves the main use case of showing replacement certificates only after initial prints
 */
export function hasPrintHistory(): JSONSchema {
  return {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            contains: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  const: 'PRINT_CERTIFICATE'
                }
              },
              required: ['type']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

/**
 * Check minimum number of prints for a certificate
 * Directly addresses the requirement: "based on the number of times a specific certificate has been printed"
 */
export function hasMinimumPrintCount(count: number): JSONSchema {
  return {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            minContains: count,
            contains: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  const: 'PRINT_CERTIFICATE'
                }
              },
              required: ['type']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

/**
 * Check minimum number of prints for a specific certificate template
 * More precise version that checks for specific template ID
 */
export function hasMinimumPrintCountForTemplate(
  count: number,
  templateId: string
): JSONSchema {
  return {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            minContains: count,
            contains: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  const: 'PRINT_CERTIFICATE'
                },
                templateId: {
                  type: 'string',
                  const: templateId
                }
              },
              required: ['type', 'templateId']
            }
          }
        },
        required: ['actions']
      }
    },
    required: ['event']
  }
}

/**
 * Check if event is registered (common status check)
 */
export function isRegistered(): JSONSchema {
  return {
    type: 'object',
    properties: {
      event: {
        type: 'object',
        properties: {
          registration: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                const: 'REGISTERED'
              }
            },
            required: ['status']
          }
        },
        required: ['registration']
      }
    },
    required: ['event']
  }
}

/**
 * Simple form field equality check
 */
export function formField(fieldPath: string) {
  return {
    equals: (value: string): JSONSchema => ({
      type: 'object',
      properties: {
        [fieldPath]: {
          type: 'string',
          const: value
        }
      },
      required: [fieldPath]
    })
  }
}

/**
 * Combine multiple conditionals with AND logic
 */
export function all(...conditionals: JSONSchema[]): JSONSchema {
  return {
    allOf: conditionals
  }
}

/**
 * Combine multiple conditionals with OR logic
 */
export function any(...conditionals: JSONSchema[]): JSONSchema {
  return {
    anyOf: conditionals
  }
}
