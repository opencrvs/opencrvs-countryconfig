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
      APPLICATION_NAME: 'OpenCRVS',
      BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
      BIRTH: {
        REGISTRATION_TARGET: 30,
        LATE_REGISTRATION_TARGET: 365,
        FEE: {
          ON_TIME: 0,
          LATE: 5.5,
          DELAYED: 15
        }
      },
      COUNTRY: 'FAR',
      COUNTRY_LOGO: countryLogo,
      COUNTRY_LOGO_RENDER_WIDTH: 104,
      COUNTRY_LOGO_RENDER_HEIGHT: 104,
      CURRENCY: {
        isoCode: 'ZMW',
        languagesAndCountry: ['en-ZM']
      },
      DEATH: {
        REGISTRATION_TARGET: 45,
        FEE: {
          ON_TIME: 0,
          DELAYED: 0
        }
      },
      DESKTOP_TIME_OUT_MILLISECONDS: 900000,
      UI_POLLING_INTERVAL: 5000,
      FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
      DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
      INFORMANT_MINIMUM_AGE: 16,
      HIDE_EVENT_REGISTER_INFORMATION: false,
      EXTERNAL_VALIDATION_WORKQUEUE: false,
      PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
      SENTRY:
        'https://f892d643aab642108f44e2d1795706bc@o309867.ingest.sentry.io/1774604',
      LOGROCKET: 'opencrvs-foundation/opencrvs-farajaland',
      NID_NUMBER_PATTERN: '^[0-9]{9}$'
    })

    const certificates = [birthCertificate, deathCertificate]

    const configs = [defaultConfig]
    function onInsert(err: any, values: any) {
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
