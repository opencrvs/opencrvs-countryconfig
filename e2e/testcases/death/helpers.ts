import { GATEWAY_HOST } from '../../constants'
import { DeathRegistrationInput } from '../../gateway'
import faker from '@faker-js/faker'

import { readFileSync } from 'fs'
import uuid from 'uuid'
import { join } from 'path'
import {
  formatDateObjectTo_yyyyMMdd,
  generateRandomSuffix,
  getRandomDate
} from '../../helpers'
import {
  CREATE_DEATH_REGISTRATION,
  GET_DEATH_REGISTRATION_FOR_REVIEW
} from './queries'
import { random } from 'lodash'

export type DeathDeclarationInput = {
  deceased?: {
    usual?: {
      province: string
      district: string
    }
  }
  event?: {
    placeOfDeath?:
      | 'Health Institution'
      | "Deceased's usual place of residence"
      | 'Other'
    deathFacility?: string
  }
}

const declaration = {
  deceased: {
    name: {
      firstNames: faker.name.firstName('male') + generateRandomSuffix(),
      familyName: faker.name.lastName('male') + generateRandomSuffix()
    },
    gender: 'male',
    age: random(20, 100),
    nationality: 'FAR',
    identifier: {
      type: 'NATIONAL_ID',
      id: faker.random.numeric(10)
    },
    address: {
      country: 'FAR',
      province: 'Sulaka',
      district: 'Zobwe',
      urbanOrRural: 'Urban',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      postcodeOrZip: faker.address.zipCode()
    }
  },
  event: {
    manner: 'Natural causes',
    date: getRandomDate(0, 20),
    cause: {
      established: true,
      source: 'Physician'
    },
    place: "Deceased's usual place of residence"
  },
  informantType: 'Spouse',
  informantEmail: faker.internet.email(),
  spouse: {
    name: {
      firstNames: faker.name.firstName('female'),
      familyName: faker.name.lastName('female')
    },
    birthDate: getRandomDate(50, 200),
    nationality: 'Farajaland',
    identifier: {
      id: faker.random.numeric(10),
      type: 'NATIONAL_ID'
    },
    address: {
      sameAsDeceased: true
    }
  }
}

async function getAllLocations(
  type: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
) {
  const locations = (await fetch(
    `${GATEWAY_HOST}/location?type=${type}&_count=0`
  ).then((res) => res.json())) as fhir.Bundle
  return locations.entry!.map((entry) => entry.resource as fhir.Location)
}

function getLocationIdByName(locations: fhir.Location[], name: string) {
  const location = locations.find((location) => location.name === name)
  if (!location?.id) {
    throw new Error(`Location with name ${name} not found`)
  }
  return location.id
}

export async function createDeathDeclaration(
  token: string,
  details: DeathDeclarationInput = {}
) {
  const locations = await getAllLocations('ADMIN_STRUCTURE')
  const facilities = await getAllLocations('HEALTH_FACILITY')

  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: CREATE_DEATH_REGISTRATION,
      variables: {
        details: {
          createdAt: new Date().toISOString(),
          registration: {
            status: [
              {
                timestamp: new Date().toISOString(),
                timeLoggedMS: 1031608
              }
            ],
            informantsSignature:
              'data:image/png;base64,' +
              readFileSync(
                join(__dirname, './data/assets/528KB-random.png')
              ).toString('base64'),
            informantType: declaration.informantType,
            contactEmail: declaration.informantEmail,
            draftId: uuid.v4()
          },
          causeOfDeath: 'NATURAL',
          deceased: {
            name: [
              {
                use: 'en',
                firstNames: declaration.deceased.name.firstNames,
                familyName: declaration.deceased.name.familyName
              }
            ],
            gender: declaration.deceased.gender as 'male',
            ageOfIndividualInYears: declaration.deceased.age,
            nationality: [declaration.deceased.nationality],
            identifier: [
              {
                type: declaration.deceased.identifier.type,
                id: declaration.deceased.identifier.id
              }
            ],
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: formatAddressLine(declaration.deceased.address),
                country: declaration.deceased.address.country,
                state: getLocationIdByName(
                  locations,
                  declaration.deceased.address.province
                ),
                partOf: getLocationIdByName(
                  locations,
                  declaration.deceased.address.district
                ),
                district: getLocationIdByName(
                  locations,
                  declaration.deceased.address.district
                ),
                city: declaration.deceased.address.town,
                postalCode: declaration.deceased.address.postcodeOrZip
              }
            ],
            deceased: {
              deathDate: formatDateObjectTo_yyyyMMdd(declaration.event.date)
            }
          },
          eventLocation:
            details.event?.placeOfDeath === 'Other'
              ? {}
              : details.event?.placeOfDeath ===
                "Deceased's usual place of residence"
              ? {
                  type: 'DECEASED_USUAL_RESIDENCE',
                  address: {
                    type: 'PRIMARY_ADDRESS',
                    line: formatAddressLine(declaration.deceased.address),
                    country: declaration.deceased.address.country,
                    state: getLocationIdByName(
                      locations,
                      declaration.deceased.address.province
                    ),
                    partOf: getLocationIdByName(
                      locations,
                      declaration.deceased.address.district
                    ),
                    district: getLocationIdByName(
                      locations,
                      declaration.deceased.address.district
                    ),
                    city: declaration.deceased.address.town,
                    postalCode: declaration.deceased.address.postcodeOrZip
                  }
                }
              : {
                  _fhirID: getLocationIdByName(
                    facilities,
                    details.event?.deathFacility || 'Kalela Health Post'
                  )
                },
          informant: { relationship: 'SPOUSE' },
          questionnaire: [
            {
              fieldId: 'death.deceased.deceased-view-group.deceasedIdType',
              value: 'NATIONAL_ID'
            },
            {
              fieldId: 'death.spouse.spouse-view-group.spouseIdType',
              value: 'NATIONAL_ID'
            }
          ],
          causeOfDeathEstablished: 'false',
          spouse: {
            name: [
              {
                use: 'en',
                firstNames: declaration.spouse.name.firstNames,
                familyName: declaration.spouse.name.familyName
              }
            ],
            birthDate: formatDateObjectTo_yyyyMMdd(
              declaration.spouse.birthDate
            ),
            nationality: ['FAR'],
            identifier: [
              {
                id: declaration.spouse.identifier.id,
                type: declaration.spouse.identifier.type
              }
            ],
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: formatAddressLine(declaration.deceased.address),
                country: declaration.deceased.address.country,
                state: getLocationIdByName(
                  locations,
                  declaration.deceased.address.province
                ),
                partOf: getLocationIdByName(
                  locations,
                  declaration.deceased.address.district
                ),
                district: getLocationIdByName(
                  locations,
                  declaration.deceased.address.district
                ),
                city: declaration.deceased.address.town,
                postalCode: declaration.deceased.address.postcodeOrZip
              }
            ]
          }
        } satisfies ConvertEnumsToStrings<DeathRegistrationInput>
      }
    })
  })
  return res.json().then((r) => r.data.createDeathRegistration)
}

export const fetchDeclaration = async (
  token: string,
  compositionId: string
) => {
  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: GET_DEATH_REGISTRATION_FOR_REVIEW,
      variables: {
        id: compositionId
      }
    })
  })

  return await res.json()
}

type ConvertEnumsToStrings<T> = T extends (infer U)[]
  ? ConvertEnumsToStrings<U>[]
  : T extends string
  ? `${T}`
  : T extends object
  ? {
      [K in keyof T]: ConvertEnumsToStrings<T[K]>
    }
  : T

const formatAddressLine = (address: typeof declaration.deceased.address) => [
  address.number,
  address.street,
  address.residentialArea,
  '',
  '',
  'URBAN',
  ...new Array(9).fill('')
]
