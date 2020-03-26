import * as fetchMock from 'jest-fetch-mock'
import { mockLocationsResponse } from '@ocrvs-chatbot-mediator/test/utils'
import { getEventLocationId } from '@ocrvs-chatbot-mediator/utils/locations'

let fetch: fetchMock.FetchMock

describe('Locations utils', () => {
  beforeEach(async () => {
    fetch = fetchMock as fetchMock.FetchMock
  })
  it('returns the location id by fetching and filtering locations', async () => {
    fetch.mockResponses([
      JSON.stringify(mockLocationsResponse),
      { status: 200 }
    ])
    const searchCriteria = await getEventLocationId(
      { Authorization: 'bearer xyz' },
      'Chembe'
    )

    expect(searchCriteria).toEqual('394e6ec9-5db7-4ce7-aa5e-6686f7a74081')
  })
})
