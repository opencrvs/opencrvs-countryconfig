import { readFileSync } from 'fs'

/* SMTP (Email) */
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS

export const SMS_PROVIDER = process.env.SMS_PROVIDER || 'infobip'

/* Clickatell  */
export const CLICKATELL_USER = process.env.CLICKATELL_USER_PATH
  ? readFileSync(process.env.CLICKATELL_USER_PATH).toString()
  : ''
export const CLICKATELL_PASSWORD = process.env.CLICKATELL_PASSWORD_PATH
  ? readFileSync(process.env.CLICKATELL_PASSWORD_PATH).toString()
  : ''
export const CLICKATELL_API_ID = process.env.CLICKATELL_API_ID_PATH
  ? readFileSync(process.env.CLICKATELL_API_ID_PATH).toString()
  : ''

/* Infobip */
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

export const USER_NOTIFICATION_DELIVERY_METHOD =
  process.env.USER_NOTIFICATION_DELIVERY_METHOD || 'sms'
