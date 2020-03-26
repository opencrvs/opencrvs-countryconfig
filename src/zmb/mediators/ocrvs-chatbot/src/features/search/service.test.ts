import * as fetchMock from 'jest-fetch-mock'
import {
  body,
  mockLocationsResponse,
  mockSearchCriteria
} from '@ocrvs-chatbot-mediator/test/utils'
import { createSearchCriteria } from '@ocrvs-chatbot-mediator/features/search/service'

let fetch: fetchMock.FetchMock

describe('Search service', () => {
  beforeEach(async () => {
    fetch = fetchMock as fetchMock.FetchMock
  })
  it('returns search criteria', async () => {
    const request = {
      payload: body,
      headers: { Authorization: 'bearer xyz' }
    }
    fetch.mockResponses([
      JSON.stringify(mockLocationsResponse),
      { status: 200 }
    ])
    const searchCriteria = await createSearchCriteria(
      request.headers,
      request.payload
    )

    expect(searchCriteria).toEqual(mockSearchCriteria)
  })
})
