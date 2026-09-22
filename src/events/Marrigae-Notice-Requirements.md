# Marriage Notice Event Requirements

> Implementation handoff for reproducing the Cook Islands Marriage Licence
> event in another OpenCRVS country configuration under the name
> **Marriage Notice**.

## 1. Document Control

| Item | Value |
| --- | --- |
| Source country configuration | Cook Islands |
| Source package version | `@opencrvs/countryconfig` 1.9.12 |
| Source toolkit version | `@opencrvs/toolkit` 1.9.12 |
| Target toolkit version | 2.0.0 |
| Target event name | Marriage Notice |
| Target event ID | `marriage-notice` |
| Target registration code | `MN` |
| Target translation namespace | `event.marriageNotice.*` |
| Document status | Ready for target compatibility assessment |

## 2. Objective

The target country configuration shall provide a new Marriage Notice event
whose observable behavior matches the source Marriage Licence event. The only
approved semantic differences are:

1. The event is named **Marriage Notice** on every user-facing surface.
2. The technical event ID is `marriage-notice`.
3. The registration-number event code is `MN`.
4. Event-specific translation keys use `event.marriageNotice.*`.
5. Address defaults, administrative levels, location prefixes, roles, and
   languages are connected to the target country's existing configuration.
6. Toolkit 2.0.0 APIs may replace source APIs when they preserve the behavior
   specified in this document.

The target event is a distinct event type. It is not an alias for
`marriage-licence`, and this work does not migrate existing Marriage Licence
records.

## 3. Rules of Interpretation

- Executable source code is authoritative when comments, labels, or earlier
  planning notes disagree with it.
- Preserve declaration field IDs and values unless toolkit 2.0.0 makes a
  schema change mandatory. Any mandatory change must be recorded in the
  compatibility matrix.
- Replace both British and American variants of "Marriage Licence/License"
  when they refer to the event or its output.
- Do not copy Cook Islands location IDs, the `COK` country default, island
  prefix mappings, or role names into the target configuration.
- Do not silently correct source behavior. Record a proposed correction in
  Section 16 and obtain product approval first.

## 4. Toolkit 2.0.0 Compatibility Gate

Before implementing dependent requirements, the implementer shall complete
the following matrix against the target repository.

| Area | Source API or behavior | Target 2.0.0 mapping | Status |
| --- | --- | --- | --- |
| Event definition | `defineConfig` | To be assessed | Open |
| Declaration form | `defineDeclarationForm`, `defineFormPage` | To be assessed | Open |
| Actions | `ActionType` definitions | To be assessed | Open |
| Conditions | event and conditionals DSL | To be assessed | Open |
| Deduplication | `@opencrvs/toolkit/events/deduplication` | To be assessed | Open |
| Advanced search | `advancedSearch` on event config | To be assessed; source marks this API for removal | Open |
| Action hook | `getPendingAction`, `aggregateActionDeclarations` | To be assessed | Open |
| Registration hook | action-confirmation response with `registrationNumber` | To be assessed | Open |
| Certificate | SVG and Handlebars certificate registry | To be assessed | Open |
| Notifications | event action hooks and template registry | To be assessed | Open |
| Access control | event-qualified role scopes | To be assessed | Open |
| Workqueues | event filters in workqueue configuration | To be assessed | Open |
| Analytics | event config registration | To be assessed | Open |

The compatibility assessment is complete only when every row identifies the
target symbol/file and either confirms direct compatibility or specifies an
equivalent adaptation and test.

## 5. Identity and Registration

### MN-ID-001: Event identity

The target event shall use `marriage-notice` everywhere an event type is
stored, compared, routed, filtered, or authorized.

Suggested target naming:

| Purpose | Target value |
| --- | --- |
| Folder | `marriageNotice` |
| Event export | `marriageNoticeEvent` |
| Enum member | `Marriage_Notice` or target repository convention |
| Declaration export | `MARRIAGE_NOTICE_DECLARATION_FORM` |
| Review export | `MARRIAGE_NOTICE_DECLARATION_REVIEW` |
| Deduplication ID | `marriage-notice-deduplication` |

### MN-ID-002: Registration number

The registration-number generator shall map `marriage-notice` to `MN` while
retaining the target country's existing number format. If the target uses the
same format as the source, the result is:

```text
<location-prefix>MN<four-digit-year><four-random-alphanumeric-characters>
```

The location prefix shall come from the target configuration. The declared
location remains preferred over the location where registration is completed.

### MN-ID-003: Coexistence

Existing event types shall remain unchanged. No `marriage-licence` record,
route, permission, or persisted payload is renamed by this work.

## 6. Declaration Form

### MN-DECL-001: Page sequence

The declaration shall contain these pages in this order:

1. Notice of intended marriage details
2. Bridegroom details
3. Bride details
4. Informant details
5. Collect Marriage Notice fee
6. Supporting documents

The review page shall display the bridegroom and bride surnames and an optional
`review.comment` textarea.

### MN-DECL-002: Notice details

| Field ID | Type | Required | Behavior |
| --- | --- | --- | --- |
| `noticeOfIntendedMarriageDetails.dateOfNoticeLodgement` | Date | Yes | Analytics enabled; defaults to now; future dates invalid |
| `noticeOfIntendedMarriageDetails.expiryDate` | Date | No | Analytics enabled; uncorrectable; hidden until populated; calculated by the server |
| `noticeOfIntendedMarriageDetails.dateOfMarriage` | Date | Yes | Analytics enabled; strictly after lodgement and no more than 90 days after lodgement |
| `noticeOfIntendedMarriageDetails.placeOfMarriage` | Address | Yes | Analytics enabled; valid administrative leaf and target street-address validation |
| `noticeOfIntendedMarriageDetails.venueName` | Text | Yes | Analytics enabled |
| `noticeOfIntendedMarriageDetails.officiantType` | Select | Yes | `MINISTER`, `MARRIAGE_CELEBRANT`, or `REGISTRAR` |
| `noticeOfIntendedMarriageDetails.denomination` | Select | No | Shown for `MINISTER`; preserve source denomination values |
| `noticeOfIntendedMarriageDetails.officiatingMinister` | Select | No | Shown after a minister denomination is selected; preserve source options |
| `noticeOfIntendedMarriageDetails.marriageCelebrant` | Select | Yes when shown | Shown for `MARRIAGE_CELEBRANT`; preserve source options |
| `noticeOfIntendedMarriageDetails.registrar` | Select | No | Shown for `REGISTRAR`; bind to target officiant/registrar options |
| `noticeOfIntendedMarriageDetails.location` | Text | No | Analytics enabled; shown after any officiant type is selected |

The address field shall use the target country code, administrative hierarchy,
street-address configuration, and primary-office default. It shall not retain
the source `COK` default.

### MN-DECL-003: Bridegroom details

| Field ID | Required | Behavior |
| --- | --- | --- |
| `brideGroom.name` | Yes | Given names and surname required; source maximum name length and invalid-name validator |
| `brideGroom.dob` | Yes | Before today and at least `16 * 365` days in the past; analytics enabled |
| `brideGroom.placeOfBirth` | Yes | Free text; analytics enabled |
| `brideGroom.occupation` | Yes | Free text; analytics enabled |
| `brideGroom.conjugalStatus` | Yes | `BACHELOR`, `DIVORCED`, or `WIDOWER`; analytics enabled |
| `brideGroom.dateDecreeAbsolute` | Yes when shown | Shown for `DIVORCED`; must be before today |
| `brideGroom.dateDeathFormerWife` | Yes when shown | Shown for `WIDOWER`; must be before today |
| `brideGroom.address` | Yes | Target-country address; valid administrative leaf; analytics enabled |
| `brideGroom.fatherFullName` | No | Free text |
| `brideGroom.fatherOccupation` | No | Free text; analytics enabled |
| `brideGroom.motherFullName` | No | Free text |
| `brideGroom.motherMaidenSurname` | No | Free text |
| `brideGroom.motherOccupation` | No | Free text; analytics enabled |

Presentation-only headings and dividers shall match the source ordering.

### MN-DECL-004: Bride details

| Field ID | Required | Behavior |
| --- | --- | --- |
| `bride.name` | Yes | Given names and surname required; source maximum name length and invalid-name validator |
| `bride.dob` | Yes | Before today and at least `16 * 365` days in the past; analytics enabled |
| `bride.placeOfBirth` | Yes | Free text; analytics enabled |
| `bride.occupation` | Yes | Free text; analytics enabled |
| `bride.conjugalStatus` | Yes | `SPINSTER`, `DIVORCED`, or `WIDOW`; analytics enabled |
| `bride.dateOfDecreeAbsolute` | Yes when shown | Shown for `DIVORCED`; must be before today |
| `bride.dateOfDeathOfFormerHusband` | Yes when shown | Shown for `WIDOW`; must be before today |
| `bride.address` | Yes | Target-country address; valid administrative leaf; analytics enabled |
| `bride.fatherName` | No | Free text |
| `bride.fatherOccupation` | No | Free text; analytics enabled |
| `bride.motherName` | No | Free text |
| `bride.motherMaidenSurname` | No | Free text |
| `bride.motherOccupation` | No | Free text; analytics enabled |

### MN-DECL-005: Informant details

The source event's active page contains a point-of-contact heading and these
two optional fields:

| Field ID | Type | Required | Behavior |
| --- | --- | --- | --- |
| `informantDetails.phoneNumber` | Phone | No | Analytics enabled; empty or exactly five digits matching `^[0-9][0-9]{4}$` |
| `informantDetails.email` | Email | No | Analytics enabled; toolkit email validation |

Unused informant-type, identity, and address imports/helpers in the source file
are not requirements and shall not be ported as functional fields.

### MN-PAY-001: Fees and collection

The page shall display a base **Marriage Notice Fee $100**. When the marriage
date is after lodgement but within the source three-day condition, it shall
also display **3-day waiting period waiver Fee $75**.

| Field ID | Type | Required | Behavior |
| --- | --- | --- | --- |
| `collector.feeWaived` | Checkbox | No | Analytics enabled; marks fee waived/not collected |
| `collector.amountCollected` | Number | No | Analytics enabled; `$` prefix |
| `collector.receiptNumber` | Text | No | Analytics enabled; shown when `feeWaived` is explicitly false |
| `collector.waiverReason` | Textarea | No | Analytics enabled; shown when `feeWaived` is true |

### MN-DOC-001: Supporting documents

All uploads use the target repository's equivalent of the source default file
configuration. The source marks every upload optional.

| Field ID | Options | Visibility |
| --- | --- | --- |
| `documents.proofOfBridegroomIdentity` | `PASSPORT`, `BIRTH_CERTIFICATE`, `OTHER` | Always |
| `documents.proofOfBrideIdentity` | `PASSPORT`, `BIRTH_CERTIFICATE`, `OTHER` | Always |
| `documents.intentionAndCapacityToMarry` | `NOTICE_OF_INTENDED_MARRIAGE`, `STATUTORY_DECLARATION`, `CONSENT_PARENTS_BRIDEGROOM`, `CONSENT_PARENTS_BRIDE` | Always |
| `documents.bridegroomProofOfDissolution` | `DIVORCE_CERTIFICATE`, `OTHER` | Bridegroom is `DIVORCED` |
| `documents.brideProofOfDissolution` | `DIVORCE_CERTIFICATE`, `OTHER` | Bride is `DIVORCED` |
| `documents.bridegroomProofOfDeathFormerSpouse` | `DEATH_CERTIFICATE_FORMER_SPOUSE`, `OTHER` | Bridegroom is `WIDOWER` |
| `documents.brideProofOfDeathFormerSpouse` | `DEATH_CERTIFICATE_FORMER_SPOUSE`, `OTHER` | Bride is `WIDOW` |
| `documents.bridegroomParentalConsent` | `PARENTAL_CONSENT_FORM`, `COURT_ORDER`, `OTHER` | Source age condition for 16 to 21 years |
| `documents.brideParentalConsent` | `PARENTAL_CONSENT_FORM`, `COURT_ORDER`, `OTHER` | Source age condition for 16 to 21 years |
| `documents.waiverOfThreeDayNotice` | `WAIVER_AUTHORIZATION`, `OTHER` | Marriage date is after lodgement and less than three days in the future relative to the current date |

## 7. Summary and Actions

### MN-WF-001: Record title and summary

The record title shall use Marriage Notice wording and the bridegroom/bride
surnames. The summary shall preserve the source fields for marriage date,
place, informant contact, and correction metadata, including empty-value
messages.

### MN-WF-002: Actions

The target shall expose behaviorally equivalent actions:

| Action | Required behavior |
| --- | --- |
| `READ` | Uses the declaration review |
| `DECLARE` | Uses review and runs duplicate detection |
| `VALIDATE` | Uses review and runs duplicate detection |
| `REGISTER` | Uses review, runs duplicate detection, and requests registration number |
| `PRINT_CERTIFICATE` | Runs the certificate collector form before printing |
| `REQUEST_CORRECTION` | Runs the correction request form |

Toolkit 2.0.0 may express the lifecycle differently, but the available user
operations, review data, and resulting legal states shall be equivalent.

## 8. Expiry Processing

### MN-EXP-001: Calculation

For event type `marriage-notice`, the action hook shall calculate:

```text
expiryDate = dateOfNoticeLodgement + 90 calendar days
```

The result is written to
`noticeOfIntendedMarriageDetails.expiryDate`. The hook shall:

- run for initial declarations, corrections, and other source-equivalent
  actions;
- aggregate accepted declarations before processing an approved correction;
- preserve source behavior for absent or invalid lodgement dates; and
- leave every other event type unchanged.

## 9. Duplicate Detection and Search

### MN-DEDUP-001: Duplicate query

Preserve the source query exactly unless product approves a correction:

1. Fuzzy match `bride.name`.
2. Fuzzy match `brideGroom.name`.
3. Match `bride.dob` within either 5 days or 1,095 days.
4. Match `brideGroom.dob` within either 5 days or 1,095 days.
5. Combine those four criteria as the standard duplicate check.
6. OR the standard check with the same criteria plus marriage date within 90
   days.

The second OR branch is logically narrower than the first in the source and
therefore does not currently change the result. This is recorded in Section 16
and shall not be redesigned during parity implementation.

### MN-SEARCH-001: Advanced search

Provide target 2.0.0 equivalents for the source search groups:

- Registration details: status and registration dates
- Event details: marriage date range, fuzzy place, and fuzzy venue
- Bridegroom details: fuzzy name and date-of-birth range
- Bride details: fuzzy name and date-of-birth range

## 10. Correction and Printing

### MN-CORR-001: Correction flow

Preserve the source five-page correction flow:

1. Correction request and reason
2. Requester details when the requester is someone else
3. Requester identity verification with verify/cancel outcomes
4. Supporting proof-of-identity documents
5. Correction payment collection

Correction approval shall use the aggregated declaration and recalculate the
notice expiry date.

### MN-PRINT-001: Collector flow

Preserve the source three-page print flow:

1. Select the collector
2. Capture name and identity details for another collector
3. Verify collector identity before printing

## 11. Certificate

### MN-CERT-001: Certificate registration

Register the Marriage Notice certificate against `marriage-notice`. Preserve
the source SVG layout, fonts, normal-copy behavior, certified-copy behavior,
collector flow, declaration values, legal-status metadata, registrar details,
and print date.

All visible event/output labels shall say Marriage Notice. Before accepting the
template, compare every Handlebars lookup with the aggregated toolkit 2.0.0
declaration shape; the source template and form currently use potentially
different marriage field paths.

## 12. Notifications

### MN-NOTIFY-001: Informant messages

Preserve source-equivalent in-progress and issued email/SMS triggers,
recipients, delivery selection, and failure handling. Templates shall receive
the bride and bridegroom names, marriage date/place/venue, notice lodgement
date, expiry date, informant contacts, and registration number where relevant.

Rename template files/types where practical and replace all visible Licence or
License wording with Marriage Notice. Subjects shall communicate that the
notice was received and, at the source-equivalent issued stage, is ready for
the relevant collection workflow.

## 13. Access, Workqueues, and Analytics

### MN-ACCESS-001: Permissions

Grant event-qualified create, declare, validate, approve/register, print,
certified-copy, and correction capabilities to the target roles that perform
the equivalent source responsibilities. Use target role IDs, not Cook Islands
role IDs.

### MN-QUEUE-001: Workqueues

Include `marriage-notice` in target equivalents of assigned, recently
registered, requires updates, sent for approval, ready to print, and registered
marriages reporting queues where those queues exist.

### MN-ANALYTICS-001: Analytics

Register the event with the target analytics resolver and preserve analytics
flags on declaration fields. Reports that group registered marriages shall
include the new event when equivalent Marriage Licence records are included in
the source.

## 14. Internationalization

### MN-I18N-001: Translation migration

Create `event.marriageNotice.*` keys corresponding to every event-specific
`event.marriageLicense.*` key. Create an aligned Marriage Notice namespace for
certificate keys. Shared translation keys may remain shared.

The translation inventory shall cover event labels, forms, fields, options,
validation errors, review and summary messages, corrections, collector flow,
fees, documents, search, actions, notifications, certificates, workqueues, and
reports in every target language.

Acceptance requires a repository scan proving that no user-facing Marriage
Licence or Marriage License text remains in the target event.

## 15. Verification and Acceptance

### Automated checks

The implementation shall pass the target repository's formatting, lint,
TypeScript compilation, and complete test suite. Add focused tests for:

- event discovery as `marriage-notice`;
- lodgement date future validation;
- marriage date strictly after lodgement and at most 90 days later;
- age exactly 16 and under 16 for each party;
- divorced and widowed conditional dates;
- five-digit and empty informant phone values;
- three-day fee condition on both sides of the boundary;
- every conditional document branch;
- 90-day expiry, month/year rollover, missing date, and correction approval;
- duplicate and non-duplicate records under the source thresholds;
- advanced search groups and matching modes;
- `MN` registration-number routing and target location prefixes;
- each action transition and role authorization;
- workqueue/report inclusion;
- each correction requester and certificate collector branch;
- notification selection and template variables; and
- normal and certified-copy certificate generation.

### Parity walkthrough

Run the same representative declaration fixtures through the source and target
events. Outcomes may differ only in event identity, visible name, registration
code, translation keys, target location data, and documented toolkit 2.0.0
transport/schema adaptations.

### Sign-off checklist

- [ ] Toolkit 2.0.0 compatibility matrix completed
- [ ] Product owner confirms behavioral parity and approved naming differences
- [ ] Technical owner confirms every requirement has a target code reference
- [ ] All focused and repository tests pass, or unrelated failures are recorded
- [ ] Every supported language has been visually reviewed
- [ ] Declaration, review, correction, and print workflows have been exercised
- [ ] Normal and certified-copy documents have been rendered and inspected
- [ ] No unintended Licence/License wording remains
- [ ] Registration numbers contain `MN` and target-country prefixes
- [ ] Permissions, workqueues, search, analytics, and notifications are verified

## 16. Source Discrepancies Requiring Explicit Approval

These are source behaviors, not permission to change the target behavior:

| ID | Source behavior | Required handling |
| --- | --- | --- |
| `MN-DISC-001` | Marriage date is capped at 90 days, although an earlier planning summary stated 18 months | Preserve the executable 90-day rule |
| `MN-DISC-002` | Expiry help text says three months while the service adds exactly 90 days | Preserve 90 calendar days; update Marriage Notice wording only |
| `MN-DISC-003` | Minimum age uses `16 * 365` days rather than calendar-year arithmetic | Preserve unless product approves a legal-rule correction |
| `MN-DISC-004` | Parental-consent visibility uses day-based age calculations | Preserve source expression through a behaviorally equivalent v2 API |
| `MN-DISC-005` | Informant type helpers exist but the active page only renders phone and email | Port only the active phone/email fields |
| `MN-DISC-006` | Deduplication's expiry branch is narrower than and absorbed by the standard branch | Preserve for parity; redesign separately if approved |
| `MN-DISC-007` | Some source labels/descriptions contain spelling or naming inconsistencies | Correct spelling and Marriage Notice wording without changing field behavior |
| `MN-DISC-008` | Certificate lookups may not match declaration field paths | Audit and use paths that render the source-intended values in v2.0.0 |
| `MN-DISC-009` | Fee visibility compares marriage date with lodgement, while waiver-upload visibility also compares marriage date with the current date | Preserve each executable condition independently; align them only with product approval |

## 17. Source-to-Target Traceability

Complete the Target reference and Status columns during implementation.

| Requirement | Source reference | Target reference | Status |
| --- | --- | --- | --- |
| Identity and actions | `src/form/types/types.ts`; `src/form/v2/marriageLicense/index.ts` | TBD | Open |
| Declaration sequence/review | `src/form/v2/marriageLicense/forms/declaration.ts` | TBD | Open |
| Notice details | `src/form/v2/marriageLicense/forms/pages/noticeDetails.ts` | TBD | Open |
| Bridegroom details | `src/form/v2/marriageLicense/forms/pages/bridegroom.ts` | TBD | Open |
| Bride details | `src/form/v2/marriageLicense/forms/pages/bride.ts` | TBD | Open |
| Informant details | `src/form/v2/marriageLicense/forms/pages/informant.ts` | TBD | Open |
| Fees | `src/form/v2/marriageLicense/forms/pages/collect.ts` | TBD | Open |
| Documents | `src/form/v2/marriageLicense/forms/pages/documents.ts` | TBD | Open |
| Option sets | `src/form/v2/marriageLicense/forms/options.ts` | TBD | Open |
| Correction | `src/form/v2/marriageLicense/forms/correctionForm/` | TBD | Open |
| Print/collector | `src/form/v2/marriageLicense/forms/printForm/` | TBD | Open |
| Advanced search | `src/form/v2/marriageLicense/advancedSearch.ts` | TBD | Open |
| Deduplication | `src/form/v2/marriageLicense/dedupConfig.ts` | TBD | Open |
| Expiry hook | `src/api/custom-event/handler.ts`; `src/api/custom-event/expiry-date-service.ts` | TBD | Open |
| Registration number | `src/api/registration/`; `REGISTRATION_NUMBER_CONTEXT.md` | TBD | Open |
| Certificate | `src/api/certificates/handler.ts`; `src/api/certificates/source/v2.marriage-certificate.svg`; `src/api/certificates/source/marriage-certificate-certified-copy.svg` | TBD | Open |
| Notifications | `src/api/notification/`; `EMAIL_NOTIFICATION_CONTEXT.md` | TBD | Open |
| Roles | `src/data-seeding/roles/roles.ts` | TBD | Open |
| Workqueues | `src/api/workqueue/workqueueConfig.ts` | TBD | Open |
| Analytics | `src/analytics/analytics.ts` | TBD | Open |
| Translations | `src/translations/client.csv` | TBD | Open |

## 18. Exclusions

- Migration or renaming of existing `marriage-licence` records
- Copying Cook Islands location data or role IDs
- Changing legal ages, expiry periods, waiting periods, fees, document rules,
  or deduplication sensitivity without separate approval
- Refactoring unrelated shared forms, validators, APIs, or templates
- Redesigning source behavior solely because toolkit 2.0.0 offers a different
  implementation pattern