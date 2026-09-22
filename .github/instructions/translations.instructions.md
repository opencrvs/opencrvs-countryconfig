---
applyTo: "src/translations/**,src/sort-translations.ts"
description: "Use when adding, editing, sorting, or auditing OpenCRVS translation strings — covers the three CSV files (client.csv, login.csv, notification.csv), the column conventions, the id-naming patterns, the `yarn sort-translations` workflow, and how content is served at `/content/{application}`."
---

# Translations

**Critical rules** (apply reflexively):
- CSVs have **4 columns**: `id,description,en,fr`. Every row must have a value in every language column. `sort-translations.ts` throws on uneven columns.
- `client.csv` and `login.csv` use **react-intl ICU** syntax (`{name}`, `{count, plural, ...}`). `notification.csv` uses **Handlebars** (`{{name}}`). Don't mix.
- Run `yarn sort-translations <path>` after every batch of additions. The CSVs are sorted in the repo; out-of-order rows are a smell.
- A `MessageDescriptor` `id` must match a CSV row exactly. Mismatch silently falls back to `defaultMessage` — easy to miss until QA in `fr`.

**For full details, read these context files**:
- [.github/context/translations.md](../context/translations.md) — three CSVs, columns, variable interpolation, sort tool, anti-patterns
- [.github/context/shared/translation-id-conventions.md](../context/shared/translation-id-conventions.md) — the canonical id-naming pattern table
