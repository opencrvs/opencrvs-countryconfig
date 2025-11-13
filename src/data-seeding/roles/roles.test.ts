import { describe, it, expect } from 'vitest'
import { roles } from './roles'

describe('Roles config', () => {
  it('should match the snapshot (scopes integrity)', () => {
    expect(roles).toMatchSnapshot()
  })

  it('each role should have valid scopes', () => {
    for (const role of roles) {
      expect(role.id).toBeTruthy()
      expect(role.label.defaultMessage).toBeTruthy()
      expect(Array.isArray(role.scopes)).toBe(true)

      for (const scope of role.scopes) {
        expect(typeof scope).toBe('string')

        const valid =
          // Configurable search scopes
          scope.startsWith('search[') ||
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
      'FIELD_AGENT',
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
      'FIELD_AGENT',
      'HEALTHCARE_WORKER',
      'HOSPITAL_CLERK',
      'LOCAL_LEADER',
      'LOCAL_REGISTRAR',
      'NATIONAL_REGISTRAR',
      'POLICE_OFFICER',
      'REGISTRATION_AGENT',
      'SOCIAL_WORKER'
    ])

    const fullWorkqueueScope =
      'workqueue[id=assigned-to-you|recent|requires-completion|requires-updates-office|in-review-all|in-external-validation|ready-to-print|ready-to-issue]'

    const rolesWithWorkqueue = roles
      .filter((role) => role.scopes.includes(fullWorkqueueScope))
      .map((role) => role.id)

    // Update this list if requirements change
    expect(rolesWithWorkqueue.sort()).toEqual([
      'LOCAL_REGISTRAR',
      'NATIONAL_REGISTRAR'
    ])
  })
})
