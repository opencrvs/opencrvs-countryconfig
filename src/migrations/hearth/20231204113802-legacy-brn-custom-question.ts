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

const CHILD_LEGACY_REGISTRATION_DATE_FIELD_ID =
  'birth.child.child-view-group.legacyBirthRegistrationDate'
const CHILD_LEGACY_REGISTRATION_TIME_FIELD_ID =
  'birth.child.child-view-group.legacyBirthRegistrationTime'
const CHILD_LEGACY_BRN_FIELD_ID =
  'birth.child.child-view-group.legacyBirthRegistrationNumber'

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
          ...convertFhirExtensionArrayToObject(
            'child.extension',
            'childExtension'
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
                    if: `$child.birthRegistrationDate`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: CHILD_LEGACY_REGISTRATION_DATE_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$child.birthRegistrationDate`
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
                    if: '$child.birthRegistrationTime',
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: CHILD_LEGACY_REGISTRATION_TIME_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: {
                                  $concat: [
                                    {
                                      $arrayElemAt: [
                                        {
                                          $split: [
                                            '$child.birthRegistrationTime',
                                            ':'
                                          ]
                                        },
                                        0
                                      ]
                                    },
                                    ':',
                                    {
                                      $arrayElemAt: [
                                        {
                                          $split: [
                                            '$child.birthRegistrationTime',
                                            ':'
                                          ]
                                        },
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
                    if: `$childExtension.patient-birthRegistrationNbr`,
                    then: {
                      $concatArrays: [
                        '$questions.item',
                        [
                          {
                            text: CHILD_LEGACY_BRN_FIELD_ID,
                            linkId: '',
                            answer: [
                              {
                                valueString: `$childExtension.patient-birthRegistrationNbr`
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
    })
  } finally {
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
