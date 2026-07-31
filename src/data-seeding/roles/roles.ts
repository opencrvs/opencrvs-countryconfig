import { MessageDescriptor } from 'react-intl'
import { defineScopes, EncodedScope } from '@opencrvs/toolkit/scopes'

type Role = {
  id: string
  label: MessageDescriptor
  scopes: EncodedScope[]
}

export const roles: Role[] = [
  {
    id: 'REGISTRAR_GENERAL',
    label: {
      defaultMessage: 'Registrar General',
      description: 'Name for user role Registrar General',
      id: 'userRole.registrarGeneral'
    },
    // National (root-level) scopes — no placeOfEvent restriction so users at
    // Location/0 offices (TUV-RGO) can see all health facilities countrywide.
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.read' },
      { type: 'user.search' },
      { type: 'performance.read-dashboards' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'escalated','potential-duplicate', 'pending-validation', 'pending-registration', 'pending-updates', 'pending-approval', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search' },
      { type: 'record.create' },
      { type: 'record.read' },
      { type: 'record.declare' },
      { type: 'record.register' },
      { type: 'record.edit' },
      { type: 'record.reject' },
      { type: 'record.archive' },
      { type: 'record.print-certified-copies' },
      { type: 'record.correct' },
      { type: 'record.review-duplicates'},
      { type: 'record.unassign-others' },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REGISTRAR_GENERAL_FEEDBACK'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REINSTATE_REVOKE_REGISTRATION'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['REGISTRAR_GENERAL_FEEDBACK'] } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'REGISTRATION_OFFICER',
    label: {
      defaultMessage: 'Registration Officer',
      description: 'Name for user role Registration Officer',
      id: 'userRole.registrationOfficer'
    },
    // National validator — based at TUV-RGO (Location/0). Unscoped so the user
    // can see notifications from every health facility nationwide and validate
    // records into the 'validated' state for RG/DRG to register.
    scopes: defineScopes([
      { type: 'organisation.read-locations' },
      { type: 'user.read' },
      { type: 'user.search' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'escalated', 'potential-duplicate', 'pending-validation', 'pending-updates', 'pending-approval', 'pending-registration', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search' },
      { type: 'record.create' },
      { type: 'record.read' },
      { type: 'record.declare' },
      { type: 'record.edit' },
      { type: 'record.reject' },
      { type: 'record.review-duplicates' },
      { type: 'record.unassign-others' },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification','v2.birth-summary', 'v2.death-summary'] } },
      { type: 'record.request-correction' },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['VALIDATE_DECLARATION', 'ESCALATE'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REINSTATE_REVOKE_REGISTRATION'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['VALIDATE_DECLARATION', 'ESCALATE'] } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'ISLAND_REGISTRAR',
    label: {
      defaultMessage: 'Island Registrar',
      description: 'Name for user role Island Registrar',
      id: 'userRole.islandRegistrar'
    },
    // Island-level scopes — restricted to the user's administrative area.
    // Scoped so they only see their own island's facilities.
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read-dashboards' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'in-external-validation', 'escalated', 'pending-validation', 'pending-updates', 'pending-approval'] } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['VALIDATE_DECLARATION', 'ESCALATE'] } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REINSTATE_REVOKE_REGISTRATION'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['VALIDATE_DECLARATION'] } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'REGISTRAR',
    label: {
      defaultMessage: 'Registrar',
      description: 'Name for user role Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read-dashboards' },
      {
        type: 'workqueue',
        options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'in-external-validation', 'escalated', 'potential-duplicate', 'pending-updates', 'pending-registration', 'pending-approval', 'pending-certification', 'pending-issuance', 'correction-requested'] }
      },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.review-duplicates', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.register', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.correct', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ESCALATE', 'REINSTATE_REVOKE_REGISTRATION'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'], registeredIn: 'administrativeArea' } },
      { type: 'record.unassign-others' },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Administrator',
      description: 'Name for user role Administrator',
      id: 'userRole.administrator'
    },
    scopes: [
      ...defineScopes([
        { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
        { type: 'user.create', options: { accessLevel: 'administrativeArea', role: ['HEALTH_NOTIFIER', 'ISLAND_CLINIC_NOTIFIER', 'COMMUNITY_LEADER', 'REGISTRAR_GENERAL', 'DEPUTY_REGISTRAR_GENERAL', 'ISLAND_REGISTRAR', 'REGISTRAR', 'ASSISTANT_REGISTRATION_OFFICER', 'ISLAND_CLERK', 'COURT_CLERK', 'STATISTICS_OFFICER', 'PROVINCIAL_REGISTRAR'] } },
        { type: 'user.edit', options: { accessLevel: 'administrativeArea', role: ['HEALTH_NOTIFIER', 'ISLAND_CLINIC_NOTIFIER', 'COMMUNITY_LEADER', 'REGISTRAR_GENERAL', 'DEPUTY_REGISTRAR_GENERAL', 'ISLAND_REGISTRAR', 'REGISTRAR', 'ASSISTANT_REGISTRATION_OFFICER', 'ISLAND_CLERK', 'COURT_CLERK', 'STATISTICS_OFFICER', 'PROVINCIAL_REGISTRAR'] } },
        { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
        { type: 'user.search', options: { accessLevel: 'administrativeArea' } }
      ])
    ]
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National Administrator',
      description: 'Name for user role National Administrator',
      id: 'userRole.nationalAdministrator'
    },
    scopes: [
      ...defineScopes([
        { type: 'config.update-all' },
        { type: 'organisation.read-locations' },
        { type: 'user.create', options: { role: ['HEALTH_NOTIFIER', 'ISLAND_CLINIC_NOTIFIER', 'COMMUNITY_LEADER', 'REGISTRAR_GENERAL', 'DEPUTY_REGISTRAR_GENERAL', 'ISLAND_REGISTRAR', 'REGISTRAR', 'ASSISTANT_REGISTRATION_OFFICER', 'ISLAND_CLERK', 'COURT_CLERK', 'STATISTICS_OFFICER', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL'] } },
        { type: 'user.edit', options: { role: ['HEALTH_NOTIFIER', 'ISLAND_CLINIC_NOTIFIER', 'COMMUNITY_LEADER', 'REGISTRAR_GENERAL', 'DEPUTY_REGISTRAR_GENERAL', 'ISLAND_REGISTRAR', 'REGISTRAR', 'ASSISTANT_REGISTRATION_OFFICER', 'ISLAND_CLERK', 'COURT_CLERK', 'STATISTICS_OFFICER', 'NATIONAL_REGISTRAR', 'LOCAL_SYSTEM_ADMIN', 'NATIONAL_SYSTEM_ADMIN', 'PERFORMANCE_MANAGER', 'PROVINCIAL_REGISTRAR', 'EMBASSY_OFFICIAL'] } },
        { type: 'user.read' },
        { type: 'user.search' },
        { type: 'performance.read' },
        { type: 'record.reindex' },
        { type: 'integration.create' },
        { type: 'performance.read-dashboards' },
        {
          type: 'dashboard.view',
          options: { ids: ['registrations', 'completeness', 'registry'] }
        }
      ])
    ]
  },
  {
    id: 'DEPUTY_REGISTRAR_GENERAL',
    label: {
      defaultMessage: 'Deputy Registrar General',
      description: 'Name for user role Deputy Registrar General',
      id: 'userRole.deputyRegistrarGeneral'
    },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.read' },
      { type: 'user.search' },
      { type: 'record.search' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-feedback-registrar-general', 'pending-registration', 'pending-certification', 'pending-issuance', 'correction-requested', 'potential-duplicate', 'registration-registrar-general'] } },
      { type: 'record.read' },
      { type: 'record.reject' },
      { type: 'record.archive' },
      { type: 'record.review-duplicates' },
      { type: 'record.register' },
      { type: 'record.print-certified-copies' },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.correct' },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['REGISTRAR_GENERAL_FEEDBACK', 'APPROVE_DECLARATION', 'REVOKE_REGISTRATION', 'REINSTATE_REVOKE_REGISTRATION', 'ISSUE_VERIFIABLE_CREDENTIAL'] } },
      { type: 'record.unassign-others' }
    ])
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Operations Manager',
      description: 'Name for user role Operations Manager',
      id: 'userRole.operationsManager'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.search' },
      { type: 'performance.read-dashboards' },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'ASSISTANT_REGISTRATION_OFFICER',
    label: {
      defaultMessage: 'Assistant Registration Officer',
      description: 'Name for user role Assistant Registration Officer',
      id: 'userRole.assistantRegistrationOfficer'
    },
    scopes: defineScopes([
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'requires-completion', 'in-external-validation', 'escalated', 'pending-validation', 'pending-updates', 'pending-approval', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create' },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.review-duplicates' },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.request-correction', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['VALIDATE_DECLARATION', 'REINSTATE_REVOKE_REGISTRATION', 'ESCALATE'] } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['ISSUE_CERTIFIED_COPY'], registeredIn: 'administrativeArea' } },
      { type: 'record.unassign-others' },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'NATIONAL_REGISTRAR',
    label: { defaultMessage: 'National Registrar', description: 'Name for user role National Registrar', id: 'userRole.nationalRegistrar' },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'organisation.read-locations' },
      { type: 'user.read' },
      { type: 'user.search' },
      { type: 'record.search' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-feedback-registrar-general', 'pending-registration', 'pending-certification', 'pending-issuance', 'correction-requested', 'potential-duplicate', 'registration-registrar-general'] } },
      { type: 'record.read' },
      { type: 'record.declare' },
      { type: 'record.reject' },
      { type: 'record.archive' },
      { type: 'record.review-duplicates' },
      { type: 'record.register' },
      { type: 'record.print-certified-copies' },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.correct' },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['REGISTRAR_GENERAL_FEEDBACK', 'REVOKE_REGISTRATION', 'REINSTATE_REVOKE_REGISTRATION', 'APPROVE_DECLARATION'] } },
      { type: 'record.custom-action', options: { event: ['death'], customActionTypes: ['APPROVE_DECLARATION'] } },
      { type: 'record.unassign-others' }
    ])
  },
  {
    id: 'ISLAND_CLERK',
    label: {
      defaultMessage: 'Island Clerk',
      description: 'Name for user role Island Clerk',
      id: 'userRole.islandClerk'
    },
    scopes: defineScopes([
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-validation', 'pending-updates', 'pending-registration', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.request-correction', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['VALIDATE_DECLARATION', 'REINSTATE_REVOKE_REGISTRATION', 'ESCALATE'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'], registeredIn: 'administrativeArea' } }
    ])
  },
  {
    id: 'COURT_CLERK',
    label: {
      defaultMessage: 'Court Clerk',
      description: 'Name for user role Court Clerk',
      id: 'userRole.courtClerk'
    },
    scopes: defineScopes([
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-validation', 'pending-updates', 'pending-registration', 'pending-certification', 'pending-issuance', 'correction-requested'] } },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.declare', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.archive', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.request-correction', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['VALIDATE_DECLARATION', 'REINSTATE_REVOKE_REGISTRATION', 'ESCALATE'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['ISSUE_CERTIFIED_COPY', 'ISSUE_VERIFIABLE_CREDENTIAL'], registeredIn: 'administrativeArea' } }
    ])
  },
  {
    id: 'STATISTICS_OFFICER',
    label: {
      defaultMessage: 'Statistics Officer',
      description: 'Name for user role Statistics Officer',
      id: 'userRole.statisticsOfficer'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'organisation.read-locations' }
    ])
  },
  {
    id: 'PROVINCIAL_REGISTRAR',
    label: {
      defaultMessage: 'Provincial Registrar',
      description: 'Name for user role Provincial Registrar',
      id: 'userRole.provincialRegistrar'
    },
    scopes: defineScopes([
      { type: 'organisation.read-locations', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.search', options: { accessLevel: 'administrativeArea' } },
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'profile.electronic-signature' },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['recent', 'pending-feedback-provincinal-registrar', 'pending-approval', 'correction-requested'] } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.reject', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.register', options: { declaredIn: 'administrativeArea' } },
      { type: 'record.archive', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['PROVINCIAL_REGISTER_FEEDBACK', 'REINSTATE_REVOKE_REGISTRATION', 'ESCALATE'], placeOfEvent: 'administrativeArea' } },
      { type: 'record.custom-action', options: { event: ['birth', 'death'], customActionTypes: ['APPROVE_DECLARATION'], declaredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } },
      { type: 'record.correct', options: { registeredIn: 'administrativeArea' } },
      { type: 'record.unassign-others', options: { placeOfEvent: 'administrativeArea' } },
      {
        type: 'dashboard.view',
        options: { ids: ['registrations', 'completeness', 'registry'] }
      }
    ])
  },
  {
    id: 'HEALTH_NOTIFIER',
    label: {
      defaultMessage: 'Health Notifier',
      description: 'Name for user role HEALTH_NOTIFIER',
      id: 'userRole.hospitalClerk'
    },
    // National health notifier — based at TUV-PMH (Location/0).
    // Unscoped so the user can see and notify records from the national hospital.
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-updates', 'my-submissions'] } },
      { type: 'record.create' },
      { type: 'record.read' },
      { type: 'record.notify' },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.birth-notification'] } }
    ])
  },
  {
    id: 'ISLAND_CLINIC_NOTIFIER',
    label: {
      defaultMessage: 'Island Clinic Notifier',
      description: 'Name for user role Island Clinic Notifier',
      id: 'userRole.islandClinicNotifier'
    },
    // Island clinic notifier — based at island health facilities (TUV-00X-002).
    // Scoped to administrativeArea so each notifier only sees their own island's records.
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'pending-updates'] } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.notify', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.print-certified-copies', options: { templates: ['v2.tennis-club-membership-certificate-alpha', 'v2.birth-notification'] } }
    ])
  },
  {
    id: 'COMMUNITY_LEADER',
    label: {
      defaultMessage: 'Community Leader',
      description: 'Name for user role Community Leader',
      id: 'userRole.communityLeader'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'record.search', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent'] } },
      { type: 'record.create', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.read', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.edit', options: { placeOfEvent: 'administrativeArea' } },
      { type: 'record.notify', options: { placeOfEvent: 'administrativeArea' } }
    ])
  },
  {
    id: 'EMBASSY_OFFICIAL',
    label: {
      defaultMessage: 'Embassy Official',
      description: 'Name for user role Embassy Official',
      id: 'userRole.embassyOffical'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      { type: 'workqueue', options: { ids: ['assigned-to-you', 'recent', 'escalated', 'pending-updates', 'pending-certification', 'potential-duplicate'] } },
      { type: 'record.search', options: { placeOfEvent: 'location' } },
      { type: 'record.create', options: { placeOfEvent: 'location' } },
      { type: 'record.read', options: { placeOfEvent: 'location' } },
      { type: 'record.declare', options: { placeOfEvent: 'location' } },
      { type: 'record.edit', options: { placeOfEvent: 'location' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ESCALATE'], placeOfEvent: 'location' } },
      { type: 'record.custom-action', options: { event: ['birth'], customActionTypes: ['ISSUE_CERTIFIED_COPY'], placeOfEvent: 'location' } },
      { type: 'record.print-certified-copies', options: { placeOfEvent: 'location' } },
      { type: 'record.correct', options: { placeOfEvent: 'location' } }
    ])
  }
]
