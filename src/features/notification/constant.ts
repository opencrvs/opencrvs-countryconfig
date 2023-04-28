import { readFileSync } from 'fs'

export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'infobip'

export const CLICKATELL_USER = process.env.CLICKATELL_USER_PATH
  ? readFileSync(process.env.CLICKATELL_USER_PATH).toString()
  : ''
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD_PATH
  ? readFileSync(process.env.CLICKATELL_PASSWORD_PATH).toString()
  : ''
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID_PATH
  ? readFileSync(process.env.CLICKATELL_API_ID_PATH).toString()
  : ''

export const INFOBIP_GATEWAY_ENDPOINT = process.env
  .INFOBIP_GATEWAY_ENDPOINT_PATH
  ? readFileSync(process.env.INFOBIP_GATEWAY_ENDPOINT_PATH).toString()
  : ''

export const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY_PATH
  ? readFileSync(process.env.INFOBIP_API_KEY_PATH).toString()
  : ''

export const INFOBIP_SENDER_ID = process.env.INFOBIP_SENDER_ID_PATH
  ? readFileSync(process.env.INFOBIP_SENDER_ID_PATH).toString()
  : ''
