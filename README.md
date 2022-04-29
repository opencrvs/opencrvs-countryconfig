<p align="center"> <a href="https://imgur.com/mGNCIvh"><img src="https://i.imgur.com/mGNCIvh.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">Farajaland country configuration module</h3>
<p align="center">An example configuration module for OpenCRVS using a fictional country
<br>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What is this module for?](#what-is-this-module-for)
- [How do I run the module alongside the OpenCRVS core?](#how-do-i-run-the-module-alongside-the-opencrvs-core)
- [What is in the Farajaland configuration module repository?](#what-is-in-the-farajaland-configuration-module-repository)
- [Why do we need this configuration module?](#why-do-we-need-this-configuration-module)
- [Developer commands](#developer-commands)
  - [How can I clear the database, and repopulate it with my country's reference data for development](#how-can-i-clear-the-database-and-repopulate-it-with-my-countrys-reference-data-for-development)
  - [What are the example sequence of scripts that run when populating the reference data?](#what-are-the-example-sequence-of-scripts-that-run-when-populating-the-reference-data)
- [Features of the configuration module](#features-of-the-configuration-module)
  - [Administrative](#administrative)
  - [Assets](#assets)
  - [Definitions](#definitions)
  - [Employees](#employees)
  - [Facilities](#facilities)
  - [Generate](#generate)
  - [Languages](#languages)
  - [Templates](#templates)
  - [Validate](#validate)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>

**This is the fictional country "Farajaland" OpenCRVS configuration companion server and extension module for OpenCRVS. Ensure that you are already running [OpenCRVS](https://github.com/opencrvs/opencrvs-core) before using.**

## What is this module for?

This is an example country configuration package for the OpenCRVS core. OpenCRVS requires a country configuration in order to run.

OpenCRVS is designed to be highly configurable for your country needs. It achieves this by loading reference data that it needs from this module. 

This module also provides a logical location where you may wish to store the code and run the servers for any custom API integrations, extension modules and innovations to OpenCRVS.

## How do I run the module alongside the OpenCRVS core?

1. Ensure that you are running [OpenCRVS Core](https://github.com/opencrvs/opencrvs-core).  

**If you successfully ran the `bash setup.sh` script in OpenCRVS Core you already have this module checked out, the dependencies are installed, the Farajaland database is populated and you can just run the following command.** 

2. `yarn dev <!-- PATH_TO_OPEN_CRVS_CORE_DIRECTORY -->` You can find out "PATH_TO_OPEN_CRVS_CORE_DIRECTORY" by running `pwd` in your opencrvs-core directory.

Thats it! 🎉

**If you did not run the OpenCRVS Core `bash setup.sh` command, or you are forking this repository in order to build your own country configuration.** 

1. Ensure that you are running [OpenCRVS Core](https://github.com/opencrvs/opencrvs-core).  

In a separate Terminal window, checkout this repository and checkout the master branch.  The develop branch is used for active feature development.

2. Run `git clone https://github.com/opencrvs/opencrvs-farajaland.git`
3. Run `cd opencrvs-farajaland`
4. Run `git checkout master`
5. Run `yarn install`
6. Run `yarn dev <!-- PATH_TO_OPEN_CRVS_CORE_DIRECTORY -->` You can find out "PATH_TO_OPEN_CRVS_CORE_DIRECTORY" by running `pwd` in your opencrvs-core directory.

## What is in the Farajaland configuration module repository?

One of the key dependencies and enablers for OpenCRVS is country configuration and a reference data source. This source is bespoke for every implementing nation. If you would like to create your own country implementation, we recommend that you duplicate this repository and use it as a template. So what does it contain?

1. On the root level, this repository contains:

- [Cypress](https://www.cypress.io/) end-to-end tests that can be run in continuous integration.

- Docker Compose environment variables. Secrets required for your external API integrations unique to your country.  Examples include: SMS gateway provider selection between [Clickatell](https://www.clickatell.com/) & [Infobip](https://www.infobip.com/)

- Backups _(Backup zips of default reference data for a nation, for a factory reset, clean installation or for local development purposes.)_

2. The [src](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src) folder contians the code required to run the configuration server.  If you fork the module, organise it like this: src > (your country name), e.g. [farajaland](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src/farajaland).  The server provides the following endpoints to OpenCRVS Core.

- Endpoints for receiving some base config variables into the OpenCRVS declaration such as your country's mobile number RegExp, or how long you wsh your login session sto last before expiring.  **This configuration will be deprecated in favour of an easy to use GUI in the Beta v1 release of OpenCRVS Core in June 2022.**

Example variables:

* Default logout timeout length in milliseconds
* Cost of the certificate generation to the public
* [Sentry](https://sentry.io/) endpoint
* [Logrocket](https://logrocket.com/) endpoint

`GET /login-config.js`
`GET /client-config.js`

- An endpoint for loading country administrative location data for offline use in the OpenCRVS web client.  This is reference data for states, districts and any other kind of administrative boundary.  This data has been previously populated into Hearth and linked to facilities and employees following the steps later in this README.

`GET /locations`

- An endpoint for loading country civil registation and health facility data for offline use in the OpenCRVS web client.  This is reference data for the buildings where civil registration occurs and where births and deaths happen in the health context.  This data has been previously populated into Hearth and linked to administrative locations and  employees following the steps later in this README.

`GET /facilities`

- An endpoint for loading country specific public assets e.g. logos

`GET /assets/<file.png>`

- An endpoint for loading the core definitions that drive the configrable functionality for OpenCRVS Core, this contains form definitions as JSON, internationalised language files and certification templates as JSON.  The JSON configuration parameters are explained below. **This JSON configuration be deprecated in favour of an easy to use GUI in the Beta v1 release of OpenCRVS Core in June 2022.**

`GET /definitions/{declaration}`

- An endpoint that can be used to pilot OpenCRVS alongside an exsting Civil Registration system.  This is an optional configuration for OpenCRVS.  OpenCRVS validates its own registration data and creates its own independent and official registration identifiers "Birth/Death Registration Numbers (BRN, DRN)".  But you may wish to pilot OpenCRVS and add an additional layer of 3rd party validation.  If you use this feature, then the following endpoint should perform the validation tasks you need and return your own BRN/DRN

`POST /validate/registration`

- Another endpoint that can be used to pilot OpenCRVS alongside an exsting Civil Registration system to generate numbers without the validation step.  This is an optional configuration for OpenCRVS.  OpenCRVS creates its own independent and official registration identifiers "Birth/Death Registration Numbers (BRN, DRN)".  But you may wish to pilot OpenCRVS and generate the official registrations somewhere else.  If you use this feature, then the following endpoint should perform whatever tasks you need and return your own BRN/DRN

`POST /generate/{type e.g. <brn|drn>}`


- The features folder, contains the scripts needed to populate OpenCRVS databases with reference data when creating a new country config installataion and backup (See [these steps](https://github.com/opencrvs/opencrvs-zambia#https://github.com/opencrvs/opencrvs-zambia#developer-commands)) nad the code necessary to handle requests to the endpoints listed above.  See the [features section](https://github.com/opencrvs/opencrvs-zambia#can-you-explain-the-resources-module-features-in-more-detail):

* Administrative: _(Administrative division data. A portion of a country delineated for the purpose of administration, allowing registrations to be coupled to locations.)_ The administrative divisions are saved into OpenCRVS as [FHIR Locations](https://www.hl7.org/fhir/location.html). You can attach GeoJSON map data to each location, to potentially generate an interactive map of the country, and historical statistical information such as crude birth rates and estimated population rates disagregated by gender, allowing OpenCRVS the ability to calculate detailed performance reports.)

* Assets: Country specific image assets for customisation of OpenCRVS. USually the national civil registration logo

* Employees: The staff required to undertake the functions of civil registration. The employees are saved into OpenCRVS as [FHIR Practitioners](https://www.hl7.org/fhir/practitioner.html)

* Facilities: The places where civil registration and vital events such as births & deaths occur. These are also saved into OpenCRVS as [FHIR Locations](https://www.hl7.org/fhir/location.html)

* Generate: Methods to generate the event registration numbers (Often referred to as a BRN: Birth Registration Number or DRN: Death Registration Number) based on country requirements. Format of the number can be bespoke or default.

* Languages: A JSON file to configure all the text copy used in OpenCRVS and all languages. Can easily be imported into a Content Management System.

* Validate: A place to optionally externally validate registration declarations on-the-fly during the registration process. This can be used if a legacy system exiss and OpenCRVS is being gradually piloted alongside an existing system. Can ensure new registrations are saved to a legacy system.

## Why do we need this configuration module?

The features in this package are designed to import and convert the reference data above into the FHIR standard, then power APIs or populate the OpenCRVS [Hearth](https://github.com/jembi/hearth) NoSQL database, via the OpenCRVS [OpenHIM](http://openhim.org/) interoperability layer.

Given the [variety of administrative divisions between nations](https://en.wikipedia.org/wiki/List_of_administrative_divisions_by_country), and the unique nature of the organisational, local government operational structure of a nation, and given the variety of digital capabilities and stages of digital readiness of a nation, OpenCRVS does not attempt to prescribe the style or nature of it's dependencies. Instead it is encouraged that this package be bespokely implementated, according to a nation's needs during installation.

- Some governments, _(as in the case of the government of Bangladesh),_ may have a central repository for some reference data accessible via APIs.

- Other governments may supply reference data in a spreadsheet format that this module can import and convert using `yarn populate`  Follow the code in package.json to see what happens.

What this module provides, is an example approach, and scripts showing how this data can be imported.

**In the Beta v1 release planned for June 2022, OpenCRVS Core will include in its National System Administrator user interface the capability to manage all of these configuration settings with the exception of administrative structure and facilities. It is planned that this functionality will be gradually released in future versions of OpenCRVS.**

## Developer commands

Some simple commands should be able to be run by a continuous integration system (E.G. [Travis](https://travis-ci.com/)) or by a developer, in order to populate and update a local or production OpenCRVS environment with the necessary reference data.

### How can I clear the database, and repopulate it with my country's reference data for development

Essentially, this is the process of creating a factory reset database population and backup of reference data for either your development or production environment.

Before commencing, you must have customised the source reference data for your needs in CSV files or alternatively via custom scripts that you write for 3rd party APIs.
You should feel free to amend the approach we have taken and the scripts if you need to integrate with APIs, but your output should be CSV files, identical in style to ours in the features folders for [administrative locations](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src/farajaland/features/administrative/source), [employees](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src/farajaland/features/employees/generated) and [facilities](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src/farajaland/features/facilities/source).

1. Ensure that OpenCRVS Core is running.

2. Clear any existing data by running `yarn db:clear:all` (On a Mac you may need to additionally manually delete the "config" and "openhim-dev" databases directly in Mongo, using a GUI tool like [Robo3T](https://robomongo.org/)). You can run this command `yarn db:backup:restore` after `yarn db:clear:all` to restore back to Farajaland factory reset backups at any time.

3. Quit and restart OpenCRVS core.

4. Log into the OpenHIM at [here](http://localhost:8888) - default login is root@openhim.org:openhim-password (When running locally, login will fail a certificate security check as we are using self signed certs by default, follow the instructions in the error message in Chrome to accept cert, then try again)

5. Once logged in click Export/Import then select the core file [`infrastructure/openhim-base-config.json`](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/openhim-base-config.json) or drag and drop the file into the import box. A modal will open displaying the channels that will be imported. These are the routing configs for OpenCRVS in OpenHIM. Click 'Import changes'.

6. Click Channels and check all have loaded successfully. All will show a green "Enabled" message with the exception of an orange "Disabled" message for Hearth passthrough.

7. To populate reference data for your country requirements, by default, you run the `yarn db:populate` command to do this when OpenCRVS Core is running . This script's intention is to create active users in the system and generate passwords for them, populate the database with FHIR jurisdictions, facilities, practitioners and any other reference data you need.

You must add 2 parameters:

a) The password you wish to set for your test employees in local development only.
b) An environment code "DEV" or "PRODUCTION".

E.G.:

`yarn db:populate test DEV`

If you pass the environment code "DEV", your test password will be the same for all users. This is to make it easier for you to demo OpenCRVS.

**Test users must NEVER be installed on production as they all use the same password. You will be warned about this.**

If you pass the environment code "PRODUCTION", your test password will be ignored. Instead we create strong passwords for each user using [niceware](https://github.com/diracdeltas/niceware) and save the usernames and passwords along with contact details for the users in a file: "login-details.json" in this [folder](https://github.com/opencrvs/opencrvs-farajaland/tree/master/src/farajaland/features/employees/generated). You can then contact the users and tell them their production password which they can change to something else strong and memorable to them when they login - WARNING: The niceware wordlist has not been rigorously checked for offensive words. Use at your own risk. You may need to login as one of these users and change a password if it is deemed offensive. This approach makes it easy to set up active employees initially in bulk for a production deployment without users having to verify their account. Alternatively a national system administrator can always use OpenCRVS' UI to create new users in the "Team" configuration at any time follwoing the standard process.

The populate script is only run once when creating your factory reset backups. **The populate script is never used live in production, only when generating reference data factory reset backups locally for production use.**

9. Once you are fully populateed, before you login and create registrations and an audit trail, run `yarn db:backup:create` to create new factory reset zips for your future use. Commit everything to a new private repo for your country. Github actions will automatically restore from these backups when setting the `--clear-data` & `--restore-metadata` props in the server deployment commands in OpenCRVS core. The script `yarn db:backup:restore` can be used to restore from existing zips and is the same script that is used by Github actions.

### What are the example sequence of scripts that run when populating the reference data?

Running the `yarn db:populate` command runs the following commands sequentially in our example implementation for Farajaland. The populate script is only run once when creating your factory reset backups. **The populate script is never used live in production, only when generating reference data factory reset backups locally for production use.**

1. assign-admin-structure-to-locations.ts

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/assign-admin-structure-to-locations.ts```

Imports administrative divisions from a relevant source _(Either a CSV file or an API)_ converts the data into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, using the [OpenCRVS interpretation](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc), and saves JSON files for applying GeoJSON map data later into the extension array. Some custom fields for the country can be utilised in the description or identifier fields.

2. assign-geodata-to-locations.ts

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/assign-geodata-to-locations.ts```

Loads the [FHIR Location](https://www.hl7.org/fhir/location.html) data from the JSON, and compares the names of the individual locations with a source GeoJSON map from [humdata.org](https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015). If the names match, then the appropriate GeoJSON map is applied to the Location [extension array](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc#L36). Warnings will be listed for any location which the script has been unable to confidently map GeoJSON data.

3. update-location-data.ts

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/update-location-data.ts```

Once the GeoJSON has been assigned to the location objects, then all the updated location objects are loaded into the OpenCRVS database via [Hearth](https://github.com/jembi/hearth).

4. prepare-statistical-data.ts, add-statistical-data.ts & update-statistical-data.ts
   <!-- prettier-ignore -->
   ```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/prepare-statistical-data.ts```

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/add-statistical-data.ts```

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/administrative/scripts/update-statistical-data.ts```

Then statistical information is prepared from a source _(Such as population estimates for male and female populations and the statistical crude birth rate (a ratio used in the calcutation of expected numbers of birth for each region and defined by a governments statistical department.) from either a CSV file or an API)_ and added to each [FHIR Location](https://www.hl7.org/fhir/location.html).

5. prepare-source-facilities.ts & assign-facilities-to-locations.ts

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/facilities/scripts/prepare-source-facilities.ts```

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/facilities/scripts/assign-facilities-to-locations.ts```

An example of how to prepare facility information data from a CSV file into [FHIR Locations](https://www.hl7.org/fhir/location.html). This script converts a facility CSV file for civil registration and health facilities where births and deaths are registered and events occur respectively.

Converts the facilities JSON file into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, using the [OpenCRVS interpretation](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc) for buildings, setting the [type](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/offices/offices-resource.jsonc#L18) of building appropriately.

6. prepare-source-employees.ts & assign-employees-to-practitioners.ts

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/employees/scripts/prepare-source-employees.ts```

<!-- prettier-ignore -->
```ts-node -r tsconfig-paths/register src/farajaland/features/employees/scripts/assign-employees-to-practitioners.ts```

An example of how to prepare employee data from a CSV file into [FHIR Practitioners](https://www.hl7.org/fhir/practitioner.html) and [PractitionerRoles](https://www.hl7.org/fhir/practitionerrole.html) that assign the employee to a specific office and sets their speciality. The list supplied is a test list based on the users and permissions in the [user-mgnt package.](https://github.com/opencrvs/opencrvs-core/blob/master/packages/user-mgnt/resources/populate.ts)

Converts the employees JSON file into [FHIR Practitioner](https://www.hl7.org/fhir/practitioner.html) and [FHIR PractitionerRole](https://www.hl7.org/fhir/practitionerrole.html) objects, using the [OpenCRVS interpretation](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/employee/employee-resource.jsonc) for employees, setting the [code](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/employee/employee-resource.jsonc#L38) of the employee's role appropriately and also critically [listing the working locations](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/employee/employee-resource.jsonc#L43) of the employee. These can be buildins or administrative divisions. Ideally they should include both in the array.

<br>

## Features of the configuration module

### Administrative

This feature, imports and converts the administrative divisions for a country into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, applies a GeoJSON map to each location and then saves the data to FHIR. The process can be interrupted to export a CSV file for manual cross-checking.

[This FHIR standard is followed.](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc)

### Assets

Currently the only configurable asset is the civil registration logo used in the review and certificate process.

### Employees

This feature, imports and converts a test user and employee list from a csv file into [FHIR Practitioner](https://www.hl7.org/fhir/practitioner.html) and [FHIR PractitionerRole](https://www.hl7.org/fhir/practitionerrole.html) objects to manage permissions and map registrations to staff members, so that their performance can be tracked. The facility id for the users working location must match a facility unique id

[This FHIR standard is followed.](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/employee/employee-resource.jsonc)

### Facilities

This feature, imports and converts civil registration offices and health facilities into [FHIR Location](https://www.hl7.org/fhir/location.html) objects. Each facility must have a unique id.

[This FHIR standard is followed.](https://github.com/opencrvs/opencrvs-core-fhir-templates/blob/master/offices/offices-resource.jsonc)

### Generate

You can configure your registration number format any way you like in these scripts.

### Languages

Client Application: Internationalisation and languages can be configured in [client.json](https://github.com/opencrvs/opencrvs-farajaland/blob/master/src/farajaland/features/languages/generated/client/client.json).

SMS Notifications: Internationalisation and languages can be configured in [notification.json](https://github.com/opencrvs/opencrvs-farajaland/blob/master/src/farajaland/features/languages/generated/notification/notification.json).

OpenCRVS currently supports the standard Roman and Latin character set and Bengali. In OpenCRVS Alpha, we will need to assist you to configure core to support a new language in the language select in a pull request. We will gladly provide support to you if you want to provide translations and hugely welcome all localisation efforts.

We have provided some handy tools to help you load your languages into a content management system such as [Contentful](https://www.contentful.com/).

We currently do not recommend one CMS over another and for now the process of updating your CMS is outside current OpenCRVS scope. So if you plan on using a CMS, you will need to keep an eye on OpenCRVS releases and perform the necessary migrations when new content keys are added for new features.

Contentful is a paid-for service but 1 space and 2 locales are free. At the time of writing we couldnt find a better free option for multi-language content management.

When a new commit is pushed to core, you can pass an environment variable **COUNTRY_CONFIG_PATH** and the commit will automatically generate a descriptions file for your language content keys in [this](https://github.com/opencrvs/opencrvs-farajaland/blob/master/src/farajaland/features/languages/generated) folder.

There is a command `yarn extract:translations` in core that you can run and compare the output to see if new content keys have been added to core since you last checked.

To perform an initial import to Contentful:

1. First create a space in Contentful and add up to 2 locales for the free plan. Copy your **space-id** from Contentful settings.
2. Download and install the [Contentful cli](https://github.com/contentful/contentful-cli)
3. Run the following command to export your space as you will need ids for your locales: `contentful space export --space-id=<your-space-id>`
4. Open the exported file and copy the required ids to this [file](https://github.com/opencrvs/opencrvs-farajaland/blob/master/src/farajaland/features/languages/scripts/constants.ts)
5. You can run the following command to generate a **contentful-import.json** file: `yarn contentful:prepare:import`
6. Run the Contentful import script: `contentful space import --content-file src/farajaland/features/languages/generated/contentful-import.json --space-id=<your-space-id>`
7. Get your API key from contentful settings and add it to docker secrets, or paste [here](https://github.com/opencrvs/opencrvs-farajaland/blob/master/src/farajaland/constants.ts) for use in development. DO NOT SUBMIT API KEYS TO A PUBLIC REPO!

<br>

### Templates

Contains the certificate configuration JSON scripts

<br>

### Validate

These scripts allow you to interrupt the registration process before the birth registration number has been assigned, in case you want to integrate with a legacy civil registration system.


