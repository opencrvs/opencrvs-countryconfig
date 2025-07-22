# Certificate Template Conditionals

This document explains how to implement certificate template conditionals in your OpenCRVS country configuration.

## Overview

Certificate template conditionals allow you to dynamically show or hide certificate templates based on print actions and other event conditions. You can use the `event.printActions()` helper from the OpenCRVS toolkit library to create simple, readable conditionals.

## Configuration

Add conditionals to your certificate templates in `src/api/certificates/handler.ts`:

```typescript
import { event } from '@opencrvs/toolkit/conditionals'

conditionals: [
  {
    type: 'SHOW',
    conditional: event.printActions().minCount(1) // Show after any print
  }
]
```

## Available Helper Methods

### 1. Basic Print Action Counting

```typescript
// Show template after any certificate has been printed once
conditional: event.printActions().minCount(1)

// Show template after any certificate has been printed twice
conditional: event.printActions().minCount(2)

// Show template only if printed at most once (hide after multiple prints)
conditional: event.printActions().maxCount(1)
```

### 2. Specific Template Print Counting

```typescript
// Show template only after the 'birth-certificate' template has been printed
conditional: event.printActions('birth-certificate').minCount(1)

// Show template after 'death-certificate' has been printed twice
conditional: event.printActions('death-certificate').minCount(2)

// Hide template if 'marriage-certificate' has been printed more than once
conditional: event.printActions('marriage-certificate').maxCount(1)
```

## Common Use Cases

### 1. Replacement Certificate

Show a "replacement" template after the original has been printed:

```typescript
{
  id: 'birth-replacement-certificate',
  event: Event.Birth,
  label: {
    id: 'certificates.birth.replacement',
    defaultMessage: 'Replacement Birth Certificate',
    description: 'Birth certificate replacement'
  },
  isDefault: false,
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions('birth-certificate').minCount(1)
    }
  ]
  // ... other properties
}
```

### 2. Multiple Copy Certificate

Show a "multiple copy" template after 2+ prints:

```typescript
{
  id: 'birth-multiple-copy-certificate',
  event: Event.Birth,
  label: {
    id: 'certificates.birth.multiple',
    defaultMessage: 'Birth Certificate (Multiple Copy)',
    description: 'Birth certificate multiple copy'
  },
  isDefault: false,
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions().minCount(2)
    }
  ]
  // ... other properties
}
```

### 3. Limited Print Certificate

Hide a template after it's been printed once (one-time only):

```typescript
{
  id: 'birth-commemorative-certificate',
  event: Event.Birth,
  label: {
    id: 'certificates.birth.commemorative',
    defaultMessage: 'Commemorative Birth Certificate',
    description: 'Special commemorative certificate'
  },
  isDefault: false,
  conditionals: [
    {
      type: 'SHOW',
      conditional: event.printActions('birth-commemorative-certificate').maxCount(0)
    }
  ]
  // ... other properties
}
```

## Integration with Country Configs

Import the helper in your certificate template configuration:

```typescript
import { event } from '@opencrvs/toolkit/conditionals'
import { Event } from '@countryconfig/form/types/types'

export const certificateTemplates: ICertificateConfigData[] = [
  {
    id: 'birth-certificate',
    event: Event.Birth,
    label: {
      id: 'certificates.birth.certificate',
      defaultMessage: 'Birth Certificate',
      description: 'The label for a birth certificate'
    },
    isDefault: true
    // ... other properties
  },
  {
    id: 'birth-replacement-certificate',
    event: Event.Birth,
    label: {
      id: 'certificates.birth.replacement',
      defaultMessage: 'Replacement Birth Certificate',
      description: 'The label for a replacement birth certificate'
    },
    isDefault: false,
    conditionals: [
      {
        type: 'SHOW',
        conditional: event.printActions('birth-certificate').minCount(1)
      }
    ]
    // ... other properties
  }
]
```

## Support

This helper is available in:

- `@opencrvs/toolkit/conditionals` package
- All country config repositories that use OpenCRVS v1.8.0+
- Full TypeScript support with autocomplete
