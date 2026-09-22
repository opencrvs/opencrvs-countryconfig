# `@opencrvs/toolkit` subpaths

The toolkit is published as `@opencrvs/toolkit@2.0.0-rc.d65ff1b` (pinned in [package.json](../../../package.json), NOT linked from a workspace). Its exports are split across subpaths — pick the right one when importing.

| Subpath | What it exports | Where it's used |
|---|---|---|
| `@opencrvs/toolkit/events` | `defineConfig`, `defineDeclarationForm`, `defineFormPage`, `defineActionForm`, `defineWorkqueues`, `field`, `event`, `user`, `status`, `flag`, `and`, `or`, `not`, `never`, `now`, `ConditionalType`, `ActionType`, `FieldType`, `PageTypes`, `AddressType`, `TranslationConfig`, `InherentFlags`, `EventStatus`, `aggregateActionDeclarations`, `deepMerge`, `workqueueDefaultColumns` | All form/page/event definitions, workqueue config, action handlers |
| `@opencrvs/toolkit/conditionals` | `defineConditional`, `defineFormConditional`, `not`, `never`, `or`, address validators | Standalone validator definitions (regex/length/format), role-conditional composites that don't need `field()` |
| `@opencrvs/toolkit/events/deduplication` | `field`, `and`, `or`, `not` — **dedup variants** with `fuzzyMatches`, `strictMatches`, `dateRangeMatches` | ONLY inside `dedupConfig.ts` files — do NOT mix with the form `field()` |
| `@opencrvs/toolkit/scopes` | `defineScopes`, `EncodedScope` | Role scope definitions in [src/data-seeding/roles/roles.ts](../../../src/data-seeding/roles/roles.ts) |
| `@opencrvs/toolkit/notification` | `TriggerEvent`, `TriggerPayload` (Zod schemas) | User-notification routes — `makeNotificationHandler<TriggerEvent>(event)` |
| `@opencrvs/toolkit/application-config` | `defineApplicationConfig`, `defineClientConfig`, `defineLoginConfig` | The three config files in `src/api/application/`, `src/client-config*.ts`, `src/login-config*.ts` |
| `@opencrvs/toolkit/api` | `createClient` (tRPC client for core's events service) | REGISTER handler (`onRegisterHandler`), analytics import pipeline |
| `@opencrvs/toolkit/lib` | Misc shared helpers | As needed |

## Picking the right subpath for the DSL builders

`field`, `event`, `user`, `status`, `flag` and combinators (`and`, `or`, `not`, `never`, `now`) all live in `@opencrvs/toolkit/events`. The same combinators (`not`, `never`, `or`) are ALSO re-exported from `@opencrvs/toolkit/conditionals` — both resolve to the same implementation.

Convention seen in this repo:
- Import combinators from `@opencrvs/toolkit/events` when you're already importing `field`/`event`/`user` from it.
- Import from `@opencrvs/toolkit/conditionals` when you only need combinators + `defineFormConditional`/`defineConditional` (e.g. a pure validator file).

Examples to copy:
- Form page mixing both: [src/events/birth/forms/pages/mother.ts](../../../src/events/birth/forms/pages/mother.ts)
- Pure validator file: [src/events/birth/validators.ts](../../../src/events/birth/validators.ts)
- Role conditionals (no `field()`): [src/events/utils/role-conditionals.ts](../../../src/events/utils/role-conditionals.ts)
- Dedup file (different `field()`): [src/events/birth/dedupConfig.ts](../../../src/events/birth/dedupConfig.ts)

## Gotchas

- **`@opencrvs/toolkit/events/deduplication` `field()` is a DIFFERENT function** from the one in `@opencrvs/toolkit/events`. Different methods (`fuzzyMatches`/`strictMatches`/`dateRangeMatches` vs `isEqualTo`/`isTruthy`/…). Never use them in the same file.
- **The toolkit is npm-pinned, not workspace-linked** — local changes to core's commons package will NOT appear in country-config until a new toolkit release is published. To test cross-repo changes, `yarn link` the toolkit from `opencrvs-core/packages/toolkit`.
- **No `field('x').isNotEqualTo(...)`** — that method does not exist. Use `not(field('x').isEqualTo(...))`.
