import { countryLogo } from '@countryconfig/api/application/country-logo'
import { defineApplicationConfig } from '@opencrvs/toolkit/application-config'

export const applicationConfig = defineApplicationConfig({
  APPLICATION_NAME: 'Tuvalu CRVS',
  COUNTRY_LOGO: countryLogo,
  SYSTEM_IANA_TIMEZONE: 'Pacific/Funafuti', // Default timezone for the country. Basis for date and time calculations during searches.
  CURRENCY: {
    languagesAndCountry: ['en-TU'],
    isoCode: 'TUV'
  },
  ADMIN_STRUCTURE: [
    {
      id: 'island',
      label: {
        id: 'field.address.island.label',
        defaultMessage: 'Island',
        description: 'Label for island in domestic address'
      }
    }
  ],
  PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
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
})
