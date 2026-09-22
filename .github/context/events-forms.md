# OpenCRVS Event & Form Conventions

This file is the canonical reference for `defineConfig`, `defineDeclarationForm`, `defineFormPage`, all `FieldType` shapes, validators, and the common patterns used across `src/events/`.

**Related context**:
- [`conditionals-and-validators.md`](conditionals-and-validators.md) — DSL for `conditionals: [...]` and `validation: [...]`
- [`translations.md`](translations.md) and [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) — for every `label.id`, `message.id` you reference
- [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md) — `Event`, `ActionType`, `FieldType`, `ConditionalType`, `PageTypes`
- [`shared/role-conditionals.md`](shared/role-conditionals.md) — reusable role gating composites

## Event Definition Pattern

Each event lives in `src/events/<event-name>/` and follows this structure:

```
src/events/<name>/
  index.ts           # defineConfig() — top-level event config
  forms/
    index.ts         # defineDeclarationForm() — assembles pages
    pages/           # One file per page (e.g. child.ts, mother.ts)
  validators.ts      # Custom validators for fields in this event
  advancedSearch.ts  # Advanced search field config
  dedupConfig.ts     # Deduplication logic
```

Use [src/events/birth/](../../src/events/birth/) as the canonical reference.  
Use [src/events/tennis-club-membership.ts](../../src/events/tennis-club-membership.ts) as the canonical **custom** event reference.

## Registering a New Event

1. Add the event name to the `Event` enum in [src/events/utils/types.ts](../../src/events/utils/types.ts)
2. Create `src/events/<name>/index.ts` using `defineConfig()` from `@opencrvs/toolkit/events`
3. Wire it into the `GET /config/events` route in [src/index.ts](../../src/index.ts)

## Shared Utilities

| Import path | Exports |
|-------------|---------|
| `@countryconfig/events/utils` | `createSelectOptions`, `emptyMessage`, `IdType`, `idTypeOptions`, `maritalStatusOptions` and more |
| `@countryconfig/events/birth/validators` | `invalidNameValidator`, `nationalIdValidator`, `farajalandNameConfig`, `MAX_NAME_LENGTH` (= **32**) |

**Never hardcode name max-length** — always import `MAX_NAME_LENGTH` from `@countryconfig/events/birth/validators`.

## Core Imports

```typescript
import {
  defineConfig, defineDeclarationForm, defineFormPage,
  defineActionForm, PageTypes, FieldType, ConditionalType,
  ActionType, AddressType, TranslationConfig
} from '@opencrvs/toolkit/events'

import { and, or, not, field, user, event, never, now } from '@opencrvs/toolkit/events'

import { defineFormConditional } from '@opencrvs/toolkit/conditionals'
```

See [`shared/toolkit-subpaths.md`](shared/toolkit-subpaths.md) for the full subpath map.

## `defineConfig()` — Complete Structure

```typescript
export const myEvent = defineConfig({
  id: Event.Birth,
  label: { defaultMessage: 'Event name', description: '...', id: 'event.birth.label' },
  dateOfEvent: field('child.dob'),           // field ref used for timeline
  title: {
    defaultMessage: '{child.name.firstname, select, __EMPTY__ {Unnamed} other {{child.name.firstname}}}',
    description: 'Summary card title',
    id: 'event.birth.summary.title'
  },
  fallbackTitle: {
    defaultMessage: 'No name provided',
    description: 'Shown when title resolves to empty',
    id: 'event.birth.summary.fallbackTitle'
  },
  summary: {
    fields: [
      { fieldId: 'child.dob', emptyValueMessage: { defaultMessage: 'Not provided', description: '...', id: '...' } }
    ]
  },
  declaration: DECLARATION_FORM,
  review: DECLARATION_REVIEW,
  actions: [
    defineActionForm({ type: ActionType.DECLARE, forms: [] }),
    defineActionForm({ type: ActionType.REGISTER, forms: [] }),
    defineActionForm({ type: ActionType.CORRECT, forms: [] })
  ]
})
```

## `defineFormPage()` Structure

```typescript
export const myPage = defineFormPage({
  id: 'pageName',                     // field ids on this page must be prefixed 'pageName.'
  type: PageTypes.enum.FORM,          // or PageTypes.enum.VERIFICATION
  title: { defaultMessage: 'Title', description: '...', id: 'event.birth.action.declare.form.section.pageName.title' },
  fields: [ /* field objects */ ]
})
```

## Standard Field Object Shape

All field properties:

```typescript
{
  id: 'section.fieldName',      // REQUIRED — prefix must match page id
  type: FieldType.TEXT,         // REQUIRED
  required: true,               // boolean (default false)
  analytics: false,             // true = tracked in vital statistics (use for DOB, gender, etc.)
  uncorrectable: false,         // true = cannot be corrected post-registration (REQUIRED for FILE)
  hideLabel: false,             // true = hide label (REQUIRED for NAME fields)
  defaultValue: undefined,      // use now() for DATE defaults, false for CHECKBOX
  label: {
    defaultMessage: 'Field label',
    description: 'Context for translators',
    id: 'event.birth.action.declare.form.section.{page}.field.{fieldName}.label'
  },
  configuration: { maxLength: MAX_NAME_LENGTH },  // type-specific — see Field Type Reference below
  conditionals: [
    { type: ConditionalType.SHOW, conditional: field('section.toggle').isEqualTo(true) },
    { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: field('section.toggle').isTruthy() }
  ],
  validation: [
    {
      message: { defaultMessage: 'Error text', description: '...', id: 'error.myError' },
      validator: field('section.fieldName').isBefore().now()
    }
  ]
}
```

## ConditionalType (quick reference)

| Type | Behaviour |
|------|-----------|
| `ConditionalType.SHOW` | Show field when `conditional` is true; hide when false. **Server-enforced** — HTTP 409 if violated on submit. |
| `ConditionalType.ENABLE` | Render but only interactive when true. Server-enforced. |
| `ConditionalType.DISPLAY_ON_REVIEW` | Controls whether the field appears on the review/preview screen |

- Use `never()` in `DISPLAY_ON_REVIEW` to hide a field from review entirely.
- Omitting `DISPLAY_ON_REVIEW` means the field follows its `SHOW` conditional on the review screen too.

Full DSL: [`conditionals-and-validators.md`](conditionals-and-validators.md).

## Conditional Fluent API (quick reference)

### `field()` operators
```typescript
field('section.name').isEqualTo(value)
// NOTE: field(...).isNotEqualTo(...) does NOT exist — use not(field(...).isEqualTo(...))
field('section.name').isUndefined()
field('section.name').isFalsy()
field('section.name').isTruthy()
field('section.name').isBefore().now()
field('section.name').isBefore().date(field('other.field'))
field('section.name').isAfter().now()
field('section.name').isAfter().date(field('other.field'))
field('section.name').isBetween(min, max)
field('section.name').get('subfield')       // access nested field (e.g. NAME subfields: firstname/middlename/surname)
field('section.name').isValidEnglishName()
```

### Logic & time operators
```typescript
and(condA, condB, condC)   // all must be true
or(condA, condB)           // any must be true
not(condA)                 // invert condition
never()                    // always false — use to hide a field from review entirely
now()                      // current datetime — use as DATE field defaultValue
```

### `user()` operators
```typescript
user.hasRole('REGISTRAR')      // use the string RoleId value (not enum) — see roles.ts
user('firstname')              // current user's firstname (for defaultValue)
user('surname')
```

### `event()` operators
```typescript
event.hasAction(ActionType.DECLARE)
event.hasAction(ActionType.REGISTER)
event.hasAction(ActionType.NOTIFY)
event.hasAction(ActionType.CORRECT)
```

## Validator Patterns

```typescript
import { invalidNameValidator, nationalIdValidator } from '@countryconfig/events/birth/validators'

// NAME field — validates all three subfields (firstname, middlename, surname)
validation: [invalidNameValidator('section.name')]

// National ID — 10 numeric digits
validation: [nationalIdValidator('section.nationalId')]

// Custom regex via defineFormConditional
import { defineFormConditional } from '@opencrvs/toolkit/conditionals'

const myCustomValidator = (fieldId: string) => ({
  message: { defaultMessage: 'Must be 8 digits', description: '...', id: 'error.myField' },
  validator: defineFormConditional({
    type: 'object',
    properties: { [fieldId]: { type: 'string', pattern: '^[0-9]{8}$' } }
  })
})
```

Full validator builder reference: [`conditionals-and-validators.md`](conditionals-and-validators.md).

## Field Type Reference

### NAME
```typescript
import { invalidNameValidator, MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

{
  id: 'section.name', type: FieldType.NAME,
  required: true,
  hideLabel: true,   // REQUIRED for all NAME fields
  label: { defaultMessage: 'Full name', description: '...', id: '...' },
  configuration: {
    maxLength: MAX_NAME_LENGTH,
    name: {
      firstname: { required: true,  label: { defaultMessage: 'Given name(s)', description: '...', id: 'form.field.label.firstNames' } },
      middlename: { required: false },
      surname:    { required: true,  label: { defaultMessage: 'Surname',       description: '...', id: 'form.field.label.familyName'  } }
    }
  },
  validation: [invalidNameValidator('section.name')]
}
```

### SELECT with static options
```typescript
import { createSelectOptions } from '@countryconfig/events/utils'
import { TranslationConfig } from '@opencrvs/toolkit/events'

const MyStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const
const myStatusLabels = {
  ACTIVE:   { defaultMessage: 'Active',   description: '...', id: 'form.field.label.statusActive'   },
  INACTIVE: { defaultMessage: 'Inactive', description: '...', id: 'form.field.label.statusInactive' }
} satisfies Record<keyof typeof MyStatus, TranslationConfig>

// In field:
{ id: 'section.status', type: FieldType.SELECT, options: createSelectOptions(MyStatus, myStatusLabels), label: { ... } }
```

### CHECKBOX
```typescript
{
  id: 'section.detailsUnavailable', type: FieldType.CHECKBOX,
  defaultValue: false, analytics: true,
  label: { ... },
  conditionals: [
    { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: field('section.detailsUnavailable').isEqualTo(true) }
  ]
}
```

### DATE
```typescript
{
  id: 'section.dob', type: FieldType.DATE, required: true,
  validation: [{
    message: { defaultMessage: 'Date cannot be in the future', description: '...', id: 'error.dateInFuture' },
    validator: field('section.dob').isBefore().now()
  }]
}
```

### DIVIDER
```typescript
import { emptyMessage } from '@countryconfig/events/utils'

{ id: 'section.divider.1', type: FieldType.DIVIDER, label: emptyMessage }
```

### FILE
```typescript
// uncorrectable: true is REQUIRED for all FILE fields
{ id: 'section.document', type: FieldType.FILE, required: false, uncorrectable: true, label: { ... } }
```

### NUMBER_WITH_UNIT
```typescript
{
  id: 'section.duration', type: FieldType.NUMBER_WITH_UNIT, label: { ... },
  options: [
    { value: 'Days',  label: { id: 'unit.days',  defaultMessage: 'Days',  description: 'Days'  } },
    { value: 'Hours', label: { id: 'unit.hours', defaultMessage: 'Hours', description: 'Hours' } }
  ],
  configuration: { min: 0, numberFieldPlaceholder: { defaultMessage: 'Enter value', description: '...', id: '...' } }
}
```

### PARAGRAPH (hint/info box)
```typescript
{
  id: 'section.info', type: FieldType.PARAGRAPH,
  label: { defaultMessage: 'Informational message.', description: '...', id: '...' },
  configuration: { styles: { hint: true } }   // renders as a grey hint box
}
```

### TEXTAREA
```typescript
{ id: 'section.notes', type: FieldType.TEXTAREA, configuration: { maxLength: 500 }, label: { ... } }
```

### SIGNATURE
```typescript
{
  id: 'section.signature', type: FieldType.SIGNATURE, required: true,
  label: { ... },
  signaturePromptLabel: { defaultMessage: 'Sign here', description: '...', id: '...' }
}
```

### TIME
```typescript
{ id: 'section.time', type: FieldType.TIME, label: { ... }, configuration: { use12HourFormat: false } }
```

### ADDRESS
Use [src/events/utils/street-address-configuration.ts](../../src/events/utils/street-address-configuration.ts) for the domestic/international nested field config.

## Translations for every `label.id`

Every new label `id` must have a corresponding row in [src/translations/client.csv](../../src/translations/client.csv).

**CSV columns are `id,description,en,fr`** — four columns including French. Every row must have a value in every language column. See [`translations.md`](translations.md) for the full convention and the `yarn sort-translations` workflow, and [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) for the full id-naming table.

## Common Patterns

```typescript
// Hide all section fields when "details unavailable" is checked
const requireDetails = not(field('mother.detailsUnavailable').isEqualTo(true))

// Role-based visibility — prefer reusable composites from src/events/utils/role-conditionals.ts
import { hasHealthNotifierRole } from '@countryconfig/events/utils/role-conditionals'
const registrarOnly = user.hasRole('REGISTRAR')

// Compound: show only if details exist AND user has correct role
and(requireDetails, registrarOnly)

// Hide field from review screen entirely
{ type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }

// Always show field on review regardless of SHOW conditional
{ type: ConditionalType.DISPLAY_ON_REVIEW, conditional: field('section.x').isTruthy() }

// Show field only during a specific action
{ type: ConditionalType.SHOW, conditional: event.hasAction(ActionType.CORRECT) }
```

## Anti-patterns

- **`field(...).isNotEqualTo(...)`** — does not exist; use `not(field(...).isEqualTo(...))`.
- **Hardcoding name max-length** — import `MAX_NAME_LENGTH` from `@countryconfig/events/birth/validators`.
- **Forgetting `hideLabel: true` on NAME fields** — required.
- **Forgetting `uncorrectable: true` on FILE fields** — required.
- **Inlining role checks** instead of reusing composites in [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts) — see [`shared/role-conditionals.md`](shared/role-conditionals.md).
- **Using `DISPLAY_ON_REVIEW` on non-declaration forms** (action/correction/print) — valid only on declaration form fields.
- **Missing CSV row for a `label.id`** — UI falls back to `defaultMessage` silently in development; QA in `fr` will surface the gap.
- **Three-column CSV updates** — the actual CSV is 4 columns (`id,description,en,fr`). Always add a `fr` value when adding rows.
