---
applyTo: "src/client-config*.ts,src/login-config*.ts,src/api/application/**"
description: "Use when editing OpenCRVS application, client, or login configuration — defineApplicationConfig (country code, timezone, currency, phone pattern, notification delivery method, search default), defineClientConfig (LANGUAGES, dashboards, register background, feature flags), defineLoginConfig (login background, language list). Covers dev vs prod variant files and the /config/application, /client-config.js, /login-config.js endpoints."
---

# Application / Client / Login Config

**Critical rules** (apply reflexively):
- Keep `client-config.ts` / `.prod.ts` and `login-config.ts` / `.prod.ts` **structurally identical** — same keys, different values. Adding a key to one without the other breaks the corresponding environment.
- `login-config.ts` MUST reference `applicationConfig.PHONE_NUMBER_PATTERN`, `applicationConfig.USER_NOTIFICATION_DELIVERY_METHOD`, and `applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD`. Never hardcode — drift causes silent inconsistency.
- `LANGUAGES` must match the CSV column headers in [src/translations/](../../src/translations/) exactly. A `LANGUAGES` entry with no matching column = silent fallback to `defaultMessage` for every key.
- `COUNTRY` must be uppercase ISO 3166-1 alpha-3.
- `DASHBOARDS[].id` must be granted via `dashboard.view` scopes in roles or no role sees it.
- `defineApplicationConfig` has no `.prod` variant — use env vars inside the single file when needed.

**For full details, read these context files**:
- [.github/context/app-client-login-config.md](../context/app-client-login-config.md) — three helpers, full option tables, dashboards, branding, common changes
- [.github/context/shared/translation-id-conventions.md](../context/shared/translation-id-conventions.md) — for `field.address.{id}.label` and `dashboard.{name}Title`
