import fetch from 'node-fetch'
import { COUNTRY_CONFIG_HOST } from './constants'

export type Location = {
  id: string
  name: string
  alias: string
  physicalType: string
  jurisdictionType: string
  type: string
  partOf: string
}
export type Facility = {
  id: string
  name: string
  alias: string
  address: string
  physicalType: string
  type: string
  partOf: string
}

export async function getLocations(token: string) {
  const res = await fetch(`${COUNTRY_CONFIG_HOST}/locations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-correlation': 'locations-' + Date.now().toString()
    }
  })
  const locations = await res.json()

  return Object.values<Location>(locations.data).filter(
    ({ jurisdictionType }) => jurisdictionType === 'DISTRICT'
  )
}

export async function getFacilities(token: string) {
  const res = await fetch(`${COUNTRY_CONFIG_HOST}/facilities`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-correlation': 'facilities-' + Date.now().toString()
    }
  })
  const facilities = await res.json()

  return Object.values<Facility>(facilities.data)
}
