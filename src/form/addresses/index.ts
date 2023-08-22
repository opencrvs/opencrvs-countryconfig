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

import {
  FATHER_DETAILS_DONT_EXIST,
  MOTHER_DETAILS_DONT_EXIST,
  fathersDetailsDontExist,
  hideIfInformantBrideOrGroom,
  informantNotMotherOrFather,
  mothersDetailsDontExistOnOtherPage,
  primaryAddressSameAsOtherPrimaryAddress
} from '../common/default-validation-conditionals'
import { formMessageDescriptors } from '../common/messages'
import {
  AddressCases,
  AddressCopyConfigCases,
  AddressSubsections,
  EventLocationAddressCases,
  IAddressConfiguration
} from '../types/types'

// ADMIN_LEVELS MUST EQUATE TO THE NUMBER OF LEVELS OF ADMINISTRATIVE STRUCTURE PROVIDED BY YOUR HUMDATA CSV IMPORT
// THE PROPERTY IS USED TO DEFINE HOW MANY STANDARDISED, DYNAMIC LOCATION SELECTS THAT ARE RENDERED IN THE ADDRESS FORM CONFIGURATION
// FOR EXAMPLE, IN OUR EXAMPLE COUNTRY: FARAJALAND, WE HAVE 2 MAIN ADMINISTRATIVE LEVELS: STATE AND DISTRICT.
// THEREFORE OUR ADMIN_LEVELS PROPERTY IS 2.
// YOU CAN SET UP TO 5 SUPPORTED ADMINISTRATIVE LEVELS.

export const ADMIN_LEVELS: Number = 2

// ADDRESSES TAKE UP A LOT OF REPEATED CODE IN THE FORMS, MAKING THE BIRTH.TS, MARRIAGE.TS AND DEATH.TS FILES LONG AND DIFFICULT TO READ
// THEREFORE WE DECORATE THE ADDRESSES DYNAMICALLY TO SECTIONS OF THE FORM USING THIS CONFIGURATION CONSTANT
// ITS POSSIBLE TO SHOW AND HIDE ADDRESS FIELDS FOR INDIVIDUALS USING CONDITIONALS.

export const defaultAddressConfiguration: IAddressConfiguration[] = [
  {
    // ====================== NOTE REGARDING IAddressConfiguration ======================

    // THE "precedingFieldId" PROPERTY IDENTIFIES AFTER WHICH FIELD IN VERTICAL ORDER THE ADDRESS FIELD CONFIGURATION WILL DISPLAY
    // IT IS A DOT SEPARATED STRING RELATING TO: EVENT.SECTION.GROUP.NAME

    // THE "configurations" ARRAY LISTS THE AVAILABLE FIELDSET CONFIGURATIONS THAT WILL RENDER
    // OPTIONS ARE THE FULL PLACE OF EVENT FIELDS, STANDARD ADDRESS FIELDS, ADDRESS SUBSECTION DIVIDERS, OR RADIO BUTTONS TO SIMPLIFY FORM ENTRY

    precedingFieldId: 'birth.child.child-view-group.birthLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_BIRTH }]
  },
  {
    precedingFieldId:
      'birth.informant.informant-view-group.informant-nid-seperator',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: informantNotMotherOrFather
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: informantNotMotherOrFather
      }
      // ====================== NOTE REGARDING SECONDARY ADDRESS ======================

      // ITS POSSIBLE TO ADD 2 ADDRESSES PER INDIVIDUAL: PRIMARY_ADDRESS & SECONDARY_ADDRESS
      // THIS IS A REQUIREMENT IN COUNTRIES WHERE INDIVIDUALS HAVE 2 OFFICIAL ADDRESSES
      // THIS IS OFTEN THE CASE WHERE MIGRANT WORKER POPULATIONS ARE CONSIDERABLE.
      // COMMENT IN THE SECONDARY_ADDRESS_SUBSECTION & SECONDARY_ADDRESS CODE IN EACH CONFIGURATION TO REVEAL THIS

      /*,{
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        conditionalCase: informantNotMotherOrFather
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: informantNotMotherOrFather
      }*/
    ]
  },
  {
    precedingFieldId: 'birth.mother.mother-view-group.mother-nid-seperator',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: MOTHER_DETAILS_DONT_EXIST
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: MOTHER_DETAILS_DONT_EXIST
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: MOTHER_DETAILS_DONT_EXIST
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: MOTHER_DETAILS_DONT_EXIST
      }*/
    ]
  },
  {
    precedingFieldId: 'birth.father.father-view-group.father-nid-seperator',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsOtherPrimary,
        xComparisonSection: 'father',
        yComparisonSection: 'mother',
        conditionalCase: `(${fathersDetailsDontExist} || ${mothersDetailsDontExistOnOtherPage})`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: `((${FATHER_DETAILS_DONT_EXIST} || ${primaryAddressSameAsOtherPrimaryAddress}) && !(${mothersDetailsDontExistOnOtherPage}) || ((${fathersDetailsDontExist}) && (${mothersDetailsDontExistOnOtherPage})))`
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: FATHER_DETAILS_DONT_EXIST
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: FATHER_DETAILS_DONT_EXIST
      }*/
    ]
  },
  {
    precedingFieldId: 'death.deathEvent.death-event-details.deathLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_DEATH }]
  },
  {
    precedingFieldId: 'death.deceased.deceased-view-group.maritalStatus',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedPrimaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedSecondaryAddress
      },
      {
        config: AddressCases.SECONDARY_ADDRESS
      }*/
    ]
  },
  {
    precedingFieldId: 'death.informant.informant-view-group.informantID',
    configurations: [
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsDeceasedsPrimary,
        xComparisonSection: 'informant',
        yComparisonSection: 'deceased'
      },
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantPrimaryAddress,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress
      },
      {
        config: AddressCases.SECONDARY_ADDRESS
      }*/
    ]
  },
  {
    precedingFieldId:
      'marriage.marriageEvent.marriage-event-details.place-of-marriage-seperator',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_MARRIAGE }]
  },
  {
    precedingFieldId: 'marriage.groom.groom-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress
      },
      {
        config: AddressCases.SECONDARY_ADDRESS
      }*/
    ]
  },
  {
    precedingFieldId: 'marriage.bride.bride-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress
      },
      {
        config: AddressCases.SECONDARY_ADDRESS
      }*/
    ]
  },
  {
    precedingFieldId:
      'marriage.informant.who-is-applying-view-group.informantID',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: hideIfInformantBrideOrGroom[0].expression
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: hideIfInformantBrideOrGroom[0].expression
      } /*,
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${hideIfInformantBrideOrGroom[0].expression}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `${hideIfInformantBrideOrGroom[0].expression}`
      }*/
    ]
  }
]
