import { Db } from 'mongodb'

export function convertFhirSectionArrayToObject(
  inputField: string,
  outputField: string
) {
  return [
    {
      $addFields: {
        [`${outputField}`]: {
          $arrayToObject: {
            $map: {
              input: `$${inputField}`,
              as: 'el',
              in: [
                {
                  $let: {
                    vars: {
                      firstElement: {
                        $arrayElemAt: ['$$el.code.coding', 0]
                      }
                    },
                    in: '$$firstElement.code'
                  }
                },
                {
                  $let: {
                    vars: {
                      firstElement: { $arrayElemAt: ['$$el.entry', 0] }
                    },
                    in: {
                      $arrayElemAt: [
                        { $split: ['$$firstElement.reference', '/'] },
                        1
                      ]
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
}

export function convertFhirExtensionArrayToObject(
  inputField: string,
  outputField: string
) {
  return [
    {
      $addFields: {
        [`${outputField}`]: {
          $arrayToObject: {
            $map: {
              input: `$${inputField}`,
              as: 'ext',
              in: [
                {
                  $ifNull: [
                    // We are using mongo 4.4, $ifNull does not have
                    // coaslesc functionality yet
                    {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $split: [
                                '$$ext.url',
                                'http://opencrvs.org/specs/extension/'
                              ]
                            },
                            1
                          ]
                        },
                        {
                          $arrayElemAt: [
                            {
                              $split: [
                                '$$ext.url',
                                'http://hl7.org/fhir/StructureDefinition/'
                              ]
                            },
                            1
                          ]
                        }
                      ]
                    },
                    ''
                  ]
                },
                { $ifNull: ['$$ext.valueString', ''] }
              ]
            }
          }
        }
      }
    }
  ]
}

export function join(
  from: string,
  localField: string,
  foreignField: string,
  as: string,
  options?: { preserveNullAndEmptyArrays: boolean }
) {
  const query = [
    {
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    }
  ]
  if (options?.preserveNullAndEmptyArrays) {
    return [
      ...query,
      { $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } }
    ]
  } else {
    return [...query, { $unwind: `$${as}` }]
  }
}

export function removeQuestionItemFromAllDocuments(db: Db, fieldId: string) {
  return db.collection('QuestionnaireResponse').updateMany({}, [
    {
      $addFields: {
        item: {
          $filter: {
            input: '$item',
            as: 'element',
            cond: { $ne: ['$$element.text', fieldId] }
          }
        }
      }
    }
  ])
}
