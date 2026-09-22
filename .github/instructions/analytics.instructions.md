---
applyTo: "src/analytics/**,infrastructure/metabase/**,infrastructure/postgres/setup-analytics.sh"
description: "Use when editing OpenCRVS country-config analytics — the separate Postgres DB owned by country-config (distinct from core's events DB), Kysely-based event import pipeline, per-event precalculated columns (e.g. child.age.days, country place of birth), the `analytics: true` field flag, POST /reindex route, Metabase dashboards, and the two reindex commands (core vs country-config)."
---

# Analytics

**Critical rules** (apply reflexively):
- Country-config owns its **own** Postgres `analytics` schema, separate from core's events DB. Never query core's Postgres directly from analytics code — always go through the tRPC client.
- `infrastructure/postgres/setup-analytics.sh` runs **before** core migrations. It MUST NOT reference core's tables.
- `analytics: true` flag is required at BOTH the event-config level AND the field level. Events without it are skipped; fields without it are filtered out (limits PII exposure).
- Precalculation output uses **dot-keys** (`'mother.age.years'`), NOT nested objects — Postgres columns are flat. Pipeline converts `child.dob` → `child_dob` column.
- Two reindex commands: country-config `POST /reindex` rebuilds Metabase data. Core's `infrastructure/deployment/reindex.sh` rebuilds Elasticsearch search indices. Don't confuse them.
- Always reindex after adding `analytics: true` to a new field or adding a precalculation — the field exists in events but not in `analytics.events` until reimport.
- Use ISO 8601 strings for date comparisons (TIMESTAMPTZ → string override in Kysely client); not `Date` objects.

**For full details, read these context files**:
- [.github/context/analytics.md](../context/analytics.md) — architecture, file map, precalculation procedure, Postgres/Kysely, Metabase, common changes
- [.github/context/shared/event-enum-and-types.md](../context/shared/event-enum-and-types.md) — `Event` enum dispatch in `precalculateAdditionalAnalytics`
