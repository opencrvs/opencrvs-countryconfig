---
applyTo: "src/api/notification/**,src/config/routes/userNotificationRoutes.ts"
description: "Use when editing OpenCRVS email/SMS notifications — informant notifications (action-triggered: birth/death declaration/registration/rejection) and user lifecycle notifications (account-created, password-reset, username-reminder). Covers email-service (Nodemailer + SMTP), sms-service (Infobip), the TriggerEvent/TriggerPayload schema from @opencrvs/toolkit/notification, USER_/INFORMANT_NOTIFICATION_DELIVERY_METHOD switching, Handlebars templates, and the vitest mocking pattern."
---

# Notifications

**Critical rules** (apply reflexively):
- `notification.csv` uses **Handlebars** (`{{trackingId}}`), NOT react-intl `{var}`. Mixing them produces verbatim output.
- `/triggers/user/*` routes are `auth: false` (core calls server-to-server without a JWT). Adding auth breaks core.
- `email-service` silently skips any recipient ending in `@example.com` — useful for dev, fatal in prod data.
- Always route through `notify()` — never call `sendEmail` / `sendSMS` directly from outside `src/api/notification/`.
- Trigger event names for user notifications must exist in `TriggerEvent` from `@opencrvs/toolkit/notification` — otherwise the Zod payload schema rejects.
- Return 200 or 4xx from handlers; core does not retry non-2xx.

**For full details, read these context files**:
- [.github/context/notifications.md](../context/notifications.md) — informant + user flows, file map, template selection, Infobip/SMTP, vitest pattern
- [.github/context/translations.md](../context/translations.md) — Handlebars vs react-intl rules for `notification.csv`
- [.github/context/shared/event-enum-and-types.md](../context/shared/event-enum-and-types.md) — `ActionType` and `EventStatus` that drive `InformantTemplateType` selection
