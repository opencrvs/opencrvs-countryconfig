# Metabase Dashboard Context for OpenCRVS Country Configuration

This file documents the full Metabase analytics dashboard setup from the **Farajaland** reference country configuration. Use it as a reference when building the same dashboards in a new country config.

---

## 1. Architecture Overview

```
OpenCRVS Core Action (DECLARE, REGISTER, PRINT_CERTIFICATE, …)
          │
          ▼
Country Config HTTP Action Hooks
          │
          ▼
src/analytics/analytics.ts   ← filters analytics: true fields, computes derived fields
          │
          ▼
PostgreSQL  analytics.event_actions  (one row per action on an event)
          │
          ▼
Metabase (v0.56.4)  ←  queries analytics schema directly via JDBC
          │
          ▼
Dashboards (Performance, Registrations Dashboard, Vital Statistics, MASTER)
```

### Key files to replicate in the new country config

| File | Purpose |
|---|---|
| `src/analytics/analytics.ts` | Analytics pipeline – filters fields, computes derived values |
| `src/analytics/postgres.ts` | Kysely PostgreSQL client |
| `src/api/dashboards/handler.ts` | `/dashboards/queries.json` and `/content/map.geojson` endpoints |
| `infrastructure/metabase/metabase.init.db.sql` | Metabase H2 database with all dashboards/questions baked in |
| `infrastructure/metabase/environment-configuration.sql` | Runtime SQL to inject env-specific settings into H2 DB |
| `infrastructure/metabase/run.sh` | Startup script – validates env vars, hashes password, runs Metabase |
| `infrastructure/postgres/setup-analytics.sh` | Creates the `analytics` schema and tables in PostgreSQL |

---

## 2. PostgreSQL Analytics Schema

### 2.1 Core table: `analytics.event_actions`

One row is written for every accepted action performed on an event.  
All columns are written by `src/analytics/analytics.ts`.

```sql
-- Subset of important columns (full set depends on Kysely typings)
id                   UUID PRIMARY KEY
event_id             UUID
event_type           TEXT          -- e.g. 'v2.birth', 'v2.death'
action_type          app.action_type ENUM  -- DECLARE, REGISTER, VALIDATE, PRINT_CERTIFICATE, …
status               app.action_status ENUM
created_at           TIMESTAMPTZ
created_at_location  UUID          -- FK → analytics.locations.id
created_by           TEXT          -- user ID
created_by_role      TEXT          -- e.g. 'FIELD_AGENT', 'REGISTRATION_AGENT'
created_by_user_type app.user_type ENUM
created_by_signature TEXT
registration_number  TEXT
declared_at          TIMESTAMPTZ   -- timestamp of the DECLARE action
registered_at        TIMESTAMPTZ   -- timestamp of the REGISTER action
declaration          JSONB         -- analytics: true fields from the form (dot-keys → underscores)
annotation           JSONB         -- analytics: true annotation fields from the action config
assigned_to          TEXT
transaction_id       TEXT
request_id           TEXT
original_action_id   UUID
content              JSONB
```

> **Important:** The `declaration` JSONB column contains only fields explicitly marked `analytics: true` in the form configuration. Dot-notation field IDs are converted to underscores, e.g. `child.gender` → stored as key `child_gender` inside the JSON object.

### 2.2 Supporting tables

```sql
analytics.locations (
  id           UUID PRIMARY KEY,
  name         TEXT,
  parentId     UUID REFERENCES analytics.locations(id),
  locationType TEXT
)

analytics.location_levels (
  id    TEXT PRIMARY KEY,
  level INTEGER,
  name  TEXT
)

analytics.location_statistics (
  reference_id      UUID,
  year              INTEGER,
  crude_birth_rate  NUMERIC,
  male_population   INTEGER,
  female_population INTEGER,
  total_population  INTEGER,
  PRIMARY KEY (reference_id, year)
)
```

---

## 3. Analytics Fields by Event Type

### 3.1 Birth event (`event_type = 'v2.birth'`)

Fields stored inside `declaration` JSONB (only `analytics: true` fields):

| JSON key (in DB) | Original field ID | Description |
|---|---|---|
| `child_gender` | `child.gender` | Child's gender |
| `child_dob` | `child.dob` | Child date of birth |
| `child_age_days` | `child.age.days` | **Computed** – days between child.dob and action.createdAt |
| `child_placeOfBirth` | `child.birthLocation.*` | Place of birth type/location |
| `child_countryPlaceOfBirth` | computed | **Computed** – resolved country name from birth location address |
| `child_firstNamesEng` | `child.firstNamesEng` | Child first name (English) |
| `child_familyNameEng` | `child.familyNameEng` | Child family name (English) |
| `child_birthOrder` | `child.multipleBirthInteger` | Multiple birth indicator |
| `informant_type` | `informant.relation` | Who is reporting |
| `mother_ageAtBirth` | `mother.ageOfIndividualInYears` | Mother's age |
| `mother_maritalStatus` | `mother.maritalStatus` | Mother's marital status |
| `mother_educationalAttainment` | `mother.educationalAttainment` | Mother's education level |
| `mother_nationality` | `mother.nationality` | Mother nationality |
| `father_educationalAttainment` | `father.educationalAttainment` | Father's education level |
| `father_nationality` | `father.nationality` | Father nationality |

> **Computed fields** are added in `precalculateAdditionalAnalytics()` in `src/analytics/analytics.ts`.

### 3.2 Death event (`event_type = 'v2.death'`)

| JSON key (in DB) | Original field ID | Description |
|---|---|---|
| `deceased_gender` | `deceased.gender` | Deceased person's gender |
| `deceased_dob` | `deceased.dob` | Deceased date of birth |
| `deceased_maritalStatus` | `deceased.maritalStatus` | Marital status |
| `deceased_nationality` | `deceased.nationality` | Nationality |
| `deceased_ageAtDeath` | `deceased.ageOfIndividualInYears` | Age at death |
| `deathDate` | `deceased.deathDate` | Date of death |
| `mannerOfDeath` | `deceased.mannerOfDeath` | Manner of death (enum) |
| `causeOfDeathMethod` | `deceased.causeOfDeathMethod` | Cause of death method |
| `causeOfDeathEstablished` | `deceased.causeOfDeathEstablished` | Whether cause established |
| `placeOfDeath` | `deceased.deathLocation.*` | Place of death |
| `informant_type` | `informant.relation` | Who is reporting |
| `mother_nationality` | `deceased.mother.nationality` | Mother nationality |
| `father_nationality` | `deceased.father.nationality` | Father nationality |

---

## 4. Metabase Models (Base Reusable Questions)

Create these as **Models** (type: `model`) in Metabase. They serve as base tables for all dashboard questions. All use the OpenCRVS Analytics Database connection.

### Model 1: `All Registrations`

```sql
SELECT * FROM analytics.event_actions WHERE action_type = 'REGISTER'
```

**Purpose:** Base model for all registration-related charts. Filter to `event_type = 'v2.birth'` or `'v2.death'` in individual questions built on top of this model.

**Column semantic types to set in model metadata:**
- `created_at` → Creation Timestamp
- `created_by` → Author
- `created_by_role` → Author
- `created_by_signature` → Author

### Model 2: `Declarations`

```sql
SELECT * FROM app.event_actions WHERE action_type = 'DECLARE'
```

**Purpose:** Base model for declaration-level analytics (before registration).

### Model 3: `Actions`

```sql
SELECT * FROM analytics.event_actions;
```

**Purpose:** Full action history – used for workflow and leaderboard analysis.

### Model 4: `Locations`

```sql
WITH RECURSIVE r AS (
  SELECT
    l.id         AS location_id,
    l.name,
    l.parent_id,
    0 AS level
  FROM analytics.locations l

  UNION ALL

  SELECT
    r.location_id,
    p.name,
    p.parent_id,
    r.level + 1
  FROM r
  JOIN analytics.locations p ON r.parent_id = p.id
)
SELECT
  location_id,
  MAX(CASE WHEN level = 0 THEN name END) AS level_0,
  MAX(CASE WHEN level = 1 THEN name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN name END) AS level_3
FROM r
GROUP BY location_id;
```

**Purpose:** Flattens the location hierarchy into one row per lowest-level location. `level_0` = facility/lowest, `level_3` = highest admin level (country). The exact depth depends on your country's admin structure. `level_2` is typically used as the map dimension (district level).

### Model 5: `Event types`

```sql
SELECT DISTINCT event_type FROM analytics.event_actions
```

**Purpose:** Provides a picklist for event type dashboard filters.

### Model 6: `Birth Registrations` (question based on Model 1)

Built on the `All Registrations` model with a filter `event_type = 'v2.birth'` (or whichever ID is used in the new country config).

**Visible columns (column titles):**
| Column | Display Title |
|---|---|
| `registration_number` | Registration No. |
| `created_at` | Registered on |
| `created_at_location` | Registered at |
| `created_by` | Registered by |
| `created_by_role` | Role type |
| `declaration` | Non PII |
| `action_type` | hidden |
| `created_by_user_type` | hidden |
| `original_action_id` | hidden |
| `request_id` | hidden |
| `status` | hidden |

**Column formatting:**
- `created_at`: date style `D MMMM, YYYY`, time disabled

---

## 5. Metabase Questions (Charts)

All questions use the **OpenCRVS Analytics Database** connection unless noted.

---

### Q1. Registrations by Gender (bar chart)

**Collection:** Birth dashboard collection  
**Display:** `bar`  
**SQL (native query):**

```sql
SELECT
  (app.event_actions.declaration #>> array['child.gender'])::text AS "child_gender",
  COUNT(*) AS count
FROM app.event_actions
WHERE 1=1
  [[AND (app.event_actions.declaration #>> array['child.gender'])::text = {{gender}}]]
  [[AND app.event_actions.created_at_location = {{location}}]]
GROUP BY (app.event_actions.declaration #>> array['child.gender'])::text
ORDER BY (app.event_actions.declaration #>> array['child.gender'])::text ASC;
```

**Template tags (optional filters):**
- `{{gender}}` – type: `text`, display name: `Gender`
- `{{location}}` – type: `text`, display name: `Location`

**Visualization settings:**
```json
{
  "graph.x_axis.scale": "ordinal",
  "graph.dimensions": ["child_gender"],
  "graph.metrics": ["count"]
}
```

---

### Q2. Age under 1 year – Registrations by Gender (bar chart)

**Display:** `bar`  
**SQL:**

```sql
SELECT
  (ea.declaration #>> ARRAY['child.gender']) AS child_gender,
  COUNT(*) AS cnt
FROM app.event_actions ea
WHERE
  ea.action_type = CAST('DECLARE' AS app.action_type)
  [[AND (app.event_actions.created_at_location = {{location}}]]
  [[AND (app.event_actions.declaration #>> array['child.gender'])::text = {{gender}}]]
  AND (ea.declaration #>> ARRAY['child.dob'])::date >= ea.created_at - INTERVAL '1 year'
GROUP BY (ea.declaration #>> ARRAY['child.gender'])
ORDER BY child_gender;
```

**Template tags:** `{{gender}}`, `{{location}}` (both optional text filters)

**Visualization settings:**
```json
{
  "graph.x_axis.scale": "ordinal",
  "graph.dimensions": ["child_gender"],
  "graph.metrics": ["cnt"]
}
```

> **Validator range:** `INTERVAL '1 year'` — only includes records where the child was less than 1 year old at the time of declaration.

---

### Q3. Age under 5 years – Registrations by Gender (bar chart)

**Display:** `bar`  
**SQL:**

```sql
SELECT
  (ea.declaration #>> ARRAY['child.gender']) AS child_gender,
  COUNT(*) AS cnt
FROM app.event_actions ea
WHERE
  ea.action_type = CAST('DECLARE' AS app.action_type)
  [[AND (app.event_actions.created_at_location = {{location}}]]
  [[AND (app.event_actions.declaration #>> array['child.gender'])::text = {{gender}}]]
  AND (ea.declaration #>> ARRAY['child.dob'])::date >= ea.created_at - INTERVAL '5 year'
GROUP BY (ea.declaration #>> ARRAY['child.gender'])
ORDER BY child_gender;
```

**Template tags:** `{{gender}}`, `{{location}}` (both optional text filters)

**Visualization settings:** same as Q2 but with `cnt` metric.

> **Validator range:** `INTERVAL '5 year'` — only includes records where the child was less than 5 years old at declaration.

---

### Q4. Registration by Gender (pie chart)

**Display:** `pie`  
**Built using GUI (not native SQL):**

- **Source table:** `event_actions` or `All Registrations` model
- **Aggregation:** Cumulative Count
- **Breakout:** `declaration → child_gender` (or `declaration #>> array['child.gender']`)
- **Filter:** `action_type = 'REGISTER'`

---

### Q5. Total Registrations (scalar)

**Display:** `scalar`  
**Built using GUI:**

- **Source:** `All Registrations` model (or filtered to specific `event_type`)
- **Aggregation:** Count
- **Filter:** `action_type = 'REGISTER'` (already in model), optionally also `event_type = 'v2.birth'`

**Visualization settings:**
```json
{ "scalar.field": "count" }
```

---

### Q6. Total Births Registered (metric / scalar)

**Type:** `metric`  
**Display:** `scalar`  
**Built using GUI:**

- **Source:** `All Registrations` model
- **Aggregation:** Count
- **Filter:** `event_type = 'v2.birth'` (adjust for new country's event type ID)

---

### Q7. Registrations by State (map)

**Display:** `map`  
**SQL (native query):**

```sql
WITH RECURSIVE r AS (
  -- base: count by lowest location
  SELECT
    ea.created_at_location AS location_id,
    COUNT(*)              AS count,
    l.name,
    l.parent_id,
    0 AS level
  FROM app.event_actions ea
  JOIN app.locations l ON ea.created_at_location = l.id
  WHERE ea.action_type = 'REGISTER'
  GROUP BY ea.created_at_location, l.name, l.parent_id

  UNION ALL

  -- climb up the hierarchy
  SELECT
    r.location_id,
    r.count,
    p.name,
    p.parent_id,
    r.level + 1
  FROM r
  JOIN app.locations p ON r.parent_id = p.id
)

SELECT
  location_id,
  MAX(CASE WHEN level = 0 THEN name END) AS level_0,
  MAX(CASE WHEN level = 1 THEN name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN name END) AS level_3,
  MAX(count) AS count
FROM r
GROUP BY location_id
ORDER BY count DESC;
```

**Visualization settings:**
```json
{
  "map.region": "<YOUR_GEOJSON_MAP_UUID>",
  "map.dimension": "level_2",
  "map.metric": "count"
}
```

> **Note:** `map.region` is the UUID assigned to your custom GeoJSON map by Metabase. It is set when you configure `OPENCRVS_METABASE_MAP_NAME` / `OPENCRVS_METABASE_MAP_URL`. The value `level_2` should match the admin level of your GeoJSON features (typically district level). Adjust `level_N` to match the depth of your location hierarchy.

---

### Q8. Number of Declarations per State (map)

**Display:** `map`  
**Built using GUI (joins `Declarations` + `Locations` model):**

- **Source:** `event_actions` table
- **Join:** `Locations` model on `created_at_location = location_id`
- **Aggregation:** Count
- **Filter:** `action_type = 'DECLARE'`
- **Map dimension:** `level_2` (from joined `Locations` model)
- **Map metric:** `count`

**Visualization settings:** same `map.region` UUID as Q7.

---

### Q9. % of Total Registrations Certified (pie chart)

**Display:** `pie`  
**SQL (native query):**

```sql
SELECT
  CASE WHEN has_certified THEN 'Certified' ELSE 'Not Certified' END AS group_name,
  COUNT(*) AS count
FROM (
  SELECT
    event_id,
    BOOL_OR(action_type = 'PRINT_CERTIFICATE') AS has_certified
  FROM app.event_actions
  WHERE action_type IN ('REGISTER', 'PRINT_CERTIFICATE')
  GROUP BY event_id
  HAVING BOOL_OR(action_type = 'REGISTER')
) t
GROUP BY has_certified;
```

**Purpose:** Shows what percentage of registered events have been certified (had a `PRINT_CERTIFICATE` action).

---

### Q10. Declarations by Role (pie chart)

**Display:** `pie`  
**Built using GUI:**

- **Source:** `event_actions` table
- **Aggregation:** Count
- **Breakout:** `created_by_role`
- **Filter:** `action_type = 'DECLARE'`

---

### Q11. Total Births By Event Type (bar chart)

**Display:** `bar`  
**Built using GUI:**

- **Source:** `All Registrations` model
- **Aggregation:** Count (or use the `Total Births Registered` metric)
- **Breakout:** `event_type`
- **Visualization:**
```json
{
  "graph.x_axis.scale": "ordinal",
  "graph.dimensions": ["event_type"],
  "graph.metrics": ["count"]
}
```

---

### Q12. Registered Records (No PII) (table)

**Display:** `table`  
**Built using GUI:**

- **Source:** `All Registrations` model
- **Filter:** `action_type = 'REGISTER'`
- **Selected fields (visible columns):**
  - `event_type`
  - `registration_number`
  - `created_by`
  - `created_at`
  - `created_at_location`
  - `declaration` (contains only non-PII analytics fields)
  - `content`

**Visualization settings:**
```json
{
  "table.columns": [
    { "name": "event_type",          "enabled": true },
    { "name": "registration_number", "enabled": true },
    { "name": "created_by",          "enabled": true },
    { "name": "created_at",          "enabled": true },
    { "name": "created_at_location", "enabled": true },
    { "name": "declaration",         "enabled": true },
    { "name": "id",                  "enabled": false },
    { "name": "content",             "enabled": true }
  ]
}
```

---

## 6. Dashboard Definitions

### Dashboard 1: `Performance`

**Tabs:** `Births` (and optionally a tab per other event type)  
**Collection:** OpenCRVS country collection

#### Tab: Births

| Card | Type | Position (col, row, w, h) |
|---|---|---|
| Total Births Registered | scalar | 0, 0, 24, 2 |
| Registrations by Gender | bar chart | 12, 2, 12, 8 |
| Age under 1 year | bar chart | 0, 10, 12, 6 |
| Age under 5 years | bar chart | 12, 10, 12, 6 |

**Dashboard filters (none required — filters are optional on individual cards):**
- `Gender` — `string/=` — connected to Q1, Q2, Q3 via template tags
- `Location` — `string/=` — connected to Q1, Q2, Q3 via template tags

---

### Dashboard 2: `Registrations Dashboard`

**Tabs:** `Tab 1` (maps), `Tab 2` (locations table)

#### Tab 1

| Card | Type | Position |
|---|---|---|
| Registrations by State (Q7) | map | 0, 0, 12, 6 |
| Number of declarations per state (Q8) | map | 12, 0, 12, 6 |
| % of Total Registrations Certified (Q9) | pie | 0, 6, 12, 8 |

**Dashboard filter:**
- `Date` — type: `date/month-year` — **required**, default: current month — connected to `created_at` on Q8 (Number of declarations per state)

#### Tab 2

| Card | Type | Position |
|---|---|---|
| Locations model | table | 0, 0, 12, 9 |

---

### Dashboard 3: `Vital Statistics Table (e-Registry)`

**Width:** `full`  
**Tabs:** `Births`, `Death`

#### Tab: Births

| Card | Type | Position |
|---|---|---|
| Birth Registrations (Q Model 6) | table | 0, 0, 24, 9 |

#### Tab: Death

| Card | Type | Position |
|---|---|---|
| Death Registrations (same as Q Model 6 but for `v2.death`) | table | 0, 0, 24, 9 |

**Death Registrations table visible columns:**

| Column | Display Title |
|---|---|
| `registration_number` | Registration No. |
| `created_at` | Registered on (D MMMM, YYYY) |
| `created_at_location` | Registered at |
| `created_by` | Registered by |
| `created_by_role` | Role type |
| `declaration` | Non PII |

**Dashboard filter:**
- `Time Period` — type: `date/relative` — **required**, default: `thisyear` — connected to `created_at` on both tabs' registration tables

---

### Dashboard 4: `MASTER Performance Dashboards`

**Tabs:** `Completness`, `Registrations`, `Insights`, `Leaderboards`, `Records (no PII)`

#### Tab: Registrations

| Card | Type | Notes |
|---|---|---|
| Total Births Registered (Q6) | scalar | 0, 0, 12, 5 |
| Placeholder cards for other metrics | placeholder | Remaining slots |

#### Tab: Records (no PII)

| Card | Type | Notes |
|---|---|---|
| Registered Records (No PII) (Q12) | table | 0, 0, 24, 9 |

#### Tab: Insights / Completness / Leaderboards

These tabs contain placeholder cards by default. Populate them with:
- **Completness:** registration coverage charts (registrations vs. population estimates)
- **Insights:** demographic breakdowns (gender, age, place of birth)
- **Leaderboards:** Declarations by Role (Q10), top registering offices

**Dashboard filter (applies globally):**
- `Event type` — type: `string/=` — connected to `event_type` field — allows filtering all charts to a single event (e.g., `v2.birth`)

---

## 7. Environment Variables

Required for Metabase startup (`infrastructure/metabase/run.sh`):

| Variable | Description | Example |
|---|---|---|
| `OPENCRVS_METABASE_SITE_NAME` | Metabase site display name | `OpenCRVS Analytics` |
| `OPENCRVS_METABASE_SITE_URL` | Public URL of Metabase | `https://metabase.your-country.opencrvs.org` |
| `METABASE_DATABASE_HOST` | PostgreSQL host | `postgres` |
| `METABASE_DATABASE_PORT` | PostgreSQL port | `5432` |
| `METABASE_DATABASE_NAME` | PostgreSQL DB name | `events` |
| `METABASE_DATABASE_USER` | PostgreSQL user | `events_analytics` |
| `METABASE_DATABASE_PASSWORD` | PostgreSQL password | *(secret)* |
| `METABASE_DATABASE_SSL` | Enable SSL | `false` (dev), `true` (prod) |
| `OPENCRVS_METABASE_ADMIN_EMAIL` | Metabase admin email | `admin@your-country.org` |
| `OPENCRVS_METABASE_ADMIN_PASSWORD` | Metabase admin password | *(secret)* |
| `OPENCRVS_METABASE_MAP_NAME` | Display name for GeoJSON map | `Your Country Districts` |
| `OPENCRVS_METABASE_MAP_URL` | URL to country GeoJSON | `https://api.your-country.org/content/map.geojson` |
| `OPENCRVS_METABASE_MAP_REGION_KEY` | GeoJSON feature property for region ID | `properties.id` |
| `OPENCRVS_METABASE_MAP_REGION_NAME` | GeoJSON feature property for region name | `properties.name` |
| `MB_JETTY_PORT` | Metabase HTTP port | `4444` |
| `MB_DB_FILE` | Path to H2 database file | `/data/metabase/metabase.mv.db` |

---

## 8. `environment-configuration.sql` Template

This file is applied at startup to inject runtime env vars into the Metabase H2 database. Copy this verbatim — **it does not need to be changed**:

```sql
UPDATE PUBLIC.SETTING
SET "VALUE" = '$OPENCRVS_METABASE_SITE_NAME'
WHERE "KEY" = 'site-name';

UPDATE PUBLIC.SETTING
SET "VALUE" = '$OPENCRVS_METABASE_SITE_URL'
WHERE "KEY" = 'site-url';

UPDATE PUBLIC.SETTING
SET "VALUE" = '{"cdc1d5eb-c7f8-8b01-b296-eda34d06b6da":{"name":"$OPENCRVS_METABASE_MAP_NAME","url":"$OPENCRVS_METABASE_MAP_URL","region_key":"$OPENCRVS_METABASE_MAP_REGION_KEY","region_name":"$OPENCRVS_METABASE_MAP_REGION_NAME"}}'
WHERE "KEY" = 'custom-geojson';

UPDATE PUBLIC.METABASE_DATABASE
SET DETAILS = '{"ssl": $METABASE_DATABASE_SSL,"password":"$METABASE_DATABASE_PASSWORD","destination-database":false,"port":$METABASE_DATABASE_PORT,"advanced-options":false,"schema-filters-type":"all","dbname":"$METABASE_DATABASE_NAME","host":"$METABASE_DATABASE_HOST","tunnel-enabled": false,"user":"$METABASE_DATABASE_USER"}'
WHERE NAME = 'OpenCRVS Analytics Database';

UPDATE PUBLIC.CORE_USER
SET
  EMAIL         = '$OPENCRVS_METABASE_ADMIN_EMAIL',
  PASSWORD      = '$OPENCRVS_METABASE_ADMIN_PASSWORD_HASH',
  PASSWORD_SALT = '$OPENCRVS_METABASE_ADMIN_PASSWORD_SALT'
WHERE IS_SUPERUSER = true;
```

> **Note:** The UUID `cdc1d5eb-c7f8-8b01-b296-eda34d06b6da` in `custom-geojson` is a fixed key used in the `map.region` visualization settings on map cards. Keep this UUID consistent between `environment-configuration.sql` and the map card visualization settings.

---

## 9. Analytics Pipeline Code to Replicate

### 9.1 `src/analytics/analytics.ts` – Key functions

**`findEventConfig(eventType)`** — maps event type string to event config:
```typescript
// Add your event types here:
if (eventType === Event.Birth)  return birthEvent
if (eventType === Event.Death)  return deathEvent
// etc.
```

**`pickDeclarationAnalyticsFields(declaration, eventConfig)`** — filters to only `analytics: true` fields from the form declaration pages.

**`precalculateAdditionalAnalytics(action, declaration, eventConfig)`** — adds computed fields. For birth:
```typescript
if (eventConfig.id === Event.Birth) {
  return {
    ...declaration,
    'child.age.days': differenceInDays(new Date(action.createdAt), new Date(childDoB)),
    'child.countryPlaceOfBirth': resolveCountryName(declaration),
  }
}
```
Add equivalent for Death if needed (e.g., age at death in years).

**`convertDotKeysToUnderscore(obj)`** — converts `child.gender` → `child_gender` for PostgreSQL JSONB key compatibility.

### 9.2 Mark fields with `analytics: true`

In your form page definitions, add `analytics: true` to all fields you want tracked. Only these fields end up in the `declaration` JSONB column:

```typescript
// src/form/v2/birth/forms/pages/child.ts
{
  id: 'child.gender',
  type: 'SELECT',
  analytics: true,   // ← this field will be stored
  label: { ... },
  options: [...]
}
```

Fields **not** marked `analytics: true` are never written to the analytics DB, even if they are part of the declaration. This is your PII protection mechanism.

---

## 10. GeoJSON Map Setup

### 10.1 GeoJSON endpoint

Register a route in `src/index.ts`:

```typescript
server.route({
  method: 'GET',
  path: '/content/map.geojson',
  handler: mapGeojsonHandler,
  options: { auth: false }
})
```

The handler (`src/api/dashboards/handler.ts`) returns the GeoJSON FeatureCollection stored in `src/api/dashboards/file/map.geojson`.

### 10.2 GeoJSON structure requirements

Each feature must have:
```json
{
  "type": "Feature",
  "properties": {
    "id": "<location UUID matching analytics.locations.id>",
    "name": "<district/region display name>"
  },
  "geometry": { ... }
}
```

The `OPENCRVS_METABASE_MAP_REGION_KEY` must point to the property that matches `location_id` values in the `Locations` model (e.g., `properties.id`).

---

## 11. Development Workflow

```bash
# Start Metabase locally with the H2 database
yarn metabase
# → http://localhost:4444
# → Email:    user@opencrvs.org
# → Password: m3tabase

# Set up the PostgreSQL analytics schema
yarn setup-analytics

# Seed some test data, then refresh analytics
# Once data is in analytics.event_actions, Metabase can query it directly

# When done making dashboard changes, stop the process.
# The H2 database is saved back to metabase.init.db.sql automatically.

# Sort translation files
yarn sort-translations
```

### Critical: Persisting dashboard changes

> Changes made in Metabase are **only persisted** when saved back to `infrastructure/metabase/metabase.init.db.sql`. Changes made in staging/production Metabase will be **reset on next deployment**. Always develop locally and commit the updated SQL file.

---

## 12. Checklist for New Country Config

- [ ] Copy `infrastructure/metabase/` directory (run.sh, environment-configuration.sql, initialize-database.sh, update-database.sh, metabase.jar)
- [ ] Copy `src/analytics/analytics.ts` and `src/analytics/postgres.ts`
- [ ] Copy `src/api/dashboards/handler.ts`
- [ ] Add GeoJSON file to `src/api/dashboards/file/map.geojson`
- [ ] Register `/dashboards/queries.json` and `/content/map.geojson` routes in `src/index.ts`
- [ ] Copy `infrastructure/postgres/setup-analytics.sh`
- [ ] Mark all desired analytics fields with `analytics: true` in form page definitions
- [ ] Add `precalculateAdditionalAnalytics()` logic for Birth and Death computed fields
- [ ] Start Metabase locally (`yarn metabase`)
- [ ] Create the 5 Models (All Registrations, Declarations, Actions, Locations, Event types)
- [ ] Create the 12 Questions / Charts (Q1–Q12)
- [ ] Build the 4 Dashboards with correct tab structure and card placements
- [ ] Configure custom GeoJSON map in Metabase Admin → Maps settings
- [ ] Connect map cards to the correct GeoJSON UUID in their visualization settings
- [ ] Verify dashboard filters (Time Period, Gender, Location, Event type) are wired correctly
- [ ] Stop Metabase to save changes to `metabase.init.db.sql`
- [ ] Commit `metabase.init.db.sql` to version control
- [ ] Set all required environment variables for deployment
- [ ] Verify `environment-configuration.sql` substitutions work in the deployed container
