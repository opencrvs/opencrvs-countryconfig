import { describe, it, expect } from 'vitest'
import { roles } from './roles'

describe('Roles config', () => {
  it('each role should have valid scopes', () => {
    for (const role of roles) {
      expect(role.id).toBeTruthy()
      expect(role.label.defaultMessage).toBeTruthy()
      expect(Array.isArray(role.scopes)).toBe(true)

      for (const scope of role.scopes) {
        expect(typeof scope).toBe('string')

        const valid =
          // Configurable search scopes
          scope.startsWith('type=record.search') ||
          // Legacyt search scopes
          scope.startsWith('search.') ||
          // Records
          scope.startsWith('record.') ||
          // Configurable workqueue scopes
          scope.startsWith('workqueue[') ||
          // User scopes
          scope.startsWith('user.') ||
          // Constants like SCOPES.RECORD_DECLARE_BIRTH
          scope.startsWith('SCOPES.') ||
          // Performance scopes
          scope.startsWith('performance.') ||
          // Organisation scopes
          scope.startsWith('organisation.') ||
          // Profile scopes
          scope.startsWith('profile.') ||
          // Config scopes
          scope.startsWith('config.')
        // Any other scopes should be manually added here

        if (!valid) {
          throw new Error(`Invalid scope "${scope}" found in role ${role.id}`)
        }
      }
    }
  })

  it('should include the correct roles', () => {
    const AUDIT_SCOPE = 'user.read:only-my-audit'

    const rolesWithAudit = roles
      .filter((role) => role.scopes.includes(AUDIT_SCOPE))
      .map((role) => role.id)

    // Update this list if requirements change
    expect(rolesWithAudit.sort()).toEqual([
      'COMMUNITY_LEADER',
      'HOSPITAL_CLERK',
      'LOCAL_REGISTRAR',
      'NATIONAL_REGISTRAR',
      'REGISTRATION_AGENT'
    ])

    const createRecordScope =
      'record.create[event=birth|death|tennis-club-membership]'

    const rolesWithCreateRecord = roles
      .filter((role) => role.scopes.includes(createRecordScope))
      .map((role) => role.id)

    // Update this list if requirements change
    expect(rolesWithCreateRecord.sort()).toEqual([
      'COMMUNITY_LEADER',
      'EMBASSY_OFFICIAL',
      'HOSPITAL_CLERK',
      'LOCAL_REGISTRAR',
      'NATIONAL_REGISTRAR',
      'REGISTRATION_AGENT'
    ])

    const rolesWithWorkqueue = roles
      .filter((role) =>
        role.scopes.some((scope) => scope.startsWith('workqueue'))
      )
      .map((role) => role.id)

    // Update this list if requirements change
    expect(rolesWithWorkqueue.sort()).toEqual([
      'COMMUNITY_LEADER',
      'EMBASSY_OFFICIAL',
      'HOSPITAL_CLERK',
      'LOCAL_REGISTRAR',
      'NATIONAL_REGISTRAR',
      'PROVINCIAL_REGISTRAR',
      'REGISTRATION_AGENT'
    ])
  })
})
