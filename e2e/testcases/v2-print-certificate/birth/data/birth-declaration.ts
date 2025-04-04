import { v4 as uuidv4 } from 'uuid'
import { GATEWAY_HOST } from '../../../../constants'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { getAllLocations, getLocationIdByName } from '../../../birth/helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionDocument, AddressType } from '@opencrvs/toolkit/events'

async function getDeclaration() {
  const locations = await getAllLocations('ADMIN_STRUCTURE')
  const province = getLocationIdByName(locations, 'Central')
  const district = getLocationIdByName(locations, 'Ibombo')

  if (!province || !district) {
    throw new Error('Province or district not found')
  }

  return {
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
    'informant.relation': 'MOTHER',
    'informant.email': 'mothers@email.com',
    'child.firstname': faker.person.firstName(),
    'child.surname': faker.person.lastName(),
    'child.gender': 'female',
    'child.dob': '2025-03-18',
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

type Declaration = Awaited<ReturnType<typeof getDeclaration>>

export interface CreateDeclarationResponse {
  eventId: string
  declaration: Declaration
}

export async function createDeclaration(
  token: string
): Promise<CreateDeclarationResponse> {
  const declaration = await getDeclaration()

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'v2.birth',
    transactionId: uuidv4()
  })
  const eventId = createResponse.id as string

  const signatureBase64 = await fs.readFileSync(
    path.join(__dirname, 'signature.png'),
    'base64'
  )

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': `data:image/png;base64,${signatureBase64}`
  }

  await client.event.actions.declare.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  await client.event.actions.validate.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    duplicates: []
  })

  const response = await client.event.actions.register.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const declareAction = response.actions.find(
    (action: ActionDocument) => action.type === 'DECLARE'
  )

  const data = declareAction?.declaration as Declaration

  return { eventId, declaration: data }
}
