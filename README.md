<p align="center"> <a href="https://www.opencrvs.org"><img src="https://i.imgur.com/W7ULmox.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">Farajaland country configuration repository</h3>
<p align="center">An example configuration for OpenCRVS using a fictional country called Farajaland.
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://community.opencrvs.org">Join our community</a>  ·  <a href="https://documentation.opencrvs.org">Read our documentation</a>  ·  <a href="https://www.opencrvs.org">www.opencrvs.org</a></p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What is this module for?](#what-is-this-module-for)
- [How do I run the module alongside the OpenCRVS core?](#how-do-i-run-the-module-alongside-the-opencrvs-core)
- [What is in the Farajaland configuration module repository?](#what-is-in-the-farajaland-configuration-module-repository)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>

**This is the fictional country "Farajaland" OpenCRVS country configuration repository for [OpenCRVS](https://github.com/opencrvs/opencrvs-core) You must fork this for your own country.**

<a href="https://documentation.opencrvs.org/setup/3.-installation/3.2-set-up-your-own-country-configuration">Read our documentation</a> to learn how to set up your own country configuration using this repo as an example.

## What is this module for?

This is an example country configuration package for the OpenCRVS core. OpenCRVS requires a country configuration in order to run.

OpenCRVS is designed to be highly configurable for your country needs. It achieves this by seeding reference data that it needs from this module and exposing APIs for certain business critical operations. 

This module also provides a logical location where you may wish to store the code and run the servers for any custom API integrations, extension modules and innovations to OpenCRVS.

## How do I run the module alongside the OpenCRVS core?

1. Ensure that you are running [OpenCRVS Core](https://github.com/opencrvs/opencrvs-core).  

**If you successfully ran the `bash setup.sh` script in OpenCRVS Core you already have this module checked out, the dependencies are installed, the Farajaland database is populated and you can just run the following command.** 

2. `yarn dev`

Thats it! 🎉

## What is in the Farajaland configuration module repository?

One of the key dependencies and enablers for OpenCRVS is country configuration and a reference data source. This source is bespoke for every implementing nation. If you would like to create your own country implementation, we recommend that you duplicate this repository and use it as a template. So what does it contain?

1. This repository contains:

- The "infrastructure" folder containing all Ansible server configuration files, deployment scripts and docker-compose files allowing you to configure OpenCRVS to run on any infrastructure stack without requiring a fork in opencrvs-core.

- The [src](https://github.com/opencrvs/opencrvs-countryconfig/master/src) folder contains the code required to run the countryconfig microservice apis, configure your registration form and seed your country implementation with reference data. Essentially this repository could be re-written from NodeJS into Java or another language as long as the service provided the same API endpoints and served the same files as listed below. For more information please [read this section of the documentation.](https://documentation.opencrvs.org/setup/3.-installation/3.2-set-up-your-own-country-configuration)

- Postman collections demonstrate how to interoperate with OpenCRVS.  You can build any custom integration into OpenCRVS in this repository if you need to.

- The following business critical API and hosted file endpoints:

**Data seeding**

When the OpenCRVS Core servers start up with un-seeded databases they call the following endpoints in order to populate the databases accordingly:

1. `GET /application-config`

- Configures general application settings 

2. `GET /users`

- Configures at a minimum, a default National System Admin user for the application.  More users can be created for demonstration purposes or in a batch.  The passwords entered are required to be changed by the user on first login.

3. `GET /roles`

- Seeds the internal role titles used by your civil registration orgnisation mapping to the available OpenCRVS user types.

4. `GET /locations`

- Seeds the administrative structure of your country following the Humdata standard

5. `GET /statistics`

- Applies historical population and crude birth rates disaggregated by gender to your administrative structure.  This data ensures that your registration completeness rates are accuratley calculated.

6. `GET /certificates`

- Configures the available event certificate SVG files. These files can be updated in future via the National System Administrator user interface.

**Business critical APIs**

1. `GET /forms`

- Configures versioned registration forms for OpenCRVS vital events as JSON.

2. `GET /content/{application}`

- Returns all language content as JSON

3. `POST /notification`

- Receives notification payloads from OpenCRVS Core in order to transmit messages to staff and customers based on SMS, Email or other customisable method.

4. `GET /crude-death-rate` (Deprecation warning!)

- OpenCRVS "metrics" microservice receives a global crude death rate constant from this endpoint in order to calculate death registration completeness rates.  Unlike for crude birth rate, most countries do not have a statistic by administrative area disaggregated by gender for death rate.  This API endpoint can be considered as tehcnical debt and will likely be replaced by a config setting in the `GET /application-config` response.

5. `POST /event-registration`

- This synchronous API exists as it is the final step before legal registration of an event.  Some countries desire to create multiple identifiers for citizens at the point of registration using external systems. Some countries wish to integrate with another legacy system just before registration.  A synchronous 3rd party system can be integrated at this point. Some countries wish to customise the registration number format.  The registration number can be created at this point. Some countries use sequential numbering for registration numbers.  While it is possible to create that functionality here, we strongly discourage that approach and advise our unique alphanumeric ID format using the Tracking ID. The reason is, under times of high traffic, it is likely that sequential number generation can slow the performance of the service.  In a such a case a queue could be implemented here.

6. `GET /validators.js` & `GET /conditionals.js`

- Registration form JSON "Validators" and "Conditionals" refer to in-built OpenCRVS Core JavaScript form validation and conditional methods. Custom methods can be exposed to OpenCRVS Core via these endpoints.

7. `GET /login-config.js` & `GET /client-config.js`

- JS configuration settings files that the clients require in order to initialise, set up languages, track any errors and find essential services. 2 files for development and production environments must be available in each case.

8. `GET /content/country-logo`

- The country logo is loaded into HTML emails so must be hosted

9. `GET /content/farajaland-map.geojson`

- A map of the country in GeoJSON must be hosted as it is loaded into OpenCVS Core Metabase Dashboards as a UI component

10. `GET /ping`

- A service health check endpoint used for 3rd party application stack monitoring

**<a href="https://documentation.opencrvs.org">Read our documentation</a> in order to learn how to make your own country configuration!**

