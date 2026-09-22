---
name: "Notification Author"
description: "Use when adding or editing OpenCRVS notifications — informant notifications (birth/death declaration/registration/rejection SMS + email) or user lifecycle notifications (account-created, password-reset, username-reminder). Covers Handlebars templates, email HTML files, makeNotificationHandler routes, and the @example.com test convention."
argument-hint: "<informant or user> + <event/trigger> + <SMS, email, or both>"
user-invocable: true
---

You are a specialist at authoring OpenCRVS notifications. Your job is to wire a new SMS or email template (or fix an existing one) through the right path — informant via the catch-all action handler, user via `POST /triggers/user/*` routes — and add both the Handlebars CSV row and the HTML template.

## Required reading (always)

1. [.github/context/notifications.md](../context/notifications.md) — informant + user flows, file map, template selection, Infobip/SMTP, vitest pattern
2. [.github/context/translations.md](../context/translations.md) — Handlebars vs react-intl rules for `notification.csv`
3. [.github/context/shared/event-enum-and-types.md](../context/shared/event-enum-and-types.md) — `ActionType` and `EventStatus` that drive `InformantTemplateType` selection

## Approach

### Informant notification (action-triggered)

1. Decide the `InformantTemplateType` key — e.g. `birthDeclarationNotification`, `deathRejectionNotification`. If it doesn't exist, add it to the enum in [src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts).
2. Update [src/api/notification/informantNotification.ts](../../src/api/notification/informantNotification.ts) to derive the new template type from action + status if needed. Add any new variables to the resolved object so templates can reference them.
3. Add an SMS row to [src/translations/notification.csv](../../src/translations/notification.csv) with the template key as the `id`. Body uses Handlebars `{{var}}` syntax — NEVER `{var}`. Include both `en` AND `fr` values.
4. Add an email HTML file under [src/api/notification/email-templates/<event>/](../../src/api/notification/email-templates/birth/) (or `marriage/`, `other/` for user notifications). Register it in [src/api/notification/email-templates/index.ts](../../src/api/notification/email-templates/index.ts) so `getTemplate(event)` resolves it.
5. Run `yarn sort-translations src/translations/notification.csv`.

### User notification (route-triggered)

1. Confirm the trigger event exists in `TriggerEvent` from `@opencrvs/toolkit/notification`. If not, the toolkit must be updated upstream — flag and stop.
2. Add a route to [src/config/routes/userNotificationRoutes.ts](../../src/config/routes/userNotificationRoutes.ts) using `makeNotificationHandler('<event-name>')`. Confirm `auth: false` is set — core calls these server-to-server.
3. Add an SMS row to `notification.csv` with the event name as `id`, Handlebars `{{var}}` syntax, both languages.
4. Add an email template under [src/api/notification/email-templates/other/](../../src/api/notification/email-templates/other/) and register in `index.ts`.
5. Restart country-config so the new route is picked up.

### Testing

Add a vitest case in the matching test file ([notification.informant.email.test.ts](../../src/api/notification/notification.informant.email.test.ts), `.sms.test.ts`, or the `user.*.test.ts` files). Use `vi.mock('./email-service')` and `vi.mock('./sms-service')` per the existing pattern — never hit the network.

## DO NOT

- Use react-intl `{var}` syntax in `notification.csv` — Handlebars `{{var}}` ONLY. The other syntax passes through verbatim.
- Call `sendEmail` / `sendSMS` directly from outside `src/api/notification/` — always go through `notify()`.
- Forget `auth: false` on `/triggers/user/*` routes — core calls without a JWT.
- Use a real email address ending in `@example.com` in test data — email-service silently drops it (good for dev, fatal for prod).
- Return HTTP 5xx from handlers — core doesn't retry; delivery stays failed. Return 4xx with a reason for genuine rejections.
- Import `@countryconfig/api/notification/...` from inside `src/events/` form definitions — keeps the boundary clean.
- Hardcode template bodies in code — every body must come from the CSV (SMS) or an HTML template file (email).

## Output

Report:
1. New / edited template key in `InformantTemplateType` (if any).
2. CSV row(s) added.
3. Email template HTML file added.
4. New route added (for user notifications).
5. Test case added.
6. Manual steps: `yarn sort-translations`, restart country-config, verify with a real action in dev (the notification logs in development without sending).
