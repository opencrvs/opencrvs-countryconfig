---
applyTo: "src/data-seeding/**"
description: "Use when changing OpenCRVS reference data — administrative areas (Humdata-format admin0-4 pcodes), CRVS offices, health facilities, population statistics, employees/users seeds, roles & scopes. Covers the CSV schemas served by /config/locations and /config/users, the role/scopes DSL served by /config/roles, environment-based CSV selection, and the partOf relationship between admin areas and locations."
---

# Data Seeding

**Critical rules** (apply reflexively):
- Three location CSVs (`administrative-areas.csv`, `locations.csv`, `statistics.csv`) plus environment-selected `default-employees.csv` / `prod-employees.csv` (switched by `OPENCRVS_ENVIRONMENT`). Every `partOf` must resolve to an existing pcode or `Location/0`.
- Every user's `primaryOfficeId` must be `CRVS_OFFICE_<id>` where `<id>` is a `CRVS_OFFICE` row in `locations.csv`. Pointing at a health facility breaks seeding.
- Every new role needs a `userRole.{camelCaseRoleId}` row in [src/translations/client.csv](../../src/translations/client.csv) AND must be granted in `defineScopes([...])`.
- Restart core's events service after role/scope/event changes — configs are cached in-memory at boot.
- Emails ending in `@example.com` are silently skipped by `email-service`. Never use them in `prod-employees.csv`.

**For full details, read these context files**:
- [.github/context/data-seeding.md](../context/data-seeding.md) — CSV schemas, employee/role flow, handler outputs, anti-patterns
- [.github/context/shared/scopes-dsl.md](../context/shared/scopes-dsl.md) — full `defineScopes` types and options (`accessLevel`, `placeOfEvent`, `registeredIn`, `templates`, `ids`, etc.)
- [.github/context/shared/translation-id-conventions.md](../context/shared/translation-id-conventions.md) — for `userRole.{camelCaseId}` and `field.address.{id}.label` patterns
