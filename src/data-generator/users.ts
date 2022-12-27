import faker from '@faker-js/faker'
import { log } from './util'
import { getFacilities, Location } from './location'

import fetch from 'node-fetch'
import { getToken, getTokenForSystemClient } from './auth'
import { AUTH_API_HOST, GATEWAY_GQL_HOST } from './constants'
import { expand } from 'regex-to-strings'
import { convertToMSISDN } from '@countryconfig/features/utils'
import { FIELD_AGENT_TYPES } from '@countryconfig/features/employees/scripts/utils'

export type User = {
  username: string
  password: string
  token: string
  stillInUse: boolean
  primaryOfficeId: string
  isSystemUser: boolean
}

type Config = {
  fieldAgents: number
  hospitalFieldAgents: number
  registrationAgents: number
  localRegistrars: number
  natlSysAdmin: number
}

enum Role {
  NationalSystemAdmin = 'NATIONAL_SYSTEM_ADMIN',
  FieldAgent = 'FIELD_AGENT',
  LocalRegistrar = 'LOCAL_REGISTRAR',
  LocalSystemAdmin = 'LOCAL_SYSTEM_ADMIN',
  RegistrationAgent = 'REGISTRATION_AGENT',
  NationalRegistrar = 'NATIONAL_REGISTRAR',
  StateRegistrar = 'STATE_REGISTRAR',
  DistrictRegistrar = 'DISTRICT_REGISTRAR'
}

interface ICreateUser {
  clientId: string
  shaSecret: string
}

export async function createUser(
  token: string,
  primaryOfficeId: string,
  countryAlpha3: string,
  phoneNumberRegex: string,
  overrides: Record<string, string>
) {
  const firstName = faker.name.firstName()
  const familyName = faker.name.lastName()
  log('Creating user', firstName, familyName, overrides)

  const phoneNumberExpander = expand(phoneNumberRegex)
  const generatedPhoneNumber = phoneNumberExpander.getIterator().next().value
  countryAlpha3 = countryAlpha3.toUpperCase() === 'FAR' ? 'ZMB' : countryAlpha3

  const user = {
    name: [
      {
        use: 'en',
        firstNames: firstName,
        familyName: familyName
      }
    ],
    identifier: [
      {
        system: 'NATIONAL_ID',
        value: faker.datatype
          .number({ min: 100000000, max: 999999999 })
          .toString()
      }
    ],
    username:
      firstName.toLocaleLowerCase() + '.' + familyName.toLocaleLowerCase(),
    mobile: convertToMSISDN(generatedPhoneNumber, countryAlpha3),
    email: faker.internet.email(),
    primaryOffice: primaryOfficeId,
    ...overrides
  }

  const createUserRes = await fetch(GATEWAY_GQL_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `createuser-${firstName}-${familyName}`
    },
    body: JSON.stringify({
      query: `
      mutation createOrUpdateUser($user: UserInput!) {
        createOrUpdateUser(user: $user) {
          username
          id
        }
      }
    `,
      variables: { user }
    })
  })

  const resp = await createUserRes.json()

  log('User created')
  const { data } = resp as {
    data: { createOrUpdateUser: { username: string; id: string } }
  }
  const userToken = await getToken(data.createOrUpdateUser.username, 'test')

  const res = await fetch(GATEWAY_GQL_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
      'x-correlation-id': `createuser-${firstName}-${familyName}`
    },
    body: JSON.stringify({
      query: `
      mutation activateUser($userId: String!, $password: String!, $securityQNAs: [SecurityQuestionAnswer]!) {
        activateUser(userId: $userId, password: $password, securityQNAs: $securityQNAs)
      }
    `,
      variables: {
        userId: data.createOrUpdateUser.id,
        password: 'test',
        securityQNAs: []
      }
    })
  })

  if (res.status !== 200) {
    throw new Error('Could not activate user')
  }

  return {
    ...data.createOrUpdateUser,
    token: userToken,
    primaryOfficeId,
    stillInUse: true,
    password: 'test',
    isSystemUser: false
  }
}

export async function getUsers(token: string, locationId: string) {
  const getUsersRes = await fetch(GATEWAY_GQL_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `getusers`
    },
    body: JSON.stringify({
      operationName: null,
      variables: {
        locationId: locationId,
        count: 100
      },
      query: `
        query ($count: Int, $skip: Int, $locationId: String) {
          searchUsers(count: $count, skip: $skip, locationId: $locationId) {
            totalItems
            results {
              id
              primaryOffice {
                id
              }
              username
              role
            }
          }
        }
      `
    })
  })

  const res = (await getUsersRes.json()) as {
    data: {
      searchUsers: {
        results: Array<{
          username: string
          role: Role
          type: string
          primaryOffice: { id: string }
        }>
      }
    }
  }

  return res.data.searchUsers.results
}

export async function createSystemClient(
  officeId: string,
  scope:
    | 'HEALTH'
    | 'NATIONAL_ID'
    | 'EXTERNAL_VALIDATION'
    | 'AGE_CHECK'
    | 'RECORD_SEARCH',
    natlSystemAdmin: User
): Promise<User> {
  const createUserRes = await fetch(`${AUTH_API_HOST}/registerSystemClient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${natlSystemAdmin.token}`,
      'x-correlation-id': `create-system-scope`
    },
    body: JSON.stringify({ type: scope, name:  faker.word.noun(5)})
  })
  const credentialsRes = await createUserRes.json()
  const credentials: {
    system : ICreateUser
    clientSecret: string
  } = credentialsRes
  
  const systemToken = await getTokenForSystemClient(
    credentials.system.clientId,
    credentials.clientSecret
  )

  return {
    token: systemToken,
    username: credentials.system.clientId,
    password: credentials.clientSecret,
    stillInUse: true,
    primaryOfficeId: officeId,
    isSystemUser: true
  }
}

export async function createUsers(
  token: string,
  location: Location,
  countryCode: string,
  phoneNumberRegex: string,
  config: Config
) {
  log('Fetching existing users')
  const existingUsers = await getUsers(token, location.id)
  log('Found', existingUsers.length, 'existing users')

  const fieldAgents: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'FIELD_AGENT')
      .map(async (user) => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: false
      }))
  )
  const registrationAgents: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'REGISTRATION_AGENT')
      .map(async (user) => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: false
      }))
  )
  const registrars: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'LOCAL_REGISTRAR')
      .map(async (user) => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: false
      }))
  )

  const natlSystemAdminUser: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'NATIONAL_SYSTEM_ADMIN')
      .map(async (user) => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: true
      }))
  )

  // These cannot be fetched through gateway, so we'll always have to regenerate them
  const hospitals: User[] = []
  
  const crvsOffices = (await getFacilities(token))
    .filter(({ type }: any) => type === 'CRVS_OFFICE')
    .filter(({ partOf }: any) => partOf === 'Location/' + location.id)

  if (crvsOffices.length === 0) {
    throw new Error(`Cannot find any CRVS offices for ${location.name}`)
  }
  const randomOffice =
    crvsOffices[Math.floor(Math.random() * crvsOffices.length)]
  const randomFieldAgentType =
    FIELD_AGENT_TYPES[Math.floor(Math.random() * FIELD_AGENT_TYPES.length)]
  log('Creating field agents')
  for (let i = fieldAgents.length; i < config.fieldAgents; i++) {
    fieldAgents.push(
      await createUser(token, randomOffice.id, countryCode, phoneNumberRegex, {
        role: 'FIELD_AGENT',
        type: randomFieldAgentType
      })
    )
  }
  log('Field agents created')

  log('Creating natlSysAdmin user')
  for (let i = natlSystemAdminUser.length; i < config.natlSysAdmin; i++) {
    natlSystemAdminUser.push(
      await createUser(token, randomOffice.id, countryCode, phoneNumberRegex, {
        role: 'NATIONAL_SYSTEM_ADMIN',
        type: ''
      })
    )
  }
  log('NatlSystemAdmin user created')

  log('Creating', config.natlSysAdmin, 'hospitals')
  for (let i = 0; i < config.natlSysAdmin; i++) {
    const natlSystemAdmin =
    natlSystemAdminUser[0] ||
    (await createUser(token, randomOffice.id, countryCode, phoneNumberRegex, {
      role: 'NATIONAL_SYSTEM_ADMIN',
      type: ''
    }))

    const user = await createSystemClient(
      randomOffice.id,
      'HEALTH',
      natlSystemAdmin
    )

    hospitals.push(user)
  }

  log('Hospitals created')
  log('Creating registration agents')
  for (let i = registrationAgents.length; i < config.registrationAgents; i++) {
    registrationAgents.push(
      await createUser(token, randomOffice.id, countryCode, phoneNumberRegex, {
        role: 'REGISTRATION_AGENT',
        type: ''
      })
    )
  }
  log('Registration agents created')
  log('Creating local registrars')

  for (let i = registrars.length; i < config.localRegistrars; i++) {
    registrars.push(
      await createUser(token, randomOffice.id, countryCode, phoneNumberRegex, {
        role: 'LOCAL_REGISTRAR',
        type: ''
      })
    )
  }
  log('Local registrars created')

  return { fieldAgents, hospitals, registrationAgents, registrars }
}
