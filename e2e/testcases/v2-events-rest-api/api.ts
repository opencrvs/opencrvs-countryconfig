import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { getToken } from '../../helpers'

export async function fetchClientAPI(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body: object = {},
  credentials = CREDENTIALS.LOCAL_REGISTRAR
) {
  const token = await getToken(credentials.USERNAME, credentials.PASSWORD)
  const url = new URL(`${CLIENT_URL}${path}`)

  console.log(url.toString())
  console.log(token)

  return fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}
