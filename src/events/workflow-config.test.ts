import { describe, expect, it } from 'vitest'
import { ActionType } from '@opencrvs/toolkit/events'
import { decodeScope, ScopeType } from '@opencrvs/toolkit/scopes'
import { Workqueues } from '../api/workqueue/workqueueConfig'
import { roles } from '../data-seeding/roles/roles'
import { birthEvent } from './birth'
import { deathEvent } from './death'

function getRole(roleId: string) {
  const role = roles.find(({ id }) => id === roleId)

  if (!role) {
    throw new Error(`Role not found: ${roleId}`)
  }

  return role
}

function hasScope(roleId: string, scopeType: ScopeType) {
  return getRole(roleId).scopes.some(
    (encodedScope) => decodeScope(encodedScope)?.type === scopeType
  )
}

function getWorkqueueIds(roleId: string) {
  return getRole(roleId).scopes.flatMap((encodedScope) => {
    const scope = decodeScope(encodedScope)

    return scope?.type === 'workqueue' ? scope.options.ids : []
  })
}

describe('birth and death workflow configuration', () => {
  it('assigns the primary lifecycle actions to the intended roles', () => {
    expect(hasScope('HEALTH_NOTIFIER', 'record.notify')).toBe(true)
    expect(hasScope('ASSISTANT_REGISTRATION_OFFICER', 'record.declare')).toBe(
      true
    )
    expect(hasScope('ASSISTANT_REGISTRATION_OFFICER', 'record.register')).toBe(
      false
    )
    expect(hasScope('REGISTRATION_OFFICER', 'record.register')).toBe(true)
  })

  it('provides each primary role with its workflow handoff queues', () => {
    expect(getWorkqueueIds('HEALTH_NOTIFIER')).toEqual(
      expect.arrayContaining(['my-submissions', 'organisation-submissions'])
    )
    expect(getWorkqueueIds('ASSISTANT_REGISTRATION_OFFICER')).toContain(
      'requires-completion'
    )
    expect(getWorkqueueIds('REGISTRATION_OFFICER')).toContain(
      'pending-registration'
    )

    const configuredWorkqueues = Workqueues.map(({ slug }) => slug)
    expect(configuredWorkqueues).toEqual(
      expect.arrayContaining([
        'my-submissions',
        'organisation-submissions',
        'requires-completion',
        'pending-registration'
      ])
    )
  })

  it.each([
    ['birth', birthEvent],
    ['death', deathEvent]
  ])(
    'orders declaration before registration and preserves safeguards for %s',
    (_, eventConfig) => {
      expect(eventConfig.actionOrder.indexOf(ActionType.DECLARE)).toBeLessThan(
        eventConfig.actionOrder.indexOf(ActionType.REGISTER)
      )

      const declareAction = eventConfig.actions.find(
        ({ type }) => type === ActionType.DECLARE
      )
      const registerAction = eventConfig.actions.find(
        ({ type }) => type === ActionType.REGISTER
      )

      expect(declareAction).toBeDefined()
      expect(registerAction).toMatchObject({
        deduplication: expect.any(Object),
        conditionals: expect.any(Array)
      })
    }
  )
})
