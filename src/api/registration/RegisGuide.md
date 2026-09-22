# OpenCRVS Registration Number Generation — Implementation Context

> Supply this file as context when implementing or adapting registration-number generation in another OpenCRVS country config. It documents the active Cook Islands flow, the framework hook that owns registration-number assignment, and the country-specific parts that must be replaced elsewhere.

---

## 1. Scope

This document covers the **current registration-number flow** used in this repo:

- The `REGISTER` action confirmation hook under `src/api/registration/`
- The custom Cook Islands generator in `src/api/registration/registrationNumber.ts`
- The route wiring in `src/index.ts`

This document does **not** describe the older bundle-based generator under `src/api/event-registration/` as the recommended pattern for new country configs. That older path still exists in this repo, but it is not the active flow to copy when documenting or implementing registration-number generation for current action-confirmation based registration.

---

## 2. Source Of Truth

If this document and code ever disagree, the code is authoritative:

- `src/index.ts` wires the active registration trigger route
- `src/api/registration/index.ts` owns the registration action confirmation flow
- `src/api/registration/registrationNumber.ts` owns the registration-number format and generation logic

---

## 3. Architecture Overview

OpenCRVS Core triggers country config when a registration action needs confirmation.
This country config responds synchronously with a `registrationNumber`, which causes the `REGISTER` action to be accepted.

### Active flow

```text
OpenCRVS Core requests registration confirmation
  ↓
POST /trigger/events/{event}/actions/REGISTER
  ↓
onRegisterHandler()                  src/api/registration/index.ts
  ↓
Fetch pending action + auth token
  ↓
Fetch all locations from Gateway API
  ↓
Resolve declared location from the first DECLARE action
  ↓
generateRegistrationNumber(event.type, registrationLocation, locations)
  ↓
sendInformantNotification(..., registrationNumber)
  ↓
Return HTTP 200 with { registrationNumber }
  ↓
OpenCRVS Core completes REGISTER action
```

### Route ownership

The active route is registered in `src/index.ts` by iterating over all event types and binding each event's `REGISTER` trigger to `onRegisterHandler()`.

This is the key framework seam for other country configs: if you want to customise registration-number creation at the point of legal registration, this route and handler contract are where to do it.

---

## 4. Route And Handler Contract

### Route

Country config exposes this registration trigger pattern:

```text
POST /trigger/events/{event}/actions/REGISTER
```

### Handler

The active handler is `onRegisterHandler()` in `src/api/registration/index.ts`.

It follows the OpenCRVS action-confirmation contract:

- `HTTP 200` accepts the action immediately
- `HTTP 400` rejects the action immediately
- `HTTP 202` defers the decision for asynchronous handling

For registration actions specifically, `HTTP 200` or async acceptance must include a payload with a `registrationNumber`.

### Required success payload

```typescript
return h.response({ registrationNumber }).code(200)
```

This response shape is reusable across country configs even when the format of the number itself changes.

---

## 5. End-To-End Runtime Flow

The current synchronous flow in `onRegisterHandler()` is:

1. Read the auth token from `request.auth.artifacts.token`
2. Read the event document from `request.payload`
3. Resolve the pending action with `getPendingAction(event.actions)`
4. Create a Gateway API client using `GATEWAY_URL`
5. Fetch all locations with `client.locations.list.query()`
6. Resolve the event's declared location using `getDeclaredLocation(event)`
7. Fall back to `action.createdAtLocation` if no DECLARE location is found
8. Find the location object in the fetched locations array
9. Generate the number with `generateRegistrationNumber(event.type, registrationLocation, locations)`
10. Send the informant notification with the generated number
11. Return `HTTP 200` with `{ registrationNumber }`

### Why declared location is used

The repo intentionally prefers the location from the first `DECLARE` action rather than only the current action location. That makes the registration number reflect where the event was originally declared, not only where the registration action was later completed.

This behavior is implemented by `getDeclaredLocation()` in `src/api/registration/index.ts`.

### Fallback behavior

If no `DECLARE` action is present, the handler falls back to `action.createdAtLocation`.

If no matching location can be resolved later in generation, the generator still returns a number by using its default island prefix.

---

## 6. Generator Contract

The active generator is `generateRegistrationNumber()` in `src/api/registration/registrationNumber.ts`:

```typescript
generateRegistrationNumber(eventType, location?, allLocations?)
```

Inputs:

- `eventType`: event type string from the event document
- `location`: the resolved location selected by the handler
- `allLocations`: the full location tree fetched from Gateway

Output:

- `Promise<string>` containing the final registration number

### Current Cook Islands format

```text
PREFEEYYYYRRRR
```

Where:

- `PREF`: 4-character island prefix
- `EE`: 2-character event code
- `YYYY`: 4-digit current year
- `RRRR`: 4-character uppercase alphanumeric suffix generated with `nanoid`

Example shape:

```text
PUKABR2026AB12
```

This repo does not currently use a sequential counter in the active flow.

---

## 7. How The Cook Islands Prefix Is Resolved

The most country-specific part of the implementation is the prefix lookup.

### Step 1: Load location source data

`loadLocations()` reads:

```text
src/data-seeding/locations/source/locations.csv
```

This CSV is treated as the source of truth for island lookup metadata.

### Step 2: Build lookup maps

The generator builds two maps:

- `islandPrefixMap`: `statisticsId` style code to prefix
- `islandNameMap`: lowercased location name to prefix

### Step 3: Fall back to hardcoded mapping

If CSV loading fails or yields no usable map entries, the generator falls back to `FALLBACK_ISLAND_PREFIX_MAP`.

That map is specific to Cook Islands `COK-XXX` administrative codes.

### Step 4: Walk up the location hierarchy

If a registration location is present, the generator tries to identify the correct island prefix by:

1. Checking `location.statisticsId` for a `COK-XXX` match
2. Checking `location.name` against the lowercased island-name map
3. Recursing to the parent location via `parentId`
4. Stopping after depth 10 to avoid an infinite loop

### Step 5: Use a hard default if no island is found

If all location lookups fail, the generator defaults to:

```text
PUKA
```

This ensures registration still succeeds, but it also means missing location data can silently produce a default prefix.

---

## 8. Event Type Mapping

The second country-specific piece is the event-code table.

Current mapping in `EVENT_TYPE_MAP`:

| Event | Code |
| --- | --- |
| Birth | `BR` |
| Death | `DR` |
| Stillbirth | `SB` |
| Marriage_Licence | `ML` |
| Marriage_Registration | `MR` |
| Marriage | `MR` |
| Divorce | `DV` |
| Adoption | `AD` |
| Name_Change | `DP` |
| TENNIS_CLUB_MEMBERSHIP | `TC` |

If no event match is found, the generator currently falls back to:

```text
AD
```

That fallback is implementation-specific and should be reviewed carefully if new event types are introduced.

---

## 9. Asynchronous Variant

`src/api/registration/index.ts` also includes an example async acceptance helper:

- `acceptRequestedRegistration()`

It uses the same location-resolution logic and the same generator, but instead of returning `HTTP 200` immediately, it later calls:

```typescript
client.event.actions.register.accept.mutate({
  ...action,
  transactionId: uuidv4(),
  eventId,
  actionId,
  registrationNumber
})
```

This is useful if another country config must consult an external service before final registration, while still using the same registration-number contract.

---

## 10. What Other Country Configs Can Reuse

The following patterns are reusable even if the numbering format is completely different:

- The `REGISTER` action-confirmation route pattern
- Returning `HTTP 200` with `{ registrationNumber }`
- The async acceptance pattern for delayed confirmation
- Resolving the original declaration location from event actions
- Fetching Gateway locations before building a location-aware number
- Treating the generator as a separate function with a stable contract

For a new country config, this repo is most useful as an example of **where** registration-number creation belongs in the request lifecycle.

---

## 11. What Other Country Configs Must Replace

The following logic is Cook Islands specific and should not be copied unchanged unless the target country has the same business rules:

- `COK-XXX` statistics code parsing
- The island-prefix table in `FALLBACK_ISLAND_PREFIX_MAP`
- The assumption that a 4-character geographic prefix is required
- The exact event-to-code mapping in `EVENT_TYPE_MAP`
- The default fallback prefix `PUKA`
- The decision to derive the year from the current server date
- The decision to use a 4-character random suffix

In practice, another country config will usually keep the handler contract and replace most of `registrationNumber.ts`.

---

## 12. Risks And Operational Notes

### Silent fallback can hide data issues

If location data is missing, malformed, or not linked correctly through parents, the generator still succeeds by falling back to `PUKA`.

That keeps registration available, but it may create incorrect numbers without blocking the workflow.

### CSV and Gateway data can diverge

The generator uses both:

- location data fetched from Gateway at runtime
- location source data loaded from the local CSV

If those two sources diverge in naming or structure, prefix resolution can become unreliable.

### Event fallback should be reviewed

Unknown event types currently fall back to `AD`. That may not be desirable in a stricter implementation.

### Notifications depend on the generated value

The synchronous handler sends `registrationNumber` into `sendInformantNotification()`, so downstream templates, certificates, or communications can reflect the final number immediately.

---

## 13. Legacy Path To Avoid For New Docs

This repo also contains an older registration-number path under:

```text
src/api/event-registration/
```

That path derives a registration number from the tracking ID and bundle payload. It is not the active flow documented here and should not be used as the primary example for current registration action-confirmation based implementations.

If you mention it at all in other docs, treat it as historical or alternative context only.

---

## 14. Implementation Checklist For Another Country Config

1. Register a `REGISTER` action-confirmation route for each event
2. Implement a handler equivalent to `onRegisterHandler()`
3. Decide whether generation is synchronous or asynchronous
4. Define the generator contract and response shape
5. Decide whether registration numbers depend on event type, date, geography, counters, or external systems
6. Replace Cook Islands specific prefix and event-code logic
7. Decide how to handle unknown locations and unknown event types
8. Confirm notifications and certificate templates read the same final field
9. Verify the number is stable at the moment of legal registration

---

## 15. Key Files

- `src/index.ts` — route registration for `REGISTER` action hooks
- `src/api/registration/index.ts` — active handler, declared-location resolution, async acceptance example
- `src/api/registration/registrationNumber.ts` — current generator implementation
- `src/api/action-confirmation.md` — framework contract for registration confirmation responses
- `src/api/event-registration/service.ts` — older bundle-based generator kept here only as non-target context

---

## 16. Maintenance Notes

- Treat `generateRegistrationNumber()` as the source of truth for the number format
- Update this document whenever prefix logic, event-code mapping, or route ownership changes
- If the repo standardises on a new action-confirmation pattern, update this document before reusing it in another country config
- Be cautious with generic statements in `src/api/action-confirmation.md`; that file explains the framework contract well, but its default-number description does not reflect the custom Cook Islands implementation in this repo