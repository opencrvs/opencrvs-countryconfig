# Notifications

Country-config owns two notification surfaces:

1. **Informant notifications** — triggered by event actions (e.g. birth registered → SMS/email to the parent). Wired via the catch-all action handler.
2. **User notifications** — account lifecycle (user created, password reset, etc.). Wired via `POST /triggers/user/*` routes.

Both share the same email and SMS service layer.

**Related context**:
- [`translations.md`](translations.md) — `notification.csv` uses Handlebars syntax, NOT react-intl
- [`shared/event-enum-and-types.md`](shared/event-enum-and-types.md) — `ActionType`, `EventStatus`

## Delivery method switch

Two settings in [src/api/application/application-config.ts](../../src/api/application/application-config.ts) control routing:

```typescript
USER_NOTIFICATION_DELIVERY_METHOD: 'email'       // or 'sms', or '' to disable. 'sms' can also mean WhatsApp.
INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email'  // independent of the user method
```

The dispatcher in [src/api/notification/handler.ts](../../src/api/notification/handler.ts) `notify()` reads these and picks the channel. Setting the value to `''` (empty) silently skips notifications — useful for environments where SMS/email infrastructure isn't yet configured.

## File map

| File | Purpose |
|---|---|
| [src/api/notification/handler.ts](../../src/api/notification/handler.ts) | `emailHandler` (legacy `POST /email`), `makeNotificationHandler<TriggerEvent>(event)` factory used by user-notification routes, `notify()` dispatcher, `generateFailureLog()` |
| [src/api/notification/email-service.ts](../../src/api/notification/email-service.ts) | `sendEmail()` — Nodemailer over SMTP. Skips `@example.com` recipients. Pre-interpolates `{DOMAIN}`, `{ALERT_EMAIL}`, `{SENDER_EMAIL_ADDRESS}` via Handlebars |
| [src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts) | `sendSMS()` — Infobip HTTP API. Looks up template text from [src/translations/notification.csv](../../src/translations/notification.csv) per recipient locale |
| [src/api/notification/informantNotification.ts](../../src/api/notification/informantNotification.ts) | `sendInformantNotification()` — pulls informant from declaration, composes variables, calls `notify()` |
| [src/api/notification/email-templates/](../../src/api/notification/email-templates/) | Per-event Handlebars HTML templates (`birth/`, `death/`, `marriage/`, `other/`) and `index.ts` that exposes `getTemplate(event)` and `renderTemplate()` |
| [src/api/notification/constant.ts](../../src/api/notification/constant.ts) | SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SECURE, SENDER_EMAIL_ADDRESS, ALERT_EMAIL, COUNTRY_LOGO_URL, INFOBIP_API_KEY, INFOBIP_GATEWAY_ENDPOINT, INFOBIP_SENDER_ID — all env-driven |
| [src/api/notification/testData.ts](../../src/api/notification/testData.ts) | Test fixtures (`EventDocument`, `Recipient`, etc.) |
| [src/config/routes/userNotificationRoutes.ts](../../src/config/routes/userNotificationRoutes.ts) | Registers `POST /triggers/user/*` routes |

## Informant notifications

### Trigger flow

1. Core calls `POST /trigger/events/{event}/actions/{action}` after every state-changing action.
2. The catch-all handler in [src/api/events/handler.ts](../../src/api/events/handler.ts) `onAnyActionHandler` calls `sendInformantNotification({ event, token })`.
3. `sendInformantNotification` in [src/api/notification/informantNotification.ts](../../src/api/notification/informantNotification.ts):
   - Reads the pending action from `event.actions`.
   - Aggregates declaration data via `aggregateActionDeclarations(event)` + `deepMerge(...)` from `@opencrvs/toolkit/events`.
   - Resolves the informant from `informant.relation` — for births: MOTHER → `mother.name`, FATHER → `father.name`, else `informant.name`; for deaths: SPOUSE → `spouse.name`, else `informant.name`.
   - Pulls `informant.email` / `informant.phoneNo` for recipient.
   - Calls `notify(...)` with `deliveryMethod: applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD`.

### Template selection

`InformantTemplateType` (in [src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts)) enumerates the supported event-stage templates:
- `birthInProgressNotification`, `birthDeclarationNotification`, `birthRegistrationNotification`, `birthRejectionNotification`
- `deathInProgressNotification`, `deathDeclarationNotification`, `deathRegistrationNotification`, `deathRejectionNotification`

`informantNotification.ts` derives the template type from the action type and event status. Each one must have:
- An SMS row in [src/translations/notification.csv](../../src/translations/notification.csv) (Handlebars syntax, `{{trackingId}}` etc.).
- An email HTML file under [src/api/notification/email-templates/{event}/](../../src/api/notification/email-templates/birth/), wired in [src/api/notification/email-templates/index.ts](../../src/api/notification/email-templates/index.ts).

### Variables exposed to templates

From `informantNotification.ts`:
- `informantName` — full name (firstname + middlename + surname)
- `name` — child's name (birth) or deceased's name (death)
- `trackingId` — `event.trackingId`
- `crvsOffice` — looked up from `locations.list.query()` (core tRPC call)
- `registrationNumber` — present only after REGISTER action
- `applicationName`, `countryLogo` — from applicationConfig + constants

Add your variables to the resolved object in `informantNotification.ts` if you need new ones in templates.

## User notifications

### Routes

Registered in [src/config/routes/userNotificationRoutes.ts](../../src/config/routes/userNotificationRoutes.ts) and mounted in [src/index.ts](../../src/index.ts):

| Route | Trigger event |
|---|---|
| `POST /triggers/user/user-created` | `user-created` |
| `POST /triggers/user/user-updated` | `user-updated` |
| `POST /triggers/user/username-reminder` | `username-reminder` |
| `POST /triggers/user/reset-password` | `reset-password` |
| (more — read the full file) | |

All routes are `auth: false` because core calls them server-to-server.

### Handler factory

```typescript
import { makeNotificationHandler } from '@countryconfig/api/notification/handler'
makeNotificationHandler('user-created')
```

The factory validates the payload against `TriggerPayload[event]` (a Zod schema from `@opencrvs/toolkit/notification`), then calls `sendUserNotification(event, payload)` which delegates to `notify()`.

### Adding a new user notification

1. Confirm the trigger event is part of `TriggerEvent` in `@opencrvs/toolkit/notification`. If not, the toolkit must be updated upstream first.
2. Add a route to [src/config/routes/userNotificationRoutes.ts](../../src/config/routes/userNotificationRoutes.ts) using `makeNotificationHandler('<event-name>')`.
3. Add an SMS template row to [src/translations/notification.csv](../../src/translations/notification.csv).
4. Add an email template under [src/api/notification/email-templates/other/](../../src/api/notification/email-templates/other/) and register it in [src/api/notification/email-templates/index.ts](../../src/api/notification/email-templates/index.ts) so `getTemplate(event)` resolves it.
5. Restart country-config to pick up the new route.

## SMS via Infobip

[src/api/notification/sms-service.ts](../../src/api/notification/sms-service.ts) `sendSMS()`:

1. Loads the template body for the recipient's locale from `notification.csv` (via `getLanguages()` from [src/api/content/service.ts](../../src/api/content/service.ts)).
2. Compiles with Handlebars against `variables`.
3. POSTs to `INFOBIP_GATEWAY_ENDPOINT` with `INFOBIP_API_KEY`, `INFOBIP_SENDER_ID`.

In `development`, logs the message instead of sending. In `test`, the entire transport is mocked via `vi.mock()` (see test files).

To switch to WhatsApp: set delivery method to `'sms'` and configure Infobip channels at the provider side — no code changes needed.

## Email via Nodemailer/SMTP

[src/api/notification/email-service.ts](../../src/api/notification/email-service.ts) `sendEmail()`:

1. Pre-interpolates `{DOMAIN}`, `{ALERT_EMAIL}`, `{SENDER_EMAIL_ADDRESS}` from constants (Handlebars).
2. **Skips any recipient ending in `@example.com`** — log line `Example email detected: ...`. This is how dev/qa avoid sending real mail.
3. Creates a Nodemailer SMTP transport per call (no pooling) using `SMTP_HOST/PORT/SECURE/USERNAME/PASSWORD`.
4. Sends with optional `bcc`.

The legacy `POST /email` route ([src/api/notification/handler.ts](../../src/api/notification/handler.ts) `emailHandler`) is **blocked in non-production** — it just logs the masked payload and returns 200 without sending. Verify `NODE_ENV=production` when sending real mail through this route.

## Testing

Test files use vitest with `vi.mock`:
- [src/api/notification/notification.informant.email.test.ts](../../src/api/notification/notification.informant.email.test.ts)
- [src/api/notification/notification.informant.sms.test.ts](../../src/api/notification/notification.informant.sms.test.ts)
- [src/api/notification/notification.user.email.test.ts](../../src/api/notification/notification.user.email.test.ts)
- [src/api/notification/notification.user.sms.test.ts](../../src/api/notification/notification.user.sms.test.ts)

Fixtures in [src/api/notification/testData.ts](../../src/api/notification/testData.ts). The pattern:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./email-service', () => ({ sendEmail: vi.fn() }))
vi.mock('./sms-service', () => ({ sendSMS: vi.fn(), InformantTemplateType: { ... } }))

beforeEach(() => { vi.clearAllMocks() })
```

When adding a new notification flow, add a matching test that asserts the right service is called with the right template + variables. Don't hit the network in tests.

## Anti-patterns

- **Sending real emails in dev/qa** — keep `@example.com` for test users; email-service silently drops them.
- **Calling `sendEmail`/`sendSMS` directly from outside `notification/`** — always go through `notify()` so delivery-method routing and failure logging are consistent.
- **Hardcoding template strings in code** — every body must come from `notification.csv` (SMS) or an HTML template file (email) for translatability.
- **Adding `@countryconfig/api/notification/...` imports inside `events/` form definitions** — keeps the boundary clean; notifications consume event data, not the other way around.
- **Mixing react-intl `{var}` syntax with Handlebars `{{var}}` in `notification.csv`** — these templates use Handlebars; the `{ }` syntax will be passed through verbatim.
- **Forgetting `auth: false` on `/triggers/user/*` routes** — core calls them server-to-server without a user token; JWT auth would reject them.
- **Returning anything other than 200/4xx from handlers** — core treats non-2xx as a delivery failure but doesn't retry; partial states make debugging hard.
