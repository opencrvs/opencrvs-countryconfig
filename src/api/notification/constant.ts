import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'

export const NOTIFICATION_TRANSPORT =
  process.env.NOTIFICATION_TRANSPORT || 'email'

/* Email address where infrastructure alert should be forwarded to */
export const ALERT_EMAIL = process.env.ALERT_EMAIL || 'alerts@example.com'

/* SMTP (Email) */
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 587
export const SMTP_USERNAME = process.env.SMTP_USERNAME
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD
export const SMTP_SECURE = process.env.SMTP_SECURE === 'true'

export const COUNTRY_LOGO_URL = `${COUNTRY_CONFIG_URL}/content/country-logo`

export const LOGIN_URL = process.env.LOGIN_URL as string

export const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS
  ? process.env.SENDER_EMAIL_ADDRESS
  : ''

export const SMS_PROVIDER = process.env.SMS_PROVIDER ?? 'aws-sns'

export const AWS_SNS_ACCESS_KEY_ID = process.env.AWS_SNS_ACCESS_KEY_ID ?? ''

export const AWS_SNS_SECRET_ACCESS_KEY =
  process.env.AWS_SNS_SECRET_ACCESS_KEY ?? ''

export const AWS_SNS_REGION_NAME = process.env.AWS_SNS_REGION_NAME ?? ''

export const AWS_SNS_SENDER_ID = process.env.AWS_SNS_SENDER_ID ?? ''
