import { GATEWAY_HOST } from '../../constants'
import { BirthRegistrationInput } from '../../gateway'
import faker from '@faker-js/faker'

import { readFileSync } from 'fs'
import uuid from 'uuid'
import { format, subDays, subYears } from 'date-fns'
import { join } from 'path'
import {
  CREATE_BIRTH_REGISTRATION,
  GET_BIRTH_REGISTRATION_FOR_REVIEW,
  REGISTER_BIRTH_DECLARATION
} from './queries'
import { random } from 'lodash'
import { generateRandomSuffix } from '../../helpers'

export type BirthDetails = {
  informant: {
    type: 'MOTHER' | 'FATHER' | 'BROTHER'
  }
  child: {
    firstNames: string
    familyName: string
    birthDate?: string
    gender: 'male' | 'female'
    birthType?: 'SINGLE' | 'MULTIPLE'
    weightAtBirth?: number
    placeOfBirth?: 'Health Institution' | 'Residential address' | 'Other'
    birthFacility?: string
    birthLocation?: {
      state: string
      district: string
    }
  }
  mother: {
    firstNames: string
    familyName: string
    age?: number
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
  }
  father: {
    firstNames: string
    familyName: string
    birthDate?: string
  }
  attendant: {
    type: 'PHYSICIAN' | 'NURSE' | 'MIDWIFE' | 'OTHER'
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
  if (!location) {
    throw new Error(`Location with name ${name} not found`)
  }
  return location.id
}
export async function createDeclaration(token: string, details: BirthDetails) {
  const locations = await getAllLocations('ADMIN_STRUCTURE')
  const facilities = await getAllLocations('HEALTH_FACILITY')

  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: CREATE_BIRTH_REGISTRATION,
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
            informantType: details.informant.type,
            contactPhoneNumber: '0' + faker.random.numeric(9),
            contactEmail: faker.internet.email(),
            draftId: uuid.v4()
          },
          child: {
            name: [
              {
                use: 'en',
                firstNames: details.child.firstNames + generateRandomSuffix(),
                familyName: details.child.familyName + generateRandomSuffix()
              }
            ],
            gender: details.child.gender,
            birthDate:
              details.child.birthDate ||
              format(
                subDays(new Date(), Math.ceil(50 * Math.random())),
                'yyyy-MM-dd'
              ),
            identifier: []
          },
          eventLocation:
            details.child.placeOfBirth &&
            details.child.placeOfBirth !== 'Health Institution'
              ? {
                  type: 'PRIVATE_HOME',
                  address: {
                    line: [
                      faker.address.buildingNumber(),
                      faker.address.streetName(),
                      faker.address.cityName(),
                      '',
                      '',
                      'URBAN',
                      ...new Array(9).fill('')
                    ],
                    country: 'FAR',
                    state: getLocationIdByName(
                      locations,
                      details.child.birthLocation?.state || 'Central'
                    ),
                    partOf: getLocationIdByName(
                      locations,
                      details.child.birthLocation?.district || 'Ibombo'
                    ),
                    district: getLocationIdByName(
                      locations,
                      details.child.birthLocation?.district || 'Ibombo'
                    ),
                    city: faker.address.cityName(),
                    postalCode: faker.address.zipCode()
                  }
                }
              : {
                  _fhirID: getLocationIdByName(
                    facilities,
                    details.child.birthFacility || 'Ibombo Rural Health Centre'
                  )
                },
          attendantAtBirth: details.attendant.type || 'PHYSICIAN',
          birthType: details.child.birthType || 'SINGLE',
          weightAtBirth: details.child.weightAtBirth || 2,
          mother: {
            name: [
              {
                use: 'en',
                firstNames: details.mother.firstNames,
                familyName: details.mother.familyName
              }
            ],
            ageOfIndividualInYears: details.mother.age || random(20, 100),
            nationality: ['FAR'],
            identifier: [
              {
                id: faker.random.numeric(10),
                type: 'NATIONAL_ID'
              }
            ],
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  faker.address.buildingNumber(),
                  faker.address.streetName(),
                  faker.address.cityName(),
                  '',
                  '',
                  'URBAN',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  ''
                ],
                country: 'FAR',
                state: getLocationIdByName(locations, 'Central'),
                partOf: getLocationIdByName(locations, 'Ibombo'),
                district: getLocationIdByName(locations, 'Ibombo'),
                city: 'Example Town',
                postalCode: '534534'
              }
            ],
            maritalStatus: details.mother.maritalStatus || 'SINGLE',
            educationalAttainment: 'NO_SCHOOLING'
          },
          questionnaire: [
            {
              fieldId: 'birth.mother.mother-view-group.motherIdType',
              value: 'NATIONAL_ID'
            },
            {
              fieldId: 'birth.father.father-view-group.fatherIdType',
              value: 'NATIONAL_ID'
            },
            {
              fieldId: 'birth.informant.informant-view-group.informantIdType',
              value: 'NATIONAL_ID'
            }
          ],
          father: {
            detailsExist: true,
            name: [
              {
                use: 'en',
                firstNames: faker.name.findName(),
                familyName: faker.name.lastName()
              }
            ],
            birthDate:
              details.father.birthDate ||
              format(
                subYears(new Date(), 16 + Math.ceil(10 * Math.random())),
                'yyyy-MM-dd'
              ),
            nationality: ['FAR'],
            identifier: [
              {
                id: faker.random.numeric(10),
                type: 'NATIONAL_ID'
              }
            ],
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '343',
                  'Example Street',
                  'Example Residential Area',
                  '',
                  '',
                  'URBAN',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  ''
                ],
                country: 'FAR',
                state: getLocationIdByName(locations, 'Central'),
                partOf: getLocationIdByName(locations, 'Ibombo'),
                district: getLocationIdByName(locations, 'Ibombo'),
                city: 'Example Town',
                postalCode: '534534'
              }
            ],
            maritalStatus: 'SINGLE',
            educationalAttainment: 'NO_SCHOOLING'
          },
          informant: {
            name: [
              {
                use: 'en',
                firstNames: faker.name.findName(),
                familyName: faker.name.lastName()
              }
            ],
            birthDate: format(
              subYears(new Date(), 16 + Math.ceil(10 * Math.random())),
              'yyyy-MM-dd'
            ),
            nationality: ['FAR'],
            identifier: [
              {
                id: faker.random.numeric(10),
                type: 'NATIONAL_ID'
              }
            ],
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '343',
                  'Example Street',
                  'Example Residential Area',
                  '',
                  '',
                  'URBAN',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  ''
                ],
                country: 'FAR',
                state: getLocationIdByName(locations, 'Central'),
                partOf: getLocationIdByName(locations, 'Ibombo'),
                district: getLocationIdByName(locations, 'Ibombo'),
                city: 'Example Town',
                postalCode: '534534'
              }
            ]
          }
        } satisfies ConvertEnumsToStrings<BirthRegistrationInput>
      }
    })
  })
  return res.json().then((r) => r.data.createBirthRegistration)
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
      query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
      variables: {
        id: compositionId
      }
    })
  })
  return await res.json()
}

export const registerDeclaration = async (
  token: string,
  compositionId: string
) => {
  await fetchDeclaration(token, compositionId)
  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: REGISTER_BIRTH_DECLARATION,
      variables: {
        id: compositionId,
        details: {
          createdAt: new Date().toISOString()
        } satisfies ConvertEnumsToStrings<BirthRegistrationInput>
      }
    })
  })
  const t = await res.json()

  return await t
}

export type ConvertEnumsToStrings<T> = T extends (infer U)[]
  ? ConvertEnumsToStrings<U>[]
  : T extends string
  ? `${T}`
  : T extends object
  ? {
      [K in keyof T]: ConvertEnumsToStrings<T[K]>
    }
  : T
