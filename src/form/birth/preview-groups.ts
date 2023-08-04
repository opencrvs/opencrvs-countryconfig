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

import { EventLocationAddressCases, AddressCases } from '../address-settings'
import { AllowedAddressConfigurations } from '../address-utils'
import { formMessageDescriptors } from '../formatjs-messages'
import { IPreviewGroup } from '../types/types'

// Preview groups are used to structure data nicely in Review Page UI

export const childNameInEnglish: IPreviewGroup = {
  id: 'childNameInEnglish',
  label: formMessageDescriptors.nameInEnglishPreviewGroup,
  fieldToRedirect: 'familyNameEng',
  delimiter: ' '
}

export const informantNameInEnglish: IPreviewGroup = {
  id: 'informantNameInEnglish',
  label: {
    defaultMessage: 'Full name',
    description: "Label for informant's name in english",
    id: 'form.preview.group.label.informant.english.name'
  },
  fieldToRedirect: 'informantFamilyNameEng',
  delimiter: ' '
}

export const motherNameInEnglish: IPreviewGroup = {
  id: 'motherNameInEnglish',
  label: {
    defaultMessage: 'Full name',
    description: "Group label for mother's name in english",
    id: 'form.preview.group.label.mother.english.name'
  },
  fieldToRedirect: 'familyNameEng',
  delimiter: ' '
}

export const fatherNameInEnglish: IPreviewGroup = {
  id: 'fatherNameInEnglish',
  label: {
    defaultMessage: 'Full name',
    description: "Group label for father's name in english",
    id: 'form.preview.group.label.father.english.name'
  },
  fieldToRedirect: 'familyNameEng',
  delimiter: ' '
}

export function getPreviewGroups(
  configuration: AllowedAddressConfigurations
): IPreviewGroup[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
      return [
        {
          id: 'placeOfBirth',
          label: {
            defaultMessage: 'Place of delivery',
            description: 'Title for place of birth sub section',
            id: 'form.field.label.placeOfBirthPreview'
          },
          fieldToRedirect: 'placeOfBirth'
        }
      ]
    case EventLocationAddressCases.PLACE_OF_DEATH:
      return [
        {
          id: 'placeOfDeath',
          label: {
            defaultMessage: 'Where did the death occur?',
            description: 'Title for place of death sub section',
            id: 'form.field.label.placeOfDeath'
          },
          fieldToRedirect: 'placeOfDeath'
        }
      ]
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return [
        {
          id: 'placeOfMarriage',
          label: {
            defaultMessage: 'Place of marriage',
            description:
              'Label for form field: Place of occurrence of marriage',
            id: 'form.field.label.placeOfMarriage'
          },
          fieldToRedirect: 'placeOfMarriage'
        }
      ]
    case AddressCases.PRIMARY_ADDRESS:
      return [
        {
          id: 'primaryAddress',
          label: {
            defaultMessage: 'Residential address',
            description:
              'Preview groups label for form field: residential address',
            id: 'form.field.previewGroups.primaryAddress'
          },
          fieldToRedirect: 'countryPrimary'
        }
      ]
    case AddressCases.SECONDARY_ADDRESS:
      return [
        {
          id: 'secondaryAddress',
          label: {
            defaultMessage: 'Secondary address',
            description: 'Preview group label for secodary address',
            id: 'form.field.previewGroups.secondaryAddress'
          },
          fieldToRedirect: 'countrySecondary'
        }
      ]
    default:
      return []
  }
}
