<p align="center"> <a href="https://www.opencrvs.org"><img src="https://i.imgur.com/W7ULmox.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">Farajaland country configuration repository</h3>
<p align="center">An example configuration for OpenCRVS using a fictional country
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

<a href="https://documentation.opencrvs.org">Read our documentation</a> to learn how to set up your own country configuration using this repo as an example.

## What is this module for?

This is an example country configuration package for the OpenCRVS core. OpenCRVS requires a country configuration in order to run.

OpenCRVS is designed to be highly configurable for your country needs. It achieves this by loading reference data that it needs from this module. 

This module also provides a logical location where you may wish to store the code and run the servers for any custom API integrations, extension modules and innovations to OpenCRVS.

## How do I run the module alongside the OpenCRVS core?

1. Ensure that you are running [OpenCRVS Core](https://github.com/opencrvs/opencrvs-core).  

**If you successfully ran the `bash setup.sh` script in OpenCRVS Core you already have this module checked out, the dependencies are installed, the Farajaland database is populated and you can just run the following command.** 

2. `yarn dev`

Thats it! 🎉

**If you did not run the OpenCRVS Core `bash setup.sh` command, or you are forking this repository in order to build your own country configuration.** 

1. Ensure that you are running [OpenCRVS Core](https://github.com/opencrvs/opencrvs-core).  

In a separate Terminal window, checkout this repository and checkout the master branch.  The develop branch is used for active feature development.

2. Run `git clone https://github.com/opencrvs/opencrvs-farajaland.git`
3. Run `cd opencrvs-farajaland`
4. Run `git checkout master`
5. Run `yarn install`
6. Run `yarn dev`

## What is in the Farajaland configuration module repository?

One of the key dependencies and enablers for OpenCRVS is country configuration and a reference data source. This source is bespoke for every implementing nation. If you would like to create your own country implementation, we recommend that you duplicate this repository and use it as a template. So what does it contain?

1. On the root level, this repository contains:

- [Cypress](https://www.cypress.io/) end-to-end tests that can be run in continuous integration.

- Docker Compose scripts that allow you to customise individual OpenCRVS Core microservices and the countryconfig microservice

- Backups _(Backup zips of default reference data for a nation, for a factory reset, clean installation or for local development purposes.)_

- The [src](https://github.com/opencrvs/opencrvs-farajaland/master/src) folder contians the code required to run the countryconfig microservice and configure your country implementation.  For more information please [read this section of the documentation.](https://documentation.opencrvs.org/setup/3.-installation/3.2-set-up-your-own-country-configuration)

- A data-generator example is included that populates a demo environment with example registrations so you can see what performance analytics look like at scale. 

- Postman collections demonstrate how to interoperate with OpenCRVS.  You can build any custom integration into OpenCRVS in this repository if you need to.

- JS configuration settings files that the clients require in order to initialise, set up languages, track any errors and find essential services.

`GET /login-config.js`
`GET /client-config.js`

- An endpoint for loading country configuration content such as languages.

`GET /content/{application}`

- An endpoint that can be used to pre-validate a registration with an external system if the clent-config.js property EXTERNAL_VALIDATION_WORKQUEUE is set to true 

`POST /validate/registration`

- An endpoint that can be used to customise the format of the registration number along with other optional birth identifiers, perhaps by integrating with another system

`POST /generate/{type e.g. <brn|drn>}`

**<a href="https://documentation.opencrvs.org">Read our documentation</a> in order to learn how to make your own country configuration!**

