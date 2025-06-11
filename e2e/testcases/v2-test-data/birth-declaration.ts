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

type InformantRelation = 'MOTHER' | 'BROTHER'

function getInformantDetails(informantRelation: InformantRelation) {
  if (informantRelation === 'MOTHER') {
    return {
      'informant.relation': informantRelation,
      'informant.email': 'mothers@email.com'
    }
  }

  return {
    'informant.relation': informantRelation,
    'informant.email': 'brothers@email.com',
    'informant.firstname': faker.person.firstName(),
    'informant.surname': faker.person.lastName(),
    'informant.dob': '2008-09-12',
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.nid': faker.string.numeric(10)
  }
}

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
  informantRelation = 'MOTHER',
  partialDeclaration = {},
  placeOfBirthType = 'PRIVATE_HOME'
}: {
  informantRelation?: InformantRelation
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
      province,
      district,
      urbanOrRural: 'URBAN' as const,
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
      addressType: AddressType.DOMESTIC
    },
    'child.firstname': faker.person.firstName(),
    'child.surname': faker.person.lastName(),
    'child.gender': 'female',
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0], // yesterday
    ...(await getPlaceOfBirth(placeOfBirthType)),
    ...getInformantDetails(informantRelation)
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

function getSignatureFile() {
  const buffer = fs.readFileSync(path.join(__dirname, 'signature.png'))
  return new File([buffer], `signature-${Date.now()}.png`, {
    type: 'image/png'
  })
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

  const filename = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': filename
  }

  const declareRes = await client.event.actions.declare.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: action !== ActionType.DECLARE
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

export async function rejectDeclaration(
  token: string,
  eventId: string
): Promise<any> {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const rejectResponse = await client.event.actions.reject.request.mutate({
    eventId,
    declaration: {},
    transactionId: uuidv4(),
    reason: { message: 'For test' }
  })

  return rejectResponse
}
