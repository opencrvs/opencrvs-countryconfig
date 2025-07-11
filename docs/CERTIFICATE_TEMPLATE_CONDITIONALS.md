# Certificate Template Conditionals

This document explains how to implement certificate template conditionals in your OpenCRVS country configuration. Certificate template conditionals allow you to dynamically show or hide certificate templates based on form data or event metadata using JSON Schema validation.

## Overview

Certificate template conditionals enable you to:

- Show templates only for specific demographics (e.g., age groups, gender, nationality)
- Filter templates based on registration status or action history
- Create regional variations of certificates
- Implement business rules for certificate availability

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
                    const: 'PRINTED' 
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
        type: 'DECLARED' | 'REGISTERED' | 'PRINTED' | 'DOWNLOADED' | 'VALIDATE',
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
        const: 'PRINTED' 
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

### Property Name Conflicts

When validating event metadata that contains a `type` property (like in action history), use proper JSON Schema structure:

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
                const: 'PRINTED' 
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

This implementation uses JSON Schema Draft 7. Avoid newer keywords like:

- `minContains` / `maxContains` (use `contains` alone)
- `unevaluatedProperties`
- `$defs`

### Performance Considerations

- Keep conditionals simple and focused
- Avoid deeply nested validation rules when possible
- Use specific field paths rather than broad object validation
- Test conditionals thoroughly with sample data
- Consider the impact on certificate loading performance

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

### Backward Compatibility

- Templates without conditionals continue to work normally
- Invalid conditionals are logged but don't break the system
- Graceful degradation for missing data

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
// Certified copy only after initial certificate has been printed
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
                    const: 'PRINTED' 
                  },
                  templateId: { 
                    type: 'string',
                    const: 'standard-birth-certificate' 
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
]
```

## Troubleshooting

### Common Issues

1. **Template not showing**: Check conditional logic and test data
2. **JSON Schema errors**: Validate schema syntax and keywords
3. **Property conflicts**: Avoid using `type` as property name in simple `properties` objects
4. **Performance issues**: Simplify complex conditionals

### Debugging Tips

1. Use browser developer tools to inspect validation errors
2. Log conditional evaluation results
3. Test with minimal data sets first
4. Validate JSON Schema syntax independently

## Support

For additional help with certificate template conditionals:

- Check the OpenCRVS core documentation
- Review example implementations in this country config
- Consult the OpenCRVS community forums
- Contact the OpenCRVS development team
