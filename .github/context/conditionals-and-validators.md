# Conditionals & Validators DSL

OpenCRVS uses a small JSONSchema-backed DSL to express **conditionals** (when something is shown, enabled, or required) and **validators** (when input is acceptable). The same DSL appears across form fields, action visibility, certificate visibility, dedup matching, advanced search, workqueue queries, and role-based gating.

**Related context**:
- [`shared/toolkit-subpaths.md`](shared/toolkit-subpaths.md) — pick the right `@opencrvs/toolkit/*` subpath
- [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md) — `ActionType`, `EventStatus`, `InherentFlags`, `ConditionalType`
- [`shared/role-conditionals.md`](shared/role-conditionals.md) — composites for role-based gating

This is the canonical reference for the DSL. Use whenever a request mentions "conditional", "validator", "show/hide field", "enable/disable", "only for role X", "only after action Y", "dedupe", "fuzzy match", "advanced search", "regex on field", or you need to write a `conditionals: [...]` / `validation: [...]` / `dedupConfig` / `flags: [{ conditional }]` block.

## Imports — pick the right subpath

The DSL is split across three `@opencrvs/toolkit` subpaths. Most of the builder API is re-exported from `events`, but `defineConditional`/`defineFormConditional` and a few combinators live in `conditionals`. The deduplication operators are in a separate subpath because `field()` has a different shape there.

| Subpath | What it exports | When to import from it |
|---|---|---|
| `@opencrvs/toolkit/events` | `field`, `event`, `user`, `status`, `flag`, `and`, `or`, `not`, `never`, `now`, `defineConditional`, `defineFormConditional`, `ConditionalType`, `InherentFlags`, `ActionType`, `FieldType` | Almost everything inside form pages, event definitions, workqueues, certificates |
| `@opencrvs/toolkit/conditionals` | `defineConditional`, `defineFormConditional`, `not`, `never`, `or`, address validators | When you only need standalone combinators/builders (custom validators, role conditionals) without the `field()` API |
| `@opencrvs/toolkit/events/deduplication` | `field`, `and`, `or`, `not` **(dedup variants)** | Only inside `dedupConfig.ts`. Do NOT mix with the form `field()` — the methods differ (`fuzzyMatches`, `strictMatches`, `dateRangeMatches`) |

Convention seen across this repo: import combinators from `@opencrvs/toolkit/events` when you're already importing `field`/`event`/`user` from it; otherwise import them from `@opencrvs/toolkit/conditionals`. Both resolve to the same implementation.

Examples:
- [src/events/birth/forms/pages/mother.ts](../../src/events/birth/forms/pages/mother.ts) — `from '@opencrvs/toolkit/events'` for `and/or/field` plus `from '@opencrvs/toolkit/conditionals'` for `not/never/defineConditional`
- [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts) — `or/user` from `events`, `not` from `conditionals`
- [src/events/birth/dedupConfig.ts](../../src/events/birth/dedupConfig.ts) — everything from `@opencrvs/toolkit/events/deduplication`
- [src/events/birth/validators.ts](../../src/events/birth/validators.ts) — `defineFormConditional` from `conditionals`, `and/field` from `events`

## The three `ConditionalType` values

Defined in [packages/commons/src/events/Conditional.ts](../../../opencrvs-core/packages/commons/src/events/Conditional.ts):

| Type | Where allowed | Behaviour |
|---|---|---|
| `ConditionalType.SHOW` | fields, actions, certificates, custom-action dialogs | Component is rendered only if the condition is true. If false, it's hidden everywhere AND the backend rejects the action with HTTP 409 if attempted. |
| `ConditionalType.ENABLE` | fields, actions | Component is rendered but only interactive if the condition is true. Backend also enforces — HTTP 409 if the action is invoked while disabled. |
| `ConditionalType.DISPLAY_ON_REVIEW` | form fields only (declaration forms have review pages) | AND-ed with `SHOW` on the review/preview screen. Omit it to inherit `SHOW`. Use `never()` to hide from review entirely while keeping the field visible on input. |

**HTTP 409 from the backend almost always means a `SHOW` or `ENABLE` conditional was violated.** Check the action's conditionals when debugging this.

## The four conditional scopes

Each builder targets a different schema scope. Mixing them in the same conditional usually fails silently (always-false). Use the right builder for the context:

| Builder | Scope | Use in |
|---|---|---|
| `field('section.x')` | `$form` — current form values | field `conditionals`, field `validation`, action conditionals that depend on declaration data, dedup, advancedSearch |
| `event('field')` / `event.hasAction(...)` / `event.field('dateOfEvent')` | `$event` — the EventDocument (actions, status, metadata) | action conditionals that depend on the event's history, certificate conditionals (`event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1)`), workqueue columns |
| `user.hasRole(...)` / `user('id' \| 'primaryOfficeId' \| 'firstname' \| ...)` | `$user` — the JWT token claims | role gating, defaulting fields to the logged-in user, workqueue filters scoped to the user |
| `status(EventStatus.enum.DECLARED)` / `flag('approval-required-...')` | `$status` / `$flags` — event metadata | action visibility based on lifecycle state, flag-driven escalation |

## `field()` — the form-data fluent API

```typescript
// Equality
field('mother.detailsUnavailable').isEqualTo(true)
field('child.placeOfBirth').isEqualTo(PlaceOfBirth.HEALTH_FACILITY)

// Presence / truthiness
field('mother.dob').isUndefined()
field('mother.dob').isFalsy()
field('mother.dob').isTruthy()

// Nested subfields (NAME, ADDRESS, etc.)
field('mother.name').get('firstname').isValidEnglishName()
field('mother.name').get('surname').isValidEnglishName()

// Date comparisons
field('child.dob').isBefore().now()
field('child.dob').isAfter().now()
field('child.dob').isAfter().days(365).inPast()   // more than 365 days ago
field('child.dob').isBefore().date(field('father.dob'))
field('child.dob').isBetween(min, max)

// String validation
field('mother.name').get('firstname').isValidEnglishName()
```

### The `isNotEqualTo` gotcha

`field(...).isNotEqualTo(...)` is **not part of the API**. Use:

```typescript
not(field('section.x').isEqualTo(value))
```

This is the most common cause of "my conditional silently always evaluates to false". The TypeScript compiler will not catch it because some chained methods only exist on certain subtypes — calling a missing method may compile but produce an invalid schema.

## `event()` — event-document API

```typescript
event.hasAction(ActionType.PRINT_CERTIFICATE)              // has any such action
event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1)  // at least N times
event.hasAction(ActionType.REGISTER).maxCount(0)           // never registered

// In advancedSearch / workqueues you use event() as a callable for search fields
event('legalStatuses.REGISTERED.createdAtLocation').within()
event('status').exact()
event('updatedAt').range()
event.field('dateOfEvent')   // workqueue column value
```

Used heavily in [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts) (e.g. certified-copy templates show only after the original was printed) and [src/events/birth/advancedSearch.ts](../../src/events/birth/advancedSearch.ts).

## `user()` — current-user API

```typescript
user.hasRole('REGISTRAR')                  // string id from src/data-seeding/roles/roles.ts
user.hasRole('ISLAND_REGISTRAR')
user('id')                                 // current user id (workqueue filter)
user('primaryOfficeId')                    // user's office location id
user('firstname')                          // user's name (for defaultValue)
```

Always pass the **string role id** (not an enum value). Role ids are defined in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts).

Common composite patterns are in [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts) — see [`shared/role-conditionals.md`](shared/role-conditionals.md) for the canonical reference. Reuse from `@countryconfig/events/utils` — do NOT inline role checks in pages.

## `status()` and `flag()` — event-state API

```typescript
status(EventStatus.enum.DECLARED)                // status is exactly DECLARED
flag('approval-required-for-late-registration')  // flag is set
flag(InherentFlags.REJECTED)                     // built-in flag

InherentFlags.INCOMPLETE
InherentFlags.REJECTED
InherentFlags.POTENTIAL_DUPLICATE
InherentFlags.CORRECTION_REQUESTED
```

Used in action conditionals (show REJECT only when not already rejected), flag-driven workqueues, and escalation gating.

## Combinators

```typescript
and(condA, condB, condC)   // all must pass
or(condA, condB)           // any must pass
not(condA)                 // invert
never()                    // always false — use to fully hide a field from review
now()                      // current datetime — use as DATE field defaultValue
```

`never()` is the canonical way to hide a field on review pages while keeping it in the input form:
```typescript
{ type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }
```

## Validators

A validator is `{ message, validator }` where `validator` is a JSONSchema. Two builder paths:

### Path A — compose with `field()` (preferred for form fields)

```typescript
import { and, field } from '@opencrvs/toolkit/events'

export const invalidNameValidator = (fieldName: string) => ({
  message: {
    defaultMessage:
      "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')",
    description: 'This is the error message for invalid name',
    id: 'error.invalidName'
  },
  validator: and(
    field(fieldName).get('firstname').isValidEnglishName(),
    field(fieldName).get('middlename').isValidEnglishName(),
    field(fieldName).get('surname').isValidEnglishName()
  )
})
```

### Path B — raw JSONSchema with `defineFormConditional` (for regex, length, custom rules)

```typescript
import { defineFormConditional } from '@opencrvs/toolkit/conditionals'

export const nationalIdValidator = (fieldId: string) => ({
  message: {
    defaultMessage: 'The national ID can only be numeric and must be 10 digits long',
    description: 'This is the error message for an invalid national ID',
    id: 'error.invalidNationalId'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[0-9]{10}$',
        description: 'Must be numeric and 10 digits long.'
      }
    }
  })
})
```

`defineFormConditional(schema)` wraps `schema` inside `{ type: 'object', properties: { $form: schema }, required: ['$form'] }` automatically — you write the inner schema, it scopes it to `$form`. See [packages/commons/src/conditionals/conditionals.ts](../../../opencrvs-core/packages/commons/src/conditionals/conditionals.ts) for the wrapping logic.

Both validators are then used in a field's `validation: [...]`:
```typescript
validation: [invalidNameValidator('mother.name'), nationalIdValidator('mother.nid')]
```

### `defineConditional` vs `defineFormConditional`

- `defineFormConditional(schema)` — auto-scopes to `$form`. Use for form-data validators.
- `defineConditional(schema)` — you write the full schema including `properties.$form` / `$event` / `$user` / `$status` / `$flags`. Use for advanced cases that span scopes.

Both deduplicate the schema via SHA1 hash, so identical schemas are collapsed to one `$id`. Do not put a `$id` of your own in nested schemas — it gets stripped.

## Deduplication conditionals

Inside [src/events/birth/dedupConfig.ts](../../src/events/birth/dedupConfig.ts) (and `death/dedupConfig.ts`) you import `field`, `and`, `or`, `not` from **`@opencrvs/toolkit/events/deduplication`**, NOT from `events`. The dedup `field()` exposes a different set of methods:

```typescript
import { field, and, or, not } from '@opencrvs/toolkit/events/deduplication'

field('child.name').fuzzyMatches()                          // ES fuzzy similarity
field('child.name').strictMatches()                         // exact string equal
field('child.dob').dateRangeMatches({ days: 5 })            // within N days
field('child.dob').dateRangeMatches({ days: 270 })          // within 9 months
field('mother.idType').strictMatches({ value: 'NONE' })     // explicit value match
field('mother.dob').dateRangeMatches({
  days: 365,
  matchAgainst: 'mother.age'                                // compare against another field
})
```

Combine into a top-level `or(and(...), and(...), ...)`. Each `and` represents one rule that, if all its conditions match, marks a potential duplicate. See [src/events/birth/dedupConfig.ts](../../src/events/birth/dedupConfig.ts).

## Action conditionals

Two arrays in an action config:

```typescript
flags: [
  {
    id: 'approval-required-for-late-registration',
    operation: 'add',
    conditional: not(field('child.dob').isAfter().days(365).inPast())
  }
],
conditionals: [
  {
    type: ConditionalType.SHOW,
    conditional: flag('approval-required-for-late-registration')
  }
]
```

`flags[].conditional` decides whether to add/remove the flag when the action runs. `conditionals[]` decides whether the action button is visible/enabled. Reference: [opencrvs-core/ACTIONS.md](../../../opencrvs-core/ACTIONS.md).

## Certificate conditionals

In [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts), certificate templates can be gated with a `SHOW` conditional that decides whether the user can select that template:

```typescript
conditionals: [
  {
    type: 'SHOW',
    conditional: event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1)
  }
]
```

Note the type is the literal string `'SHOW'` here (not `ConditionalType.SHOW`), because the certificate schema is hand-rolled.

## Common patterns

```typescript
// "Details unavailable" pattern — hide section when checkbox is on
const requireDetails = not(field('mother.detailsUnavailable').isEqualTo(true))

// Role-based field
const registrarOnly = user.hasRole('REGISTRAR')

// Compound: visible only when details are provided AND user is registrar
{ type: ConditionalType.SHOW, conditional: and(requireDetails, registrarOnly) }

// Hide from review only
{ type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }

// Show field only during a specific action (e.g. on the correction form)
{ type: ConditionalType.SHOW, conditional: event.hasAction(ActionType.REQUEST_CORRECTION) }

// Late registration flag
not(field('child.dob').isAfter().days(365).inPast())  // dob is more than 365 days ago

// "Approved by registrar already" — don't show REJECT
not(flag(InherentFlags.REJECTED))
```

## Anti-patterns to flag

1. `field('x').isNotEqualTo(y)` — does not exist. Use `not(field('x').isEqualTo(y))`.
2. Mixing the dedup `field()` with the form `field()` in the same file. They are different functions.
3. Putting `user.hasRole(...)` inside `field()` validation. `validator` is `$form`-scoped — role checks won't evaluate.
4. Forgetting that `SHOW` is enforced server-side. A field hidden by `SHOW` cannot be submitted; the backend returns HTTP 409.
5. Hardcoding role string ids in many files. Centralise in [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts).
6. Using `DISPLAY_ON_REVIEW` on non-declaration forms (action/correction/print). It is only valid on declaration form fields.
7. Adding `$id` inside a nested schema passed to `defineConditional`. It gets stripped; trying to reference it later fails.

## Procedure for a new conditional or validator

1. Decide the scope: `$form`, `$event`, `$user`, or `$flags`/`$status`. Pick the matching builder.
2. Pick the import subpath using the table above (or [`shared/toolkit-subpaths.md`](shared/toolkit-subpaths.md)). Reuse an existing import where possible — don't add a second import of `not`/`never` from a different subpath.
3. Use the fluent builder before reaching for raw JSONSchema. Drop to `defineFormConditional` only for regex/length/structural rules the fluent API doesn't cover.
4. For role checks, look at [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts) first — if your role combo already exists, reuse it.
5. For validators that produce user-facing errors, add a translation row to [src/translations/client.csv](../../src/translations/client.csv) for the `message.id`.
6. Test the result by exercising the conditional path. If the backend returns HTTP 409 on action submit, the issue is almost always a `SHOW`/`ENABLE` conditional you forgot was server-enforced.
