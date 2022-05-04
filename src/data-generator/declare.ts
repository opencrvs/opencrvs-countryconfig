import fetch from 'node-fetch'
import { User } from './users'
import { faker } from '@faker-js/faker'
import { sub, differenceInDays, add, max, differenceInYears } from 'date-fns'
import { log } from './util'

import { Facility, Location } from './location'
import { COUNTRY_CONFIG_HOST, GATEWAY_HOST } from './constants'
import { createAddressInput } from './address'
import { AddressType, BirthRegistration, EducationType } from './gateway'
import { pick } from 'lodash'

function randomWeightInGrams() {
  return Math.round((2.5 + 2 * Math.random()) * 1000)
}

export async function sendBirthNotification(
  { username, token }: User,
  sex: 'male' | 'female',
  birthDate: Date,
  createdAt: Date,
  location: Facility
) {
  const familyName = faker.name.lastName()
  const firstNames = faker.name.firstName()
  const requestStart = Date.now()

  const notification = {
    created_at: createdAt,
    dhis2_event: '1111',
    child: {
      first_names: firstNames,
      last_name: familyName,
      weight: randomWeightInGrams().toString(),
      sex: sex
    },
    father: {
      first_names: 'Dad',
      last_name: familyName,
      nid: faker.datatype.number({ min: 100000000, max: 999999999 }).toString()
    },
    mother: {
      first_names: 'Mom',
      last_name: familyName,
      dob: sub(birthDate, { years: 20 })
        .toISOString()
        .split('T')[0],
      nid: faker.datatype.number({ min: 100000000, max: 999999999 }).toString()
    },
    phone_number:
      '+2607' + faker.datatype.number({ min: 10000000, max: 99999999 }),
    date_birth: birthDate.toISOString().split('T')[0],
    place_of_birth: location.id
  }
  const createBirthNotification = await fetch(
    `${COUNTRY_CONFIG_HOST}/dhis2-notification/birth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-correlation-id': `birth-notification-${firstNames}-${familyName}`
      },
      body: JSON.stringify(notification)
    }
  )

  if (!createBirthNotification.ok) {
    log(
      'Failed to create a birth notification',
      await createBirthNotification.text()
    )
    throw new Error('Failed to create a birth notification')
  }

  const res = await createBirthNotification.json()

  const requestEnd = Date.now()
  log(
    'Creating birth notification',
    firstNames,
    familyName,
    'born',
    birthDate.toISOString().split('T')[0],
    'created by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return res.compositionId
}

export async function createBirthDeclaration(
  { username, token }: User,
  sex: 'male' | 'female',
  birthDate: Date,
  declarationTime: Date,
  location: Location
) {
  const timeFilling = Math.round(100000 + Math.random() * 100000) // 100 - 200 seconds
  const familyName = faker.name.lastName()
  const firstNames = faker.name.firstName()
  const mother = {
    nationality: ['FAR'],
    occupation: 'Bookkeeper',
    educationalAttainment: EducationType.LowerSecondaryIsced_2,
    dateOfMarriage: sub(birthDate, { years: 2 })
      .toISOString()
      .split('T')[0],
    identifier: [
      {
        id: faker.datatype.number({ min: 100000000, max: 999999999 }),
        type: 'NATIONAL_ID'
      }
    ],
    name: [
      {
        use: 'en',
        familyName: familyName
      }
    ],
    birthDate: sub(birthDate, { years: 20 })
      .toISOString()
      .split('T')[0],
    maritalStatus: 'MARRIED',
    address: [
      createAddressInput(location, AddressType.PrimaryAddress),
      createAddressInput(location, AddressType.PrimaryAddress)
    ]
  }

  const details = {
    createdAt: declarationTime.toISOString(),
    registration: {
      contact: 'MOTHER',
      contactPhoneNumber:
        '+2607' + faker.datatype.number({ min: 10000000, max: 99999999 }),
      contactRelationship: 'Mother',
      status: [
        {
          timestamp: sub(declarationTime, {
            seconds: timeFilling / 1000
          }),
          timeLoggedMS: timeFilling * 1000
        }
      ],
      draftId: faker.datatype.uuid()
    },

    child: {
      name: [
        {
          use: 'en',
          firstNames,
          familyName
        }
      ],
      gender: sex,
      birthDate: birthDate.toISOString().split('T')[0],
      multipleBirth: Math.round(Math.random() * 5)
    },
    attendantAtBirth: 'PHYSICIAN',
    birthType: 'SINGLE',
    weightAtBirth: Math.round(2.5 + 2 * Math.random() * 10) / 10,
    eventLocation: {
      address: createAddressInput(location, AddressType.PrivateHome),
      type: AddressType.PrivateHome
    },
    mother
  }

  const requestStart = Date.now()
  const createDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `declare-${firstNames}-${familyName}`
    },
    body: JSON.stringify({
      query: `
        mutation submitMutation($details: BirthRegistrationInput!) {
          createBirthRegistration(details: $details) {
            compositionId
          }
        }`,
      variables: {
        details
      }
    })
  })
  const requestEnd = Date.now()
  log(
    'Creating',
    firstNames,
    familyName,
    'born',
    birthDate.toISOString().split('T')[0],
    'declared',
    declarationTime.toISOString().split('T')[0],
    'days in between',
    differenceInDays(declarationTime, birthDate),
    'created by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )
  const result = await createDeclarationRes.json()
  if (!result?.data?.createBirthRegistration?.compositionId) {
    log(result)
    throw new Error('Birth declaration was not created')
  }
  return result.data.createBirthRegistration.compositionId
}

export async function createDeathDeclaration(
  { username, token }: User,
  deathTime: Date,
  sex: 'male' | 'female',
  declarationTime: Date,
  location: Location
) {
  const familyName = faker.name.lastName()
  const firstNames = faker.name.firstName()

  const requestStart = Date.now()

  const birthDate = sub(deathTime, { years: Math.random() * 100 })
  const deathDay = deathTime
  const timeFilling = Math.round(100000 + Math.random() * 100000) // 100 - 200 seconds
  const details = {
    createdAt: declarationTime.toISOString(),
    registration: {
      contact: 'INFORMANT',
      contactPhoneNumber:
        '+2607' + faker.datatype.number({ min: 10000000, max: 99999999 }),
      contactRelationship: 'Mother',
      draftId: faker.datatype.uuid(),
      status: [
        {
          timestamp: sub(declarationTime, {
            seconds: timeFilling / 1000
          }),
          timeLoggedMS: timeFilling * 1000
        }
      ]
    },
    causeOfDeath: 'Natural cause',
    deceased: {
      identifier: [
        {
          id: faker.datatype.number({ min: 100000000, max: 999999999 }),
          type: 'NATIONAL_ID'
        },
        {
          id: faker.datatype.number({ min: 100000000, max: 999999999 }),
          type: 'SOCIAL_SECURITY_NO'
        }
      ],
      nationality: ['FAR'],
      name: [
        {
          use: 'en',
          firstNames: firstNames,
          familyName: familyName
        }
      ],
      birthDate: birthDate.toISOString().split('T')[0],
      gender: sex,
      maritalStatus: 'MARRIED',
      address: [createAddressInput(location, AddressType.PrimaryAddress)],
      age: Math.max(1, differenceInYears(deathDay, birthDate)),
      deceased: {
        deceased: true,
        deathDate: deathDay.toISOString().split('T')[0]
      }
    },
    mannerOfDeath: 'NATURAL_CAUSES',
    maleDependentsOfDeceased: Math.round(Math.random() * 5),
    femaleDependentsOfDeceased: Math.round(Math.random() * 5),
    eventLocation: {
      address: createAddressInput(location, AddressType.PrimaryAddress),
      type: AddressType.PrimaryAddress
    },
    informant: {
      individual: {
        birthDate: sub(declarationTime, { years: 20 })
          .toISOString()
          .split('T')[0],
        occupation: 'consultant',
        nationality: ['FAR'],
        identifier: [
          {
            id: faker.datatype.number({ min: 100000000, max: 999999999 }),
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'en',
            firstNames: firstNames,
            familyName: familyName
          }
        ],
        address: [createAddressInput(location, AddressType.PrimaryAddress)]
      },
      relationship: 'SON'
    },
    father: {
      name: [
        {
          use: 'en',
          familyName: familyName
        }
      ]
    },
    mother: {
      name: [
        {
          use: 'en',
          familyName: familyName
        }
      ]
    }
  }

  const createDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `declare-death-${firstNames}-${familyName}`
    },
    body: JSON.stringify({
      operationName: 'submitMutation',
      variables: {
        details
      },
      query: `mutation submitMutation($details: DeathRegistrationInput!) {
            createDeathRegistration(details: $details) {
              trackingId
              compositionId
          }
      }
      `
    })
  })
  const requestEnd = Date.now()
  log(
    'Creating a death declaration for',
    firstNames,
    familyName,
    'born',
    birthDate.toISOString().split('T')[0],
    'died',
    deathDay.toISOString().split('T')[0],
    'declared',
    declarationTime.toISOString().split('T')[0],
    'days in between',
    differenceInDays(declarationTime, deathDay),
    'created by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )
  const result = await createDeclarationRes.json()
  if (!result?.data?.createDeathRegistration?.compositionId) {
    log(result)

    throw new Error('Death declaration was not created')
  }
  return result.data.createDeathRegistration.compositionId
}

export const BIRTH_REGISTRATION_FIELDS = `
  _fhirIDMap
  id
  createdAt
  child {
    id
    multipleBirth
    name {
      use
      firstNames
      familyName
    }
    birthDate
    gender
  }
  informant {
    id
    relationship
    otherRelationship
    individual {
      id
      identifier {
        id
        type
    }
    name {
        use
        firstNames
        familyName
    }
    occupation
    nationality
    birthDate
    address {
        type
        line
        district
        state
        city
        postalCode
        country
    }
  }
  }
  mother {
    id
    name {
      use
      firstNames
      familyName
  }
  birthDate
  maritalStatus
  occupation
  dateOfMarriage
  educationalAttainment
  nationality
  identifier {
      id
      type
  }
  address {
      type
      line
      district
      state
      city
      postalCode
      country
  }
  telecom {
      system
      value
  }
  }
  father {
    id
    name {
      use
      firstNames
      familyName
  }
  birthDate
  maritalStatus
  occupation
  dateOfMarriage
  educationalAttainment
  nationality
  identifier {
    id
    type
  }
  address {
    type
    line
    district
    state
    city
    postalCode
    country
  }
  telecom {
    system
    value
  }
  }
  registration {
    id
    contact
    contactRelationship
    contactPhoneNumber
    attachments {
      data
      type
      contentType
      subject
    }
    status {
        comments {
        comment
      }
      type
      timestamp
    }
    type
    trackingId
    registrationNumber
  }
  attendantAtBirth
  weightAtBirth
  birthType
  eventLocation {
    type
    address {
      line
      district
      state
      city
      postalCode
      country
    }
  }
`

export const FETCH_REGISTRATION_QUERY = `
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      ${BIRTH_REGISTRATION_FIELDS}
    }
  }`
export async function fetchRegistration(
  user: User,
  compositionId: string
): Promise<BirthRegistration> {
  const fetchDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
      'x-correlation-id': `fetch-declaration-${compositionId}`
    },
    body: JSON.stringify({
      query: FETCH_REGISTRATION_QUERY,
      variables: {
        id: compositionId
      }
    })
  })

  const res = await fetchDeclarationRes.json()
  if (!res.data?.fetchBirthRegistration) {
    throw new Error(
      `Fetching birth declaration data for ${compositionId} failed`
    )
  }

  return res.data.fetchBirthRegistration
}
export const DEATH_REGISTRATION_FIELDS = `
_fhirIDMap
id
createdAt
deceased {
  id
  name {
    use
    firstNames
    familyName
  }
  birthDate
  age
  gender
  maritalStatus
  nationality
  identifier {
    id
    type
  }
  gender
  deceased {
    deathDate
  }
  address {
    type
    line
    district
    state
    city
    postalCode
    country
  }
}
informant {
  id
  relationship
  individual {
    id
    identifier {
      id
      type
    }
    name {
      use
      firstNames
      familyName
    }
    nationality
    occupation
    birthDate
    telecom {
      system
      value
    }
    address {
      type
      line
      district
      state
      city
      postalCode
      country
    }
  }
}
father {
  id
  name {
    use
    firstNames
    familyName
  }
}
mother {
  id
  name {
    use
    firstNames
    familyName
  }
}
medicalPractitioner {
  name
  qualification
  lastVisitDate
}
registration {
  id
  contact
  contactRelationship
  contactPhoneNumber
  attachments {
    data
    type
    contentType
    subject
  }
  status {
    type
    timestamp
  }
  type
  trackingId
  registrationNumber
}
eventLocation {
  id
  type
  address {
    type
    line
    district
    state
    city
    postalCode
    country
  }
}
mannerOfDeath
causeOfDeath
maleDependentsOfDeceased
femaleDependentsOfDeceased`

const FETCH_DEATH_REGISTRATION_QUERY = `query data($id: ID!) {
  fetchDeathRegistration(id: $id) {
    ${DEATH_REGISTRATION_FIELDS}
  }
}
`
export async function fetchDeathRegistration(
  user: User,
  compositionId: string
) {
  const fetchDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
      'x-correlation-id': `fetch-declaration-${compositionId}`
    },
    body: JSON.stringify({
      query: FETCH_DEATH_REGISTRATION_QUERY,
      variables: {
        id: compositionId
      }
    })
  })

  const res = await fetchDeclarationRes.json()
  if (!res.data?.fetchDeathRegistration) {
    throw new Error(
      `Fetching death declaration data for ${compositionId} failed`
    )
  }

  return res.data.fetchDeathRegistration
}

export async function fetchAlreadyGeneratedInterval(
  token: string,
  locationIds: string[]
) {
  const fetchFirst = async (sort: 'desc' | 'asc') => {
    const res = await fetch(GATEWAY_HOST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-correlation-id': `fetch-interval-oldest`
      },
      body: JSON.stringify({
        query: `query data($sort: String, $locationIds: [String]) {
          searchEvents(sort: $sort, locationIds: $locationIds, sortColumn: "dateOfDeclaration", count: 1) {
            results {
              registration {
                dateOfDeclaration
              }
            }
          }
        }
        `,
        variables: {
          sort,
          locationIds
        }
      })
    })
    const body = await res.json()

    if (body.errors) {
      log(body.errors)
      throw new Error('Fetching generated intervals failed')
    }

    const data = body.data as {
      searchEvents: {
        results: Array<{
          registration: {
            dateOfDeclaration: string
          }
        }>
      }
    }
    return data.searchEvents.results.map(
      ({ registration }) => new Date(registration.dateOfDeclaration)
    )[0]
  }

  return (await Promise.all([fetchFirst('asc'), fetchFirst('desc')])).filter(
    Boolean
  )
}
