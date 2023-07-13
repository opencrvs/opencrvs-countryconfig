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
import { marriageDocumentForWhomFhirMapping } from '../options'
import { ISelectOption, SerializedFormField, Conditional } from '../types/types'

export const marriageInformantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: informantMessageDescriptors.birthInformantTitle,
  required: true,
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.informantType']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.informantType']
    },
    template: {
      fieldName: 'informantType',
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'GROOM',
      label: informantMessageDescriptors.GROOM
    },
    {
      value: 'BRIDE',
      label: informantMessageDescriptors.BRIDE
    },
    {
      value: 'HEAD_OF_GROOM_FAMILY',
      label: formMessageDescriptors.headOfGroomFamily
    },
    {
      value: 'HEAD_OF_BRIDE_FAMILY',
      label: formMessageDescriptors.headOfBrideFamily
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}

export const getMarriageDate: SerializedFormField = {
  name: 'marriageDate',
  type: 'DATE',
  label: formMessageDescriptors.marriageEventDate,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'checkMarriageDate',
      parameters: [18]
    }
  ],
  mapping: {
    template: {
      operation: 'marriageDateFormatTransformation',
      fieldName: 'eventDate',
      parameters: ['en', 'do MMMM yyyy', ['bride', 'groom']]
    },
    mutation: {
      operation: 'fieldToMarriageDateTransformation',
      parameters: [
        ['bride', 'groom'],
        {
          operation: 'longDateTransformer',
          parameters: []
        }
      ]
    },
    query: {
      operation: 'marriageDateToFieldTransformation',
      parameters: [['bride', 'groom']]
    }
  }
}

export const witnessName = (
  name: string,
  previewGroup: string,
  certificateHandlebar: string,
  parameters: string,
  label: 'firstName' | 'familyName'
): SerializedFormField => ({
  name,
  previewGroup,
  type: 'TEXT',
  label: formMessageDescriptors[label],
  maxLength: 32,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  mapping: {
    mutation: {
      operation: 'fieldValueNestingTransformer',
      parameters: [
        'individual',
        {
          operation: 'fieldToNameTransformer',
          parameters: ['en', parameters]
        },
        'name'
      ]
    },
    query: {
      operation: 'nestedValueToFieldTransformer',
      parameters: [
        'individual',
        {
          operation: 'nameToFieldTransformer',
          parameters: ['en', parameters]
        }
      ]
    },
    template: {
      fieldName: certificateHandlebar,
      operation: 'nameToFieldTransformer',
      parameters: ['en', parameters, 'informant', 'individual']
    }
  }
})

export const getRelationshipToSpousesForWitness: SerializedFormField = {
  name: 'relationship',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.relationshipToSpouses,
  required: true,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'headOfGroomFamily',
      label: formMessageDescriptors.headOfGroomFamily
    },
    {
      value: 'headOfBrideFamily',
      label: formMessageDescriptors.headOfBrideFamily
    },
    {
      value: 'other',
      label: formMessageDescriptors.other
    }
  ]
}

export const witnessRelationshipForOthers: SerializedFormField = {
  name: 'otherRelationship',
  type: 'TEXT',
  label: formMessageDescriptors.other,
  maxLength: 32,
  required: true,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '(values.relationship!="other")'
    }
  ]
}

export const getDocUploaderForMarriage = (
  name: string,
  label:
    | 'proofOfMarriageNotice'
    | 'proofOfGroomsID'
    | 'proofOfBridesID'
    | 'proofOfInformantsID',
  extraValueEnum: 'GROOM' | 'BRIDE' | 'MARRIAGE_NOTICE_PROOF' | 'INFORMANT',
  options: ISelectOption[],
  conditionals: Conditional[]
): SerializedFormField => ({
  name,
  type: 'DOCUMENT_UPLOADER_WITH_OPTION',
  label: formMessageDescriptors[label],
  required: false,
  initialValue: '',
  extraValue: marriageDocumentForWhomFhirMapping[extraValueEnum],
  hideAsterisk: true,
  conditionals,
  validator: [],
  options,
  mapping: {
    mutation: {
      operation: 'eventFieldToAttachmentTransformer'
    },
    query: {
      operation: 'eventAttachmentToFieldTransformer'
    }
  }
})
