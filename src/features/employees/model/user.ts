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

// NOTE: THE MODEL AND STATUSES HERE MUST BE IDENTICAL TO THOSE IN OPENCRVS CORE
// TO BE FOUND IN: '@opencrvs/user-mgnt/src/model/user'
// CHECK RELEASE NOTES FOR BREAKING CHANGES

import { Document, model, Schema } from 'mongoose'

enum AUDIT_REASON {
  TERMINATED,
  SUSPICIOUS,
  ROLE_REGAINED,
  NOT_SUSPICIOUS,
  OTHER
}

enum AUDIT_ACTION {
  DEACTIVATE,
  REACTIVATE
}

const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export interface IUserName {
  use: string
  family: string
  given: string[]
}

interface IIdentifier {
  system: string
  value: string
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}
interface IAuditHistory {
  auditedBy: string
  auditedOn: number
  action: string
  reason: string
  comment?: string
}
export interface IUser {
  name: IUserName[]
  username: string
  identifiers?: IIdentifier[]
  email?: string
  mobile: string
  passwordHash: string
  salt: string
  role?: string
  type?: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  status: string
  device?: string
  securityQuestionAnswers?: ISecurityQuestionAnswer[]
  auditHistory?: IAuditHistory[]
}

export interface IUserModel extends IUser, Document {}

// tslint:disable-next-line
const UserNameSchema = new Schema(
  {
    use: String,
    given: [String],
    family: String
  },
  { _id: false }
)
// tslint:disable-next-line
const IdentifierSchema = new Schema(
  {
    system: String,
    value: String
  },
  { _id: false }
)
// tslint:disable-next-line
const SecurityQuestionAnswerSchema = new Schema(
  {
    questionKey: String,
    answerHash: String
  },
  { _id: false }
)
// tslint:disable-next-line
const AuditHistory = new Schema(
  {
    auditedBy: String,
    auditedOn: {
      type: Number,
      default: Date.now
    },
    action: {
      type: String,
      enum: [AUDIT_ACTION.DEACTIVATE, AUDIT_ACTION.REACTIVATE],
      default: AUDIT_ACTION.DEACTIVATE
    },
    reason: {
      type: String,
      enum: [
        AUDIT_REASON.TERMINATED,
        AUDIT_REASON.SUSPICIOUS,
        AUDIT_REASON.ROLE_REGAINED,
        AUDIT_REASON.NOT_SUSPICIOUS,
        AUDIT_REASON.OTHER
      ],
      default: AUDIT_REASON.OTHER
    },
    comment: String
  },
  {
    _id: false
  }
)

const userSchema = new Schema(
  {
    name: { type: [UserNameSchema], required: true },
    username: { type: String, required: true },
    identifiers: [IdentifierSchema],
    email: String,
    mobile: { type: String, unique: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    role: String,
    type: String,
    practitionerId: { type: String, required: true },
    primaryOfficeId: { type: String, required: true },
    catchmentAreaIds: { type: [String], required: true },
    scope: { type: [String], required: true },
    status: {
      type: String,
      enum: [
        statuses.PENDING,
        statuses.ACTIVE,
        statuses.DISABLED,
        statuses.DEACTIVATED
      ],
      default: statuses.PENDING
    },
    securityQuestionAnswers: [SecurityQuestionAnswerSchema],
    device: String,
    creationDate: { type: Number, default: Date.now },
    auditHistory: [AuditHistory]
  },
  { strict: false }
)

export default model<IUserModel>('User', userSchema)
