import { countryLogo } from '@countryconfig/api/application/country-logo'

export const defaultApplicationConfig = {
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
  // Following constants aren't configurable via UI
  FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
  DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
  EXTERNAL_VALIDATION_WORKQUEUE: false,
  MARRIAGE_REGISTRATION: true,
  DATE_OF_BIRTH_UNKNOWN: false,
  INFORMANT_SIGNATURE: true,
  INFORMANT_SIGNATURE_REQUIRED: false,
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  SIGNATURE_REQUIRED_FOR_ROLES: ['LOCAL_REGISTRAR', 'NATIONAL_REGISTRAR']
}

export const COUNTRY_WIDE_CRUDE_DEATH_RATE = 10
