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

const MOTHER_YEAR_OF_BIRTH_FIELD_ID =
  'birth.mother.mother-view-group.yearOfBirth'
const FATHER_YEAR_OF_BIRTH_FIELD_ID =
  'birth.father.father-view-group.yearOfBirth'

// const INFORMANT_YEAR_OF_BIRTH_FIELD_ID =
//   'birth.informant.informant-view-group.yearOfBirth'

const MOTHER_YEAR_OF_BIRTH_EXTENSION_CODE = 'mother-year-of-birth-around'
const FATHER_YEAR_OF_BIRTH_EXTENSION_CODE = 'father-year-of-birth-around'

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
                    if: `$motherExtension.${MOTHER_YEAR_OF_BIRTH_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: MOTHER_YEAR_OF_BIRTH_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$motherExtension.${MOTHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
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
                    if: `$fatherExtension.${FATHER_YEAR_OF_BIRTH_EXTENSION_CODE}`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: FATHER_YEAR_OF_BIRTH_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$fatherExtension.${FATHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
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
          $or: [
            {
              'extension.url': `http://opencrvs.org/specs/extension/${MOTHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
            },
            {
              'extension.url': `http://opencrvs.org/specs/extension/${FATHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
            }
          ]
        },
        [
          {
            $addFields: {
              extension: {
                $filter: {
                  input: '$extension',
                  as: 'ext',
                  cond: {
                    $and: [
                      {
                        $ne: [
                          '$$ext.url',
                          `http://opencrvs.org/specs/extension/${MOTHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
                        ]
                      },
                      {
                        $ne: [
                          '$$ext.url',
                          `http://opencrvs.org/specs/extension/${FATHER_YEAR_OF_BIRTH_EXTENSION_CODE}`
                        ]
                      }
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
