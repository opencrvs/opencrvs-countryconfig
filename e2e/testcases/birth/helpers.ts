import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { GATEWAY_HOST } from '../../constants'
import { BirthRegistrationInput } from '../../gateway'
import faker from '@faker-js/faker'

import type testData from './data/1-both-mother-and-father.json'
import { readFileSync } from 'fs'
import uuid from 'uuid'
import { format, subDays, subYears } from 'date-fns'
import { Bundle } from 'typescript'
import { join } from 'path'

export const CREATE_BIRTH_REGISTRATION = print(gql`
  mutation createBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
      isPotentiallyDuplicate
      __typename
    }
  }
`)

type Details = {
  informant: {
    type: 'MOTHER' | 'FATHER'
  }
  child: {
    firstNames: string
    familyName: string
    birthDate?: string
    gender: 'male' | 'female'
    birthType?: 'SINGLE' | 'MULTIPLE'
    weightAtBirth?: number
  }
  mother: {
    firstNames: string
    familyName: string
    birthDate?: string
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
  const locations = (await fetch(`${GATEWAY_HOST}/location?type=${type}`).then(
    (res) => res.json()
  )) as fhir.Bundle

  return locations.entry!.map((entry) => entry.resource as fhir.Location)
}

function getLocationIdByName(locations: fhir.Location[], name: string) {
  const location = locations.find((location) => location.name === name)
  if (!location) {
    throw new Error(`Location with name ${name} not found`)
  }
  return location.id
}
export async function createDeclaration(token: string, details: Details) {
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
            contactPhoneNumber: '+260' + faker.random.numeric(9),
            contactEmail: faker.internet.email(),
            draftId: uuid.v4()
          },
          child: {
            name: [
              {
                use: 'en',
                firstNames: details.child.firstNames,
                familyName: details.child.familyName
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
          eventLocation: {
            _fhirID: getLocationIdByName(
              facilities,
              'Chikobo Rural Health Centre'
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
            birthDate:
              details.mother.birthDate ||
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
          }
        } satisfies ConvertEnumsToStrings<BirthRegistrationInput>
      }
    })
  })
  return res.json().then((r) => r.data.createBirthRegistration)
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
