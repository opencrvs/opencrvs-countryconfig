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

import { Db, MongoClient } from 'mongodb'
import {
  convertFhirSectionArrayToObject,
  convertFhirExtensionArrayToObject,
  join
} from '../../utils/hearth-helpers'

const CHILD_CUSTOM_ADDRESS_FIELD_ID =
  'birth.child.child-view-group.fokontanyCustomAddress'
const MOTHER_CUSTOM_ADDRESS_FIELD_ID =
  'birth.mother.mother-view-group.fokontanyCustomAddress'
const FATHER_CUSTOM_ADDRESS_FIELD_ID =
  'birth.father.father-view-group.fokontanyCustomAddress'
const INFORMANT_CUSTOM_ADDRESS_FIELD_ID =
  'birth.informant.informant-view-group.fokontanyCustomAddress'
const PATIENT_CUSTOM_FOKONTANY_EXTENSION_CODE = 'patient-birthFktLocation'
const PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE = 'patient-custom-address'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('Composition')
        .aggregate([
          {
            $match: {
              'type.coding.code': 'birth-declaration'
            }
          },
          ...convertFhirSectionArrayToObject('section', 'extensions'),
          ...join(
            'RelatedPerson',
            'extensions.informant-details',
            'id',
            'relatedPerson'
          ),
          {
            $addFields: {
              informantReference: {
                $arrayElemAt: [
                  {
                    $split: ['$relatedPerson.patient.reference', 'Patient/']
                  },
                  1
                ]
              },
              informantRelation: '$relatedPerson.relationship.coding.code'
            }
          },
          {
            $lookup: {
              from: 'Patient',
              let: {
                informant: '$informantReference',
                child: '$extensions.child-details',
                mother: '$extensions.mother-details',
                father: '$extensions.father-details'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        '$id',
                        ['$$informant', '$$mother', '$$father', '$$child']
                      ]
                    }
                  }
                }
              ],
              as: 'patients'
            }
          },
          {
            $addFields: {
              child: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$patients',
                      as: 'ptn',
                      cond: { $eq: ['$$ptn.id', '$extensions.child-details'] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $addFields: {
              mother: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$patients',
                      as: 'ptn',
                      cond: { $eq: ['$$ptn.id', '$extensions.mother-details'] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $addFields: {
              father: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$patients',
                      as: 'ptn',
                      cond: { $eq: ['$$ptn.id', '$extensions.father-details'] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $addFields: {
              informant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$patients',
                      as: 'ptn',
                      cond: { $eq: ['$$ptn.id', '$informantReference'] }
                    }
                  },
                  0
                ]
              }
            }
          },
          ...convertFhirExtensionArrayToObject(
            'informant.extension',
            'informantExtension'
          ),
          ...convertFhirExtensionArrayToObject(
            'child.extension',
            'childExtension'
          ),
          ...convertFhirExtensionArrayToObject(
            'mother.extension',
            'motherExtension'
          ),
          ...convertFhirExtensionArrayToObject(
            'father.extension',
            'fatherExtension'
          ),
          {
            $addFields: {
              questionnaireReference: {
                $concat: ['Encounter/', '$extensions.birth-encounter']
              }
            }
          },
          ...join(
            'QuestionnaireResponse',
            'questionnaireReference',
            'subject.reference',
            'questions',
            { preserveNullAndEmptyArrays: true }
          ),
          {
            $addFields: {
              questions: {
                item: {
                  $cond: {
                    if: `$childExtension.${PATIENT_CUSTOM_FOKONTANY_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: CHILD_CUSTOM_ADDRESS_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$childExtension.${PATIENT_CUSTOM_FOKONTANY_EXTENSION_CODE}`
                              }
                            ]
                          }
                        ]
                      ]
                    },
                    else: '$questions.item'
                  }
                }
              }
            }
          },
          {
            $addFields: {
              questions: {
                item: {
                  $cond: {
                    if: `$motherExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: MOTHER_CUSTOM_ADDRESS_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$motherExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`
                              }
                            ]
                          }
                        ]
                      ]
                    },
                    else: '$questions.item'
                  }
                }
              }
            }
          },
          {
            $addFields: {
              questions: {
                item: {
                  $cond: {
                    if: `$fatherExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: FATHER_CUSTOM_ADDRESS_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$fatherExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`
                              }
                            ]
                          }
                        ]
                      ]
                    },
                    else: '$questions.item'
                  }
                }
              }
            }
          },
          {
            $addFields: {
              questions: {
                item: {
                  $cond: {
                    if: `$informantExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: INFORMANT_CUSTOM_ADDRESS_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$informantExtension.${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`
                              }
                            ]
                          }
                        ]
                      ]
                    },
                    else: '$questions.item'
                  }
                }
              }
            }
          },
          { $replaceRoot: { newRoot: '$questions' } },
          {
            $merge: {
              into: 'QuestionnaireResponse',
              on: '_id',
              whenMatched: 'replace',
              whenNotMatched: 'insert'
            }
          }
        ])
        .toArray()

      await db.collection('Patient').updateMany(
        {
          'extension.url': `http://opencrvs.org/specs/extension/${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`
        },
        [
          {
            $addFields: {
              extension: {
                $filter: {
                  input: '$extension',
                  as: 'ext',
                  cond: {
                    $ne: [
                      '$$ext.url',
                      `http://opencrvs.org/specs/extension/${PATIENT_CUSTOM_ADDRESS_EXTENSION_CODE}`
                    ]
                  }
                }
              }
            }
          }
        ]
      )
    })
  } finally {
    session.endSession()
  }
}
