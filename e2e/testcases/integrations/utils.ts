import { AUTH_URL, GATEWAY_HOST } from '../../constants'
import fetch from 'node-fetch'

export async function getTokenForSystemClient(
  clientId: string,
  clientSecret: string
) {
  const authenticateResponse = await fetch(
    `${AUTH_URL}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': clientId + '-' + Date.now()
      }
    }
  )
  const res = await authenticateResponse.json()
  return res as { access_token: string }
}

export async function fetchEvents(trackingId: string, token: string) {
  const query = `
    query SearchEvents(
      $advancedSearchParameters: AdvancedSearchParametersInput!
    ) {
      searchEvents(
        advancedSearchParameters: $advancedSearchParameters
      ) {
        totalItems
      }
    }
  `

  const variables = {
    advancedSearchParameters: {
      trackingId
    }
  }

  const response = await fetch(GATEWAY_HOST + '/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ query, variables })
  })

  const data = await response.json()
  return data as { data: { searchEvents: { totalItems: number } } }
}
