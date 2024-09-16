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

import crypto from 'crypto'
import { Db, MongoClient } from 'mongodb'
import {
  convertFhirSectionArrayToObject,
  join
} from '../../utils/hearth-helpers'

const BIRTH_TIME_FIELD_ID = 'birth.child.child-view-group.birthTime'

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
          ...join('Patient', 'extensions.child-details', 'id', 'child'),
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
                resourceType: 'QuestionnaireResponse',
                status: 'completed',
                id: {
                  $function: {
                    body: function () {
                      return crypto.randomUUID()
                    },
                    args: [],
                    lang: 'js'
                  }
                },
                subject: {
                  reference: {
                    $concat: ['Encounter/', '$extensions.birth-encounter']
                  }
                },
                item: []
              }
            }
          },
          {
            $addFields: {
              'questions.item': {
                $concatArrays: [
                  '$questions.item',
                  [
                    {
                      text: BIRTH_TIME_FIELD_ID,
                      linkId: '',
                      answer: [
                        {
                          valueString: {
                            $concat: [
                              {
                                $arrayElemAt: [
                                  { $split: ['$child.birthTime', ':'] },
                                  0
                                ]
                              },
                              ':',
                              {
                                $arrayElemAt: [
                                  { $split: ['$child.birthTime', ':'] },
                                  1
                                ]
                              }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                ]
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
    })
    await db
      .collection('Patient')
      .updateMany({ birthTime: { $exists: true } }, [{ $unset: ['birthTime'] }])
  } finally {
    session.endSession()
  }
}
