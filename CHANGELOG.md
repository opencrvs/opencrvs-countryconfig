## [1.3.3](https://github.com/opencrvs/opencrvs-farajaland/compare/v1.3.2...v1.3.3) (TBD)

## Breaking changes

## New features

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

## Bug fixes

- Updated translations for form introduction page and sending for approval to reflect the default notification method being email.
- Remove hard-coded conditionals from "occupation" field to make it usable in the deceased form

See [Releases](https://github.com/opencrvs/opencrvs-farajaland/releases) for release notes of older releases.
