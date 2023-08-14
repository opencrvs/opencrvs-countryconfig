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

import { seperatorDivider } from '../common/common-optional-fields'
import {
  formMessageDescriptors,
  informantMessageDescriptors
} from '../common/messages'
import {
  causeOfDeathReportedOptions,
  deathInformantTypeOptions,
  mannerOfDeathOptions,
  placeOfDeathOptions
} from '../common/select-options'
import { SerializedFormField, TEXTAREA, Conditional } from '../types/types'
import { certificateHandlebars } from './certficate-handlebars'

export const getDeathDate = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[]
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
      fieldName: certificateHandlebars.eventDate,
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
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: informantMessageDescriptors.birthInformantTitle,
  required: true,
  previewGroup: 'contactPointGroup',
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantType']
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantType']
    },
    template: {
      fieldName: certificateHandlebars.informantType,
      operation: 'selectTransformer'
    }
  },
  options: deathInformantTypeOptions
}

export const getMannerOfDeath: SerializedFormField = {
  name: 'mannerOfDeath',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.manner,
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: mannerOfDeathOptions,
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
      fieldName: certificateHandlebars.mannerOfDeath,
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
      fieldName: certificateHandlebars.causeOfDeathEstablished,
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
  options: causeOfDeathReportedOptions,
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
      fieldName: certificateHandlebars.causeOfDeathMethod,
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
      fieldName: certificateHandlebars.deathDescription,
      operation: 'plainInputTransformer'
    }
  }
}

export const getPlaceOfDeathFields = () =>
  [
    {
      name: 'placeOfDeathTitle',
      type: 'HEADING3',
      label: formMessageDescriptors.placeOfDeath,
      previewGroup: 'placeOfDeath',
      ignoreBottomMargin: false,
      initialValue: '',
      validator: []
    },
    seperatorDivider('place-of-death-seperator'),
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
      options: placeOfDeathOptions,
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
          fieldName: certificateHandlebars.placeOfDeath,
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
