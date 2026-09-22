---
applyTo: "src/api/certificates/**,src/certificate/**,src/api/fonts/**"
description: "Use when adding or editing OpenCRVS certificate templates, SVG files, certificate fees, Handlebars helpers for certificates, or the fonts served to certificate PDFs. Covers the ICertificateConfigData shape, v1/v2 template distinction, certificate conditionals (event.hasAction.minCount), font registration, and the `/certificates`, `/fonts`, `/handlebars.js` endpoints."
---

# Certificates

**Critical rules** (apply reflexively):
- Exactly **one** `isDefault: true` per event. If you make a new template the default, flip the previous one to `false`.
- The template `id` must match the SVG filename in `src/api/certificates/source/<id>.svg`. The `svgUrl` is a derived path, not a free-form URL.
- Certificate `conditionals` use the literal string `'SHOW'`, NOT `ConditionalType.SHOW` — the schema is hand-rolled.
- All three fee tiers (`onTime`, `late`, `delayed`) are mandatory. Use `0` for free templates.
- Every `label.id` needs a row in [src/translations/client.csv](../../src/translations/client.csv) under the `certificates.{event}.certificate[.copy|.receipt]` convention.

**For full details, read these context files**:
- [.github/context/certificates.md](../context/certificates.md) — `ICertificateConfigData` shape, SVG/font/Handlebars registries, full procedure
- [.github/context/conditionals-and-validators.md](../context/conditionals-and-validators.md) — `event.hasAction(...).minCount(N)` builder for gating templates
- [.github/context/shared/translation-id-conventions.md](../context/shared/translation-id-conventions.md) — for `certificates.{event}.certificate[.copy]` ids
