/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { birthRegisterForms as birth } from './birth'
import { deathRegisterForms as death } from './death'
import { marriageRegisterForms as marriage } from './marriage'
import { populateRegisterFormsWithAddresses } from './addresses'
import { IForms, Event } from './types/types'

export async function formHandler(): Promise<IForms> {
  // AS OF OPENCRVS v1.3.0 YOU CANNOT MAKE A CHANGE TO A CIVIL REGISTRATION FORM ONCE YOU GO LIVE IN PRODUCTION

  // AFTER YOU HAVE STARTED REGISTERING CITIZENS, WHEN YOU MAKE A CHANGE TO A FORM IN PRODUCTION,
  // THE FORM MAY NO LONGER WORK FOR REGISTRATIONS MADE ON A PREVIOUS VERSION OF THE FORM.

  // THIS IS BECAUSE, YOU MAY HAVE REMOVED PREVIOUSLY REQUIRED QUESTIONS, OR ADDED NEW ONES.

  // AN OLDER REGISTRATION MAY NOT HAVE CAPTURED SUCH DATA, SO IF YOU VIEW OR CORRECT THAT RECORD
  // YOU MAY FIND THAT REQUIRED DATA IS NOW MISSING AND FORM VALIDATION PREVENTS THE SUBMISSION OF THE FORM.

  // WE HAVE A BACKLOG ITEM TO ALLOW REGISTRATION FORM CHANGES TO BE MADE POST LIVE TO
  // SUPPORT CIVIL REGISTRATION REGULATORY CHANGES THAT MAY HAPPEN IN THE FUTURE.

  // FOLLOW THE STATUS OF THIS ISSUE: https://github.com/opencrvs/opencrvs-core/issues/3798

  // IN THE MEANTIME, WE WILL SAVE A VERSION OF YOUR FORM IN AN IMMUTABLE DATABASE, WHENEVER YOU EDIT THE VERSION NUMBER BELOW
  // THIS WILL ALLOW US IN FUTURE TO ASSOCIATE A REGISTRATION WITH A PREVIOUSLY DRAFTED REGISTRATION FORM
  // EVEN IF THE CIVIL REGISTRATION REGULATIONS EVOLVE IN YOUR COUNTRY.

  return {
    // THE VERSION NUMBER FOR YOUR FORM IS NOT RELATED TO ANY OPENCRVS VERSION.
    // YOU CAN NAME THIS VERSION ANYTHING YOU LIKE AS LONG AS IT IS UNIQUE EACH TIME.

    version: 'v1.0.0',
    birth: populateRegisterFormsWithAddresses(birth, Event.Birth),
    death: populateRegisterFormsWithAddresses(death, Event.Death),
    marriage: populateRegisterFormsWithAddresses(marriage, Event.Marriage)
  }
}
