---
name: conditionals-and-validators
description: "Use when adding or modifying OpenCRVS event/form conditionals or validators — anything calling field(), event(), user(), status(), flag(), and/or/not/never, defineFormConditional, defineConditional, ConditionalType.SHOW/ENABLE/DISPLAY_ON_REVIEW, or building dedupConfig, advancedSearch, role-conditionals, action conditionals, or validation rules in src/events/. Covers which @opencrvs/toolkit subpath to import from, all builders and combinators, the isNotEqualTo gotcha, JSONSchema-based custom validators, and form-vs-action-vs-deduplication contexts."
---

# Conditionals & Validators DSL

**Critical rules** (apply reflexively):
- `field(...).isNotEqualTo(...)` does NOT exist. Use `not(field(...).isEqualTo(...))`. This is the #1 cause of "my conditional silently evaluates to false".
- `ConditionalType.SHOW` and `ConditionalType.ENABLE` are **server-enforced**. HTTP 409 from an action submit almost always means a SHOW/ENABLE conditional was violated.
- The dedup `field()` is a **different function** from the form `field()`. Import dedup operators from `@opencrvs/toolkit/events/deduplication` ONLY inside `dedupConfig.ts`. Don't mix.
- Pick the right scope for the context: `field` = `$form`, `event` = `$event`, `user` = `$user`, `status`/`flag` = `$status`/`$flags`. Mixing scopes silently produces always-false.
- Validators are `$form`-scoped — putting `user.hasRole(...)` inside `validation: [...]` will not evaluate.
- Certificate `conditionals` use the literal string `'SHOW'`, NOT `ConditionalType.SHOW` (hand-rolled schema).

**Procedure**: read the relevant context files for your task:
- [.github/context/conditionals-and-validators.md](../../context/conditionals-and-validators.md) — full DSL: builders, combinators, validators, dedup, certificate/action conditionals, anti-patterns
- [.github/context/shared/toolkit-subpaths.md](../../context/shared/toolkit-subpaths.md) — which `@opencrvs/toolkit/*` subpath exports what
- [.github/context/shared/event-enum-and-types.md](../../context/shared/event-enum-and-types.md) — `ActionType`, `EventStatus`, `InherentFlags`, `ConditionalType` constants
- [.github/context/shared/role-conditionals.md](../../context/shared/role-conditionals.md) — existing composites in `src/events/utils/role-conditionals.ts` to reuse
