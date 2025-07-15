# Certificate Template Conditionals

This document explains how to implement certificate template conditionals in your OpenCRVS country configuration. Certificate template conditionals allow you to dynamically show or hide certificate templates based on form data or event metadata using JSON Schema validation.

## Overview

Certificate template conditionals enable you to:

- Show templates only for specific demographics (e.g., age groups, gender, nationality)
- Filter templates based on registration status or action history
- Create regional variations of certificates
- Implement business rules for certificate availability
- Display role-based templates based on who registered the event
- Show replacement vs. first-issue certificate templates
- Enable fee-based template options

**Key Concept**: Conditionals validate against a combined data structure containing both form data (flattened with dot notation) and event metadata (nested under the `event` property). Understanding this structure is essential for writing effective conditionals.

## Configuration

### Basic Structure

Add conditionals to your certificate templates in `src/api/certificates/handler.ts`:

```typescript
{
  id: 'example-certificate',
  event: Event.Birth,
  // ... other certificate properties
  conditionals: [
    {
      type: 'SHOW',
      conditional: {
        // JSON Schema validation rules for both form data and event metadata
      }
    }
  ]
}
```

### Types of Conditionals

When OpenCRVS evaluates certificate template conditionals, it validates against a combined data structure that includes both the form data and event metadata. Understanding this structure is crucial for writing effective conditionals.

#### Data Structure Overview

The validation object passed to conditionals contains:

```typescript
{
  // Form data (flattened with dot notation)
  'child.gender': 'male',
  'child.dob': '2023-01-15',
  'mother.nationality': 'FAR',
  'informant.relationship': 'MOTHER',
  // ... other form fields

  // Event metadata (nested under 'event' property)
  event: {
    id: '12345678-1234-1234-1234-123456789012',
    type: 'Birth',
    trackingId: 'B123456',
    registration: {
      status: 'REGISTERED',
      registrationNumber: 'BR123456789',
      contactPoint: {
        partOf: 'Location/123e4567-e89b-12d3-a456-426614174000'
      }
    },
    actions: [
      {
        type: 'DECLARED',
        timestamp: '2023-01-15T10:00:00.000Z',
        createdByRole: 'FIELD_AGENT'
      },
      {
        type: 'REGISTERED',
        timestamp: '2023-01-16T14:30:00.000Z',
        createdByRole: 'REGISTRAR'
      }
    ]
  }
}
```

This structure allows you to write conditionals that check both form data (using flattened property names) and event metadata (using the nested `event` object).

#### 1. Form Data Conditionals

Use flattened property keys with dot notation as literal property names to validate against form data:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        'child.gender': {
          type: 'string',
          enum: ['male']
        },
        'informant.relationship': {
          type: 'string',
          enum: ['MOTHER', 'FATHER']
        }
      },
      required: ['child.gender']
    }
  }
]
```

#### 2. Event Metadata Conditionals

Use nested object structure through the `event` property to validate against event metadata:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
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
                  enum: ['REGISTERED']
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
]
```

#### 3. Combined Conditionals

You can combine both form data and event metadata in a single conditional:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        'child.gender': {
          type: 'string',
          enum: ['male']
        },
        event: {
          type: 'object',
          properties: {
            registration: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['REGISTERED']
                }
              },
              required: ['status']
            }
          },
          required: ['registration']
        }
      },
      required: ['child.gender', 'event']
    }
  }
]
```

## Practical Examples

### Age-Based Templates

Show a template only for children born before a specific date:

```typescript
{
  id: 'late-birth-certificate',
  event: Event.Birth,
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      conditional: {
        type: 'object',
        properties: {
          'child.dob': {
            type: 'string',
            format: 'date',
            formatMaximum: '2023-01-01' // Born before this date
          }
        },
        required: ['child.dob']
      }
    }
  ]
}
```

### Gender-Specific Templates

Show a template only for male children:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        'child.gender': {
          type: 'string',
          enum: ['male']
        }
      },
      required: ['child.gender']
    }
  }
]
```

### Regional Templates

Show a template only for specific locations:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            registration: {
              type: 'object',
              properties: {
                contactPoint: {
                  type: 'object',
                  properties: {
                    partOf: {
                      type: 'string',
                      enum: ['Location/123e4567-e89b-12d3-a456-426614174000']
                    }
                  },
                  required: ['partOf']
                }
              },
              required: ['contactPoint']
            }
          },
          required: ['registration']
        }
      },
      required: ['event']
    }
  }
]
```

### Status-Based Templates

Show a template only for registered events:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
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
                  enum: ['REGISTERED']
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
]
```

### Action History-Based Templates

Show a template only if certain actions have occurred:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
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
]
```

### Action Count-Based Templates

Show a template only if a specific number of actions have occurred:

```typescript
// Show template only if exactly 2 print actions have occurred
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              minContains: 2,
              maxContains: 2,
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' }
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
]
```

### Minimum Action Count Templates

Show a template only if at least a certain number of actions have occurred:

```typescript
// Show template only if at least 3 print actions have occurred
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              minContains: 3,
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' }
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
]
```

### Template-Specific Action Count

Show a template only if a specific template has been printed a certain number of times:

```typescript
// Show certified copy only after the main certificate has been printed at least twice
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              minContains: 2,
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' },
                  templateId: { const: 'birth-certificate' }
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
]
```

### Role-Based Templates

Show templates based on who registered the event:

```typescript
// Show special template for events registered by National Registrars
conditionals: [
  {
    type: 'SHOW',
    conditional: {
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
                  type: { const: 'REGISTER' },
                  createdByRole: {
                    enum: ['NATIONAL_REGISTRAR']
                  }
                },
                required: ['type', 'createdByRole']
              }
            }
          },
          required: ['actions']
        }
      },
      required: ['event']
    }
  }
]
```

### Replacement Certificate Templates

Show replacement templates only after previous certificates have been issued:

```typescript
// Show replacement template only if at least one certificate has been printed
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              minContains: 1,
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' }
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
]
```

### Complex Multi-Condition Templates

Combine multiple conditions using `allOf`, `anyOf`, or `oneOf`:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      allOf: [
        {
          properties: {
            'child.gender': {
              type: 'string',
              enum: ['female']
            }
          },
          required: ['child.gender']
        },
        {
          properties: {
            'mother.nationality': {
              type: 'string',
              enum: ['FAR']
            }
          },
          required: ['mother.nationality']
        }
      ]
    }
  }
]
```

## Helper Functions

To make conditionals more readable and maintainable, OpenCRVS provides helper functions that generate the verbose JSON Schema structures for common patterns. These are available in `src/api/certificates/conditional-helpers.ts`.

### Using Helper Functions

Instead of writing verbose JSON Schema objects, you can use helper functions:

```typescript
import {
  formField,
  hasPrintHistory,
  isValidated,
  isRegistered,
  all,
  any,
  not
} from './conditional-helpers'

// Instead of verbose JSON Schema...
conditionals: [
  {
    type: 'SHOW',
    conditional: hasPrintHistory() // Simple and readable!
  }
]
```

### Available Helper Functions

#### Form Data Helpers

```typescript
// Check if form field equals specific value
formField('child.gender').equals('male')
formField('informant.relationship').isOneOf(['MOTHER', 'FATHER'])
formField('child.name').exists()

// Date comparisons
formField('child.dob').dateBefore('2023-01-01')
formField('child.dob').dateAfter('2022-01-01')
```

#### Event Metadata Helpers

```typescript
// Registration status
isRegistered()
hasRegistrationStatus(['REGISTERED', 'VALIDATED'])

// Action history
hasPrintHistory() // Has any print action
hasAction('VALIDATE') // Has specific action type
hasActionWithStatus('VALIDATE', 'ACCEPTED') // Action with status
hasActionByRole('PRINT_CERTIFICATE', 'REGISTRAR') // Action by role

// Action counting (JSON Schema Draft 2019-09)
hasMinimumActions('PRINT_CERTIFICATE', 2) // At least 2 prints
hasMaximumActions('PRINT_CERTIFICATE', 1) // Maximum 1 print

// Location-based
isFromLocation('Location/123e4567-e89b-12d3-a456-426614174000')
```

#### Combining Conditions

```typescript
// Combine conditions
all(isRegistered(), formField('child.gender').equals('male'))

any(hasPrintHistory(), formField('informant.relationship').equals('SPOUSE'))

not(hasAction('REJECT'))
```

### Real-World Examples

#### Replacement Certificate Logic

```typescript
{
  id: 'birth-certificate-replacement',
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      // Show only if original was printed and this is for registered records
      conditional: all(
        isRegistered(),
        hasPrintHistory()
      )
    }
  ]
}
```

#### Gender and Status Based Template

```typescript
{
  id: 'male-birth-certificate',
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      // Show only for registered male children
      conditional: all(
        isRegistered(),
        formField('child.gender').equals('male')
      )
    }
  ]
}
```

#### Flexible Access Template

```typescript
{
  id: 'flexible-death-certificate',
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      // Show if printed before OR if informant is spouse
      conditional: any(
        hasPrintHistory(),
        formField('informant.relationship').equals('SPOUSE')
      )
    }
  ]
}
```

#### Advanced Action Counting

```typescript
{
  id: 'multi-print-certificate',
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      // Show only after certificate has been printed at least twice
      conditional: hasMinimumActions('PRINT_CERTIFICATE', 2)
    }
  ]
}
```

### Benefits of Helper Functions

1. **Readability**: `hasPrintHistory()` vs. 20+ lines of JSON Schema
2. **Maintainability**: Changes to logic happen in one place
3. **Type Safety**: TypeScript ensures correct usage
4. **Consistency**: Standardized patterns across all certificates
5. **Testing**: Easier to unit test individual helper functions

### Creating Custom Helper Functions

Countries can create their own helper functions for business logic specific to their implementation. This is particularly useful for:

- Country-specific eligibility criteria
- Regional variations
- Complex fee structures
- Multi-step validation logic

#### Example: Custom Country Helper

```typescript
// In your conditional-helpers.ts or separate file
export function isEligibleForFreeRegistration() {
  return all(
    formField('child.dob').dateAfter('2023-01-01'), // Born after policy change
    any(
      formField('mother.nationality').equals('FAR'),
      formField('father.nationality').equals('FAR')
    ),
    formField('informant.relationship').isOneOf(['MOTHER', 'FATHER'])
  )
}

// Usage in certificate template
{
  id: 'free-birth-certificate',
  // ... other properties
  conditionals: [
    {
      type: 'SHOW',
      conditional: isEligibleForFreeRegistration()
    }
  ]
}
```

#### Example: Regional Template Helper

```typescript
export function isFromRuralArea() {
  return any(
    formField('child.placeOfBirth').equals('RURAL_DISTRICT_1'),
    formField('child.placeOfBirth').equals('RURAL_DISTRICT_2'),
    formField('mother.permanentAddress').equals('RURAL_AREA')
  )
}

// Combined with existing helpers
export function ruralRegisteredBirth() {
  return all(isRegistered(), isFromRuralArea())
}
```

#### Best Practices for Custom Helpers

1. **Descriptive Names**: Use clear, business-focused function names
2. **Modular Design**: Break complex logic into smaller, reusable functions
3. **Documentation**: Add JSDoc comments explaining the business rules
4. **Testing**: Write unit tests for your custom logic
5. **Consistency**: Follow the same patterns as built-in helpers

```typescript
/**
 * Checks if a birth registration qualifies for expedited processing
 * Based on: urgency reason, hospital birth, and complete documentation
 */
export function qualifiesForExpeditedProcessing() {
  return all(
    formField('registration.urgencyReason').exists(),
    formField('child.placeOfBirth').equals('HOSPITAL'),
    formField('documents.allRequired').equals('true')
  )
}
```

## Data Access Patterns

### Form Data Structure

Form data uses flattened property keys with dot notation as **literal property names**:

- `'child.firstName'` - Child's first name
- `'child.familyName'` - Child's family name
- `'child.gender'` - Child's gender
- `'child.dob'` - Child's date of birth
- `'mother.nationality'` - Mother's nationality
- `'father.nationality'` - Father's nationality
- `'informant.relationship'` - Informant's relationship to child

### Event Metadata Structure

Event metadata is accessed through the `event` property as a **nested object structure**:

```typescript
{
  event: {
    id: string,
    type: string,
    trackingId: string,
    createdAt: string,
    updatedAt: string,
    registration: {
      status: 'REGISTERED' | 'DECLARED' | 'VALIDATED',
      registrationNumber: string,
      trackingId: string,
      contactPoint: {
        partOf: string // Location reference
      }
    },
    actions: [
      {
        type: 'DECLARED' | 'REGISTERED' | 'PRINT_CERTIFICATE' | 'DOWNLOADED' | 'VALIDATE',
        status: 'ACCEPTED' | 'REJECTED',
        timestamp: string,
        templateId?: string,
        createdByRole?: string
      }
    ]
  }
}
```

## Key Differences in Conditional Syntax

### Form Data Conditionals (Flattened)

Use dot notation as **literal property names**:

```typescript
{
  type: 'object',
  properties: {
    'child.gender': { // This is a literal property key
      type: 'string',
      enum: ['male']
    }
  },
  required: ['child.gender']
}
```

### Event Metadata Conditionals (Nested)

Use **nested object structure** through the `event` property:

```typescript
{
  type: 'object',
  properties: {
    event: { // This is an object property
      type: 'object',
      properties: {
        registration: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['REGISTERED']
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
```

## JSON Schema Validation

### Supported Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `object` - Nested objects
- `array` - Arrays of values

### Common Patterns

#### Exact Match

```typescript
{
  type: 'string',
  const: 'REGISTERED'
}
```

#### Multiple Options

```typescript
{
  type: 'string',
  enum: ['MOTHER', 'FATHER', 'GUARDIAN']
}
```

#### Date Validation

```typescript
{
  type: 'string',
  format: 'date',
  formatMaximum: '2023-01-01' // Before this date
}
```

#### Array Contains

```typescript
{
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
```

#### Array Count Validation

```typescript
{
  type: 'array',
  minContains: 2,
  maxContains: 5,
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
```

#### Logical Operators

```typescript
{
  allOf: [/* all conditions must match */],
  anyOf: [/* at least one condition must match */],
  oneOf: [/* exactly one condition must match */],
  not: { /* condition must not match */ }
}
```

## Important Notes

### Backward Compatibility

- **No Action Required**: Existing configurations continue to work without changes
- **Optional Enhancement**: Countries can choose when and how to adopt conditionals
- Templates without conditionals continue to work normally
- Invalid conditionals are logged but don't break the system
- Graceful degradation for missing data

### Data Structure Requirements

When validating event metadata that contains a `type` property (like in action history), use proper JSON Schema structure. The modern JSON Schema version handles property name conflicts better:

```typescript
// Correct approach for event metadata with type property:
{
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
```

### JSON Schema Version Compatibility

This implementation uses JSON Schema Draft 2019-09. This version supports advanced features like:

- `minContains` / `maxContains` for precise array validation
- `unevaluatedProperties` for enhanced object validation
- Modern JSON Schema features for complex conditional logic

### Performance Considerations

- Keep conditionals simple and focused
- Avoid deeply nested validation rules when possible
- Use specific field paths rather than broad object validation
- Test conditionals thoroughly with sample data
- Consider the impact on certificate loading performance
- Conditionals are evaluated client-side for responsive UI

## Testing Your Conditionals

### Manual Testing

1. Set up test data that matches your conditional criteria
2. Navigate to the certificate selection screen
3. Verify that templates appear/disappear as expected
4. Test edge cases and boundary conditions

### Sample Test Data

Create test cases that cover:

- Valid conditions (template should show)
- Invalid conditions (template should hide)
- Missing data (template should handle gracefully)
- Edge cases (dates, enums, etc.)

## Migration Guide

### Updating Existing Templates

1. Identify templates that need conditional logic
2. Determine what data to validate against (form vs metadata)
3. Write JSON Schema validation rules
4. Test thoroughly in development environment
5. Deploy incrementally

### Implementation Strategy

- **Phase 1**: Add conditionals to new templates first
- **Phase 2**: Gradually migrate existing templates
- **Phase 3**: Test all combinations thoroughly
- **Phase 4**: Deploy with monitoring and rollback plan

Templates without conditionals continue to work normally, making this a non-breaking change.

## Best Practices

1. **Start Simple**: Begin with basic conditionals and add complexity gradually
2. **Document Logic**: Comment your conditional logic for future maintainers
3. **Test Thoroughly**: Validate all scenarios including edge cases
4. **Monitor Performance**: Keep an eye on certificate loading times
5. **Version Control**: Track conditional changes in your country config versioning
6. **Use Meaningful Names**: Make template IDs descriptive of their conditional purpose

## Common Use Cases

### Regional Variations

```typescript
// Template for Capital Region only
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            registration: {
              type: 'object',
              properties: {
                contactPoint: {
                  type: 'object',
                  properties: {
                    partOf: {
                      type: 'string',
                      enum: ['Location/capital-region-id']
                    }
                  },
                  required: ['partOf']
                }
              },
              required: ['contactPoint']
            }
          },
          required: ['registration']
        }
      },
      required: ['event']
    }
  }
]
```

### Age Groups

```typescript
// Template for children born after 2020
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        'child.dob': {
          type: 'string',
          format: 'date',
          formatMinimum: '2020-01-01'
        }
      },
      required: ['child.dob']
    }
  }
]
```

### Document Types

```typescript
// Certified copy only after initial certificate has been printed at least twice
conditionals: [
  {
    type: 'SHOW',
    conditional: {
      type: 'object',
      properties: {
        event: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              minContains: 2,
              contains: {
                type: 'object',
                properties: {
                  type: { const: 'PRINT_CERTIFICATE' },
                  templateId: { const: 'standard-birth-certificate' }
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
]
```

## Troubleshooting

### Common Issues

1. **Template not showing**: Check conditional logic and test data
2. **JSON Schema errors**: Validate schema syntax and keywords
3. **Property conflicts**: Avoid using `type` as property name in simple `properties` objects
4. **Performance issues**: Simplify complex conditionals
5. **Event metadata not accessible**: Ensure you're using the nested `event` property structure, not flattened dot notation like form data

### Debugging Tips

1. Use browser developer tools to inspect validation errors
2. Log conditional evaluation results
3. Test with minimal data sets first
4. Validate JSON Schema syntax independently
5. Remember: form data uses `'child.gender'` (literal string), event metadata uses `event.registration.status` (nested object)

## Support

For additional help with certificate template conditionals:

- Check the OpenCRVS core documentation
- Review example implementations in this country config
- Consult the OpenCRVS community forums
- Contact the OpenCRVS development team
