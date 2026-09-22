# Workqueues & Action Lifecycle

Country-config owns three pieces of the action lifecycle:

1. **Workqueues** — the per-role inboxes shown in the client UI. Country-config defines slugs, queries, columns, icons, action types.
2. **Action confirmations** — HTTP callbacks core fires for every state-changing action. Country-config decides what to do with them (notify, generate registration numbers, run external integrations).
3. **CUSTOM actions** — non-core action types defined entirely in country-config via `ActionType.CUSTOM` in event configs.

**Related context**:
- [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md) — `ActionType`, `EventStatus`, `InherentFlags`, lifecycle
- [`shared/scopes-dsl.md`](shared/scopes-dsl.md) — workqueue id is granted via role scopes
- [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) — `workqueues.{slug}.title|emptyMessage`
- [`conditionals-and-validators.md`](conditionals-and-validators.md) — the `event()` API used for column values

Background reading: [opencrvs-core/ACTIONS.md](../../../opencrvs-core/ACTIONS.md) lists the full set of core actions, statuses, and the rules around action configurations.

## Workqueues

### File

[src/api/workqueue/workqueueConfig.ts](../../src/api/workqueue/workqueueConfig.ts) — single export `Workqueues = defineWorkqueues([...])`. Served at `GET /config/workqueues` by [src/api/workqueue/handler.ts](../../src/api/workqueue/handler.ts).

### Workqueue shape

```typescript
{
  slug: 'pending-validation',                // unique id referenced by role scopes
  icon: 'Stamp',                             // phosphor-react icon name
  name: {
    id: 'workqueues.pendingValidation.title',
    defaultMessage: 'Pending validation',
    description: 'Title of pending validation workqueue'
  },
  query: { /* see below */ },
  action: { type: ActionType.READ },         // action taken on click (READ = open record)
  emptyMessage: { /* optional MessageDescriptor shown when 0 results */ },
  columns: [ /* optional — uses workqueueDefaultColumns if omitted */ ]
}
```

The `name.id` and `emptyMessage.id` must have rows in [src/translations/client.csv](../../src/translations/client.csv).

### Query DSL

Composable predicates that hit Elasticsearch via core's `@opencrvs/events`. The most common pieces:

```typescript
// Status
status: { type: 'exact', term: EventStatus.enum.DECLARED }

// Assignment
assignedTo: { type: 'exact', term: user('id') }

// Time
updatedAt: { type: 'timePeriod', term: 'last7Days' }
updatedBy: { type: 'exact', term: user('id') }

// Geographic
createdAtLocation:   { type: 'within', location: user('primaryOfficeId') }
['legalStatuses.DECLARED.createdAtLocation']:  { type: 'within', location: user('primaryOfficeId') }
['legalStatuses.REGISTERED.createdAtLocation']: { type: 'within', location: user('primaryOfficeId') }
updatedAtLocation:   { type: 'within', location: user('primaryOfficeId') }

// Flags
flags: {
  anyOf: [InherentFlags.INCOMPLETE],
  noneOf: [InherentFlags.REJECTED, 'validated', 'approval-required-for-late-registration', InherentFlags.POTENTIAL_DUPLICATE]
}
```

There are reusable composites at the top of [src/api/workqueue/workqueueConfig.ts](../../src/api/workqueue/workqueueConfig.ts):
```typescript
const createdInMyAdminArea    = { createdAtLocation: { type: 'within', location: user('primaryOfficeId') } } as const
const declaredInMyAdminArea   = { ['legalStatuses.DECLARED.createdAtLocation']: { type: 'within', location: user('primaryOfficeId') } } as const
const registeredInMyAdminArea = { ['legalStatuses.REGISTERED.createdAtLocation']: { type: 'within', location: user('primaryOfficeId') } } as const
```

Reuse these — don't inline. The `as const` is required so spread doesn't widen literal types.

### Columns

Optional `columns: [...]` array. Each column:
```typescript
{
  label: { id: 'workqueues.dateOfEvent', defaultMessage: 'Date of Event', description: '...' },
  value: event.field('dateOfEvent')   // or event('updatedAt'), etc.
}
```

Use `event.field('dateOfEvent')`, `event('updatedAt')`, `event('trackingId')`, etc. — see [`conditionals-and-validators.md`](conditionals-and-validators.md) for the `event()` API.

If `columns` is omitted, core uses `workqueueDefaultColumns` from `@opencrvs/toolkit/events`.

### Adding a new workqueue

1. Decide the slug — kebab-case, descriptive (`pending-validation`, `correction-requested`).
2. Compose the query using existing geographic composites + status/flag filters.
3. Pick a phosphor icon name (`Stamp`, `Timer`, `FileDotted`, `PushPin`, etc. — see imports in the file).
4. Add `name`, `emptyMessage` translation rows to [src/translations/client.csv](../../src/translations/client.csv) using `workqueues.{slug}.title` / `.emptyMessage`.
5. Grant the slug to relevant roles in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts) via `{ type: 'workqueue', options: { ids: ['<slug>', ...] } }`. **Roles that aren't granted a slug cannot see that workqueue, even if their query matches records.** See [`shared/scopes-dsl.md`](shared/scopes-dsl.md).
6. Restart core's events service so the new config is picked up (in-memory cache).

## Action confirmations

### Catch-all handler

[src/api/events/handler.ts](../../src/api/events/handler.ts) `onAnyActionHandler` is registered at `POST /trigger/events/{event}/actions/{action}` as a catch-all. It:

1. Receives the full `EventDocument` as the payload.
2. Pulls the JWT from `request.auth.artifacts.token`.
3. Fires `sendInformantNotification({ event, token })` (see [`notifications.md`](notifications.md)).
4. Returns HTTP 200.

This handler is the default for any action type that doesn't have a more specific route. Override only when you need action-specific behaviour (the REGISTER hook is the canonical example).

### Custom action handler

`POST /trigger/events/{event}/actions/CUSTOM` is wired to `onCustomActionHandler` ([src/api/events/handler.ts](../../src/api/events/handler.ts)). The default implementation is a no-op (HTTP 200). Custom actions don't change event status; use them for side effects (escalation, integration, custom validation).

### Specific action overrides

Currently overridden: `REGISTER` → [src/api/registration/index.ts](../../src/api/registration/index.ts) `onRegisterHandler`. To override another action, register a more-specific route in [src/index.ts](../../src/index.ts) before the catch-all.

## REGISTER hook

[src/api/registration/index.ts](../../src/api/registration/index.ts) `onRegisterHandler` is the most documented integration surface in this repo. It supports three response patterns:

### HTTP 200 — immediate acceptance

```typescript
const registrationNumber = generateRegistrationNumber()
await sendInformantNotification({ event, token, registrationNumber })
return h.response({ registrationNumber }).code(200)
```

**For REGISTER, the 200 response body MUST include a `registrationNumber`.** Without it core rejects the action.

### HTTP 400 — immediate rejection

```typescript
return h.response({ reason: 'Rejection reason here' }).code(400)
```

Marks the action as rejected. The user sees an error in the client.

### HTTP 202 — deferred / async

```typescript
setTimeout(() => acceptRequestedRegistration(token, eventId, actionId, action), 10000)
return h.response().code(202)
```

Puts the action in `Requested` state. The integration code must later call:
- `client.event.actions.register.accept.mutate({ ...action, transactionId: uuidv4(), eventId, actionId, registrationNumber })` to accept, OR
- `client.event.actions.register.reject.mutate(...)` to reject.

Use this for external workflow integrations where the decision takes time (court approval, manual review). You must persist `token`, `eventId`, `actionId`, and `action` payload between request and callback.

Client setup:
```typescript
import { createClient } from '@opencrvs/toolkit/api'
const url = new URL('events', GATEWAY_URL).toString()
const client = createClient(url, `Bearer ${token}`)
```

### Registration number generation

[src/api/registration/registrationNumber.ts](../../src/api/registration/registrationNumber.ts) is intentionally tiny — current impl is a 12-char `nanoid` from `0-9A-Z`:

```typescript
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)
export function generateRegistrationNumber(): string { return nanoid() }
```

This is the canonical place to enforce a country-specific format (e.g. `YYYY-NNNNNN`, regional prefix, checksum). Keep it pure and deterministic enough to be unit-testable. Return type **must** be `string`.

## CUSTOM actions

Defined in event configs ([src/events/birth/index.ts](../../src/events/birth/index.ts), [src/events/death/index.ts](../../src/events/death/index.ts)) using `ActionType.CUSTOM`. They are quick actions executed via a dialog on the event overview page. Distinguish themselves by a `customActionType` string scoped per event.

The handler is `onCustomActionHandler` — by default a no-op. If a CUSTOM action needs side effects:
1. Either branch inside `onCustomActionHandler` on `event.actions[...].customActionType`,
2. Or register a more-specific route (e.g. `POST /trigger/events/birth/actions/CUSTOM` with payload inspection).

Permissions for CUSTOM actions are granted in roles via:
```typescript
{ type: 'record.custom-action', options: {
    event: ['birth'],
    customActionTypes: ['VALIDATE_DECLARATION', 'ESCALATE'],
    placeOfEvent: 'administrativeArea'
  }
}
```
See [`shared/scopes-dsl.md`](shared/scopes-dsl.md).

## Linking to core actions

The action types fired by core are enumerated in [opencrvs-core/ACTIONS.md](../../../opencrvs-core/ACTIONS.md) and summarised in [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md):

`CREATE`, `READ`, `ASSIGN`/`UNASSIGN`, `DELETE`, `NOTIFY`, `DECLARE`*, `VALIDATE`*, `REGISTER`*, `REJECT`*, `ARCHIVE`, `PRINT_CERTIFICATE`*, `REQUEST_CORRECTION`*, `APPROVE_CORRECTION`, `REJECT_CORRECTION`, `DUPLICATE_DETECTED`, `MARK_AS_DUPLICATE`, `MARK_AS_NOT_DUPLICATE`.

`*` = configurable. Only **core actions can change status**; CUSTOM actions cannot. Status transitions: `CREATED → NOTIFIED → DECLARED → REGISTERED → ARCHIVED`.

When debugging "why didn't core fire my handler?": check that the action is enabled in the event config (`actions: [...]`) and that the user's role has the matching `record.<action>` scope.

## Anti-patterns

- **Returning HTTP 200 for REGISTER without `{ registrationNumber }`** in the body — action stays in Requested state forever from core's perspective.
- **Calling `sendInformantNotification` for REGISTER twice** — both `onRegisterHandler` and `onAnyActionHandler` send notifications. The more-specific route wins; `onAnyActionHandler` only runs for non-overridden action types.
- **Side effects in `onCustomActionHandler` default** — keep the default a no-op. Branch explicitly on `customActionType` if you need behaviour.
- **Inlining workqueue location scoping** — reuse the `createdInMyAdminArea` / `declaredInMyAdminArea` / `registeredInMyAdminArea` composites at the top of the workqueue config.
- **Adding a workqueue without granting it to any role** — invisible to users.
- **Granting a role a workqueue id that doesn't exist** — UI silently drops it.
- **Restart-less changes** — the events service caches event/workqueue configs in-memory at boot. Always restart events after structural changes.
- **Using `customAlphabet` with non-cryptographic alphabets when uniqueness matters** — 12-char from 36-symbol alphabet gives ~10^18 combinations; expand the length if your country's volume warrants.
- **Returning HTTP 5xx from confirmation handlers** — core won't retry; the action gets stuck. Always return 400 with a reason for genuine rejections.
