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
  formMessageDescriptors,
  informantMessageDescriptors
} from '../formatjs-messages'
import { SerializedFormField, TEXTAREA, Conditional } from '../types/types'

export const getDeathDate = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: fieldName, // A field with this name MUST exist
  type: 'DATE',
  label: formMessageDescriptors.deathEventDate,
  required: true,
  conditionals,
  initialValue: '',
  validator,
  mapping: {
    template: {
      operation: 'deceasedDateFormatTransformation',
      fieldName: certificateHandlebar,
      parameters: ['en', 'do MMMM yyyy', 'deceased']
    },
    mutation: {
      operation: 'fieldToDeceasedDateTransformation',
      parameters: [
        'deceased',
        {
          operation: 'longDateTransformer',
          parameters: []
        }
      ]
    },
    query: {
      operation: 'deceasedDateToFieldTransformation',
      parameters: ['deceased']
    }
  }
})

export const deathInformantType: SerializedFormField = {
  name: 'contactPoint',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.relationshipToDeceased,
  required: true,
  previewGroup: 'contactPointGroup',
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.contact']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.contact']
    },
    template: {
      fieldName: 'contactPoint',
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'SPOUSE',
      label: informantMessageDescriptors.SPOUSE
    },
    {
      value: 'SON',
      label: informantMessageDescriptors.SON
    },
    {
      value: 'DAUGHTER',
      label: informantMessageDescriptors.DAUGHTER
    },
    {
      value: 'SON_IN_LAW',
      label: informantMessageDescriptors.SON_IN_LAW
    },
    {
      value: 'DAUGHTER_IN_LAW',
      label: informantMessageDescriptors.DAUGHTER_IN_LAW
    },
    {
      value: 'MOTHER',
      label: informantMessageDescriptors.MOTHER
    },
    {
      value: 'FATHER',
      label: informantMessageDescriptors.FATHER
    },
    {
      value: 'GRANDSON',
      label: informantMessageDescriptors.GRANDSON
    },
    {
      value: 'GRANDDAUGHTER',
      label: informantMessageDescriptors.GRANDDAUGHTER
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}

export const getMannerOfDeath: SerializedFormField = {
  name: 'mannerOfDeath',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.manner,
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'NATURAL_CAUSES',
      label: formMessageDescriptors.mannerNatural
    },
    {
      value: 'ACCIDENT',
      label: formMessageDescriptors.mannerAccident
    },
    {
      value: 'SUICIDE',
      label: formMessageDescriptors.mannerSuicide
    },
    {
      value: 'HOMICIDE',
      label: formMessageDescriptors.mannerHomicide
    },
    {
      value: 'MANNER_UNDETERMINED',
      label: formMessageDescriptors.mannerUndetermined
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['mannerOfDeath']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['mannerOfDeath']
    },
    template: {
      fieldName: 'mannerOfDeath',
      operation: 'selectTransformer'
    }
  }
}

export const getCauseOfDeath: SerializedFormField = {
  name: 'causeOfDeathEstablished',
  type: 'CHECKBOX',
  label: formMessageDescriptors.causeOfDeathEstablished,
  required: true,
  checkedValue: 'true',
  uncheckedValue: 'false',
  hideHeader: true,
  initialValue: 'false',
  validator: [],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['causeOfDeathEstablished']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['causeOfDeathEstablished']
    },
    template: {
      fieldName: 'causeOfDeathEstablished',
      operation: 'plainInputTransformer'
    }
  }
}

export const getCauseOfDeathMethod: SerializedFormField = {
  name: 'causeOfDeathMethod',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.causeOfDeathMethod,
  required: true,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  conditionals: [
    {
      action: 'hide',
      expression: 'values.causeOfDeathEstablished !== "true"'
    }
  ],
  options: [
    {
      value: 'PHYSICIAN',
      label: formMessageDescriptors.physician
    },
    {
      value: 'LAY_REPORTED',
      label: formMessageDescriptors.layReported
    },
    {
      value: 'VERBAL_AUTOPSY',
      label: formMessageDescriptors.verbalAutopsy
    },
    {
      value: 'MEDICALLY_CERTIFIED',
      label: formMessageDescriptors.medicallyCertified
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['causeOfDeathMethod']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['causeOfDeathMethod']
    },
    template: {
      fieldName: 'causeOfDeathMethod',
      operation: 'selectTransformer'
    }
  }
}

export const getDeathDescription: SerializedFormField = {
  name: 'deathDescription',
  type: TEXTAREA,
  label: formMessageDescriptors.deathDescription,
  conditionals: [
    {
      action: 'hide',
      expression:
        'values.causeOfDeathEstablished !== "true" || values.causeOfDeathMethod !== "LAY_REPORTED" && values.causeOfDeathMethod !== "VERBAL_AUTOPSY"'
    }
  ],
  initialValue: '',
  validator: [],
  required: true,
  maxLength: 500,
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['deathDescription']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['deathDescription']
    },
    template: {
      fieldName: 'deathDescription',
      operation: 'plainInputTransformer'
    }
  }
}

export const getPlaceOfDeathFields = () =>
  [
    {
      name: 'placeOfDeathTitle',
      type: 'SUBSECTION',
      label: formMessageDescriptors.placeOfDeath,
      previewGroup: 'placeOfDeath',
      ignoreBottomMargin: true,
      initialValue: '',
      validator: []
    },
    {
      name: 'placeOfDeath',
      type: 'SELECT_WITH_OPTIONS',
      previewGroup: 'placeOfDeath',
      ignoreFieldLabelOnErrorMessage: true,
      label: formMessageDescriptors.placeOfDeath,
      required: true,
      initialValue: '',
      validator: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'HEALTH_FACILITY',
          label: formMessageDescriptors.healthInstitution
        },
        {
          value: 'DECEASED_USUAL_RESIDENCE',
          label: formMessageDescriptors.placeOfDeathSameAsPrimary
        },
        {
          value: 'OTHER',
          label: formMessageDescriptors.otherInstitution
        }
      ],
      mapping: {
        mutation: {
          operation: 'deathEventLocationMutationTransformer',
          parameters: [{}]
        },
        query: {
          operation: 'eventLocationTypeQueryTransformer',
          parameters: []
        }
      }
    },
    {
      name: 'deathLocation',
      type: 'LOCATION_SEARCH_INPUT',
      label: formMessageDescriptors.healthInstitution,
      previewGroup: 'placeOfDeath',
      required: true,
      initialValue: '',
      searchableResource: ['facilities'],
      searchableType: ['HEALTH_FACILITY'],
      dynamicOptions: {
        resource: 'facilities'
      },
      validator: [
        {
          operation: 'facilityMustBeSelected'
        }
      ],
      conditionals: [
        {
          action: 'hide',
          expression: '(values.placeOfDeath!="HEALTH_FACILITY")'
        }
      ],
      mapping: {
        template: {
          fieldName: 'placeOfDeath',
          operation: 'eventLocationNameQueryOfflineTransformer',
          parameters: ['facilities', 'placeOfDeath']
        },
        mutation: {
          operation: 'deathEventLocationMutationTransformer',
          parameters: [{}]
        },
        query: {
          operation: 'eventLocationIDQueryTransformer',
          parameters: []
        }
      }
    }
  ] satisfies SerializedFormField[]
