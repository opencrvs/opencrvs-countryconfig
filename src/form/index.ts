/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Request } from '@hapi/hapi'
import { decorateFormsWithAddresses } from '../utils/address-utils'
import { birthForm } from './birth'
import { deathForm } from './death'
import { marriageForm } from './marriage'
import { IForms, Event } from './types/types'
import { getUserOfficeLocationHierarchy } from '@countryconfig/utils/users'

export async function formHandler(req: Request): Promise<IForms> {
  const addressHierarchy = (
    await getUserOfficeLocationHierarchy(
      req.headers.authorization,
      req.auth.credentials.sub as string
    )
  ).map(({ id }) => id)
  // ====================== NOTE REGARDING MIGRATING FROM OPNCRVS v1.2 OR EARLIER ======================

  // SIMPLY RETURN A JSON OF YOUR FULL FORM HERE, WITH THE ADDITION OF THE NEW MARRIAGE AND VERSION PROP
  // ALTERNATIVELY, REFACTOR YOUR JSON INTO TYPESCRIPT FOLLOWING OUR EXAMPLE

  return {
    // ====================== NOTE REGARDING FORM VERSION ======================

    // THE VERSION NUMBER FOR YOUR FORM IS NOT RELATED TO THE OPENCRVS VERSION.
    // THIS IS A VERSION NUMBER FOR YOUR USE AS YOU EDIT FORMS OVER TIME.

    // AFTER YOU HAVE STARTED REGISTERING CITIZENS, WHEN YOU MAKE A CHANGE TO A FORM IN PRODUCTION,
    // THE FORM MAY NO LONGER WORK FOR REGISTRATIONS MADE ON A PREVIOUS VERSION OF THE FORM.

    // THIS IS BECAUSE, YOU MAY HAVE REMOVED PREVIOUSLY REQUIRED QUESTIONS, OR ADDED NEW ONES.

    // AN OLDER REGISTRATION MAY NOT HAVE CAPTURED SUCH DATA, SO IF YOU VIEW OR CORRECT THAT RECORD
    // YOU MAY FIND THAT REQUIRED DATA IS NOW MISSING AND FORM VALIDATION PREVENTS THE SUBMISSION OF THE FORM.

    // WE HAVE A BACKLOG ITEM TO ALLOW REGISTRATION FORM CHANGES TO BE MADE POST LIVE TO
    // SUPPORT CIVIL REGISTRATION REGULATORY CHANGES THAT MAY HAPPEN IN THE FUTURE.

    // FOLLOW THE STATUS OF THIS ISSUE: https://github.com/opencrvs/opencrvs-core/issues/3798

    // IN THE MEANTIME, WHENEVER YOU SEMANTICALLY INCREMENT THE VERSION NUMBER BELOW, WE WILL SAVE A VERSION OF YOUR FORM IN AN IMMUTABLE DATABASE.

    // THIS WILL ALLOW US IN FUTURE TO ASSOCIATE A REGISTRATION WITH A PREVIOUSLY DRAFTED REGISTRATION FORM
    // EVEN IF THE CIVIL REGISTRATION REGULATIONS EVOLVE IN YOUR COUNTRY.

    version: 'v1.0.0',

    // ADDRESS FORMAT IS DYNAMICALLY DUPLICATED MULTIPLE TIMES FOR ALL EVENTS.
    // THIS DECORATOR FUNCTION POPULATES ADDRESSES ACCORDING TO THE defaultAddressConfiguration in address-settings.ts
    // SO YOU ONLY NEED TO CONFIGURE ADDRESS FIELDS IN A SINGLE LOCATION FOR ALL DECORATED INSTANCES.

    birth: decorateFormsWithAddresses(birthForm, Event.Birth, addressHierarchy),
    death: decorateFormsWithAddresses(deathForm, Event.Death, addressHierarchy),
    marriage: decorateFormsWithAddresses(
      marriageForm,
      Event.Marriage,
      addressHierarchy
    )
  }
}
