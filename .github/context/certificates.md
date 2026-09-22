# Certificates

OpenCRVS issues certificates from country-config-supplied **SVG templates**. The country-config defines: the template metadata (id, label, event, fees), the SVG source files, the fonts that the client-side PDF renderer can use, and Handlebars helpers compiled into a single JS bundle the client loads.

**Related context**:
- [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) for `certificates.{event}.certificate[.copy]` ids.
- [`conditionals-and-validators.md`](conditionals-and-validators.md) for the `event.hasAction(...).minCount(N)` builder used in template gating.

## Three HTTP endpoints

| Route | Handler | Purpose |
|---|---|---|
| `GET /certificates` | [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts) `certificateHandler` | Returns `ICertificateConfigData[]` — all template metadata |
| `GET /certificates/{id}` | same handler | Serves the SVG file from `src/api/certificates/source/{id}` |
| `GET /fonts/{filename}` | [src/api/fonts/handler.ts](../../src/api/fonts/handler.ts) | Serves a TTF font file |
| `GET /handlebars.js` | [src/certificate/handlebars/handler.ts](../../src/certificate/handlebars/handler.ts) | Returns custom Handlebars helpers as a JS bundle |

## `ICertificateConfigData` shape

Defined in [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts):

```typescript
interface ICertificateConfigData {
  id: string                          // unique slug, also the SVG filename without .svg
  event: Event                        // Event.Birth | Event.Death | Event.Marriage
  isV2Template?: boolean              // true = render via v2 pipeline (transition flag)
  label: {
    id: string                        // matches a translation row in client.csv
    defaultMessage: string
    description: string
  }
  isDefault: boolean                  // exactly one default per event type
  fee: {
    onTime: number                    // within the on-time grace period
    late: number                      // late but before "delayed"
    delayed: number                   // long-overdue (highest fee)
  }
  svgUrl: string                      // '/api/countryconfig/certificates/<id>.svg'
  fonts?: Record<string, FontFamilyTypes>
  conditionals?: { type: 'SHOW'; conditional: JSONSchema }[]
}
```

### `isV2Template` transition flag

A temporary marker for templates that should be rendered by the v2 pipeline. Both v1 and v2 templates may coexist for the same event id (e.g. two `birth-certificate` entries with different `isV2Template` values). Remove the flag once v1 is phased out — comment in source notes "After v1 is phased out, this field can be removed."

### Default templates

Exactly one entry per event should have `isDefault: true`. That's the template surfaced to the user when no explicit selection is made.

### Certified-copy / receipt patterns

Common companion templates seen in this repo:
- `<event>-certificate` (default, isDefault: true)
- `<event>-certificate-certified-copy` (gated by conditional: only available after the original was printed)
- `<event>-registration-receipt` (printed at registration time, before certificate issuance)

The certified-copy gate uses:
```typescript
conditionals: [{ type: 'SHOW', conditional: event.hasAction(ActionType.PRINT_CERTIFICATE).minCount(1) }]
```
Note: the type is the literal string `'SHOW'`, not `ConditionalType.SHOW` — the certificate config schema is hand-rolled. The `event.hasAction(...).minCount(N)` builder is from `@opencrvs/toolkit/events`. See [`conditionals-and-validators.md`](conditionals-and-validators.md) for details.

## Fees

Three tiers per template — all mandatory:
- `onTime` — within the on-time registration window (event-specific, defined by event config thresholds)
- `late` — past the on-time window but not yet "delayed"
- `delayed` — past the late window

Use `0` for free templates (e.g. on-time receipt). Currency comes from `applicationConfig.CURRENCY.isoCode` ([src/api/application/application-config.ts](../../src/api/application/application-config.ts)).

## SVGs

Files live in [src/api/certificates/source/](../../src/api/certificates/source/). The `id` field in the config must match the filename without `.svg`. Mime is served as `image/svg+xml` by Hapi's `h.file()`.

SVG templates contain `{{...}}` placeholders that the client interpolates against the event's declaration data + the compiled Handlebars helpers. Common variables: `{{registrationNumber}}`, `{{child.name.firstname}}`, `{{trackingId}}`, `{{registrationDate}}`, plus anything the Handlebars helpers expose.

### v2 template data lookups

v2 templates (`isV2Template: true`) use these expressions to read data — the legacy flat `{{registrationNumber}}`-style variables do NOT work in v2:

- **Declaration field**: `{{$lookup $declaration 'section.fieldId'}}` (e.g. `'mother.placeOfBirth'`)
- **NAME field full name**: `{{$lookup $declaration 'section.name.fullname'}}` — `.fullname` is a synthesized virtual property that joins the configured name subfields (firstname + surname). Don't `$join` them manually.
- **Event metadata**: `{{$lookup $metadata 'path'}}` — verified paths:
  | Path | Notes |
  |---|---|
  | `legalStatuses.REGISTERED.registrationNumber` | The official reg number |
  | `legalStatuses.REGISTERED.createdAtLocation.name` | Office of registration |
  | `legalStatuses.REGISTERED.createdBy.name` | Registrar full name |
  | `legalStatuses.REGISTERED.createdByRole` | Registrar role — **flat property**, returns SCREAMING_SNAKE_CASE (e.g. `REGISTRAR_GENERAL`). Format with a `$formatEnum` helper for display. NOT `createdBy.role` |
  | `createdAt` | Top-level event creation timestamp (NOT nested under `legalStatuses.REGISTERED.createdAt`) |
  | `assignedTo.name` | Currently assigned user |
  Note: `assignedTo.role` does NOT exist; only `assignedTo.name`.
- **Action-specific field**: `{{$lookup ($action "ACTION_NAME") "field"}}` — e.g. `($action "PRINT_CERTIFICATE") "createdAt"` for the certification date.
- **Conditional**: `{{#ifCond ($lookup $declaration 'x') '===' 'VALUE'}}...{{else}}...{{/ifCond}}` — operators include `===`, `!==`.

### Editing an SVG

1. Edit the file in place (it's text; any vector editor or plain text editor works).
2. Keep `{{...}}` placeholders intact and only reference variables you know are passed by the client.
3. If you add a new placeholder that needs computed logic (date formatting, name combination, signature URL), add a Handlebars helper in [src/certificate/handlebars/helpers.ts](../../src/certificate/handlebars/helpers.ts) and reference it as `{{helperName arg}}`.
4. Check that any fonts referenced in `font-family="..."` exist in the `fonts` registry for that template (next section).

## Fonts

Two font families are pre-registered in [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts):

```typescript
const notoSansFont = {
  'Noto Sans': {
    normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
    bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
    italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
    bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
  }
}

const libreBaskervilleFont = {
  'Libre Baskerville': { ... }
}
```

Each template picks `notoSansFont` or `libreBaskervilleFont` via its `fonts` property — only one family per template is typical, but the schema allows merging multiple.

The actual TTF files live in [src/api/fonts/](../../src/api/fonts/):
- `NotoSans-Regular.ttf`
- `NotoSans-Bold.ttf`
- `NotoSans-SemiBold.ttf`
- `LibreBaskerville-Regular.ttf`
- `LibreBaskerville-Bold.ttf`
- `LibreBaskerville-Italic.ttf`

### Adding a new font

1. Drop the TTF into [src/api/fonts/](../../src/api/fonts/).
2. Add a `<NewFont>Font` const in [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts) with `normal`/`bold`/`italics`/`bolditalics` URLs (`/api/countryconfig/fonts/<filename>.ttf`). All four variants must be set — point to the regular file as fallback if you don't have italic/bolditalic variants.
3. Reference the const in any template's `fonts` property.
4. Use `font-family="<NewFont>"` in the SVG.

## Handlebars helpers

Custom helpers live in [src/certificate/handlebars/helpers.ts](../../src/certificate/handlebars/helpers.ts) and are compiled to a JS bundle (esbuild, ESM) by [src/certificate/handlebars/handler.ts](../../src/certificate/handlebars/handler.ts), served at `GET /handlebars.js`. The client dynamically `import()`s this URL and the exported names become Handlebars helpers — there is no manual `Handlebars.registerHelper` call in country-config.

### Each export MUST be a factory function

Core registers helpers by calling `customHelpers[name]({ intl })` and passing the **returned function** to `Handlebars.registerHelper`. The expected type is:

```typescript
(injectedUtilities: { intl: IntlShape }) => Handlebars.HelperDelegate
```

✅ **Correct shape**:
```typescript
export function $formatRegistrationDate() {
  return function (value: string): string { /* ... */ }
}

// Or, if you need intl:
export function $localiseDate({ intl }: { intl: IntlShape }) {
  return function (value: string): string {
    return intl.formatDate(value)
  }
}
```

❌ **Wrong** — exporting the helper directly causes runtime `lookupProperty(...).call is not a function` when the SVG is rendered:
```typescript
export function $formatRegistrationDate(value: string): string { /* ... */ }
```

### Adding a helper

1. Add the factory export in `helpers.ts` (see shape above).
2. Reference from SVGs as `{{$formatRegistrationDate registrationDate}}`. Helper names prefixed with `$` work fine.
3. Restart country-config so the bundle is rebuilt — the handler uses **memoized** esbuild compilation via [src/utils/index.ts](../../src/utils/index.ts) `buildTypeScriptToJavaScript`. A hot reload of `helpers.ts` alone is not enough.

### `$or` does not accept string literals

The built-in `$or` helper (provided by core) only works between two `$lookup` subexpressions. Passing a string literal as the fallback returns blank silently:

```handlebars
{{$or ($lookup $declaration 'field') '-'}}     ← BROKEN — renders empty when field is undefined
```

For string-literal fallbacks, define a local `$defaultTo` helper in `helpers.ts` and use it instead:

```handlebars
{{$defaultTo ($lookup $declaration 'field') '-'}}
```

## Adding a new certificate template

1. Append a new entry to the `certificateConfigs` array in [src/api/certificates/handler.ts](../../src/api/certificates/handler.ts) with a unique `id`.
2. Drop the SVG file into [src/api/certificates/source/](../../src/api/certificates/source/) named `<id>.svg`.
3. Add a translation row for `label.id` in [src/translations/client.csv](../../src/translations/client.csv) — pattern: `certificates.{event}.certificate[.copy|.receipt]`.
4. Set fees for all three tiers (`onTime`, `late`, `delayed`) — use `0` if free.
5. Pick a `fonts` registry (`notoSansFont` or `libreBaskervilleFont`) matching the SVG's `font-family` usage.
6. Set `isDefault: false` unless this is the new canonical certificate for that event (in which case flip the previous default to `false`).
7. Optionally add a `conditionals: [{ type: 'SHOW', conditional: ... }]` block to gate availability — see [`conditionals-and-validators.md`](conditionals-and-validators.md).
8. If certain roles should be the only ones permitted to issue this template, scope `record.print-certified-copies` with `options.templates: ['<id>']` in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts) — see [`shared/scopes-dsl.md`](shared/scopes-dsl.md).

## Anti-patterns

- **Two `isDefault: true` for the same event** — undefined behaviour; one will win arbitrarily.
- **`svgUrl` not matching `id`** — the GET-by-id handler reads `{__dirname}/source/{params.id}`, so `id: 'foo'` must point to `source/foo.svg`. Don't use a free-form URL.
- **Referencing a font in SVG that isn't in the template's `fonts` registry** — silently falls back to PDF default, looks wrong.
- **Using `ConditionalType.SHOW` (object) instead of the literal `'SHOW'` string** in the certificate `conditionals` — the schema is hand-rolled and expects the literal.
- **Editing a TTF without updating the const** — the `getMimeTypeFromBase64`-style detection only works for the country logo, not fonts. Always wire new fonts through `fonts` registry consts.
- **Hardcoding a registration number, tracking id, or date in the SVG** — these must be `{{placeholders}}`. Static SVG text is for fixed labels only.
- **Skipping the `isV2Template` flag for new v2 templates** — they won't be picked up by the v2 client renderer.
- **Exporting Handlebars helpers as direct functions** (`export function $foo(value) {...}`) instead of factories (`export function $foo() { return function(value) {...} }`) — fails at print time with `lookupProperty(...).call is not a function`.
- **Using `$or` with a string literal fallback** (e.g. `{{$or ($lookup ...) '-'}}`) — returns blank silently. Use a local `$defaultTo` helper for literal fallbacks.
- **Using `legalStatuses.REGISTERED.createdBy.role`** for the registrar role — that path doesn't exist. The correct path is the flat `legalStatuses.REGISTERED.createdByRole`.
- **Using `legalStatuses.REGISTERED.createdAt`** for the registration date — also doesn't exist nested. Use the top-level `createdAt` on metadata.
