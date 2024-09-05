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
  convertFhirExtensionArrayToObject,
  convertFhirSectionArrayToObject,
  join
} from '../../utils/hearth-helpers'

const MOTHER_BIRTH_PLACE_FIELD_ID = 'birth.mother.mother-view-group.birthPlace'
const FATHER_BIRTH_PLACE_FIELD_ID = 'birth.father.father-view-group.birthPlace'
const PATIENT_BIRTH_PLACE_EXTENSION_CODE = 'patient-birthPlace'

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
          {
            $lookup: {
              from: 'Patient',
              let: {
                mother: '$extensions.mother-details',
                father: '$extensions.father-details'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$id', ['$$mother', '$$father']]
                    }
                  }
                }
              ],
              as: 'patients'
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
                    if: `$motherExtension.${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: MOTHER_BIRTH_PLACE_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$motherExtension.${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`
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
                    if: `$fatherExtension.${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: FATHER_BIRTH_PLACE_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$fatherExtension.${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`
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
          'extension.url': `http://opencrvs.org/specs/extension/${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`
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
                      `http://opencrvs.org/specs/extension/${PATIENT_BIRTH_PLACE_EXTENSION_CODE}`
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
