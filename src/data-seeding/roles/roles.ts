import { MessageDescriptor } from 'react-intl'

type Role = {
  id: string
  label: MessageDescriptor
  scopes: string[]
}

export const roles: Role[] = [
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Officer',
      description: 'Name for user role Registration Officer',
      id: 'userRole.registrationOfficer'
    },
    scopes: [
      'type=performance.read',
      'type=organisation.read-locations&accessLevel=administrativeArea',
      'type=user.read&accessLevel=administrativeArea',
      'type=performance.read-dashboards',
      'type=workqueue&ids=assigned-to-you,recent,requires-completion,in-external-validation,escalated,pending-validation,pending-updates,pending-approval,pending-certification,pending-issuance,correction-requested',
      'type=record.search&placeOfEvent=administrativeArea',
      'type=record.create&placeOfEvent=administrativeArea',
      'type=record.read&placeOfEvent=administrativeArea',
      'type=record.declare&placeOfEvent=administrativeArea',
      'type=record.edit&placeOfEvent=administrativeArea',
      'type=record.reject&placeOfEvent=administrativeArea',
      'type=record.archive&declaredIn=administrativeArea',
      'type=record.print-certified-copies&registeredIn=administrativeArea',
      'type=record.request-correction&registeredIn=administrativeArea',
      'type=record.custom-action&event=birth&customActionTypes=VALIDATE_DECLARATION,ESCALATE&placeOfEvent=administrativeArea',
      'type=record.custom-action&event=birth&customActionTypes=ISSUE_CERTIFIED_COPY,ISSUE_VERIFIABLE_CREDENTIAL&registeredIn=administrativeArea',
      'type=record.custom-action&event=death&customActionTypes=VALIDATE_DECLARATION&declaredIn=administrativeArea'
    ]
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Registrar',
      description: 'Name for user role Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: [
      'type=profile.electronic-signature',
      'type=performance.read',
      'type=organisation.read-locations&accessLevel=administrativeArea',
      'type=user.read&accessLevel=administrativeArea',
      'type=performance.read-dashboards',
      'type=workqueue&ids=assigned-to-you,recent,requires-completion,in-external-validation,escalated,potential-duplicate,pending-updates,pending-registration,pending-approval,pending-certification,pending-issuance,correction-requested',
      'type=record.search&placeOfEvent=administrativeArea',
      'type=record.create&placeOfEvent=administrativeArea',
      'type=record.read&placeOfEvent=administrativeArea',
      'type=record.declare&placeOfEvent=administrativeArea',
      'type=record.edit&placeOfEvent=administrativeArea',
      'type=record.reject&placeOfEvent=administrativeArea',
      'type=record.archive&declaredIn=administrativeArea',
      'type=record.review-duplicates&placeOfEvent=administrativeArea',
      'type=record.register&placeOfEvent=administrativeArea',
      'type=record.print-certified-copies&registeredIn=administrativeArea',
      'type=record.correct&registeredIn=administrativeArea',
      'type=record.custom-action&event=birth&customActionTypes=ESCALATE&placeOfEvent=administrativeArea',
      'type=record.custom-action&event=birth&customActionTypes=ISSUE_CERTIFIED_COPY,ISSUE_VERIFIABLE_CREDENTIAL&registeredIn=administrativeArea',
      'type=record.unassign-others'
    ]
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Administrator',
      description: 'Name for user role Administrator',
      id: 'userRole.administrator'
    },
    scopes: [
      'type=organisation.read-locations&accessLevel=administrativeArea',
      'type=user.create&accessLevel=administrativeArea',
      'user.create[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|PROVINCIAL_REGISTRAR]',
      'user.edit[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|PROVINCIAL_REGISTRAR]',
      'type=user.edit&accessLevel=administrativeArea',
      'type=user.read&accessLevel=administrativeArea'
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
      'type=config.update-all',
      'type=organisation.read-locations',
      'type=user.create',
      'user.create[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER|PROVINCIAL_REGISTRAR|EMBASSY_OFFICIAL]',
      'user.edit[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER|PROVINCIAL_REGISTRAR|EMBASSY_OFFICIAL]',
      'type=user.read',
      'type=user.edit',
      'type=performance.read',
      'type=record.reindex',
      'type=integration.create',
      'type=performance.read-dashboards'
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Operations Manager',
      description: 'Name for user role Operations Manager',
      id: 'userRole.operationsManager'
    },
    scopes: [
      'type=performance.read',
      'type=organisation.read-locations',
      'type=performance.read-dashboards'
    ]
  },
  {
    id: 'NATIONAL_REGISTRAR',
    label: {
      defaultMessage: 'Registrar General',
      description: 'Name for user role Registrar General',
      id: 'userRole.registrarGeneral'
    },
    scopes: [
      'type=profile.electronic-signature',
      'type=performance.read',
      'type=organisation.read-locations',
      'type=user.read',
      'type=record.search',
      'type=workqueue&ids=assigned-to-you,recent,pending-feedback-registrar-general,potential-duplicate,registration-registrar-general',
      'type=record.read',
      'type=record.declare',
      'type=record.reject',
      'type=record.archive',
      'type=record.review-duplicates',
      'type=record.register',
      'type=record.print-certified-copies',
      'type=record.correct',
      'type=record.custom-action&event=birth&customActionTypes=REGISTRAR_GENERAL_FEEDBACK,REVOKE_REGISTRATION,REINSTATE_REVOKE_REGISTRATION,APPROVE_DECLARATION',
      'type=record.custom-action&event=death&customActionTypes=APPROVE_DECLARATION',
      'type=record.unassign-others'
    ]
  },
  {
    id: 'PROVINCIAL_REGISTRAR',
    label: {
      defaultMessage: 'Provincial Registrar',
      description: 'Name for user role Provincial Registrar',
      id: 'userRole.provincialRegistrar'
    },
    scopes: [
      'type=organisation.read-locations&accessLevel=administrativeArea',
      'type=user.read&accessLevel=administrativeArea',
      'type=performance.read',
      'type=performance.read-dashboards',
      'type=profile.electronic-signature',
      'type=record.search&placeOfEvent=administrativeArea',
      'type=workqueue&ids=recent,pending-feedback-provincinal-registrar,pending-approval,correction-requested',
      'type=record.read&placeOfEvent=administrativeArea',
      'type=record.reject&placeOfEvent=administrativeArea',
      'type=record.register&declaredIn=administrativeArea',
      'type=record.archive&placeOfEvent=administrativeArea',
      'type=record.custom-action&event=birth&customActionTypes=PROVINCIAL_REGISTER_FEEDBACK,REINSTATE_REVOKE_REGISTRATION,ESCALATE&placeOfEvent=administrativeArea',
      'type=record.custom-action&event=birth,death&customActionTypes=APPROVE_DECLARATION&declaredIn=administrativeArea',
      'type=record.print-certified-copies&registeredIn=administrativeArea',
      'type=record.correct&registeredIn=administrativeArea',
      'type=record.unassign-others&placeOfEvent=administrativeArea'
    ]
  },
  {
    id: 'HOSPITAL_CLERK',
    label: {
      defaultMessage: 'Hospital Official',
      description: 'Name for user role Hospital Official',
      id: 'userRole.hospitalClerk'
    },
    scopes: [
      'type=user.read-only-my-audit',
      'type=record.search&placeOfEvent=location',
      'type=workqueue&ids=assigned-to-you,recent,pending-updates',
      'type=record.create&placeOfEvent=location',
      'type=record.read&placeOfEvent=location',
      'type=record.declare&placeOfEvent=location',
      'type=record.notify&placeOfEvent=location',
      'type=record.edit&placeOfEvent=location&declaredBy=user',
      'type=record.print-certified-copies&templates=v2.tennis-club-membership-certificate-alpha&registeredIn=location'
    ]
  },
  {
    id: 'COMMUNITY_LEADER',
    label: {
      defaultMessage: 'Community Leader',
      description: 'Name for user role Community Leader',
      id: 'userRole.communityLeader'
    },
    scopes: [
      'type=user.read-only-my-audit',
      'type=record.search&placeOfEvent=location',
      'type=workqueue&ids=assigned-to-you,recent',
      'type=record.create&placeOfEvent=location',
      'type=record.read&placeOfEvent=location',
      'type=record.edit&placeOfEvent=location',
      'type=record.notify&placeOfEvent=location'
    ]
  },
  {
    id: 'EMBASSY_OFFICIAL',
    label: {
      defaultMessage: 'Embassy Official',
      description: 'Name for user role Embassy Official',
      id: 'userRole.embassyOffical'
    },
    scopes: [
      'type=user.read-only-my-audit',
      'type=workqueue&ids=assigned-to-you,recent,escalated,pending-updates,pending-certification,potential-duplicate',
      'type=record.search&placeOfEvent=location',
      'type=record.create&placeOfEvent=location',
      'type=record.read&placeOfEvent=location',
      'type=record.declare&placeOfEvent=location',
      'type=record.edit&placeOfEvent=location',
      'type=record.custom-action&event=birth&customActionTypes=ESCALATE&placeOfEvent=location',
      'type=record.custom-action&event=birth&customActionTypes=ISSUE_CERTIFIED_COPY&registeredIn=location',
      'type=record.print-certified-copies&registeredIn=location',
      'type=record.correct&registeredIn=location'
    ]
  }
]
