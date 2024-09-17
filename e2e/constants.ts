export const DOMAIN = process.env.DOMAIN || 'farajaland-dev.opencrvs.org'
export const LOGIN_URL = 'https://login.' + DOMAIN
export const AUTH_URL = 'https://auth.' + DOMAIN
export const CLIENT_URL = 'https://register.' + DOMAIN
export const GATEWAY_HOST = 'https://gateway.' + DOMAIN

/*
 * This timeout is to ensure that all previous actions have been completed
 * including filling inputs and that the changed values have been reflected
 * also to the Redux state. 500ms is selected as a safe value.
 */
export const SAFE_INPUT_CHANGE_TIMEOUT_MS = 500

/*
 * This timeout ensures that
 * the declaration in outbox is sent to backend
 * and outbox is now empty
 */
export const SAFE_OUTBOX_TIMEOUT_MS = 30 * 1000
const TEST_USER_PASSWORD = 'test'

export const CREDENTIALS = {
  FIELD_AGENT: {
    USERNAME: 'k.bwalya',
    PASSWORD: TEST_USER_PASSWORD
  },
  REGISTRATION_AGENT: {
    USERNAME: 'f.katongo',
    PASSWORD: TEST_USER_PASSWORD
  },
  LOCAL_REGISTRAR: {
    USERNAME: 'k.mweene',
    PASSWORD: TEST_USER_PASSWORD
  },
  NATIONAL_REGISTRAR: {
    USERNAME: 'j.musonda',
    PASSWORD: TEST_USER_PASSWORD
  }
}
