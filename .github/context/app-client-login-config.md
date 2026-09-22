# Application / Client / Login Config

Three related config surfaces, three separate files, three `define*` helpers from `@opencrvs/toolkit/application-config`. All are served as static config to core services and the two web apps at boot.

**Related context**: [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) for `field.address.{id}.label` and `dashboard.{name}Title` id patterns.

| File | Helper | Served at | Consumed by |
|---|---|---|---|
| [src/api/application/application-config.ts](../../src/api/application/application-config.ts) | `defineApplicationConfig` | `GET /config/application` (via [src/api/application/handler.ts](../../src/api/application/handler.ts)) | Core's events service + client app (search/timezone/notification defaults) |
| [src/client-config.ts](../../src/client-config.ts) (dev) / [src/client-config.prod.ts](../../src/client-config.prod.ts) | `defineClientConfig` | `GET /client-config.js` (as a JS module the SPA imports) | Registration web app (`@opencrvs/client`) only |
| [src/login-config.ts](../../src/login-config.ts) (dev) / [src/login-config.prod.ts](../../src/login-config.prod.ts) | `defineLoginConfig` | `GET /login-config.js` | Login web app (`@opencrvs/login`) only |

## Dev vs prod variants

Two files for `client-config` and `login-config` — the routing in [src/index.ts](../../src/index.ts) picks the right one based on environment. The dev variant typically points to `localhost:*` (e.g. Metabase dashboards at `localhost:4444`) while the prod variant uses domain URLs.

Keep the two variants in sync structurally — same keys, only values differ. When adding a new field, add it to both. Application config does **not** have a `.prod` variant; environment-specific values use `env`/`process.env` if needed inside the single file.

## Application config

[src/api/application/application-config.ts](../../src/api/application/application-config.ts):

```typescript
import { defineApplicationConfig } from '@opencrvs/toolkit/application-config'

export const applicationConfig = defineApplicationConfig({
  APPLICATION_NAME: 'Tuvalu CRVS',
  COUNTRY_LOGO: countryLogo,                       // imported from country-logo.ts
  SYSTEM_IANA_TIMEZONE: 'Pacific/Funafuti',        // basis for date/time in searches
  CURRENCY: {
    languagesAndCountry: ['en-TU'],                // for Intl.NumberFormat
    isoCode: 'TUV'                                 // ISO 4217 currency code
  },
  ADMIN_STRUCTURE: [
    {
      id: 'island',                                // arbitrary id used in address fields
      label: {
        id: 'field.address.island.label',          // must exist in client.csv
        defaultMessage: 'Island',
        description: '...'
      }
    }
  ],
  PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',        // regex; validates employees and informant phones
  USER_NOTIFICATION_DELIVERY_METHOD: 'email',      // 'email' | 'sms' | '' (disable). 'sms' = SMS or WhatsApp via Infobip
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // independent of USER method
  SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID'           // see allowed values below
})
```

### Allowed `SEARCH_DEFAULT_CRITERIA`

```
'TRACKING_ID' | 'REGISTRATION_NUMBER' | 'NATIONAL_ID' | 'NAME' | 'PHONE_NUMBER' | 'EMAIL'
```

### `COUNTRY_LOGO`

Defined in [src/api/application/country-logo.ts](../../src/api/application/country-logo.ts). Shape `{ fileName: string, file: string }` where `file` is a data URI (`data:image/png;base64,...`). Served as the raw image at `GET /content/country-logo` via [src/api/content/handler.ts](../../src/api/content/handler.ts) `countryLogoHandler` (decodes the base64 and returns with the matching mime type).

To replace the country logo:
1. Base64-encode the new PNG/SVG.
2. Update `file` in `country-logo.ts` with a `data:image/<mime>;base64,...` URI.
3. Update `fileName` to match.

### `PHONE_NUMBER_PATTERN`

This regex validates phone fields across the entire system — employees CSV, informant `phoneNo` fields, login phone field. It's read by the login app via [src/login-config.ts](../../src/login-config.ts) `PHONE_NUMBER_PATTERN: applicationConfig.PHONE_NUMBER_PATTERN`. Keep the two in sync (the login config imports `applicationConfig` to avoid drift).

Test the pattern against `default-employees.csv` mobile values when changing — every row's `mobile` must match or seeding fails.

### `ADMIN_STRUCTURE`

Custom admin levels used in domestic address fields (e.g. `island` in Tuvalu). Each entry is an addressable level. The `label.id` must exist in [src/translations/client.csv](../../src/translations/client.csv) under the convention `field.address.{id}.label`.

## Client config

[src/client-config.ts](../../src/client-config.ts) (dev) — what the registration web app loads:

```typescript
export default defineClientConfig({
  COUNTRY: 'TUV',                               // ISO 3166-1 alpha-3, uppercase
  LANGUAGES: ['en', 'fr'],                      // must match CSV columns in src/translations/
  SENTRY: '',                                   // Sentry DSN; empty = disabled
  REGISTER_BACKGROUND: { backgroundColor: '36304E' },  // hex without '#'
  DASHBOARDS: [
    {
      id: 'registrations',                      // referenced from role scopes `dashboard.view`
      title: { id: 'dashboard.registrationsTitle', defaultMessage: 'Registrations Dashboard', description: '...' },
      url: 'http://localhost:4444/public/dashboard/03be04d6-bde0-4fa7-9141-21cea2a7518b#bordered=false&titled=false&refresh=300'
    },
    // ...
  ],
  FEATURES: {}                                  // feature flag map
})
```

### LANGUAGES vs CSV columns

The list here must exactly match the language columns present in [src/translations/client.csv](../../src/translations/client.csv) (and `login.csv` / `notification.csv`). Adding a new language is a two-step change: add the CSV column to all three files (with values in every row) AND update this list.

### DASHBOARDS

Each entry `id` is referenced from role scopes:
```typescript
{ type: 'dashboard.view', options: { ids: ['registrations', 'completeness', 'registry'] } }
```
in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts). Adding a dashboard requires updating relevant role scopes too, or no role will see it.

The `url` is a Metabase embed URL. The query string fragment (`#bordered=false&titled=false&refresh=300`) controls Metabase embed behaviour. Dev uses `localhost:4444`; prod variant uses the deployed Metabase domain.

### FEATURES

Reserved for feature flags. Currently empty in this repo; populate as needed when the SPA grows feature-gated UI.

### REGISTER_BACKGROUND / LOGIN_BACKGROUND

Either `{ backgroundColor: '<hex without #>' }` or `{ backgroundImage: '<url>', imageFit: 'cover' | 'contain' | ... }`. Both client and login each have their own background config.

## Login config

[src/login-config.ts](../../src/login-config.ts) — what the login web app loads:

```typescript
export default defineLoginConfig({
  COUNTRY: 'TUV',
  LANGUAGES: ['en', 'fr'],
  LOGIN_BACKGROUND: { backgroundColor: '36304E' },
  SENTRY: '',
  USER_NOTIFICATION_DELIVERY_METHOD: applicationConfig.USER_NOTIFICATION_DELIVERY_METHOD,
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD,
  PHONE_NUMBER_PATTERN: applicationConfig.PHONE_NUMBER_PATTERN
})
```

This file **imports `applicationConfig`** so notification methods and phone pattern are single-sourced. Don't hardcode these in login config — always cross-reference.

`LANGUAGES` here drives the login page language switcher. Must match `login.csv` columns.

## Endpoints in index.ts

These configs are wired in [src/index.ts](../../src/index.ts):
- `GET /config/application` → `applicationConfigHandler` returning `JSON.stringify(applicationConfig)`
- `GET /client-config.js` → returns dev or prod `clientConfig` serialized as `window.config = {...}` JS
- `GET /login-config.js` → returns dev or prod `loginConfig` serialized as `window.config = {...}` JS

Both `*-config.js` endpoints are served with `auth: false` since the web apps load them before the user is authenticated.

## Common changes

### Toggle 2FA / change SMS code expiry

Auth-side settings (2FA enabled, code expiry, token expiry) are environment variables on core's auth service, not in country-config. See [src/environment.ts](../../src/environment.ts) for `TWO_FA_ENABLED` (default `true`) — but the effective enforcement is in core's auth-service env (`CONFIG_TOKEN_EXPIRY_SECONDS`, `CONFIG_SMS_CODE_EXPIRY_SECONDS`, see [docker-compose.yml](../../../opencrvs-core/docker-compose.yml)).

Country-config's `TWO_FA_ENABLED` is mainly informational here; the real flag is in core. To change in production, update the deploy compose files in [infrastructure/docker-compose.*-deploy.yml](../../infrastructure/).

### Change timezone

Update `SYSTEM_IANA_TIMEZONE` in `application-config.ts`. Affects how dates are bucketed in searches/analytics. Restart events service.

### Add a language

1. Add the language column (e.g. `es`) to all three CSVs in [src/translations/](../../src/translations/) — every row must have a value.
2. Add the language code to `LANGUAGES` in both [src/client-config.ts](../../src/client-config.ts) and [src/login-config.ts](../../src/login-config.ts) (plus their `.prod` variants).
3. Restart country-config; the web apps will pick up the new language on next boot.

### Add a dashboard

1. Build the dashboard in Metabase (see [infrastructure/metabase/](../../infrastructure/metabase/)).
2. Copy the public embed URL.
3. Append to `DASHBOARDS` in both client config variants with a unique `id` and translation row for `title.id` (pattern: `dashboard.{name}Title`).
4. Grant the id in role scopes:
   ```typescript
   { type: 'dashboard.view', options: { ids: ['<your-id>'] } }
   ```
5. Restart events service.

### Branding

- Logo: `country-logo.ts` (data URI).
- Register background: `REGISTER_BACKGROUND` in `client-config.ts`.
- Login background: `LOGIN_BACKGROUND` in `login-config.ts`.
- App name shown in tabs: `APPLICATION_NAME` in `application-config.ts`.

## Anti-patterns

- **Drift between dev and prod variants** — every key added to one must be added to the other.
- **Hardcoding `PHONE_NUMBER_PATTERN` in login-config** — always reference `applicationConfig.PHONE_NUMBER_PATTERN`.
- **Adding a language column without updating `LANGUAGES`** — the app won't expose it.
- **Adding a `LANGUAGES` entry without adding the CSV column** — react-intl falls back to `defaultMessage` for every key in that language, silently.
- **`DASHBOARDS[].url` pointing to a non-public embed** — Metabase will require auth and the iframe will fail.
- **Granting a `dashboard.view` id that isn't in `DASHBOARDS`** — UI just won't show it.
- **Editing `COUNTRY` to a non-uppercase or non-ALPHA-3 value** — breaks data-seeder location/country lookups.
- **Changing `SYSTEM_IANA_TIMEZONE` without restarting events service** — search/analytics bucketing will keep using the old zone until restart.
