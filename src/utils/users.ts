import { APPLICATION_CONFIG_URL, GATEWAY_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { URL } from 'url'

type GetUser = {
  primaryOffice?: {
    id: string
  }
}

type Location = {
  id: string
}

async function getUser(token: string, userId: string): Promise<GetUser> {
  const url = new URL('graphql', GATEWAY_URL)
  const getUsersRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`
    },
    body: JSON.stringify({
      operationName: 'fetchUser',
      variables: {
        userId: userId
      },
      query: print(gql`
        query fetchUser($userId: String!) {
          getUser(userId: $userId) {
            id
            creationDate
            username
            practitionerId
            mobile
            systemRole
            role {
              _id
              labels {
                lang
                label
                __typename
              }
              __typename
            }
            status
            name {
              use
              firstNames
              familyName
              __typename
            }
            primaryOffice {
              id
              name
              alias
              status
              __typename
            }
            __typename
          }
        }
      `)
    })
  })

  const res = (await getUsersRes.json()) as {
    data: { getUser: GetUser }
  }

  return res.data.getUser
}

async function getLocationHierarchy(locationId: string): Promise<Location[]> {
  const url = new URL(
    `location/${locationId}/hierarchy`,
    APPLICATION_CONFIG_URL
  )
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Unable to retrieve location hierarchy')
  }
  return res.json()
}

export async function getUserOfficeLocationHierarchy(
  token: string,
  userId: string
): Promise<Location[]> {
  const user = await getUser(token, userId)
  if (!user.primaryOffice) {
    throw new Error('No primary office found for user')
  }
  return getLocationHierarchy(user.primaryOffice.id)
}
