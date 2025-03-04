import { countryLogo } from '@countryconfig/api/application/country-logo'

export const applicationConfig = {
  APPLICATION_NAME: 'Farajaland CRS',
  BIRTH: {
    REGISTRATION_TARGET: 30,
    LATE_REGISTRATION_TARGET: 365,
    FEE: {
      ON_TIME: 0,
      LATE: 5.5,
      DELAYED: 15
    },
    PRINT_IN_ADVANCE: true
  },
  COUNTRY_LOGO: countryLogo,
  CURRENCY: {
    languagesAndCountry: ['en-US'],
    isoCode: 'USD'
  },
  DEATH: {
    REGISTRATION_TARGET: 45,
    FEE: {
      ON_TIME: 0,
      DELAYED: 0
    },
    PRINT_IN_ADVANCE: true
  },
  PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
  NID_NUMBER_PATTERN: '^[0-9]{10}$',
  LOGIN_BACKGROUND: {
    backgroundColor: '36304E'
  },
  MARRIAGE: {
    REGISTRATION_TARGET: 45,
    FEE: {
      ON_TIME: 10,
      DELAYED: 45
    },
    PRINT_IN_ADVANCE: true
  },
  FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
  DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
  FEATURES: {
    DEATH_REGISTRATION: true,
    MARRIAGE_REGISTRATION: true,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    PRINT_DECLARATION: true,
    DATE_OF_BIRTH_UNKNOWN: true
  },
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  SIGNATURE_REQUIRED_FOR_ROLES: ['LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR'],
  SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID'
  /*
   * SEARCH_DEFAULT_CRITERIA's value can be one of the following
   * | 'TRACKING_ID',
   * | 'REGISTRATION_NUMBER',
   * | 'NATIONAL_ID',
   * | 'NAME',
   * | 'PHONE_NUMBER',
   * | 'EMAIL'
   */
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

export const notificationForRecord: NotificationFlags = {
  BIRTH: {
    'sent-notification': true,
    'sent-notification-for-review': true,
    'sent-for-approval': true,
    registered: true,
    'sent-for-updates': true
  },
  DEATH: {
    'sent-notification': true,
    'sent-notification-for-review': true,
    'sent-for-approval': true,
    registered: true,
    'sent-for-updates': true
  }
}
