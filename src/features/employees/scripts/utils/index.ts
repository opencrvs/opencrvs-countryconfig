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
import * as fs from 'fs'
import { ORG_URL } from '@countryconfig/constants'
import { getFromFhir, sendToFhir } from '@countryconfig/features/utils'
import chalk from 'chalk'
import User, {
  IUserModel,
  ISecurityQuestionAnswer
} from '@countryconfig/features/employees/model/user'
import { EMPLOYEES_SOURCE } from '@countryconfig/constants'
import {
  generateSaltedHash,
  convertToMSISDN,
  ISaltedHash,
  generateHash
} from '@countryconfig/features/utils'
import * as niceware from 'niceware'
import { MONGO_URL } from '@countryconfig/constants'
import * as mongoose from 'mongoose'
import Role from '@countryconfig/features/employees/model/role'

export const FIELD_AGENT_TYPES = [
  'HEALTHCARE_WORKER',
  'POLICE_OFFICER',
  'SOCIAL_WORKER',
  'LOCAL_LEADER'
]

function setDemoUser(scopes: string[], environment: string): string[] {
  if (environment === 'development') {
    // This makes sure that for test users in development, the SMS code is always 000000
    scopes.push('demo')
  }
  return scopes
}

export function getScope(role: string, environment: string): string[] {
  switch (role) {
    case 'FIELD_AGENT':
      return setDemoUser(['declare'], environment)
    case 'REGISTRATION_AGENT':
      return setDemoUser(['validate', 'certify'], environment)
    case 'LOCAL_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'DISTRICT_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'STATE_REGISTRAR':
      return setDemoUser(['register', 'performance', 'certify'], environment)
    case 'NATIONAL_REGISTRAR':
      return setDemoUser(
        ['register', 'performance', 'certify', 'config', 'teams'],
        environment
      )
    case 'LOCAL_SYSTEM_ADMIN':
      return setDemoUser(['sysadmin'], environment)
    case 'NATIONAL_SYSTEM_ADMIN':
      return setDemoUser(['sysadmin', 'natlsysadmin'], environment)
    case 'PERFORMANCE_MANAGEMENT':
      return setDemoUser(['performance'], environment)
    default:
      return setDemoUser(['declare'], environment)
  }
}

export function createUsers(users: IUserModel[]) {
  mongoose.connect(MONGO_URL)
  const fieldAgentRole = new Role({
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    types: FIELD_AGENT_TYPES,
    active: true
  })

  const regitstrationAgentRole = new Role({
    title: 'Registration Agent',
    value: 'REGISTRATION_AGENT',
    types: [],
    active: true
  })

  const regitstrarRole = new Role({
    title: 'Registrar',
    value: 'LOCAL_REGISTRAR',
    types: [],
    active: true
  })

  const sysAdminLocalRole = new Role({
    title: 'System admin (local)',
    value: 'LOCAL_SYSTEM_ADMIN',
    types: [],
    active: true
  })

  const sysAdminNationalRole = new Role({
    title: 'System admin (national)',
    value: 'NATIONAL_SYSTEM_ADMIN',
    types: [],
    active: true
  })

  const performanceMgntRole = new Role({
    title: 'Performance Management',
    value: 'PERFORMANCE_MANAGEMENT',
    types: [],
    active: true
  })

  const nationalRegistrarRole = new Role({
    title: 'National Registrar',
    value: 'NATIONAL_REGISTRAR',
    types: [],
    active: true
  })

  const roles = [
    fieldAgentRole,
    regitstrationAgentRole,
    regitstrarRole,
    sysAdminLocalRole,
    sysAdminNationalRole,
    performanceMgntRole,
    nationalRegistrarRole
  ]
  function onInsert(err: any, values: any) {
    if (!err) {
      mongoose.disconnect()
    } else {
      throw Error(
        `Cannot save ${JSON.stringify(values)} to user-mgnt db ... ${err}`
      )
    }
  }
  Role.collection.insertMany(roles, onInsert)
  User.collection.insertMany(users, onInsert)
}

interface ITestPractitioner {
  facilityId: string
  environment: string
  username: string
  givenNames: string
  familyName: string
  gender: string
  role: string
  type: string
  mobile: string
  email: string
  signature?: string
}

interface ILoginDetails {
  username: string
  password: string
  email: string
  mobile: string
}

const composeFhirPractitioner = (practitioner: ITestPractitioner): any => {
  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        use: 'official',
        system: 'mobile',
        value: practitioner.mobile
      }
    ],
    telecom: [{ system: 'phone', value: practitioner.mobile }],
    name: [
      {
        use: 'en',
        family: [practitioner.familyName],
        given: practitioner.givenNames.split(' ')
      }
    ],
    gender: practitioner.gender,
    extension: practitioner.signature
      ? [
          {
            url: 'http://opencrvs.org/specs/extension/employee-signature',
            valueSignature: {
              type: [
                {
                  system: 'urn:iso-astm:E1762-95:2013',
                  code: '1.2.840.10065.1.12.1.13',
                  display: 'Review Signature'
                }
              ],
              when: new Date().toISOString(),
              contentType: 'image/png',
              blob: practitioner.signature
            }
          }
        ]
      : []
  }
}

const composeFhirPractitionerRole = (
  role: string,
  practitioner: string,
  location: fhir.Reference[]
): fhir.PractitionerRole => {
  return {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: practitioner
    },
    code: [
      {
        coding: [
          {
            system: `${ORG_URL}/specs/roles`,
            code: role
          }
        ]
      }
    ],
    location
  }
}

export async function createOpenCRVSEmployees(
  practitioners: ITestPractitioner[],
  testUserPassword: string,
  environment: string,
  countryAlpha3: string
): Promise<boolean> {
  const users: IUserModel[] = []
  const loginDetails: ILoginDetails[] = []
  for (const practitioner of practitioners) {
    const locations: fhir.Reference[] = []
    const catchmentAreaIds: string[] = []

    if (countryAlpha3 === 'FAR') {
      // For Farajaland, use Zambia country code
      countryAlpha3 = 'ZMB'
    }
    // get location FHIR references for catchment area and PractitionerRole locations prop
    if (!practitioner.facilityId) {
      throw Error(
        'Cannot save practitioner as no facilityId exists to map practitioner to an office'
      )
    }
    const facility = await getFromFhir(
      `/Location?identifier=${encodeURIComponent(practitioner.facilityId)}`
    )
    const facilityResource = facility.entry[0].resource
    const primaryOfficeId = facilityResource.id

    catchmentAreaIds.push(primaryOfficeId)

    locations.push({ reference: `Location/${primaryOfficeId}` })
    let partOf: fhir.Reference = facilityResource.partOf
    let parentLocation: fhir.Location = {}
    while (partOf.reference !== 'Location/0') {
      parentLocation = await getFromFhir(`/${partOf.reference}`)
      locations.push({ reference: `Location/${parentLocation.id}` })
      if (parentLocation.id && parentLocation.partOf) {
        catchmentAreaIds.push(parentLocation.id)
        partOf = parentLocation.partOf
      }
    }

    // Create and save Practitioner
    const newPractitioner: fhir.Practitioner =
      composeFhirPractitioner(practitioner)
    const savedPractitionerResponse = await sendToFhir(
      newPractitioner,
      '/Practitioner',
      'POST'
    ).catch((err) => {
      throw Error('Cannot save practitioner to FHIR')
    })

    const practitionerLocationHeader = savedPractitionerResponse.headers.get(
      'location'
    ) as string
    const practitionerId = practitionerLocationHeader.split('/')[3]
    const practitionerReference = `Practitioner/${practitionerId}`

    // Create and save PractitionerRole
    const newPractitionerRole: fhir.PractitionerRole =
      composeFhirPractitionerRole(
        practitioner.role,
        practitionerReference,
        locations
      )

    await sendToFhir(newPractitionerRole, '/PractitionerRole', 'POST').catch(
      (err) => {
        throw Error('Cannot save practitioner role to FHIR')
      }
    )

    let pass: ISaltedHash
    if (environment !== 'production') {
      pass = generateSaltedHash(testUserPassword)
    } else {
      const generatedPassword = niceware.generatePassphrase(8).join('-')
      loginDetails.push({
        username: practitioner.username,
        password: generatedPassword,
        email: practitioner.email,
        mobile: practitioner.mobile
      })
      console.log(
        `${chalk.white(`USERNAME: `)}${chalk.green(
          `${practitioner.username}`
        )}${chalk.white(` & PASSWORD: `)}${chalk.green(`${generatedPassword}`)}`
      )
      pass = generateSaltedHash(generatedPassword)
    }
    const secAnswer: string = generateHash(testUserPassword, pass.salt)
    const secQAndA: ISecurityQuestionAnswer[] =
      environment !== 'production'
        ? [
            {
              questionKey: 'BIRTH_TOWN',
              answerHash: secAnswer
            },
            {
              questionKey: 'HIGH_SCHOOL',
              answerHash: secAnswer
            },
            {
              questionKey: 'FAVORITE_MOVIE',
              answerHash: secAnswer
            }
          ]
        : []
    const user = new User({
      name: [
        {
          use: 'en',
          given: [practitioner.givenNames],
          family: practitioner.familyName
        }
      ],
      username: practitioner.username,
      email: practitioner.email,
      mobile: convertToMSISDN(practitioner.mobile, countryAlpha3.toUpperCase()),
      passwordHash: pass.hash,
      salt: pass.salt,
      role: practitioner.role,
      type: practitioner.type,
      scope: getScope(practitioner.role, practitioner.environment),
      status: practitioner.environment === 'development' ? 'active' : 'pending',
      practitionerId,
      primaryOfficeId,
      catchmentAreaIds,
      securityQuestionAnswers: secQAndA
    } as IUserModel)
    users.push(user)
  }
  // Create users
  createUsers(users)

  if (environment === 'production') {
    fs.writeFileSync(
      `${EMPLOYEES_SOURCE}tmp/login-details.json`,
      JSON.stringify(loginDetails, null, 2)
    )
    console.log(
      `${chalk.blueBright(
        'FINISHED SAVING PRODUCTION USERS.  USER LOGIN DETAILS HAVE BEEN EXPORTED TO THE features/employees/tmp FOLDER'
      )}`
    )
  } else {
    console.log(
      `${chalk.blueBright(`FINISHED SAVING TEST USERS.`)}  ${chalk.black.bgRed(
        `WARNING: `
      )} ${chalk.blueBright(
        `ALL USERS USE THE SAME PASSWORD: ${testUserPassword}.  YOU MUST ONLY USE THESE USERS FOR TESTING AND DELETE THEM BEFORE GOING TO PRODUCTION`
      )}`
    )
  }
  return true
}
