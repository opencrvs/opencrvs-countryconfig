# Analytics

Country-config owns its **own Postgres database** (`analytics` schema) that is read by Metabase for reporting. This is distinct from core's events Postgres (which stores events). The analytics DB is a denormalised read-side built by pulling events from core's events service over tRPC, then applying country-specific precalculations and storing them flat in `analytics.events`.

Two reindex commands exist with different scopes — see "Reindex" below for which to use when.

**Related context**: [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md) for `Event` enum and `ActionType`.

## Architecture

```
core events Postgres  ←(tRPC: client.event.list / locations.list)──  country-config analytics module
                                                                              │
                                                                              ▼
                                                       country-config analytics Postgres (`analytics` schema)
                                                                              │
                                                                              ▼
                                                                          Metabase
```

The analytics module never writes back to core. It's a one-way export.

## File map

| File | Purpose |
|---|---|
| [src/analytics/analytics.ts](../../src/analytics/analytics.ts) | Main import pipeline — `importEvents`, `importEvent`, `importLocations`, `importAdministrativeAreas`, `syncLocationLevels`, `syncLocationStatistics` |
| [src/analytics/analytics-precalculations.ts](../../src/analytics/analytics-precalculations.ts) | Per-event computed columns (e.g. `precalculateBirthEvent`) — extends the declaration with derived fields before insertion |
| [src/analytics/postgres.ts](../../src/analytics/postgres.ts) | Kysely client setup, `analytics` schema, CamelCase plugin, TIMESTAMPTZ → ISO 8601 conversion |
| [src/analytics/countries.ts](../../src/analytics/countries.ts) | ISO country code → name lookup table |
| [src/analytics/analytics.test.ts](../../src/analytics/analytics.test.ts) | Vitest tests for the import pipeline |
| [infrastructure/postgres/setup-analytics.sh](../../infrastructure/postgres/setup-analytics.sh) | Creates Postgres role + `analytics` schema. Idempotent. Runs **before core migrations** — must not reference core's tables |
| [infrastructure/metabase/](../../infrastructure/metabase/) | Metabase configuration, init SQL, env config, dashboard JSON in `_data/` |

## The `analytics: true` field flag

The pipeline filters in two places:

### Per-event-config

```typescript
const analyticsEventConfigs = eventConfigs.filter((event) => event.analytics === true)
```

Set `analytics: true` on the top-level event config to opt the event in. Events without it are silently skipped — useful for demo events (e.g. `tennis-club-membership`).

### Per-field

```typescript
const analyticsFields = eventConfig.declaration.pages.flatMap((page) =>
  page.fields.filter((field) => field.analytics === true)
)
return pickBy(declaration, (_, key) => analyticsFields.some((field) => field.id === key))
```

Inside each opted-in event, **only fields with `analytics: true`** are exported. Use this to limit PII exposure to Metabase users. Common analytics fields: `child.dob`, `child.gender`, `mother.age`, `child.placeOfBirth`. Avoid: names, national IDs, contact info.

Similarly for action annotations: `pickAnnotationAnalyticsFields` filters annotation fields to `analytics: true` only.

## Precalculations

[src/analytics/analytics-precalculations.ts](../../src/analytics/analytics-precalculations.ts) computes derived values that are easier to query in Metabase than to compute on the fly:

```typescript
export function precalculateBirthEvent(action: ActionDocument, declaration: ActionDocument['declaration']) {
  const createdAt = new Date(action.createdAt)
  const childDoB = declaration['child.dob']
  if (!childDoB) return action
  return {
    ...declaration,
    'child.age.days': differenceInDays(createdAt, new Date(childDoB as string)),
    'child.countryPlaceOfBirth': getCountryPlaceOfBirthResolved(declaration)
  }
}
```

Two examples of precalculation:
- `child.age.days` — age in days at the time the action was created (used for on-time vs late registration analysis).
- `child.countryPlaceOfBirth` — resolved from nested `child.birthLocation.privateHome.country` or `child.birthLocation.other.country` via `COUNTRY_NAMES_BY_CODE` lookup, defaulting to the country name (`'Farajaland'` here as the example name — update for your country).

`precalculateAdditionalAnalytics` in [src/analytics/analytics.ts](../../src/analytics/analytics.ts) dispatches per event id:

```typescript
if (eventConfig.id === Event.Birth) return precalculateBirthEvent(action, declaration)
return declaration
```

### Adding a precalculation

1. Add a function `precalculate<EventName>Event(action, declaration)` in [src/analytics/analytics-precalculations.ts](../../src/analytics/analytics-precalculations.ts).
2. Return a new object that spreads `declaration` plus the new computed keys (use dot-keys: `'mother.age.years'`, not nested objects — Postgres columns are flat).
3. Wire into `precalculateAdditionalAnalytics` in [src/analytics/analytics.ts](../../src/analytics/analytics.ts) under a new `if (eventConfig.id === Event.Death) ...` branch.
4. The new columns will appear after the next import. Metabase auto-detects new columns when you refresh a question; existing dashboards keep working.
5. Add a unit test in [src/analytics/analytics.test.ts](../../src/analytics/analytics.test.ts) — pure function, easy to mock-input.

## Dot-key → underscore mapping

The pipeline converts `child.dob` → `child_dob` for Postgres column names via `convertDotKeysToUnderscore` ([src/analytics/analytics.ts](../../src/analytics/analytics.ts)). Always reference fields by their dot-form in code — the conversion happens on insertion. Reverse the mapping in mind when querying in Metabase: a field `child.age.days` becomes column `child_age_days`.

## Postgres client

[src/analytics/postgres.ts](../../src/analytics/postgres.ts) sets up Kysely with:
- `CamelCasePlugin` — so `event_id` in the DB maps to `eventId` in code.
- Schema scope `.withSchema('analytics')` — all queries are namespaced.
- TIMESTAMPTZ override to return ISO 8601 strings (`2025-06-16T12:55:51.507Z`) instead of `Date` objects — ensures consistent timezone handling (`Settings.defaultZone = 'utc'`).

Pool/db are lazily initialised and reused — call `getClient()` to obtain a scoped Kysely instance.

Connection URL comes from `ANALYTICS_DATABASE_URL` env var (default `postgres://events_analytics:analytics_password@localhost:5432/events`).

## `setup-analytics.sh`

[infrastructure/postgres/setup-analytics.sh](../../infrastructure/postgres/setup-analytics.sh):

1. Waits for Postgres to be ready.
2. Creates or updates the `ANALYTICS_POSTGRES_USER` role.
3. Creates the `analytics` schema and base tables (`analytics.administrative_areas`, `analytics.events`, etc.).
4. Grants the analytics role usage on the schema.

**Idempotent** — runs on every deploy and on every `yarn start` (via the `setup-analytics` script in package.json). Critical constraint at the top of the file:

> NOTE! This setup is ran before core migrations. Therefore you CAN NOT refer to the tables or data in core.

If you need data from core (e.g. event configs, location lists), pull it at import time via tRPC inside `analytics.ts`, not in this shell script.

Required env vars:
- `POSTGRES_USER`, `POSTGRES_PASSWORD` (superuser)
- `ANALYTICS_POSTGRES_USER`, `ANALYTICS_POSTGRES_PASSWORD`
- `POSTGRES_HOST` (default `localhost`), `POSTGRES_PORT` (default `5432`)
- `TARGET_DB` (default `events` — same DB as core events service, different schema)

The `events_analytics` role is **read-only outside the `analytics` schema**. Metabase connects as this user.

## Reindex

Two distinct commands — don't confuse them:

### Country-config `POST /reindex`

The HTTP route (registered in [src/index.ts](../../src/index.ts)) calls `importEvents` which:
1. Streams all events from core via `client.event.list` (paginated cursor).
2. For each event, picks analytics-tagged fields, runs precalculations, upserts into `analytics.events`.
3. Reimports locations and administrative areas.

This is the **rebuild-Metabase-data** operation. Trigger after:
- Adding `analytics: true` to new fields (so they appear in Metabase).
- Adding a new precalculation (so derived columns are populated).
- Restoring from a backup.
- Suspecting analytics is out of sync.

Performance: linear in number of events. Cursor-paginated, so safe to run on large datasets.

### Core's `reindex.sh`

[infrastructure/deployment/reindex.sh](../../infrastructure/deployment/reindex.sh) (matches core's equivalent) **rebuilds core's Elasticsearch indices** for search and workqueues. This is separate from analytics. Trigger after:
- Schema migrations in `@opencrvs/migration`.
- Field id renames in event configs.
- ES mapping changes.

## Metabase

[infrastructure/metabase/](../../infrastructure/metabase/) hosts:
- `run.sh` / `run-dev.sh` — start Metabase (dev uses `localhost:4444`, prod uses deployed Metabase domain).
- `metabase.init.db.sql` — initialises the Metabase H2 config DB.
- `environment-configuration.sql` — applies env-specific settings on start.
- `_data/` — exported dashboards as JSON for version control.

The dashboards referenced from [src/client-config.ts](../../src/client-config.ts) `DASHBOARDS` are Metabase public embed URLs. The UUIDs in those URLs are Metabase dashboard ids — keep them stable when editing dashboards or update the client config.

### Local Metabase

```bash
yarn metabase   # alias for bash infrastructure/metabase/run-dev.sh
```

Boots Metabase against the local analytics Postgres. Connect at `http://localhost:4444`.

## Excluding events from analytics

Set `analytics: false` (or omit) on the event config:

```typescript
defineConfig({
  id: Event.TENNIS_CLUB_MEMBERSHIP,
  analytics: false,
  // ...
})
```

The pipeline silently skips these. Useful for demo events you don't want polluting registration metrics.

## Common changes

### Add a new analytics field

1. Set `analytics: true` on the field in the event form definition (e.g. inside [src/events/birth/forms/pages/child.ts](../../src/events/birth/forms/pages/child.ts)).
2. POST `/reindex` (or wait for next deploy).
3. Open Metabase, refresh the events table schema, the new column is available.

### Add a new precalculated column

1. Implement in [src/analytics/analytics-precalculations.ts](../../src/analytics/analytics-precalculations.ts) per the procedure above.
2. Add unit test.
3. POST `/reindex`.

### Add a country code

[src/analytics/countries.ts](../../src/analytics/countries.ts) `COUNTRY_NAMES_BY_CODE` is the source for country name resolution in precalculations. Add/edit ISO 3166-1 alpha-3 code entries here when supporting cross-border data.

## Anti-patterns

- **Setting `analytics: true` on PII fields** — names, IDs, contact info leak to Metabase users. Restrict to demographic/statistical fields.
- **Querying core's events Postgres directly from analytics code** — always go through the tRPC client. Country-config has no DB credentials for core's events DB by design.
- **Adding tables in `setup-analytics.sh` that reference core's tables** — runs before core migrations; references will fail.
- **Forgetting to call `/reindex` after adding analytics fields** — the field exists in events but won't be in `analytics.events` until reimport.
- **Renaming a dot-key field without reindexing** — old column lingers in Postgres with stale data; new column is empty until reindex.
- **Nested objects in precalculation output** — Postgres columns are flat; use dot-keys (`'mother.age.years'`) which become underscored columns (`mother_age_years`).
- **Using `Date` types in queries** — analytics uses ISO 8601 strings via the TIMESTAMPTZ override. Compare to `'2025-01-01T00:00:00Z'` not `new Date(...)`.
- **Confusing the two reindex commands** — country-config's `POST /reindex` rebuilds Metabase data; core's `reindex.sh` rebuilds Elasticsearch search/workqueue indices.
- **Editing Metabase dashboards without exporting to `_data/`** — changes are lost on container restart unless persisted to the JSON files.
- **Hardcoding `ANALYTICS_DATABASE_URL`** — always read from env. Production uses encrypted credentials.
