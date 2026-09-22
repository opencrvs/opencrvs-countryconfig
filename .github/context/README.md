# `.github/context/` — Heavy reference, on-demand only

This folder is the **single source of truth** for OpenCRVS country-config rules, types, options, and procedures. Files here are NOT auto-loaded by VS Code. They are explicitly fetched by:

- Slim instructions in [.github/instructions/](../instructions/) when a developer needs depth on a topic that auto-loaded.
- The skill in [.github/skills/conditionals-and-validators/SKILL.md](../skills/conditionals-and-validators/SKILL.md) when a related task is detected.
- Agents in [.github/agents/](../agents/) as their first action when invoked.

If you are an agent: `read_file` the matching context files BEFORE you write code. If you are a human: open these directly when you need the full reference.

## Domain context files

One per domain. Bulk content lives here; the matching `.instructions.md` is a slim trigger that points back.

| Context file | Domain | Triggering instruction |
|---|---|---|
| [analytics.md](analytics.md) | Country-config-owned Postgres analytics, precalculations, reindex | [analytics.instructions.md](../instructions/analytics.instructions.md) |
| [app-client-login-config.md](app-client-login-config.md) | `defineApplicationConfig` / `defineClientConfig` / `defineLoginConfig` | [app-client-login-config.instructions.md](../instructions/app-client-login-config.instructions.md) |
| [certificates.md](certificates.md) | SVG templates, fees, fonts, Handlebars helpers | [certificates.instructions.md](../instructions/certificates.instructions.md) |
| [conditionals-and-validators.md](conditionals-and-validators.md) | `field/event/user/status/flag`, `and/or/not`, `defineFormConditional` | [conditionals-and-validators/SKILL.md](../skills/conditionals-and-validators/SKILL.md) |
| [data-seeding.md](data-seeding.md) | Humdata admin areas, offices, employees, roles & scopes | [data-seeding.instructions.md](../instructions/data-seeding.instructions.md) |
| [events-forms.md](events-forms.md) | `defineConfig`, `defineFormPage`, all FieldTypes, validators | [events-forms.instructions.md](../instructions/events-forms.instructions.md) |
| [infrastructure.md](infrastructure.md) | Docker Compose, Ansible, on-deploy hooks, monitoring, backups, cryptfs | [infrastructure.instructions.md](../instructions/infrastructure.instructions.md) |
| [notifications.md](notifications.md) | Informant + user notifications, email/SMS services, templates | [notifications.instructions.md](../instructions/notifications.instructions.md) |
| [translations.md](translations.md) | Three CSVs, 4 columns (`id,description,en,fr`), `yarn sort-translations` | [translations.instructions.md](../instructions/translations.instructions.md) |
| [workqueues-actions.md](workqueues-actions.md) | `defineWorkqueues`, action confirmation handlers, REGISTER hook | [workqueues-actions.instructions.md](../instructions/workqueues-actions.instructions.md) |

## Shared atomic context files

Cross-cutting facts referenced by multiple domains. Pull these when the topic spans more than one domain.

| File | What it covers |
|---|---|
| [shared/toolkit-subpaths.md](shared/toolkit-subpaths.md) | Which `@opencrvs/toolkit/*` subpath exports what (events, conditionals, events/deduplication, scopes, notification, application-config, api) |
| [shared/translation-id-conventions.md](shared/translation-id-conventions.md) | The full ID naming pattern table (`event.{e}.action.declare.form.section.{p}.field.{f}.label`, `error.{n}`, `userRole.{camelCase}`, etc.) |
| [shared/scopes-dsl.md](shared/scopes-dsl.md) | All `defineScopes` types + options (`accessLevel`, `placeOfEvent`, `registeredIn`, `declaredIn`, `declaredBy`, `templates`, `ids`, `event`, `customActionTypes`) |
| [shared/event-enum-and-types.md](shared/event-enum-and-types.md) | `Event` enum, `ActionType` full list, `EventStatus`, `InherentFlags`, `ConditionalType`, lifecycle diagram |
| [shared/role-conditionals.md](shared/role-conditionals.md) | Composites from [src/events/utils/role-conditionals.ts](../../src/events/utils/role-conditionals.ts) (`hasHealthNotifierRole`, `hasNonHealthNotifierRole`) + naming convention |

## Common reading lists for typical tasks

| Task | Read these |
|---|---|
| Add a field to an existing form page | `events-forms.md` + `translations.md` + `shared/translation-id-conventions.md` |
| Add a conditional or validator | `conditionals-and-validators.md` + `shared/toolkit-subpaths.md` + `shared/event-enum-and-types.md` |
| Scaffold a new event type end-to-end | `events-forms.md` + `conditionals-and-validators.md` + `translations.md` + `workqueues-actions.md` + `certificates.md` + `analytics.md` + `shared/event-enum-and-types.md` |
| Add or edit a CRVS office / admin area / user / role | `data-seeding.md` + `translations.md` + `shared/scopes-dsl.md` + `shared/translation-id-conventions.md` |
| Add a new certificate template | `certificates.md` + `conditionals-and-validators.md` + `translations.md` + `shared/translation-id-conventions.md` |
| Wire a new informant/user notification | `notifications.md` + `translations.md` + `shared/event-enum-and-types.md` |
| Add a precalculated analytics column | `analytics.md` + `shared/event-enum-and-types.md` |
| Add or change a workqueue | `workqueues-actions.md` + `data-seeding.md` (for role scopes) + `translations.md` + `shared/scopes-dsl.md` |
| Deploy / set up an environment / rotate secrets | `infrastructure.md` |
| Debug "HTTP 409", "conditional always false", "dedup not firing" | `conditionals-and-validators.md` + `shared/toolkit-subpaths.md` + `shared/role-conditionals.md` |

## Conventions

- Every context file uses workspace-relative markdown links so click-to-open works in the editor (`[file](../../src/...)`).
- "Anti-patterns" sections list common mistakes. Always scan these before writing code.
- Code examples are TypeScript with imports shown — copy-pasteable into the right file.
- Cross-references to other context files use plain markdown links, not VS Code customization syntax.
