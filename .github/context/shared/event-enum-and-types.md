# Event, ActionType, EventStatus, InherentFlags, ConditionalType

Core constants used across forms, conditionals, workqueues, certificates, notifications, and analytics. Source: `@opencrvs/toolkit/events`.

## `Event`

Defined in [src/events/utils/types.ts](../../../src/events/utils/types.ts):

```typescript
enum Event {
  Birth = 'birth',
  Death = 'death',
  Marriage = 'marriage',
  // plus any custom events e.g. TENNIS_CLUB_MEMBERSHIP
}
```

Used as the `id` field of `defineConfig({ id: Event.Birth, ... })`. Adding a new event requires (1) adding to this enum and (2) wiring the new event config into the `GET /config/events` route in [src/index.ts](../../../src/index.ts).

## `ActionType`

The full set of actions core fires. From `@opencrvs/toolkit/events`:

| Action | Status-changing? | Notes |
|---|---|---|
| `CREATE` | yes (→ CREATED) | Event is opened |
| `READ` | no | User opened the record |
| `ASSIGN` / `UNASSIGN` | no | Lock/unlock for editing |
| `DELETE` | yes | Tombstones the event |
| `NOTIFY` | yes (→ NOTIFIED) | Healthcare notifier submits partial info |
| `DECLARE` | yes (→ DECLARED) | Full declaration submitted |
| `VALIDATE` | no | Optional pre-register check |
| `REGISTER` | yes (→ REGISTERED) | Final registration — produces a registration number |
| `REJECT` | yes (status carries `rejected` flag) | Sent back to declarant |
| `ARCHIVE` | yes (→ ARCHIVED) | Closed without registration |
| `PRINT_CERTIFICATE` | no | Adds a print action to history |
| `REQUEST_CORRECTION` | no | Asks for post-registration edit |
| `APPROVE_CORRECTION` | no | Applies the requested edit |
| `REJECT_CORRECTION` | no | Declines the requested edit |
| `DUPLICATE_DETECTED` | no | System flag |
| `MARK_AS_DUPLICATE` / `MARK_AS_NOT_DUPLICATE` | no | Manual dedupe resolution |
| `CUSTOM` | no | Country-defined action type — must use `customActionType` to distinguish |

**Only the status-changing actions transition status.** CUSTOM actions cannot change status — they are side-effect-only.

Configurable actions (subject to `conditionals: [...]` in event config): `DECLARE`, `VALIDATE`, `REGISTER`, `REJECT`, `PRINT_CERTIFICATE`, `REQUEST_CORRECTION`.

## `EventStatus`

```typescript
EventStatus.enum.CREATED      // 'CREATED'
EventStatus.enum.NOTIFIED     // 'NOTIFIED'
EventStatus.enum.DECLARED     // 'DECLARED'
EventStatus.enum.REGISTERED   // 'REGISTERED'
EventStatus.enum.ARCHIVED     // 'ARCHIVED'
```

Lifecycle:

```
CREATED  →  [NOTIFIED]  →  DECLARED  →  REGISTERED  →  ARCHIVED
                                        │
                                        └── (REJECT loops back without changing status; sets 'rejected' flag)
```

`NOTIFIED` is an optional pre-state for healthcare notifier flows. Most events go `CREATED → DECLARED → REGISTERED`.

## `InherentFlags`

Built-in flags maintained automatically by core:

```typescript
InherentFlags.INCOMPLETE              // declaration is missing required fields
InherentFlags.REJECTED                // last REJECT action; cleared on next DECLARE
InherentFlags.POTENTIAL_DUPLICATE     // dedup matched another event
InherentFlags.CORRECTION_REQUESTED    // REQUEST_CORRECTION pending APPROVE/REJECT
```

Used in:
- Workqueue queries (`flags: { anyOf: [InherentFlags.INCOMPLETE], noneOf: [InherentFlags.REJECTED] }`)
- Action conditionals (`not(flag(InherentFlags.REJECTED))` — don't show REJECT again if already rejected)
- Custom flag composition

Country-config can add custom flags via the event's `flags: [{ id, operation, conditional }]` array (e.g. `'approval-required-for-late-registration'`).

## `ConditionalType`

```typescript
ConditionalType.SHOW                  // 'SHOW'
ConditionalType.ENABLE                // 'ENABLE'
ConditionalType.DISPLAY_ON_REVIEW     // 'DISPLAY_ON_REVIEW'
```

| Type | Allowed in | Behaviour |
|---|---|---|
| `SHOW` | fields, actions, certificates, custom-action dialogs | Component renders only if condition is true. **Backend enforces** — HTTP 409 on action submit if violated. |
| `ENABLE` | fields, actions | Component renders but only interactive if true. **Backend enforces** — HTTP 409 on submit if violated. |
| `DISPLAY_ON_REVIEW` | declaration form fields only | AND-ed with `SHOW` on the review/preview screen. Use `never()` to hide from review while keeping it on input. Omit to inherit `SHOW`. |

**Certificates use the literal string `'SHOW'` (not `ConditionalType.SHOW`)** because their config schema is hand-rolled — see [`../certificates.md`](../certificates.md).

## Cross-references

- The conditional DSL that consumes these: [`../conditionals-and-validators.md`](../conditionals-and-validators.md)
- Where event configs are defined: [`../events-forms.md`](../events-forms.md)
- How workqueues query on flags/status: [`../workqueues-actions.md`](../workqueues-actions.md)
- Core's authoritative action documentation: [opencrvs-core/ACTIONS.md](../../../../opencrvs-core/ACTIONS.md)
