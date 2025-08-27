/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import {
  ActionType,
  aggregateActionDeclarations,
  EventDocument,
  FieldUpdateValue,
  getPendingAction
} from '@opencrvs/toolkit/events'
import { applicationConfig } from '../application/application-config'
import { COUNTRY_LOGO_URL } from './constant'
import { GATEWAY_URL } from '@countryconfig/constants'
import { createClient } from '@opencrvs/toolkit/api'
import { Event } from '@countryconfig/form/types/types'
import { InformantType as BirthInformantType } from '@countryconfig/form/v2/birth/forms/pages/informant'
import { InformantTemplateType } from './sms-service'
import { generateFailureLog, notify } from './handler'
import { InformantType as DeathInformantType } from '@countryconfig/form/v2/death/forms/pages/informant'

const resolveName = (name: FieldUpdateValue) => {
  const nameObj = {
    firstname: '',
    middlename: '',
    surname: ''
  }
  if (name && typeof name === 'object') {
    if ('firstname' in name && typeof name.firstname === 'string') {
      nameObj.firstname = name.firstname
    }
    if ('middlename' in name && typeof name.middlename === 'string') {
      nameObj.middlename = name.middlename
    }
    if ('lastname' in name && typeof name.lastname === 'string') {
      nameObj.surname = name.lastname
    }
  }
  return {
    nameObj,
    fullName:
      `${nameObj.firstname} ${nameObj.middlename} ${nameObj.surname}`.trim()
  }
}

export async function sendInformantNotification({
  event,
  token,
  registrationNumber
}: {
  event: EventDocument
  token: string
  registrationNumber?: string
}) {
  const url = new URL('events', GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  const locations = await client.locations.get.query()

  const pendingAction = getPendingAction(event.actions)

  const declaration = {
    ...aggregateActionDeclarations(event),
    ...pendingAction.declaration
  }

  const applicationName = applicationConfig.APPLICATION_NAME

  const commonVariables = {
    trackingId: event.trackingId,
    crvsOffice:
      (locations ?? []).find(({ id }) => id === pendingAction.createdAtLocation)
        ?.name || '',
    registrationLocation: '',
    applicationName,
    countryLogo: COUNTRY_LOGO_URL
  }

  if (event.type === Event.V2_BIRTH) {
    const informantName =
      declaration['informant.relation'] === BirthInformantType.MOTHER
        ? declaration['mother.name']
        : declaration['informant.relation'] === BirthInformantType.FATHER
          ? declaration['father.name']
          : declaration['informant.name']

    const { nameObj, fullName } = resolveName(informantName)

    const informantEmail = declaration['informant.email']
    const informantMobile = declaration['informant.phoneNo']

    const recipient = {
      name: nameObj,
      email: typeof informantEmail === 'string' ? informantEmail : undefined,
      mobile: typeof informantMobile === 'string' ? informantMobile : undefined
    }
    const deliveryInfo = {
      recipient,
      deliveryMethod: applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD
    }

    const commonBirthVariables = {
      ...commonVariables,
      informantName: fullName,
      name: resolveName(declaration['child.name']).fullName
    }

    if (pendingAction.type === ActionType.NOTIFY) {
      await notify({
        event: InformantTemplateType.birthInProgressNotification,
        variable: commonBirthVariables,
        ...deliveryInfo
      })
    } else if (pendingAction.type === ActionType.DECLARE) {
      await notify({
        event: InformantTemplateType.birthDeclarationNotification,
        variable: commonBirthVariables,
        ...deliveryInfo
      })
    } else if (pendingAction.type === ActionType.REGISTER) {
      if (!registrationNumber) {
        generateFailureLog({
          contact: {
            mobile: recipient.mobile,
            email: recipient.email
          },
          name: recipient.name,
          event: InformantTemplateType.birthRegistrationNotification,
          reason: 'registration number being missing'
        })
      } else {
        await notify({
          event: InformantTemplateType.birthRegistrationNotification,
          variable: {
            ...commonBirthVariables,
            registrationNumber
          },
          ...deliveryInfo
        })
      }
    } else if (pendingAction.type === ActionType.REJECT) {
      await notify({
        event: InformantTemplateType.birthRejectionNotification,
        variable: commonBirthVariables,
        ...deliveryInfo
      })
    }
  } else if (event.type === Event.V2_DEATH) {
    const informantName =
      declaration['informant.relation'] === DeathInformantType.SPOUSE
        ? declaration['spouse.name']
        : declaration['informant.name']

    const { nameObj, fullName } = resolveName(informantName)

    const informantEmail = declaration['informant.email']
    const informantMobile = declaration['informant.phoneNo']

    const recipient = {
      name: nameObj,
      email: typeof informantEmail === 'string' ? informantEmail : undefined,
      mobile: typeof informantMobile === 'string' ? informantMobile : undefined
    }

    const deliveryInfo = {
      recipient,
      deliveryMethod: applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD
    }

    const commonDeathVariables = {
      ...commonVariables,
      informantName: fullName,
      name: resolveName(declaration['deceased.name']).fullName
    }

    if (pendingAction.type === ActionType.NOTIFY) {
      await notify({
        event: InformantTemplateType.birthInProgressNotification,
        variable: commonDeathVariables,
        ...deliveryInfo
      })
    } else if (pendingAction.type === ActionType.DECLARE) {
      await notify({
        event: InformantTemplateType.birthDeclarationNotification,
        variable: commonDeathVariables,
        ...deliveryInfo
      })
    } else if (pendingAction.type === ActionType.REGISTER) {
      if (!registrationNumber) {
        generateFailureLog({
          contact: {
            mobile: recipient.mobile,
            email: recipient.email
          },
          name: recipient.name,
          event: InformantTemplateType.birthRegistrationNotification,
          reason: 'registration number being missing'
        })
      } else {
        await notify({
          event: InformantTemplateType.birthRegistrationNotification,
          variable: {
            ...commonDeathVariables,
            registrationNumber
          },
          ...deliveryInfo
        })
      }
    } else if (pendingAction.type === ActionType.REJECT) {
      await notify({
        event: InformantTemplateType.birthRejectionNotification,
        variable: commonDeathVariables,
        ...deliveryInfo
      })
    }
  }

  return
}
