import { countryLogo } from '@countryconfig/api/application/country-logo'
import * as fs from 'fs'
import { join } from 'path'

export const applicationConfig = {
  APPLICATION_NAME: 'SIECM',
  FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
  DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
  EXTERNAL_VALIDATION_WORKQUEUE: false,
  BIRTH: {
    REGISTRATION_TARGET: 30,
    LATE_REGISTRATION_TARGET: 365,
    FEE: {
      ON_TIME: 0,
      LATE: 1000.0,
      DELAYED: 2000
    },
    PRINT_IN_ADVANCE: true
  },
  COUNTRY_LOGO: countryLogo,
  CURRENCY: {
    isoCode: 'MGA',
    languagesAndCountry: ['en-US']
  },
  DEATH: {
    REGISTRATION_TARGET: 30,
    FEE: {
      ON_TIME: 0,
      DELAYED: 2000
    },
    PRINT_IN_ADVANCE: true
  },
  PHONE_NUMBER_PATTERN: '^(\\+261|0)?3[0-9]{8}$',
  NID_NUMBER_PATTERN: '^[0-9]{10}$',
  LOGIN_BACKGROUND: {
    backgroundImage: `data:image/jpg;base64,${fs
      .readFileSync(join(__dirname, 'login-bg-mdg.jpg'))
      .toString('base64')}`,
    imageFit: 'FILL'
  },
  MARRIAGE: {
    REGISTRATION_TARGET: 45,
    FEE: {
      ON_TIME: 10,
      DELAYED: 45
    },
    PRINT_IN_ADVANCE: true
  },
  FEATURES: {
    DEATH_REGISTRATION: false,
    MARRIAGE_REGISTRATION: false,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    INFORMANT_SIGNATURE: false,
    PRINT_DECLARATION: true,
    DATE_OF_BIRTH_UNKNOWN: false,
    INFORMANT_SIGNATURE_REQUIRED: false
  },
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or 'email' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms', // or 'sms', or 'email' ... You can use 'sms' for WhatsApp
  SIGNATURE_REQUIRED_FOR_ROLES: ['LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR']
}

export const COUNTRY_WIDE_CRUDE_DEATH_RATE = 10

type EventNotificationFlags = {
  'sent-notification'?: boolean
  'sent-notification-for-review'?: boolean
  'sent-for-approval'?: boolean
  registered?: boolean
  'sent-for-updates'?: boolean
}

type NotificationFlags = {
  BIRTH?: EventNotificationFlags
  DEATH?: EventNotificationFlags
  MARRIAGE?: EventNotificationFlags
}

const isNotificationEnabled = process.env.QA_ENV !== 'true' //process.env.QA_ENV !== 'true'

export const notificationForRecord: NotificationFlags = {
  BIRTH: {
    'sent-notification': isNotificationEnabled,
    'sent-notification-for-review': isNotificationEnabled,
    'sent-for-approval': isNotificationEnabled,
    registered: isNotificationEnabled,
    'sent-for-updates': isNotificationEnabled
  },
  DEATH: {
    'sent-notification': false,
    'sent-notification-for-review': false,
    'sent-for-approval': false,
    registered: false,
    'sent-for-updates': false
  }
}
