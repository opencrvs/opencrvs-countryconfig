# Data Seeding

Country-config exposes **reference data** that core consumes at boot via the `@opencrvs/data-seeder` CLI. The data lives as CSVs (locations, employees, statistics) and TypeScript (roles + scopes). Three HTTP endpoints serve it:

| Route | Handler | Returns |
|---|---|---|
| `GET /config/locations` | [src/data-seeding/locations/handler.ts](../../src/data-seeding/locations/handler.ts) | Flat `Location[]` (admin areas + facilities, with statistics joined onto admin areas) |
| `GET /config/users` | [src/data-seeding/employees/handler.ts](../../src/data-seeding/employees/handler.ts) | User array from environment-selected CSV |
| `GET /config/roles` | [src/data-seeding/roles/handler.ts](../../src/data-seeding/roles/handler.ts) | Role definitions with scopes from [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts) |

**Related context**:
- [`shared/scopes-dsl.md`](shared/scopes-dsl.md) — canonical reference for `defineScopes` types and options
- [`shared/translation-id-conventions.md`](shared/translation-id-conventions.md) — for `userRole.{camelCaseId}` and `field.address.{id}.label` ids

## Locations

### Three CSV inputs

All under [src/data-seeding/locations/source/](../../src/data-seeding/locations/source/):

#### `administrative-areas.csv` — Humdata format

Columns: `admin0Pcode,admin0Name_alias,admin0Name_en,admin1Pcode,admin1Name_alias,admin1Name_en,...,admin4Pcode,admin4Name_alias,admin4Name_en`

- Each row represents the **leaf-most** admin area; parent levels are repeated.
- `admin0` is always the country (e.g. `TUV`, `Tuvalu`). `admin1`–`admin4` are progressively finer subdivisions.
- `_en` is the canonical name. `_alias` is an alternative spelling used for search.
- Pcode hierarchy is required to be hierarchical strings — e.g. `TUV-001-002` is a child of `TUV-001`.
- The handler infers depth from the count of non-empty `adminNPcode` columns and maps it to `JURISDICTION_TYPE[depth-1]` (`STATE`, `DISTRICT`, `LOCATION_LEVEL_3`, `LOCATION_LEVEL_4`, `LOCATION_LEVEL_5`).
- `partOf` is auto-computed: leaf points to its immediate parent's pcode, top level points to `Location/0`.

#### `locations.csv` — CRVS offices + health facilities

Columns: `id,name,partOf,locationType`

- `id` is a free-form string (convention: `TUV-RGO`, `TUV-001-001`).
- `partOf` is `Location/{adminPcode}` — must reference an admin area defined in `administrative-areas.csv`, OR `Location/0` for nationwide facilities.
- `locationType` is `CRVS_OFFICE` or `HEALTH_FACILITY`.
- No alias column — handler reuses `name` as alias.

Every user in employees CSV must have a `primaryOfficeId` of the form `CRVS_OFFICE_<id>` where `<id>` is a row from this file with `locationType=CRVS_OFFICE`.

#### `statistics.csv` — Population & crude birth rate

Columns: `adminPcode,name,male_population_<year>,female_population_<year>,population_<year>,crude_birth_rate_<year>` repeated per year.

- One row per admin area that has stats (typically `admin1` level only).
- The year range expands automatically based on column names — currently 2007–2025 in the Tuvalu data.
- Used by core to compute completeness rates against expected birth registrations.
- Parser is in [src/utils/index.ts](../../src/utils/index.ts) `getStatistics()` — it splits each column on `_` and extracts the year.

### Handler output shape

[src/data-seeding/locations/handler.ts](../../src/data-seeding/locations/handler.ts) merges all three CSVs into one flat `Location[]`:

```typescript
type Location = {
  id: string
  name: string
  alias: string
  partOf: string                                          // 'Location/<id>' or 'Location/0'
  locationType: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
  jurisdictionType?: 'STATE' | 'DISTRICT' | 'LOCATION_LEVEL_3' | 'LOCATION_LEVEL_4' | 'LOCATION_LEVEL_5'
  statistics?: LocationStatistic['years']
}
```

### Adding a new admin area

1. Insert a row in `administrative-areas.csv` with a unique pcode at the correct depth.
2. If you want statistics, add a row to `statistics.csv` with `adminPcode = the new pcode` and the full year span (every existing year column must have a numeric value).
3. If users will work from this area, add a CRVS office for it in `locations.csv` with `partOf = Location/<adminPcode>`.
4. No translation rows needed — area names come from the CSV directly.

### Adding a CRVS office or health facility

1. Insert a row in `locations.csv`. `partOf` must match an existing pcode (or `Location/0` for nationwide).
2. For a `CRVS_OFFICE`, any user assigned `primaryOfficeId = CRVS_OFFICE_<id>` will operate from that office.
3. For a `HEALTH_FACILITY`, the office becomes selectable as a `FACILITY` field in birth/death forms (`child.birthLocationId`, etc.). Note: `FACILITY` field type currently renders only `HEALTH_FACILITY` locations — see [ADMINISTRATIVE-HIERARCHY.md](../../../opencrvs-core/ADMINISTRATIVE-HIERARCHY.md).

## Employees

### Two environment-selected CSVs

Under [src/data-seeding/employees/source/](../../src/data-seeding/employees/source/):

- `default-employees.csv` — dev/qa
- `prod-employees.csv` — staging + production

The handler picks based on `OPENCRVS_ENVIRONMENT`:

```typescript
['staging', 'production'].includes(OPENCRVS_ENVIRONMENT)
  ? './src/data-seeding/employees/source/prod-employees.csv'
  : './src/data-seeding/employees/source/default-employees.csv'
```

(see [src/data-seeding/employees/handler.ts](../../src/data-seeding/employees/handler.ts)). Both files use the same schema.

### Columns

```
primaryOfficeId,givenNames,familyName,role,mobile,username,email,password
```

- `primaryOfficeId` must match `CRVS_OFFICE_<id>` where `<id>` is a `CRVS_OFFICE` row in `locations.csv`.
- `role` must match a role `id` from [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts) (e.g. `NATIONAL_REGISTRAR`, `REGISTRATION_OFFICER`, `ISLAND_CLERK`).
- `mobile` should match the `PHONE_NUMBER_PATTERN` from [src/api/application/application-config.ts](../../src/api/application/application-config.ts).
- `email` ending with `@example.com` is treated as a test address by [src/api/notification/email-service.ts](../../src/api/notification/email-service.ts) and **skipped** — useful for dev but never use this in prod.
- `password` in `default-employees.csv` is typically `test`; users are required to change on first login.

### Adding a new user

1. Decide which env's CSV to edit (or both).
2. Verify the `primaryOfficeId` exists in `locations.csv`.
3. Verify the `role` exists in `roles.ts`.
4. Append the row — no ordering requirement, but keep grouping by office for readability.
5. For prod, use real email and a strong placeholder password; the user will be forced to change on first login.

## Roles & scopes

### Role definitions

All roles live in [src/data-seeding/roles/roles.ts](../../src/data-seeding/roles/roles.ts) as a single exported `roles: Role[]`. Each entry:

```typescript
{
  id: 'REGISTRATION_OFFICER',
  label: {
    defaultMessage: 'Registration Officer',
    description: 'Name for user role Registration Officer',
    id: 'userRole.registrationOfficer'   // must exist in client.csv
  },
  scopes: registrationOfficerScopes        // EncodedScope[] from defineScopes(...)
}
```

The `label.id` must match a row in [src/translations/client.csv](../../src/translations/client.csv) under the `userRole.{camelCaseRoleId}` convention.

### Scopes DSL

For the full scope type list and options, see [`shared/scopes-dsl.md`](shared/scopes-dsl.md). Quick reference:

```typescript
import { defineScopes, EncodedScope } from '@opencrvs/toolkit/scopes'

const registrationOfficerScopes = defineScopes([
  { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
  { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent'] } },
  { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
  { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
  { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
  { type: 'record.custom-action', options: {
      event: ['birth'],
      customActionTypes: ['VALIDATE_DECLARATION'],
      placeOfEvent: 'administrativeArea'
    }
  }
])
```

The convention in this repo: roles based at `Location/0` offices (e.g. `TUV-RGO`) get unscoped versions; island-level roles get `administrativeArea`-scoped versions.

### Adding a new role

1. Build a `defineScopes([...])` array for the role's permissions (see [`shared/scopes-dsl.md`](shared/scopes-dsl.md)).
2. Append a new entry to the `roles` export with `id`, `label`, and `scopes`.
3. Add a translation row to [src/translations/client.csv](../../src/translations/client.csv) for the `label.id` (pattern: `userRole.camelCaseRoleId`).
4. If users will have this role, add them to the employees CSV with matching `role` value.
5. If the role needs workqueues that don't exist yet, add them to [src/api/workqueue/workqueueConfig.ts](../../src/api/workqueue/workqueueConfig.ts) first and reference the slug in `workqueue.options.ids`.
6. Restart events service for new role/scope to take effect (event service caches configs in-memory at boot — see [packages/events/src/index.ts](../../../opencrvs-core/packages/events/src/index.ts)).

## Anti-patterns

- **Pointing `primaryOfficeId` at a non-`CRVS_OFFICE` location** — health facilities cannot host users.
- **`partOf` referencing a pcode not in `administrative-areas.csv`** — the handler silently drops the parent linkage; the location becomes unreachable.
- **Inconsistent year columns in `statistics.csv`** — every row must have the full year span; missing columns produce NaN.
- **Adding a role label without the `client.csv` row** — UI falls back to `defaultMessage` silently in development; QA in `fr` will surface the gap.
- **Granting nationwide scopes (no `accessLevel`) to island-level officers** — breaks the geographic isolation design. Mirror the existing two-tier pattern (`registrarGeneralScopes` vs `islandRegistrarScopes`).
- **Referencing a workqueue slug in `workqueue.options.ids` that does not exist** in workqueueConfig — the UI just doesn't show it.
- **Forgetting to restart core's events service** after role/scope/event changes — the in-memory cache is loaded only at boot. Use `db:clear:all` + restart or core's `/reindex`.
