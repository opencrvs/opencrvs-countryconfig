import { countryLogo } from '@countryconfig/features/config/scripts/country-logo'

export const defaultApplicationConfig = {
  APPLICATION_NAME: 'Farajaland CRS',
  FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
  DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
  ADMIN_LEVELS: 2,
  HIDE_BIRTH_EVENT_REGISTER_INFORMATION: false,
  HIDE_DEATH_EVENT_REGISTER_INFORMATION: false,
  HIDE_MARRIAGE_EVENT_REGISTER_INFORMATION: false,
  EXTERNAL_VALIDATION_WORKQUEUE: false,
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
  MARRIAGE_REGISTRATION: false,
  ADDRESSES: 1,
  DATE_OF_BIRTH_UNKNOWN: false,
  INFORMANT_SIGNATURE: true,
  INFORMANT_SIGNATURE_REQUIRED: true
}
