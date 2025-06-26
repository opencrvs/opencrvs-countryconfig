import { v4 as uuidv4 } from 'uuid'
import { GATEWAY_HOST } from '../../constants'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { getAllLocations, getLocationIdByName } from '../birth/helpers'
import { createClient } from '@opencrvs/toolkit/api'
import {
  ActionDocument,
  ActionType,
  ActionUpdate,
  AddressType
} from '@opencrvs/toolkit/events'

async function getPlaceOfBirth(type: 'PRIVATE_HOME' | 'HEALTH_FACILITY') {
  if (type === 'HEALTH_FACILITY') {
    const locations = await getAllLocations('HEALTH_FACILITY')
    const locationId = getLocationIdByName(
      locations,
      'Ibombo Rural Health Centre'
    )

    return {
      'child.placeOfBirth': 'HEALTH_FACILITY',
      'child.birthLocation': locationId
    }
  }

  if (type === 'PRIVATE_HOME') {
    const locations = await getAllLocations('ADMIN_STRUCTURE')
    const province = getLocationIdByName(locations, 'Central')
    const district = getLocationIdByName(locations, 'Ibombo')

    if (!province || !district) {
      throw new Error('Province or district not found')
    }

    return {
      'child.placeOfBirth': 'PRIVATE_HOME',
      'child.address.privateHome': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province,
        district,
        urbanOrRural: 'URBAN' as const
      }
    }
  }

  throw new Error('Invalid place of birth type')
}

export async function getDeclaration({
  partialDeclaration = {},
  placeOfBirthType = 'PRIVATE_HOME'
}: {
  partialDeclaration?: Record<string, any>
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
}) {
  const locations = await getAllLocations('ADMIN_STRUCTURE')
  const province = getLocationIdByName(locations, 'Central')
  const district = getLocationIdByName(locations, 'Ibombo')

  if (!province || !district) {
    throw new Error('Province or district not found')
  }

  const mockDeclaration = {
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.nationality': 'FAR',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10),
    'mother.address': {
      country: 'FAR',
      province,
      district,
      urbanOrRural: 'URBAN' as const,
      addressType: AddressType.DOMESTIC
    },
    'father.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'father.dob': '1995-09-12',
    'father.nationality': 'FAR',
    'father.idType': 'NATIONAL_ID',
    'father.nid': faker.string.numeric(10),
    'father.addressSameAs': 'NO',
    'father.address': {
      country: 'FAR',
      province,
      district,
      urbanOrRural: 'URBAN' as const,
      addressType: AddressType.DOMESTIC
    },
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.gender': 'female',
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0], // yesterday
    ...(await getPlaceOfBirth(placeOfBirthType)),
    'informant.relation': 'BROTHER',
    'informant.email': 'brothers@email.com',
    'informant.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'informant.dob': '2008-09-12',
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.nid': faker.string.numeric(10)
  }
  // 💡 Merge overriden fields
  return {
    ...mockDeclaration,
    ...partialDeclaration
  }
}

export type Declaration = Awaited<ReturnType<typeof getDeclaration>>

export interface CreateDeclarationResponse {
  eventId: string
  declaration: Declaration
}

async function uploadFile(file: File, token: string) {
  const formData = new FormData()
  const transactionId = uuidv4()
  formData.append('file', file)
  formData.append('transactionId', transactionId)

  const url = new URL('/upload', GATEWAY_HOST)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.statusText}`)
  }

  return {
    filename: `${transactionId}.png`,
    originalFilename: file.name,
    type: file.type
  }
}

function getSignatureFile() {
  const buffer = fs.readFileSync(path.join(__dirname, 'signature.png'))
  return new File([buffer], `signature-${Date.now()}.png`, {
    type: 'image/png'
  })
}

export async function createDeclaration(
  token: string,
  dec?: Partial<ActionUpdate>,
  action: ActionType = ActionType.REGISTER,
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
): Promise<CreateDeclarationResponse> {
  const declaration = await getDeclaration({
    partialDeclaration: dec,
    placeOfBirthType
  })

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'v2.birth',
    transactionId: uuidv4()
  })
  const eventId = createResponse.id as string

  const file = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': file
  }

  const declareRes = await client.event.actions.declare.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: true
  })

  if (action === ActionType.DECLARE) {
    const declareAction = declareRes.actions.find(
      (action: ActionDocument) => action.type === 'DECLARE'
    )

    return { eventId, declaration: declareAction?.declaration as Declaration }
  }

  const validateRes = await client.event.actions.validate.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    duplicates: [],
    keepAssignment: true
  })

  if (action === ActionType.VALIDATE) {
    const validateAction = validateRes.actions.find(
      (action: ActionDocument) => action.type === 'VALIDATE'
    )

    return {
      eventId,
      declaration: validateAction?.declaration as Declaration
    }
  }

  const registerRes = await client.event.actions.register.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const registerAction = registerRes.actions.find(
    (action: ActionDocument) => action.type === 'REGISTER'
  )

  return { eventId, declaration: registerAction?.declaration as Declaration }
}
