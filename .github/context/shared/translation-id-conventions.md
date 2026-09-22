# Translation ID naming conventions

All translatable strings in OpenCRVS country-config use a `MessageDescriptor`:

```typescript
{
  defaultMessage: 'Some text',           // fallback only; the id is what matters
  description: 'Context for translators',
  id: '<namespaced.id>'                  // must have a row in the matching CSV
}
```

The `id` literal in code must EXACTLY match a row in the right CSV (`client.csv` / `login.csv` / `notification.csv`). Mismatch silently falls back to `defaultMessage` — easy to miss until QA in a non-English language.

## Pattern table

| Surface | Pattern | Example | CSV |
|---|---|---|---|
| Event top-level | `event.{eventId}.label` | `event.birth.label` | client |
| Event summary card | `event.{eventId}.summary.title` / `.fallbackTitle` | `event.birth.summary.title` | client |
| Event flag | `event.{eventId}.flag.{flag-id}` | `event.birth.flag.validated` | client |
| Form section title | `event.{eventId}.action.declare.form.section.{page}.title` | `event.birth.action.declare.form.section.child.title` | client |
| Form field label | `event.{eventId}.action.declare.form.section.{page}.field.{fieldName}.label` | `event.birth.action.declare.form.section.child.field.name.label` | client |
| Summary field value | `event.{eventId}.summary.{section}.{field}.{label\|empty}` | `event.birth.summary.child.dob.empty` | client |
| Validation error | `error.{errorName}` | `error.invalidName`, `error.invalidNationalId` | client |
| User role | `userRole.{camelCaseRoleId}` | `userRole.registrarGeneral`, `userRole.islandClerk` | client |
| Select option label | `form.field.label.{contextValue}` | `form.field.label.statusActive`, `form.field.label.firstNames`, `form.field.label.familyName` | client |
| Certificate label | `certificates.{event}.certificate[.copy\|.receipt]` | `certificates.birth.certificate`, `certificates.birth.certificate.copy` | client |
| Workqueue | `workqueues.{slug}.{title\|emptyMessage}` | `workqueues.assignedToYou.title` | client |
| Advanced search | `advancedSearch.form.{section}` / `birth.search.criteria.label.prefix.{role}` | | client |
| Dashboard | `dashboard.{name}Title` | `dashboard.registrationsTitle` | client |
| Address admin level | `field.address.{id}.label` | `field.address.island.label` | client |
| Login UI text | `login.{key}` / `verify-mobile.{key}` | `login.errors.wrongCredentials` | login |
| SMS / email body | `informant.notification.{event}.{stage}` / `user.{trigger}` | `informant.notification.birth.declared` | notification |

## Repeated-section convention

For indexed repeated fields (children 1–15, name changes 1–N, etc.), each instance gets its own row:

```
event.death.action.declare.form.section.livingChildren.field.child1.name.label
event.death.action.declare.form.section.livingChildren.field.child2.name.label
...
```

Labels themselves can be identical text; only the `id` differs.

## Casing rules

- Event ids: lowercase singular (`birth`, `death`, `marriage`)
- Page/section ids: lowercase camelCase (`child`, `mother`, `livingChildren`)
- Field ids: lowercase camelCase (`name`, `dob`, `placeOfBirth`)
- Role ids: SCREAMING_SNAKE_CASE in `roles.ts` (`REGISTRATION_OFFICER`); converted to camelCase in the translation id (`registrationOfficer`)
- Workqueue slugs: kebab-case (`assigned-to-you`, `pending-validation`); converted to camelCase in the translation id (`assignedToYou`)
- Error names: lowercase camelCase (`invalidName`, `invalidNationalId`)

## Cross-references

- Full translations workflow + sort tool + variable interpolation: [`../translations.md`](../translations.md)
- Where field-label ids come from: [`../events-forms.md`](../events-forms.md)
- Where role-label ids come from: [`../data-seeding.md`](../data-seeding.md)
- Where workqueue-name ids come from: [`../workqueues-actions.md`](../workqueues-actions.md)
- Where certificate-label ids come from: [`../certificates.md`](../certificates.md)
- Where dashboard-title ids come from: [`../app-client-login-config.md`](../app-client-login-config.md)
