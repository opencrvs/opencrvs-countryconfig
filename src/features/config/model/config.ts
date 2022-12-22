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
import { model, Schema, Document } from 'mongoose'

interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
}

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
}

interface ICountryLogo {
  fileName: string
  file: string
}
interface IPhoneNumberPattern {
  pattern: RegExp
  example: string
  start: string
  num: string
  mask: {
    startForm: number
    endBefore: number
  }
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}
export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string
  ADMIN_LEVELS: number
  BIRTH: IBirth
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  DEATH: IDeath
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: string
  INTEGRATIONS: [IIntegration]
}

const birthSchema = new Schema<IBirth>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  LATE_REGISTRATION_TARGET: { type: Number, default: 365 },
  FEE: {
    ON_TIME: Number,
    LATE: Number,
    DELAYED: Number
  }
})

const deathSchema = new Schema<IDeath>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  FEE: {
    ON_TIME: Number,
    DELAYED: Number
  }
})

const currencySchema = new Schema<IPhoneNumberPattern>({
  isoCode: { type: String },
  languagesAndCountry: [String]
})

const countryLogoSchema = new Schema<ICountryLogo>({
  fileName: String,
  file: String
})

interface IIntegration {
  name: string
  status: string
}

const integrationsSchema = new Schema<IIntegration>({
  name: String,
  status: {
    type: String,
    enum: [
      statuses.PENDING,
      statuses.ACTIVE,
      statuses.DISABLED,
      statuses.DEACTIVATED
    ],
    default: statuses.PENDING
  }
})

const systemSchema = new Schema({
  APPLICATION_NAME: { type: String, required: false, default: 'OpenCRVS' },
  BIRTH: { type: birthSchema, required: false },
  COUNTRY_LOGO: { type: countryLogoSchema, required: false },
  CURRENCY: { type: currencySchema, required: false },
  DEATH: { type: deathSchema, required: false },
  FIELD_AGENT_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  DECLARATION_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  ADMIN_LEVELS: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5],
    default: 2
  },
  HIDE_EVENT_REGISTER_INFORMATION: {
    type: Boolean,
    required: false,
    default: false
  },
  EXTERNAL_VALIDATION_WORKQUEUE: {
    type: Boolean,
    required: false,
    default: false
  },
  PHONE_NUMBER_PATTERN: { type: String, required: false },
  NID_NUMBER_PATTERN: { type: String, required: false },
  INTEGRATIONS: [integrationsSchema]
})

export default model<IApplicationConfigurationModel>('Config', systemSchema)
