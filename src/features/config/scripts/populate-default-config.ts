/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as mongoose from 'mongoose'
import { CONFIG_MONGO_URL } from '@countryconfig/constants'
import Certificate from '@countryconfig/features/config/model/certificate'
import Config from '@countryconfig/features/config/model/config'
import chalk from 'chalk'
import { countryLogo } from '@countryconfig/features/config/scripts/country-logo'
import birthCertificateTemplateDefault from '@countryconfig/features/config/scripts/birth-certificate-template-default'
import deathCertificateTemplateDefault from '@countryconfig/features/config/scripts/death-certificate-template-default'

export default async function importCertificates() {
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// IMPORT DEFAULT CERTIFICATES ///////////////////////////'
      )}`
    )
    mongoose.connect(CONFIG_MONGO_URL)
    const birthCertificate = new Certificate({
      svgCode: birthCertificateTemplateDefault,
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
      user: 'jonathan.campbell',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1643292458812.0,
      svgDateCreated: 1640696680593.0
    })

    const deathCertificate = new Certificate({
      svgCode: deathCertificateTemplateDefault,
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
      user: 'jonathan.campbell',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1643292520393.0,
      svgDateCreated: 1640696804785.0
    })

    const defaultConfig = new Config({
      APPLICATION_NAME: 'Farajaland CRS',
      BIRTH: {
        REGISTRATION_TARGET: 30,
        LATE_REGISTRATION_TARGET: 365,
        FEE: {
          ON_TIME: 0,
          LATE: 5.5,
          DELAYED: 15
        }
      },
      COUNTRY_LOGO: countryLogo,
      CURRENCY: {
        isoCode: 'USD',
        languagesAndCountry: ['en-US']
      },
      DEATH: {
        REGISTRATION_TARGET: 45,
        FEE: {
          ON_TIME: 0,
          DELAYED: 0
        }
      },
      FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT', // Because administrative division levels are not editable, you cant edit this in the UI yet as of OpenCRVS v1.0.1.  Field agents only audited at DISTRICT level
      DECLARATION_AUDIT_LOCATIONS: 'DISTRICT', // Because administrative division levels are not editable, you cant edit this in the UI yet as of OpenCRVS v1.0.1.  Declarations only audited at DISTRICT level
      HIDE_EVENT_REGISTER_INFORMATION: false,
      EXTERNAL_VALIDATION_WORKQUEUE: false, // API related, you cant edit this in the UI yet as of OpenCRVS v1.0.1.  Declarations only audited at DISTRICT level
      PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
      NID_NUMBER_PATTERN: '^[0-9]{9}$'
    })

    const certificates = [birthCertificate, deathCertificate]

    const configs = [defaultConfig]
    const onInsert = (err: any, values: any) => {
      if (!err) {
        mongoose.disconnect()
      } else {
        throw Error(
          `Cannot save ${JSON.stringify(
            values
          )} to declaration config db ... ${err}`
        )
      }
    }
    Certificate.collection.insertMany(certificates, onInsert)
    Config.collection.insertMany(configs, onInsert)
  } catch (err) {
    throw new Error(err)
  }

  return true
}

importCertificates()
