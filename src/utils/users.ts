import { GATEWAY_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { URL } from 'url'

type GetUser = {
  primaryOffice: {
    hierarchy: Array<{
      id: string
    }>
  }
}
export async function fetchUserLocationHierarchy(
  token: string,
  userId: string
) {
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
            primaryOffice {
              hierarchy {
                id
              }
            }
          }
        }
      `)
    })
  })

  const res = (await getUsersRes.json()) as {
    data: { getUser: GetUser }
  }

  return res.data.getUser.primaryOffice.hierarchy.map(({ id }) => id)
}
