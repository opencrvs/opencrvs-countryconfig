import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'

/* SMTP (Email) */
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS

/* Infobip */
export const INFOBIP_GATEWAY_ENDPOINT = process.env.INFOBIP_GATEWAY_ENDPOINT
  ? process.env.INFOBIP_GATEWAY_ENDPOINT
  : ''

export const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY
  ? process.env.INFOBIP_API_KEY
  : ''

export const INFOBIP_SENDER_ID = process.env.INFOBIP_SENDER_ID
  ? process.env.INFOBIP_SENDER_ID
  : ''

export const EMAIL_API_KEY = process.env.EMAIL_API_KEY

export const COUNTRY_LOGO_URL = `${COUNTRY_CONFIG_URL}/content/country-logo`

export const LOGIN_URL = process.env.LOGIN_URL as string

export const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS
  ? process.env.SENDER_EMAIL_ADDRESS
  : ''
