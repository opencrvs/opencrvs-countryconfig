import * as fetchMock from 'jest-fetch-mock'
import {
  body,
  mockLocationsResponse,
  mockSearchResponse,
  mockResponse
} from '@ocrvs-chatbot-mediator/test/utils'
import { createServer } from '@ocrvs-chatbot-mediator/index'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

let fetch: fetchMock.FetchMock

describe('Search handler', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch = fetchMock as fetchMock.FetchMock
  })
  it('return a mediator response', async () => {
    const token = jwt.sign(
      { scope: ['declare', 'chatbot-api'] },
      readFileSync('../../../../test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:chatbot-api-user'
      }
    )
    fetch.mockResponses(
      [JSON.stringify(mockLocationsResponse), { status: 200 }],
      [JSON.stringify(mockSearchResponse), { status: 200 }]
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/search',
      payload: body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(201)
    expect(res.result).toEqual(mockResponse)
  })
})
