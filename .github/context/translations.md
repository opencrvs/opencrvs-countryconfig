# Translations

OpenCRVS country-config stores all translations as **CSV** (not JSON). The files are served by core's content endpoint as react-intl–compatible message bundles. Each row is one translation key in every supported language.

**Related context**: [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) is the canonical id-naming reference.

## Files

| File | Used by | Served at | Common consumers |
|---|---|---|---|
| [src/translations/client.csv](../../src/translations/client.csv) | Registration web app (`@opencrvs/client`) | `GET /content/client` | All form labels, field labels, validation errors, button text, dashboard titles, certificate labels, role labels |
| [src/translations/login.csv](../../src/translations/login.csv) | Login app (`@opencrvs/login`) | `GET /content/login` | Login screen text, 2FA, password recovery |
| [src/translations/notification.csv](../../src/translations/notification.csv) | Country-config's SMS/email sender | Loaded by [src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts) via `getLanguages('notification')` | SMS bodies, email subject lines, account-lifecycle messages |

The HTTP path comes from [src/api/content/handler.ts](../../src/api/content/handler.ts) — `request.params.application` is `client`, `login`, or `notification`.

## Column structure

The actual columns in this repo:

```
id,description,en,fr
```

- `id` — the message id used in code (e.g. `event.birth.label`, `error.invalidName`)
- `description` — context for translators (NOT shown to users)
- `en` — English text (always required)
- `fr` — French text

**The languages enabled here are `['en', 'fr']`** (see [src/client-config.ts](../../src/client-config.ts) `LANGUAGES`). Every row must have a value in every language column — `sort-translations.ts` checks that all rows have the same column count and throws if not.

To add a new language: add a new column (e.g. `es`) to all three CSVs and update `LANGUAGES` in both [src/client-config.ts](../../src/client-config.ts) and [src/login-config.ts](../../src/login-config.ts). Every existing row must get a value in the new column.

## Variable interpolation

- **Client/login** (`client.csv`, `login.csv`) use **react-intl ICU syntax**: `{name}`, `{count, plural, one {# child} other {# children}}`, `{value, select, MALE {Male} FEMALE {Female} other {Other}}`.
- **Notifications** (`notification.csv`) use **Handlebars syntax**: `{{trackingId}}`, `{{name}}`, `{{crvsOffice}}`. Templates are compiled by [src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts) and [src/api/notification/email-service.ts](../../src/api/notification/email-service.ts) using `handlebars`.

Do not mix the two — react-intl will ignore `{{...}}` and Handlebars will ignore `{...}`.

## ID naming conventions

Used consistently across the codebase. When you invent a new id, follow the matching pattern. Full table: [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md). Quick summary:

| Surface | Pattern | Example |
|---|---|---|
| Event top-level | `event.{eventId}.label` / `event.{eventId}.title` / `event.{eventId}.fallbackTitle` | `event.birth.label` |
| Event flag | `event.{eventId}.flag.{flag-id}` | `event.birth.flag.validated` |
| Form field label | `event.{eventId}.action.declare.form.section.{page}.field.{fieldName}.label` | `event.birth.action.declare.form.section.child.field.name.label` |
| Form section title | `event.{eventId}.action.declare.form.section.{page}.title` | |
| Summary field | `event.{eventId}.summary.{section}.{field}.{label\|empty}` | `event.birth.summary.child.dob.empty` |
| Validation error | `error.{errorName}` | `error.invalidName`, `error.invalidNationalId` |
| User role | `userRole.{camelCaseRoleId}` | `userRole.registrarGeneral`, `userRole.islandClerk` |
| Select option | `form.field.label.{contextValue}` | `form.field.label.statusActive` |
| Certificate label | `certificates.{event}.certificate[.copy]` | `certificates.birth.certificate`, `certificates.birth.certificate.copy` |
| Workqueue | `workqueues.{slug}.{title\|emptyMessage}` | `workqueues.assignedToYou.title` |
| Advanced search | `advancedSearch.form.{section}` / `birth.search.criteria.label.prefix.{role}` | |
| Dashboard | `dashboard.{name}Title` | `dashboard.registrationsTitle` |

When a label is referenced as a `MessageDescriptor` in code:
```typescript
label: {
  defaultMessage: 'Some text',
  description: 'Context for translators',
  id: 'event.birth.action.declare.form.section.child.field.dob.label'
}
```
the **`defaultMessage` is the fallback only**; the `id` must match a row in `client.csv` or the client falls back to `defaultMessage` (silently — easy to miss until QA in another language).

## Sorting & validation

```bash
yarn sort-translations src/translations/client.csv
yarn sort-translations src/translations/login.csv
yarn sort-translations src/translations/notification.csv
```

Sorts rows alphabetically by `id` and validates uniform column count. Implementation: [src/sort-translations.ts](../../src/sort-translations.ts).

Run after every batch of additions to keep diffs reviewable and prevent merge conflicts. The CSVs are sorted in the repo — out-of-order rows are a sign of a hand-edit that needs `yarn sort-translations`.

## Adding a new translation row

1. Choose an `id` matching the convention above. Look for an existing similar key — reuse if it covers the same concept.
2. Append a row to the appropriate CSV with values for **every** language column.
3. Run `yarn sort-translations <path>` to reorder.
4. If the row is referenced in code, ensure the `id` literal in code matches the CSV id exactly. There is no compile-time check.
5. For form fields, also confirm there is no duplicate row with the same `id` — sort + diff to spot duplicates.

## Repeated-section pattern

For repeated indexed fields (children 1–15, name changes 1–N), each instance gets its own row. Example pattern: `event.death.action.declare.form.section.livingChildren.field.child1.name.label`, `...child2...`, etc. The labels themselves can be identical text — only the id differs.

## Anti-patterns

- **Hand-editing CSVs without running `yarn sort-translations`** — produces noisy diffs and merge conflicts.
- **Different column counts across files / rows** — `sort-translations` will throw. Either add the missing language column to all rows or remove the extra one.
- **Embedding HTML in `client.csv`** — react-intl escapes by default. Use `<FormattedMessage>` rich-text args (`<b>`, `<i>`) only if the call site uses `<FormattedMessage>` with formatters.
- **Using `{{var}}` in `client.csv`** — react-intl uses `{var}`. Handlebars syntax is only for `notification.csv`.
- **Reusing `id` across CSVs for different text** — keep ids unique even across files; reuse only when the intent is identical.
- **Missing `fr` value** — produces silent fallback to `en` in production; not a build error.

## CSV writer/reader helpers

If you need to programmatically edit CSVs, use the existing helpers from [src/utils/index.ts](../../src/utils/index.ts):

```typescript
import { readCSVToJSON, writeJSONToCSV } from '@countryconfig/utils'

const rows = await readCSVToJSON<Array<{ id: string; description: string; en: string; fr: string }>>(path)
// ... edit rows ...
await writeJSONToCSV(path, rows)
```

These wrap `csv2json` (read) and `csv-stringify/sync` (write) consistently with the sort tool.
