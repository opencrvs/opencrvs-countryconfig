# Changelog

## 1.7.0 Release candidate

### Bug fixes

- Protect individual certificate endpoint with token
- Kibana disk space alerts now work regardless of your disk device names. Alerts listen devices mounted both to `/` and `/data` (encrypted data partition)
- "Publish release" pipeline now correctly uses the "Branch to build from" value as the branch to be tagged. Previously it tried tagging "master". "Release tag" is also now used as the release version as is instead of it being read from `package.json`.

### Breaking changes

- **Title** Description

### Improvements

- Auth token, ip address, remote address, mobile number, email redacted/masked from server log

### Infrastructure breaking changes

- **Title** Description

### New features

- **Major new feature** Description
- Misc new feature

### New content keys requiring translation

```
INSERT CSV ROWS IN ENGLISH ONLY
```

## Bug fixes

- TBC

## 1.6.0 Release candidate

### Breaking changes

- **Gateways searchEvents API updated** `operationHistories` only returns `operationType` & `operatedOn` due to the other fields being unused in OpenCRVS
- **Config changes to review/preview and signatures** Core used to provide review/preview section by default which are now removed and need to be provided from countryconfig. The signature field definitions (e.g. informant signature, bride signature etc.) were hard coded in core which also have now been removed. The signatures can now be added through the review/preview sections defined in countryconfig just like any other field. You can use the following section definition as the default which is without any additional fields. We highly recommend checking out our reference country repository which has the signature fields in it's review/preview sections

```
{
  id: 'preview',
  viewType: 'preview',
  name: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  title: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  groups: [
    {
      id: 'preview-view-group',
      fields: []
    }
  ]
}
```

- Remove `splitView` option from DOCUMENT_UPLOADER_WITH_OPTION field
- New required sections preview & review added. Signature field definitions are now part of these two sections same as normal form fields.
- Remove `inputFieldWidth` from Number type form field
- Application config file is renamed to `application-config.ts`
- Allow configuring the default search criteria for record search which can be done by adding or modifying a property named `SEARCH_DEFAULT_CRITERIA` in `application-config.ts`
  Value of `SEARCH_DEFAULT_CRITERIA` can be one of the following
  1. 'TRACKING_ID',
  2. 'REGISTRATION_NUMBER',
  3. 'NATIONAL_ID',
  4. 'NAME',
  5. 'PHONE_NUMBER',
  6. 'EMAIL'
- Updated `allowedFileFormats` in signature fields to use MIME types (`image/png`, `image/jpg`, `image/jpeg`, `image/svg`) instead of simple file extensions. If you are already using the `allowedFileFormats` field in your implementation, please ensure to update the format accordingly.

### New features

- Certificate handlebar for registration fees `registrationFees` [#6817](https://github.com/opencrvs/opencrvs-core/issues/6817)
- Logged in user details handlebar `loggedInUser` [#6529](https://github.com/opencrvs/opencrvs-core/issues/6529)
- Supporting document fields can now be made required
- If there is only one option in the document uploader select, then it stays hidden and only the upload button is showed with the only option being selected by default
- The select options in DOCUMENT_UPLOADER_WITH_OPTION field can now be hidden using the new `optionCondition` property. It works similarly to the same property available in SELECT_WITH_OPTIONS field

* **ElasticSearch reindexing**

Allows reindexing ElasticSearch via a new search-service endpoint `reindex`. We're replacing the original `ocrvs` index with timestamped ones. This is done automatically when upgrading and migrating, but this is an important architectural change that should be noted. More details in [#7033](https://github.com/opencrvs/opencrvs-core/pull/7033).

- Introduce a new certificate handlebar "preview" which can be used to conditionally render some svg element when previewing the certificate e.g. background image similar to security paper

### New content keys requiring translation

```
INSERT CSV ROWS IN ENGLISH ONLY
```

## Bug fixes

- Github pipeline dedicated for reading secrets and variables from other environments now checks if GH_TOKEN is still valid before attempting other operations
- Remove unnecessary UI dividers that add in various sections of the declaration forms(e.g the Death, Birth and Marriage forms) [#244](https://github.com/opencrvs/opencrvs-countryconfig/pull/244)

## 1.5.0 (https://github.com/opencrvs/opencrvs-countryconfig/compare/v1.4.1...v1.5.0)

### Breaking changes

- **Removed dependency on OpenHIM.**&#x20;

  The performance of OpenHIM added an unexpected burden of 200 m/s to every interaction. Cumulatively, this was negatively affecting user experience and therefore we decided to deprecate it.&#x20;

  &#x20;Interested implementers are free to re-introduce OpenHIM should they wish to use it as an interoperability layer without affecting the performance of OpenCRVS now that our architecture no longer depends on it.

  The OpenHIM database is kept for backwards compatibility reasons and will be removed in v1.6. [OpenHIM](https://openhim.org/) is an Open Source middleware component designed for managing FHIR interoperability between disparate systems as part of the OpenHIE architectural specification. We had been using this component in a much more fundamental way to monitor microservice comms in a similar fashion to Amazon SQS. &#x20;

- **Upgrade node version to 18**

  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16

  - Use nvm to upgrade your local development environment to use node version `18.19.x.`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts and Vite run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

- **Update the certificate preview mechanism** In effort of minimizing JavaScript-bundle size, we have streamlined the way how review certificate -page renders certificates. In case the images in your certificates are previewing blurry, you need to update your SVG-certificates to print QR-codes and other images directly with `<image width="36" height="36" xlink:href="{{qrCode}}" x="500" y="770"></image>` instead of the more complicated `<rect fill="url(#pattern)"></rect>` -paradigm. This doesn't affect printed certificates as they are still created as previously.
- **Generate default address according to logged-in user's location** We have dropped support for the 'agentDefault' prop which was used as initial value for SELECT_WITH_DYNAMIC_OPTIONS fields. If you have not made any changes to address generation, then this should not affect you. If you have, you can refer to this PR to see how agentDefault has been deprecated in an example country: [https://github.com/opencrvs/opencrvs-farajaland/pull/978](https://github.com/opencrvs/opencrvs-farajaland/pull/978)
- **Remove system admin UI items: Application, User roles** We have now moved to configuring these items away from the UI in favour of directly editing these from country configuration repository in code - specifically in application-config-default.ts.
- **Set Metabase default credentials.** These must be configured via countryconfig repository environment variables and secrets otherwise the dashboard service won't start
- **Check your Metabase map file.** For Metabase configuration, we renamed `farajaland-map.geojson` to `map.geojson` to not tie implementations into example country naming conventions.
- **Feature flags** In order to make application config settings more readable, we re-organised `src/api/application/application-config-default.ts` with a clear feature flag block like so. These are then used across the front and back end of the application to control configurable functionality. New feature flags DEATH_REGISTRATION allow you to optionally run off death registration if your country doesnt want to run its first pilot including death and PRINT_DECLARATION (see New Features) have been added.
  `FEATURES: {
  DEATH_REGISTRATION: true,
  MARRIAGE_REGISTRATION: false,
  ...
} `
- **Improve rendering of addresses in review page where addresses match** When entering father's address details, some countries make use of a checkbox which says "Address is the same as the mothers. " which, when selected, makes the mother's address and fathers address the same. The checkbox has a programatic value of "Yes" or "No". As a result on the review page, the value "Yes" was displayed which didn't make grammatical sense as a response. We decided to use a custom label: "Same as mother's", which is what was asked on the form. This requires some code changes in the src/form/addresses/index.ts file to pull in the `hideInPreview` prop which will hide the value "Yes" on the review page and replace with a content managed label. Associated bug [#5086](https://github.com/opencrvs/opencrvs-core/issues/5086)

### Infrastructure breaking changes

More improvements have been made to the infrastructure provisioning and Github environment creation scripts and documentation. The complexity is somewhat reduced.

- **We removed the example Wireguard VPN set up as it was confusing.** Our intention was to ensure that all implementers were aware that OpenCRVS should be installed behind a VPN and used Wireguard as an example. But the configuration requirements for Wireguard confused implementers who are not using it. Therefore we decided to remove Wireguard as an example. &#x20;
- **We now have a "backup" Github environment and the backup server is automatically provisioned.** We moved the inventory file location to an explicit directory and removed parameters to scripts that can be automated. To migrate, move all inventory files (qa.yml, production.yml, staging.yml from `infrastructure/server-setup` to `infrastructure/server-setup/inventory` and configure `infrastructure/server-setup/inventory/backup.yml`. Run environment creator for your backup server `yarn environment:init --environment=backup`
- **You can configure the file path on the backup server where backups are stored.** We can also allow using staging to both periodically restore a production backup and also give it the capability if required to backup it's own data to a different location using `backup_server_remote_target_directory` and `backup_server_remote_source_directory` Ansible variables. This use case is mostly meant for OpenCRVS team internal use.
- **We now automate SSH key exchange between application and backup server.** For staging servers, automatically fetch production backup encryption key if periodic restore is enabled using `ansible_ssh_private_key_file` Ansible variables. Therefore documentation is simplified for a new server set-up.
- **In infrastructure Github workflows: SSH_PORT is new and required allowing you the ability to use a non-standard SSH port.** This Github Action environment variable must be added.
- **In infrastructure Github workflows: SSH_HOST** should be moved from being a Github Action environment secret to a Github Action environment variable before it is deprecated in 1.7.0
- **No longer an assumption made that production server Docker replicas and Mongo replica-sets are necessary.** In our Docker Compose files, we had originally assumed that a production deployment would always be deployed on a cluster to enable load balancing. We applied a [Mongo replica set](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L170C3-L201C19) by default on production and set [replicas: 2](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L124) on each microservice. However after experience in multiple countries running small scale pilots, a production deployment usually starts off as 1 server node and then scales into a cluster over time in order to save costs and resources. Therefore these replicas are a waste of resources. So you will notice that this has been deleted. You can always manually add your desired replicas back into you Docker Compose configuration if you want. In Docker Compose files, search for REPLICAS and update accordingly as well as attending to the linked examples.

Follow the descriptions in the migration notes to re-provision all servers safely.

### New features

- Introduced rate limiting to routes that could potentially be bruteforced or extracted PII from.
- The login and client application loading experience has improved. A loading bar appears before the javaScript bundle has loaded and this transitions when fetching records.&#x20;
- Development time logs are now much tidier and errors easier to point out. Production logging will still remain as is.&#x20;
- Masked emails and phone numbers from notification logs.
- Support for landscape certificate templates.
- Allow defining maxLength attribute for number type fields.
- A new certificate handlebar for registration fees has been added `registrationFees`
- A new certificate handlebar for logged-in user details has been added `loggedInUser`&#x20;
- Add support for image compression configuration. Two new properties to this form field are available: `DOCUMENT_UPLOADER_WITH_OPTION`
  - `compressImagesToSizeMB` : An optional prop of number type to define a compressed size. Compression is ignored when the input file is already smaller or equal of the given value or a falsy given value.
  - `maxSizeMB`: An optional validation prop to prevent input of a file bigger than a defined value.
- If a country doesnt wish to use Sentry for logging errors, the SENTRY_DSN variable is now optional and the LogRocket option has been deprecated due to lack of demand.
- Given that upon an upgrade between versions of OpenCRVS, that users cache is cleared, it is important to inform staff to submit any draft applications before the upgrade date. We introduced an "Email all users" feature so that National System Admins can send all staff messages. This feature can be used for any other all staff comms that are deemed required.

<figure><img src="../../.gitbook/assets/Screenshot 2024-06-25 at 17.12.54.png" alt=""><figcaption></figcaption></figure>

- Included an endpoint for serving individual certificates in development mode. This improves the developer experience when configuring certificates.
- Removed logrocket refrences.
- Enable gzip compression in client & login
- Use docker compose v2 in github workflows
- Added SMTP environment variables into the qa compose file to enable QA of SMTP servers.
- In the certificate, the 'Place of Certification' now accurately reflects the correct location.
- Groom's and Bride's name, printIssue translation variables updated [#124](https://github.com/opencrvs/opencrvs-countryconfig/pull/124)
- Change condition of Number of previous births
- Add query mapper for International Postal Code field
- Provide env variables for metabase admin credentials
- Remove 'Other' dropdown when informant is mother or father [#7011](https://github.com/opencrvs/opencrvs-core/issues/7011)
- Hide same as other primary address field if the other person's details not available [#7000](https://github.com/opencrvs/opencrvs-core/issues/7000)
- Improved formatting of informant name for inProgress declaration emails
- There is now an option to print the review page of an event declaration form. The PRINT_DECLARATION feature flag in application config settings can enable this on or off.

### New content keys requiring translation

```
advancedSearch.form.recordStatusCorrectionRequested,Option for form field: status of record,Correction requested
config.emailAllUsers.modal.supportingCopy,Label for send email all users confirmation supporting copy,User will receive emails over the next 24 hours
config.emailAllUsers.modal.title,Label for send email all users confirmation title,Send email to all users?
config.emailAllUsers.subtitle,Subtitle for email all users,This email will be sent to all users you are active. Emails will be sent over the next 24 hours. Only one email can be sent per day
config.emailAllUsers.title,Title for email all users,Email all users
config.userRoles.language,Language name,"{language, select, en {English} fr {French} other {{language}}}"
constants.emailBody,Label for email body input,Message
constants.emailSubject,Label for email subject input,Subject
correction.correctionForApprovalDialog.actions.cancel,The cancel button for the dialog when record correction sent by registration agent for approval,Cancel
correction.correctionForApprovalDialog.actions.send,The send button for the dialog when record correction sent by registration agent for approval,Confirm
correction.correctionForApprovalDialog.description,The description for the dialog when record correction sent by registration agent for approval,The Registrar will be notified of this correction request and a record of this request will be recorded
correction.correctionForApprovalDialog.title,The title for the dialog when record correction sent by registration agent for approval,Send record correction for approval ?
correction.correctRecordDialog.description,The description for the dialog when record correction sent by a registrar,The informant will be notified of this correction and a record of this decision will be recorded
correction.correctRecordDialog.title,The title for the dialog when record correction sent by a registrar,Correct record ?
correction.summary.office,Office where certificate correction summary was submitted,Office
correction.summary.requestedOn,Date when certificate correction summary was submitted,Requested on
correction.summary.submitter,Submitter of certificate correction summary,Submitter
form.customField.label.numberOfDependants,,No. of dependants
form.customField.label.reasonForLateRegistrationBirth,,Reason for delayed registration
form.customField.label.reasonForLateRegistrationDeath,,Reason for late registration
form.field.helpertext.nid,Helper text for nid input field,The National ID can only be numeric and must be 10 digits long
form.field.label.addressLine1RuralOption,,Village
form.field.label.addressLine1UrbanOption,,Residential Area
form.field.label.addressLine2UrbanOption,,Street
form.field.label.app.certifyRecordTo.bride,,Print and issue to bride
form.field.label.app.certifyRecordTo.groom,,Print and issue to groom
form.field.label.attendantAtBirthLayperson,,Layperson
form.field.label.cityUrbanOption,Label for City,Town
form.field.label.empty,empty string,
form.field.label.informantsRelationWithChild,,Relationship to child
form.field.label.maritalStatusSeparated,,Separated
form.field.label.relationOtherFamilyMember,Label for other family member relation,Other family member
form.field.label.totalFees,Label for input Reason for Change,
form.field.nidVerificationOngoing,Label for indicating offline status for the user. NID verification is not currently available offline.,National ID authentication is currently not available offline.
form.section.deceased.relationship,,Relationship to deceased
form.section.witnessOne.name,Form section name for Witness one,Witness 1
form.section.witnessTwo.name,Form section name for Witness two,Witness 2
home.header.placeHolderId,,Search for an ID
misc.notif.emailAllUsersError,Label for Email all users error toast,Only one email can be sent per day
misc.notif.emailAllUsersSuccess,Label for Email all users success toast,Email sent to all users
navigation.emailAllUsers,Email all users label in navigation,Email all users
number.twelve,Minimum length password,12
phone.digit,,10
phone.start,Should starts with,0(4|5)
recordAudit.regAction.markedAsNotDuplicate,Marked not a duplicate status message for record audit,Marked not a duplicate
recordAudit.regAction.verified,Verified action,Certificate verified
recordAudit.regStatus.correctionRequested,Label for when someone requested correction,Correction requested
regHome.outbox.failed,Label for declaration status failed,Failed to send
regHome.outbox.retry,Label for Retry button in Outbox shown for records that failed to send,Retry
register.form.modal.desc.saveCorrectionConfirm,Description for save correction confirmation modal,The declarant will be notified of this correction and a record of this decision will be recorded
register.form.modal.desc.saveCorrectionReject,Description for reject correction modal,The declarant will be notified of this decision and a record of this decision will be recorded
register.form.modal.title.saveCorrectionConfirm,Title for save correction confirmation modal,Approve correction?
register.form.modal.title.saveCorrectionReject,Title for reject correction modal,Reject correction?
register.selectInformant.birthInformantTitle,Who is applying for birth registration,Informant type
system.user.settings.language,Language name,"{language, select, en {English} fr {Français} other {{language}}}"
user.profile.auditList.approvedCorrectionAuditAction,Description for record correction being approved,Approved correction request
user.profile.auditList.rejectedCorrectedAuditAction,Description for record correction being rejected,Rejected correction request
user.profile.auditList.requestedCorrectionAuditAction,Description for record correction being requested,Requested correction
validations.invalidDate,The error message that appears when a date field is invalid,Invalid date field
verifyCertificate.certifiedAt,Label for date of certification,Date of certification
```

## [1.4.1](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.4.0...v1.4.1)

### Other changes

- Upgrade Node.js to 18
- Remove dependency OpenHIM. The OpenHIM database is kept for backwards compatibility reasons and will be removed in v1.6
- Change auth URLs to access them via gateway
- Add hearth URL to search service
- Include an endpoint for serving individual certificates in development mode
- Include compositionId in confirm registration payload
- Remove logrocket refrences
- Enable gzip compression in client & login
- Make SENTRY_DSN variable optional
- Use docker compose v2 in github workflows
- Mass email from national system admin
- Add SMTP environment variables in qa compose file
- Use image tag instead of patterns in certificate SVGs
- Generate default address according to logged-in user's location
- Remove authentication from dashboard queries route
- Added french translation of informant for print certificate flow, issue certificate flow & correction flow
- In the certificate, the 'Place of Certification' now accurately reflects the correct location.
- Added french translation of informant for print certificate flow, issue certificate flow & correction flow
- Groom's and Bride's name, printIssue translation variables updated [#124](https://github.com/opencrvs/opencrvs-countryconfig/pull/124)
- Add query mapper for International Postal Code field
- Add support for image compression configuration
- Provide env variables for metabase admin credentials
- Improved formatting of informant name for inProgress declaration emails
- Rename `farajaland-map.geojson` to `map.geojson` to not tie implementations into example country naming
- Remove `splitView` option from DOCUMENT_UPLOADER_WITH_OPTION field [#114](https://github.com/opencrvs/opencrvs-countryconfig/pull/114)
- Enable authentication for certificates endpoint [#188](https://github.com/opencrvs/opencrvs-countryconfig/pull/188)

## [1.4.1](https://github.com/opencrvs/opencrvs-countryconfig/compare/v1.4.0...v1.4.1)

- Improved logging for emails being sent
- Updated default Metabase init file so that it's compatible with the current Metabase version
- Deployment: Verifies Kibana is ready before setting up alert configuration
- Deployment: Removes `depends_on` configuration from docker compose files
- Deployment: Removes some deprecated deployment code around Elastalert config file formatting
- Provisioning: Creates backup user on backup servers automatically
- Provisioning: Update ansible Github action task version

- Copy: All application copy is now located in src/translations as CSV files. This is so that copy would be easily editable in software like Excel and Google Sheets. After this change, `AVAILABLE_LANGUAGES_SELECT` doesn't need to be defined anymore by country config.

## [1.4.0](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.3...v1.4.0)

- Added examples for configuring HTTP-01, DNS-01, and manual HTTPS certificates. By default, development and QA environments use HTTP-01, while others use DNS-01.
- All secrets & variables defined in Github Secrets are now passed automatically to the deployment script.
- The VPN_HOST_ADDRESS variable is now required for staging and production installations to ensure deployments are not publicly accessible.
- Replica limits have been removed; any number can now be deployed.
- Each environment now has a dedicated docker-compose-<environment>-deploy.yml. Use `environment:init` to create a new environment and generate a corresponding file for customizable configurations.
- 🔒 OpenHIM console is no longer exposed via HTTP.
- Ansible playbooks are refactored into smaller task files.
- Resolved the issue of National ID validation to prevent the informant, father, and mother from having the same ID.

### New features

- We now recommend creating a new Ubuntu user `provision` with passwordless sudo rights for all automated operations on the server, instead of using the root user. New users for different operations will be created in future releases.
- All human users on all servers now have their own Linux users with mandatory 2-factor authentication.
- OpenCRVS Farajaland now has an interactive script `environment:init` for creating new Github environments and defining secrets. This script should also be run for existing environments to ensure all variables and secrets are defined, especially important when pulling the latest changes from the Farajaland repository to your own country resource package.
- The environment creator script also manages the known hosts file automatically.
- 🚰 New pipeline for automatic provisioning of Ubuntu servers (all environments).
- 🚰 New pipeline for resetting data from an environment (non-production environments).
- 🚰 New pipeline for resetting SSH 2FA for all environments.
- 🚰 Development deploy pipeline now includes a "debug" option for SSHing into the action runner (non-production environments).
- A new "staging" environment has been introduced, acting as a production environment clone that resets its data nightly to match the production environment.
- The deployment script can now verify if there are undefined environment variables referred to in your compose files. All secrets and variables defined in Github Environments are automatically passed down to the deployment script.
- 🔒 Backup archives are now secured with a passphrase.
- HTTPS setup now offers three options: HTTP challenge, DNS challenge, and using a pre-issued certificate file.
- There's now a generic purpose POST /email endpoint only available from the internal network. Elastalert2 is configured to use this endpoint instead of directly using SMTP details or the Sendgrid API key.
- 🔒 QA environment now hosts a Wireguard server and admin panel (wg-easy). After deploying, you can access the admin panel at vpn.<your domain>.
- Allow configuring additional SSH parameters globally using `SSH_ARGS` Github variable.

### Breaking changes

- Known hosts are now defined in the `infrastructure/known-hosts` file. You can clear the file and use `bash infrastructure/environments/update-known-hosts.sh <domain>` to add your own domains.
- Ansible inventory files are now in .yml format. Please convert your old `production.ini` and similar files to this new format.
- The `authorized_keys` file has been removed, and keys should now be defined in the inventory yaml files.
- The `DOCKER_PASSWORD` secret has been replaced with `DOCKER_TOKEN`.

### Note

In the next OpenCRVS release v1.5.0, there will be two significant changes:

- The `infrastructure` directory and related pipelines will be moved to a new repository.
- Both the new infrastructure repository and the OpenCRVS country resource package repositories will start following their own release cycles, mostly independent from the core's release cycle. From this release forward, both packages are released as "OpenCRVS minor compatible" releases, meaning that the OpenCRVS countryconfig 1.3.0-<incrementing release number> is compatible with OpenCRVS 1.3.0, 1.3.1, 1.3.2, etc. This allows for the release of new hotfix versions of the core without having to publish a new version of the infrastructure or countryconfig.

## [1.3.4](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.3...v1.3.4)

### Bug fixes

- Fix typo in certificate handlebar names

## [1.3.3](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.2...v1.3.3)

### Breaking changes

### New features

- #### Greater customizability of location data in certificates

  The various admin level handlebars e.g. **statePlaceofbirth**,
  **districtPrimaryMother** only contained the name of that location which was
  not able to take advantage of all the information OpenCRVS had available
  about the various admin levels e.g. the name of that location in the
  secondary language. So we are introducing a new set of admin level
  handlebars that would contain the **id** of that location which we can
  resolve into a value of the shape

  ```
  {
    name: string
    alias: string
  }
  ```

  using the new **"location"** handlebar helper. Here name is the primary
  label of the location and alias being the secondary one. Currently only
  these 2 fields are available but we will be adding more fields depending on
  various countries requirements. If previously the certificate svg used to
  contain `{{districtPlaceofbirth}}` then now we can replace it with
  `{{location districtPlaceofbirthId 'name'}}`. To access alias, the `'name'`
  needs to be replaced with `'alias'`.

  Below is a list of all the new handlebars that are meant to be used with the
  "location" handlebar helper.

  - statePrimaryInformantId
  - districtPrimaryInformantId
  - statePlaceofbirthId
  - districtPlaceofbirthId
  - statePrimaryMotherId
  - districtPrimaryMotherId
  - statePrimaryFatherId
  - districtPrimaryFatherId
  - statePrimaryDeceasedId
  - districtPrimaryDeceasedId
  - statePlaceofdeathId
  - districtPlaceofdeathId
  - statePrimaryGroomId
  - districtPrimaryGroomId
  - statePrimaryBrideId
  - districtPrimaryBrideId
  - statePlaceofmarriageId
  - districtPlaceofmarriageId
  - registrar.stateId
  - registrar.districtId
  - registrar.officeId
  - registrationAgent.stateId
  - registrationAgent.districtId
  - registrationAgent.officeId

  ##### We will be deprecating the counterpart of the above mentioned handlebars that contains only the label of the specified location in a future version so we highly recommend that implementers update their certificates to use these new ones.

- #### "Spouse" section in Farajaland death form

  Spouse section is an optional section in death form. Going forward it will be included in Farajaland example configuration.

- #### Type of ID dropdown
  Farajaland forms will now include a dropdown to select the type of ID an individual is providing e.g. National ID, Driving License etc. instead of being restricted to only national ID number.
- #### Number of dependents of deceased field
  As an example of custom field, the deceased section in death form will now include the **numberOfDependants** field.
- #### Reason for late registration field
  The birth & death forms will include another custom field, **reasonForLateRegistration**, which makes use of "LATE_REGISTRATION_TARGET" configuration option in it's visibility conditional.

### Bug fixes

- Updated translations for form introduction page and sending for approval to reflect the default notification method being email.
- Remove hard-coded conditionals from "occupation" field to make it usable in the deceased form

See [Releases](https://github.com/opencrvs/opencrvs-farajaland/releases) for release notes of older releases.
