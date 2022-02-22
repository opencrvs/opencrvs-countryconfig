import faker from '@faker-js/faker'
import { log } from './util'
import { getFacilities, Location } from './location'

import fetch from 'node-fetch'
import { getToken, getTokenForSystemClient } from './auth'
import { AUTH_API_HOST, GATEWAY_HOST } from './constants'

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

export async function createUser(
  token: string,
  primaryOfficeId: string,
  overrides: Record<string, string>
) {
  const firstName = faker.name.firstName()
  const familyName = faker.name.lastName()
  log('Creating user', firstName, familyName, overrides)
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
    mobile: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    primaryOffice: primaryOfficeId,
    ...overrides
  }

  const createUserRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `createuser-${firstName}-${familyName}`
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

  if (!resp.data) {
    console.log(resp)
  }
  log('User created')
  const { data } = resp as {
    data: { createOrUpdateUser: { username: string; id: string } }
  }
  const userToken = await getToken(data.createOrUpdateUser.username, 'test')

  const res = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
      'x-correlation': `createuser-${firstName}-${familyName}`
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
  const getUsersRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `getusers`
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
          primaryOffice: { id: string }
        }>
      }
    }
  }

  return res.data.searchUsers.results
}

export async function createSystemClient(
  token: string,
  officeId: string,
  scope: 'HEALTH' | 'NATIONAL_ID' | 'EXTERNAL_VALIDATION' | 'AGE_CHECK',
  systemAdmin: User
): Promise<User> {
  const createUserRes = await fetch(`${AUTH_API_HOST}/registerSystemClient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${systemAdmin.token}`,
      'x-correlation': `create-system-scope`
    },
    body: JSON.stringify({ scope })
  })

  const credentials: {
    client_id: string
    client_secret: string
    sha_secret: string
  } = await createUserRes.json()

  const systemToken = await getTokenForSystemClient(
    credentials.client_id,
    credentials.client_secret
  )

  return {
    token: systemToken,
    username: credentials.client_id,
    password: credentials.client_secret,
    stillInUse: true,
    primaryOfficeId: officeId,
    isSystemUser: true
  }
}

export async function createUsers(
  token: string,
  location: Location,
  config: Config
) {
  log('Fetching existing users')
  const existingUsers = await getUsers(token, location.id)
  log('Found', existingUsers.length, 'existing users')

  const fieldAgents: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'FIELD_AGENT')
      .map(async user => ({
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
      .map(async user => ({
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
      .map(async user => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: false
      }))
  )

  const systemAdmins: User[] = await Promise.all(
    existingUsers
      .filter(({ role }) => role === 'LOCAL_SYSTEM_ADMIN')
      .map(async user => ({
        username: user.username,
        password: 'test',
        token: await getToken(user.username, 'test'),
        stillInUse: true,
        primaryOfficeId: user.primaryOffice.id,
        isSystemUser: false
      }))
  )

  // These cannot be fetched through gateway, so we'll always have to regenerate them
  const hospitals: User[] = []

  const crvsOffices = (await getFacilities(token))
    .filter(({ type }) => type === 'CRVS_OFFICE')
    .filter(({ partOf }) => partOf === 'Location/' + location.id)
  if (crvsOffices.length === 0) {
    throw new Error(`Cannot find any CRVS offices for ${location.name}`)
  }
  const randomOffice =
    crvsOffices[Math.floor(Math.random() * crvsOffices.length)]
  log('Creating field agents')
  for (let i = fieldAgents.length; i < config.fieldAgents; i++) {
    fieldAgents.push(
      await createUser(token, randomOffice.id, {
        role: 'FIELD_AGENT'
      })
    )
  }
  log('Field agents created')
  log('Creating', config.hospitalFieldAgents, 'hospitals')
  for (let i = 0; i < config.hospitalFieldAgents; i++) {
    const systemAdmin =
      systemAdmins[i] ||
      (await createUser(token, randomOffice.id, {
        role: 'LOCAL_SYSTEM_ADMIN'
      }))

    hospitals.push(
      await createSystemClient(token, randomOffice.id, 'HEALTH', systemAdmin)
    )
  }

  log('Hospitals created')
  log('Creating registration agents')
  for (let i = registrationAgents.length; i < config.registrationAgents; i++) {
    registrationAgents.push(
      await createUser(token, randomOffice.id, {
        role: 'REGISTRATION_AGENT'
      })
    )
  }
  log('Registration agents created')
  log('Creating local registrars')

  for (let i = registrars.length; i < config.localRegistrars; i++) {
    registrars.push(
      await createUser(token, randomOffice.id, {
        role: 'LOCAL_REGISTRAR'
      })
    )
  }
  log('Local registrars created')

  return { fieldAgents, hospitals, registrationAgents, registrars }
}
