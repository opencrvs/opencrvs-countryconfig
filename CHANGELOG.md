# Changelog

## [1.4.0](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.3...v1.4.0) (TBD)

- Adds examples of configuring HTTP-01, DNS-01 and manual HTTPS certificates By default development & QA uses HTTP-01 and others DNS-01.
- All secrets & variables defined in Github Secrets are now passed automatically to the deployment script
- Make VPN_HOST_ADDRESS variable required for staging and production installations. This is to verify deployments are not publicly accessible on public internet.
- Number of replicas is not limited to 1, 3 and 5 anymore. Any number of replicas can be deployed from this release forwards.
- Every environment now has its own docker-compose-<environment>-deploy.yml first creating a new environment with `environment:init` and then creating one of these files allows you to configure an environment you can freely name.
- 🔒 OpenCRVS console is not exposed via HTTP anymore
- Ansible playbooks are refactored to smaller task files

### New features

- We now recommend creating a new Ubuntu user `provision` with passwordless sudo rights that should be used for all automated operations on the server instead of root. New users for different operations will be created in future releases.
- All human users on all servers now have their own Linux users with mandatory 2-factor authentication.
- OpenCRVS Farajaland now has an interactive script for creating new Github environments and for defining secrets `environment:init`. This script can and should also be run for existing environments to verify all variables and secrets are defined. This is especially important when pulling latest changes from the Farajaland repository to your own country resource package.
- Environment creator script also manages known hosts file automatically
- 🚰 New pipeline for automatic provisioning of Ubuntu servers (all environments)
- 🚰 New pipeline for resetting data from an environment (non-production environments)
- 🚰 New pipeline for resetting SSH 2FA for (all environments)
- 🚰 Development deploy pipeline now has a "debug" option for SSHing into the action runner. (non-production environments)
- We've introduced a new environment "staging". Staging is a production environment clone that resets its data nightly to match production environment
- Deployment script can now verify if you have undefined environment variables that are referred to in your compose files. All secrets and variables defined in Github Environments are automatically passed down to the deployment script.
- 🔒 Backup archives are now secured with a passphrase
- HTTPS setup now has three options: HTTP challenge, DNS challenge and using pre-issued certificate file
- There's now a generic purpose POST /email endpoint only available from the internal network. Elastalert2 is pointed to use that endpoint instead of directly using SMTP details or Sendgrid API key.
- 🔒 QA environment now hosts a Wireguard server and admin panel (wg-easy). After deploying, you can see the admin panel in vpn.<your domain>.

### Breaking changes

- Known hosts are now defined in a file `infrastructure/known-hosts`. You can clear the file and use `bash infrastructure/environments/update-known-hosts.sh <domain>` to add your own domains to this file
- Ansible inventory files are now .yml files. Please port your old `production.ini` and similar files to this new syntax.
- `authorized_keys` file is removed and files should now be defined in the inventory yaml files.
- `DOCKER_PASSWORD` secret is replaced with `DOCKER_TOKEN`

### Note

In the next OpenCRVS release v1.5.0, there will be two significant changes:

- `infrastructure` directory and related pipelines are going to be moved to a new repository.
- Both the new infrastructure repository and OpenCRVS country resource package repositories are going start following their own releasing cycle mostly independent from core's release cycle.
  From this release forward, both packages are released as "OpenCRVS minor compatible" releases. This means that the OpenCRVS countryconfig 1.3.0-<incrementing release number> is compatible with OpenCRVS 1.3.0, 1.3.1, 1.3.2 and so on. This means we can then release new hotfix versions of core without having to publish a new version of the infrastructure or countryconfig.

See [Releases](https://github.com/opencrvs/opencrvs-farajaland/releases) for release notes of older releases.

## [1.3.3](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.2...v1.3.3) (TBD)

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

### Bug fixes

See [Releases](https://github.com/opencrvs/opencrvs-farajaland/releases) for release notes of older releases.
