import fetch from 'node-fetch'
import { RESOURCES_URL } from '@ocrvs-chatbot-mediator/constants'
import { IAuthHeader } from '@ocrvs-chatbot-mediator/features/search/service'

export interface ILocation {
  id: string
  name: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}

export async function loadLocations(
  authHeader: IAuthHeader
): Promise<ILocationDataResponse> {
  const url = `${RESOURCES_URL}/locations`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

export async function getEventLocationId(
  authHeader: IAuthHeader,
  name: string
): Promise<string> {
  const locations = await loadLocations(authHeader)
  const searchableLocations = Object.values(locations)
  const filteredLocations = searchableLocations.filter(
    location =>
      location.name.toUpperCase().includes(name.toUpperCase()) &&
      location.type === 'ADMIN_STRUCTURE'
  )

  const selectedValue =
    (filteredLocations &&
      filteredLocations.length > 0 &&
      filteredLocations[0].id) ||
    ''
  return selectedValue
}
