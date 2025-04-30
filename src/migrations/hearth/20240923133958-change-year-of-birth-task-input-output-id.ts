/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { Db, MongoClient } from 'mongodb'

const BIRTH_YEAR_FIELDS_TO_MIGRATE = [
  'motherYearOfBirthAround',
  'fatherYearOfBirthAround',
  'informantYearOfBirthAround'
]

const CUSTOM_BIRTH_YEAR_FIELD_ID = 'customizedExactDateOfBirthUnknown'

const updateYearOfBirthAggregration = ({
  propertyName
}: {
  propertyName: 'input' | 'output'
}) => [
  {
    $set: {
      [propertyName]: {
        $map: {
          input: `$${propertyName}`,
          as: 'taskUpdate', // Renaming it to separate from input/output in/out methods for clarity.
          in: {
            $mergeObjects: [
              '$$taskUpdate',
              {
                valueId: {
                  $cond: {
                    if: {
                      $in: [
                        '$$taskUpdate.valueId',
                        BIRTH_YEAR_FIELDS_TO_MIGRATE
                      ]
                    },
                    then: CUSTOM_BIRTH_YEAR_FIELD_ID,
                    else: '$$taskUpdate.valueId'
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
]

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const propertyNames = ['input', 'output'] as const

      for await (const propertyName of propertyNames) {
        await db.collection('Task').updateMany(
          {
            [propertyName]: { $type: 'array' }
          },
          updateYearOfBirthAggregration({ propertyName })
        )

        await db
          .collection('Task_history')
          .updateMany(
            { [propertyName]: { $type: 'array' } },
            updateYearOfBirthAggregration({ propertyName })
          )
      }
    })
  } catch (err) {
    console.log('Error occurred while migrating Tasks', err)
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
