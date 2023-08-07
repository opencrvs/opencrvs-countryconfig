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
  AddressCases,
  AddressCopyConfigCases,
  AddressSubsections,
  EventLocationAddressCases,
  FATHER_DETAILS_DONT_EXIST,
  IAddressConfiguration,
  MOTHER_DETAILS_DONT_EXIST,
  fathersDetailsDontExist,
  mothersDetailsDontExistOnOtherPage,
  primaryAddressSameAsOtherPrimaryAddress
} from './address-utils'
import {
  hideIfInformantBrideOrGroom,
  informantNotMotherOrFather
} from '../common/default-validation-conditionals-utils'
import { formMessageDescriptors } from '../common/messages'

// ADMIN_LEVELS must equate to the number of levels of administrative structure provided by your Humdata CSV import
// The property is used to define how many standardised, dynamic location selects that are rendered in the address form configuration
// For example, in our example country: Farajaland, we have 2 main administrative levels: State and District.
// Therefore our ADMIN_LEVELS property is 2.
// You can set up to 5 supported administrative levels.

export const ADMIN_LEVELS: Number = 2

// Addresses take up a lot of repeated code in the forms, making the birth.ts, marriage.ts and death.ts files long and difficult to read
// Therefore we decorate the addresses dynamically to sections of the form using this configuration constant
// Its possible to show and hide address fields for individuals using conditionals.

export const defaultAddressConfiguration: IAddressConfiguration[] = [
  {
    // ====================== NOTE REGARDING IAddressConfiguration ======================

    // The "precedingFieldId" property identifies after which field in vertical order the address field configuration will display
    // It is a dot separated string relating to: event.section.group.name

    // The "configurations" array lists the available fieldset configurations that will render
    // Options are the full place of event fields, standard address fields, address subsection dividers, or radio buttons to simplify form entry

    precedingFieldId: 'birth.child.child-view-group.birthLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_BIRTH }]
  },
  {
    precedingFieldId:
      'birth.informant.informant-view-group.informantNidVerification',
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

      // Its possible to add 2 addresses per individual: PRIMARY_ADDRESS & SECONDARY_ADDRESS
      // This is a requirement in countries where individuals have 2 official addresses
      // This is often the case where migrant worker populations are considerable.
      // Comment in the SECONDARY_ADDRESS_SUBSECTION & SECONDARY_ADDRESS code in each configuration to reveal this

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
    precedingFieldId: 'birth.mother.mother-view-group.educationalAttainment',
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
    precedingFieldId: 'birth.father.father-view-group.educationalAttainment',
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
    precedingFieldId: 'marriage.marriageEvent.marriage-event-details.seperator',
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
