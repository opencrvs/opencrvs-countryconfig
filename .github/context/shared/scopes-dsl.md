# `defineScopes` DSL

Role permissions in OpenCRVS are expressed via `defineScopes(...)` from `@opencrvs/toolkit/scopes`. Each role in [src/data-seeding/roles/roles.ts](../../../src/data-seeding/roles/roles.ts) holds an array of `EncodedScope` produced by this DSL.

```typescript
import { defineScopes, EncodedScope } from '@opencrvs/toolkit/scopes'

const registrationOfficerScopes = defineScopes([
  { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
  { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent'] } },
  { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
  { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
  { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
  { type: 'record.custom-action', options: {
      event: ['birth'],
      customActionTypes: ['VALIDATE_DECLARATION'],
      placeOfEvent: 'administrativeArea'
    }
  }
])
```

## Scope `type` values

### Organisation / profile / user
- `profile.electronic-signature` — user can attach an e-signature
- `organisation.read-locations` — list locations
- `user.read` — read other users
- `user.search` — search users
- `user.read-only-my-audit` — restrict audit log to self

### Workqueues / dashboards / performance
- `workqueue` with `options.ids: string[]` — slugs from [src/api/workqueue/workqueueConfig.ts](../../../src/api/workqueue/workqueueConfig.ts). **A role that's not granted a slug cannot see that workqueue, even if the query matches records.**
- `dashboard.view` with `options.ids: string[]` — dashboard ids from [src/client-config.ts](../../../src/client-config.ts) `DASHBOARDS`
- `performance.read`
- `performance.read-dashboards`

### Record actions
- `record.search`, `record.create`, `record.read`
- `record.declare`, `record.register`, `record.edit`, `record.reject`, `record.archive`, `record.correct`
- `record.print-certified-copies`
- `record.request-correction`, `record.review-duplicates`
- `record.notify` — for healthcare notifiers
- `record.unassign-others`
- `record.custom-action` with `options: { event: ['birth' | 'death' | 'marriage'], customActionTypes: string[] }`

## `options` — geographic and contextual scoping

Most data scopes accept an `options` object. Common keys:

| Option | Meaning |
|---|---|
| `accessLevel: 'administrativeArea'` | User only sees data within their own admin area |
| `placeOfEvent: 'administrativeArea'` | Records where the event happened in the user's admin area |
| `declaredIn: 'administrativeArea'` | Records declared at a location in the user's admin area |
| `registeredIn: 'administrativeArea'` | Records registered at a location in the user's admin area |
| `declaredBy: 'user'` | Records that the user themselves declared |
| `event: ['birth' \| 'death' \| 'marriage']` | Restrict scope to specific event types |
| `customActionTypes: string[]` | Restrict `record.custom-action` to named custom action types |
| `templates: string[]` | Restrict `record.print-certified-copies` to specific certificate template ids |
| `ids: string[]` | For `workqueue` and `dashboard.view` — which ones are visible |

**Omit `options` entirely** for nationwide / unscoped access. The convention in this repo: nationwide roles (based at `TUV-RGO`) get unscoped versions; island-level roles get `administrativeArea`-scoped versions.

## Geographic options compared

For a record viewer, three options describe "events I care about":

- `placeOfEvent` — where the event physically occurred (`child.birthLocation`, `deceased.deathLocation`)
- `declaredIn` — where the declaration was submitted (`legalStatuses.DECLARED.createdAtLocation`)
- `registeredIn` — where it was registered (`legalStatuses.REGISTERED.createdAtLocation`)

These are independent — a baby could be born in island A, declared at office B, registered at office C. Pick the right axis for the role's responsibility.

## Combining with workqueue queries

Scopes determine **what a role can do**; workqueue queries determine **what records appear in their inbox**. They must align:

- A role with `record.search` scoped to `placeOfEvent: 'administrativeArea'` will only see results in their area, even if a workqueue query returns more.
- A role with `workqueue` granting `'pending-validation'` slug must have the matching record scopes (`record.read`, `record.validate-declaration` etc.) to actually act on items in that workqueue.

See [`../workqueues-actions.md`](../workqueues-actions.md) for the workqueue query DSL.

## Adding a new role's scopes

1. Identify the role's geographic tier (nationwide vs admin-area scoped).
2. Start from an existing role with similar responsibilities and clone its `defineScopes([...])`.
3. Adjust workqueue ids, custom action types, and any `record.*` types it needs.
4. Add the `EncodedScope[]` export, then reference it in the role's `scopes` field.

## Anti-patterns

- **Granting nationwide scopes (no `accessLevel`) to island-level officers** — breaks the geographic isolation design.
- **Granting `workqueue.options.ids` that doesn't exist** in workqueueConfig — UI silently drops it.
- **Granting `dashboard.view` ids that aren't in `DASHBOARDS`** — same: silently dropped.
- **Inconsistent geographic option across scopes for the same role** — pick one axis (`accessLevel` OR `placeOfEvent` OR …) and stick to it for that role's data scopes.
- **Forgetting to restart core's events service** after role/scope changes — in-memory cache.
