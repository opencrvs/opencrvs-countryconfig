import uuid from 'uuid'
import { EVENT_API_URL } from '../../../../constants'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'

const generateCreateRequestData = () => {
  const transactionId = `tmp-${uuid.v4()}`
  return {
    json: {
      type: 'v2.birth',
      transactionId,
      data: null
    },
    meta: {
      values: {
        data: ['undefined']
      }
    }
  }
}

const declarationData = {
  'father.detailsNotAvailable': true,
  'father.reason': 'Father is missing.',
  'mother.firstname': faker.person.firstName(),
  'mother.surname': faker.person.lastName(),
  'mother.dob': '1995-09-12',
  'mother.nationality': 'FAR',
  'mother.idType': 'NATIONAL_ID',
  'mother.nid': faker.string.numeric(10),
  'mother.address': {
    country: 'FAR',
    province: 'a9b82be4-fdbb-4cfc-9926-d1b0d1af8bea',
    district: '4e471e0b-12e1-41d5-9c9b-f31cf5590f80',
    urbanOrRural: 'URBAN',
    town: null,
    residentialArea: null,
    street: null,
    number: null,
    zipCode: null,
    village: null,
    state: null,
    district2: null,
    cityOrTown: null,
    addressLine1: null,
    addressLine2: null,
    addressLine3: null,
    postcodeOrZip: null,
    addressType: 'DOMESTIC'
  },
  'informant.relation': 'MOTHER',
  'informant.email': 'mothers@email.com',
  'child.firstname': faker.person.firstName(),
  'child.surname': faker.person.lastName(),
  'child.gender': 'female',
  'child.dob': '2025-03-18',
  'child.placeOfBirth': 'PRIVATE_HOME',
  'child.address.privateHome': {
    country: 'FAR',
    addressType: 'DOMESTIC',
    province: 'a9b82be4-fdbb-4cfc-9926-d1b0d1af8bea',
    district: '4e471e0b-12e1-41d5-9c9b-f31cf5590f80',
    urbanOrRural: 'URBAN'
  }
}

const generateBirthRequestData = async (eventId: string) => {
  const signatureBase64 = await fs.readFileSync(
    path.join(__dirname, 'signature.png'),
    'base64'
  )

  return {
    json: {
      data: declarationData,
      metadata: {
        'review.comment': 'My comment',
        'review.signature': `data:image/png;base64,${signatureBase64}`
      },
      eventId,
      transactionId: uuid.v4(),
      duplicates: []
    }
  }
}

export interface CreateDeclarationResponse {
  eventId: string
  data: typeof declarationData
}

export async function fetchEventApi(
  token: string,
  path: string,
  body: Record<string, any>
) {
  return fetch(`${EVENT_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
}

export async function createDeclaration(
  token: string
): Promise<CreateDeclarationResponse> {
  const createResponse = await fetchEventApi(
    token,
    '/event.create',
    generateCreateRequestData()
  )

  const createResponseData = await createResponse.json()
  const eventId = createResponseData.result.data.json.id as string

  await fetchEventApi(
    token,
    '/event.actions.declare',
    await generateBirthRequestData(eventId)
  )

  await fetchEventApi(
    token,
    '/event.actions.validate',
    await generateBirthRequestData(eventId)
  )

  const response = await fetchEventApi(
    token,
    '/event.actions.register',
    await generateBirthRequestData(eventId)
  )

  const parsedResponse = await response.json()
  const res = parsedResponse.result.data.json

  const data = res.actions.find((action: any) => action.type === 'DECLARE')
    .data as typeof declarationData

  return { eventId, data }
}
