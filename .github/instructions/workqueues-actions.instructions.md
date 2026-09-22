---
applyTo: "src/api/workqueue/**,src/api/events/**,src/api/registration/**"
description: "Use when adding or modifying OpenCRVS workqueues, action confirmation handlers, custom actions, or registration-number generation. Covers the defineWorkqueues DSL with query/action/columns, the catch-all /trigger/events/{event}/actions/{action} handler, the REGISTER hook with its three response modes (200/202/400), the CUSTOM action handler, and the link to core's action lifecycle."
---

# Workqueues & Action Lifecycle

**Critical rules** (apply reflexively):
- A workqueue is invisible until at least one role grants it via `{ type: 'workqueue', options: { ids: ['<slug>'] } }` in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts).
- REGISTER hook responses: HTTP 200 MUST include `{ registrationNumber }`; HTTP 400 must include `{ reason }`; HTTP 202 puts action in `Requested` and you MUST later call `client.event.actions.register.accept.mutate(...)` or `.reject.mutate(...)`.
- Reuse `createdInMyAdminArea` / `declaredInMyAdminArea` / `registeredInMyAdminArea` composites in [src/api/workqueue/workqueueConfig.ts](../../src/api/workqueue/workqueueConfig.ts) — don't inline location filters. The `as const` on each composite is required.
- Return 200/4xx from action handlers only; core does not retry 5xx and actions get stuck.
- Restart core's events service after structural workqueue/event changes (in-memory cache).

**For full details, read these context files**:
- [.github/context/workqueues-actions.md](../context/workqueues-actions.md) — `defineWorkqueues` DSL, REGISTER hook three modes, CUSTOM actions, full query reference
- [.github/context/shared/scopes-dsl.md](../context/shared/scopes-dsl.md) — `workqueue.options.ids` and `record.custom-action` grants
- [.github/context/shared/event-enum-and-types.md](../context/shared/event-enum-and-types.md) — `ActionType`, `EventStatus`, `InherentFlags`, lifecycle diagram
