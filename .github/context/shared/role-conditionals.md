# Role conditionals

Composable role-based predicates live in [src/events/utils/role-conditionals.ts](../../../src/events/utils/role-conditionals.ts). Reuse them from `@countryconfig/events/utils/role-conditionals` instead of inlining `user.hasRole(...)` checks across form pages.

## Existing composites

```typescript
import { or, and, user } from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

export const hasHealthNotifierRole = or(
  user.hasRole('HEALTH_NOTIFIER'),
  user.hasRole('ISLAND_CLINIC_NOTIFIER')
)

export const hasNonHealthNotifierRole = and(
  not(user.hasRole('HEALTH_NOTIFIER')),
  not(user.hasRole('ISLAND_CLINIC_NOTIFIER'))
)
```

These are used heavily in form page `conditionals` to gate fields and sections by who's filling the form.

## Role-id naming

Role ids are SCREAMING_SNAKE_CASE strings defined in [src/data-seeding/roles/roles.ts](../../../src/data-seeding/roles/roles.ts):

- `REGISTRAR_GENERAL`
- `NATIONAL_REGISTRAR`
- `REGISTRATION_OFFICER`
- `ISLAND_REGISTRAR`
- `ISLAND_CLERK`
- `HEALTH_NOTIFIER`
- `ISLAND_CLINIC_NOTIFIER`
- … (consult the file for the live list)

The id is what `user.hasRole(...)` takes — **always the string id, never an enum value**. The translation `id` for the role label uses camelCase (`userRole.registrationOfficer`) — see [`./translation-id-conventions.md`](./translation-id-conventions.md).

## Adding a new composite

1. Open [src/events/utils/role-conditionals.ts](../../../src/events/utils/role-conditionals.ts).
2. Add an `export const has<Concept>Role = ...` built from `or(user.hasRole('A'), user.hasRole('B'))` or `and(not(...), not(...))` for negation.
3. Import from `@countryconfig/events/utils/role-conditionals` in pages that need it.
4. Do NOT re-inline `user.hasRole('A')` patterns in page files when a matching composite already exists.

## Convention: when to make a composite

If two or more page files check the same role-set, factor it into a composite. One-off role checks can stay inline. The goal is consistency — when "non-health notifier" semantics change (add a third notifier role tomorrow), there's one place to update.

## Anti-patterns

- **Hardcoding role ids in multiple page files** — when the role taxonomy changes, you miss one.
- **Using enum values instead of string ids** in `user.hasRole(...)` — there is no role enum; the API takes strings.
- **Putting role checks inside `validation: [...]`** — validators are `$form`-scoped; role checks won't evaluate there. Use `conditionals: [{ type: ConditionalType.SHOW, conditional: roleCheck }]` to gate a field by role.
- **Mixing the `not` from `@opencrvs/toolkit/events` and `@opencrvs/toolkit/conditionals`** in the same file — both work, but pick one per file for consistency.

## Cross-references

- Full conditional DSL: [`../conditionals-and-validators.md`](../conditionals-and-validators.md)
- Where roles are defined: [`../data-seeding.md`](../data-seeding.md)
- Toolkit subpath details for `user` / `not` / `or`: [`./toolkit-subpaths.md`](./toolkit-subpaths.md)
