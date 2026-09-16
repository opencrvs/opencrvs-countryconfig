import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventDocument } from '@opencrvs/toolkit/events'
import { birthEvent } from '../../events/birth'

const {
  acceptRegistrationMock,
  rejectRegistrationMock,
  sendInformantNotificationMock
} = vi.hoisted(() => ({
  acceptRegistrationMock: vi.fn(),
  rejectRegistrationMock: vi.fn(),
  sendInformantNotificationMock: vi.fn()
}))

vi.mock('@opencrvs/toolkit/api', () => ({
  createClient: vi.fn(() => ({
    event: {
      actions: {
        register: {
          accept: { mutate: acceptRegistrationMock },
          reject: { mutate: rejectRegistrationMock }
        }
      }
    }
  }))
}))

vi.mock('../notification/informantNotification', () => ({
  sendInformantNotification: sendInformantNotificationMock
}))

import {
  buildBirthRegistrationDeclarationPatch,
  onRegisterHandler
} from './index'

beforeEach(() => {
  acceptRegistrationMock.mockReset()
  rejectRegistrationMock.mockReset()
  sendInformantNotificationMock.mockReset()
})

describe('buildBirthRegistrationDeclarationPatch', () => {
  it('only populates fields defined in the birth event configuration', () => {
    const fieldIds = birthEvent.declaration.pages
      .flatMap((page) => page.fields)
      .map((field) => field.id)

    expect(fieldIds).toEqual(
      expect.arrayContaining([
        'introduction.effectiveRegistrationDate',
        'child.effectiveRegistrationPlaceId'
      ])
    )
  })

  it('uses the derived CRVS office and defaults the registration date', () => {
    expect(
      buildBirthRegistrationDeclarationPatch({
        existingEffectiveRegistrationDate: undefined,
        existingEffectiveRegistrationPlaceId: undefined,
        derivedEffectiveRegistrationPlaceId: 'CRVS_OFFICE_TUV-RGO',
        registrationLocationId: 'fallback-office',
        currentDate: new Date('2026-09-16T10:00:00.000Z')
      })
    ).toEqual({
      'introduction.effectiveRegistrationDate': '2026-09-16',
      'child.effectiveRegistrationPlaceId': 'CRVS_OFFICE_TUV-RGO'
    })
  })

  it('falls back to the registration action location', () => {
    expect(
      buildBirthRegistrationDeclarationPatch({
        existingEffectiveRegistrationDate: undefined,
        existingEffectiveRegistrationPlaceId: undefined,
        derivedEffectiveRegistrationPlaceId: undefined,
        registrationLocationId: 'action-office',
        currentDate: new Date('2026-09-16T10:00:00.000Z')
      })
    ).toEqual({
      'introduction.effectiveRegistrationDate': '2026-09-16',
      'child.effectiveRegistrationPlaceId': 'action-office'
    })
  })

  it('preserves existing values when no derived office is available', () => {
    expect(
      buildBirthRegistrationDeclarationPatch({
        existingEffectiveRegistrationDate: '2020-01-02',
        existingEffectiveRegistrationPlaceId: 'existing-office',
        derivedEffectiveRegistrationPlaceId: undefined,
        registrationLocationId: 'action-office'
      })
    ).toEqual({
      'introduction.effectiveRegistrationDate': '2020-01-02',
      'child.effectiveRegistrationPlaceId': 'existing-office'
    })
  })
})

describe('onRegisterHandler', () => {
  const actionId = 'a843fca4-6e0c-4fd6-8a24-b163d2b9e759'
  const eventId = 'e7526eea-8528-474f-baa1-76f096b1647d'
  const event = {
    id: eventId,
    type: 'birth',
    actions: [
      {
        id: actionId,
        type: 'REGISTER',
        status: 'Requested',
        createdAt: '2026-09-16T07:20:00.000Z',
        createdAtLocation: 'c7da087c-9905-4b01-91dc-e5a43feb6003',
        declaration: {}
      }
    ]
  } as EventDocument

  async function invokeHandler() {
    const code = vi.fn()
    const response = vi.fn(() => ({ code }))

    await onRegisterHandler(
      {
        auth: { artifacts: { token: 'test-token' } },
        payload: event
      } as unknown as Parameters<typeof onRegisterHandler>[0],
      { response } as unknown as Parameters<typeof onRegisterHandler>[1]
    )

    expect(code).toHaveBeenCalledWith(202)
  }

  it('rejects the requested action when asynchronous acceptance fails', async () => {
    acceptRegistrationMock.mockRejectedValueOnce(
      new Error('Core rejected the declaration patch')
    )
    rejectRegistrationMock.mockResolvedValueOnce({})

    await invokeHandler()

    await vi.waitFor(() => {
      expect(rejectRegistrationMock).toHaveBeenCalledWith(
        expect.objectContaining({ eventId, actionId })
      )
    })
  })

  it('does not reject an accepted registration when notification fails', async () => {
    acceptRegistrationMock.mockResolvedValueOnce({})
    sendInformantNotificationMock.mockRejectedValueOnce(
      new Error('Notification delivery failed')
    )

    await invokeHandler()

    await vi.waitFor(() => {
      expect(sendInformantNotificationMock).toHaveBeenCalledOnce()
    })
    expect(rejectRegistrationMock).not.toHaveBeenCalled()
  })
})