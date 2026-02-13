import { SCOPES, Scope } from '@opencrvs/toolkit/scopes'
import { MessageDescriptor } from 'react-intl'

type Role = {
  id: string
  label: MessageDescriptor
  scopes: Scope[]
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
      SCOPES.RECORD_READ,
      SCOPES.PERFORMANCE_READ,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.USER_READ_MY_JURISDICTION,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=assigned-to-you|recent|requires-completion|in-review|in-external-validation|escalated|pending-validation|pending-updates|pending-approval|pending-certification|pending-issuance|correction-requested]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.request-correction[event=birth|death|tennis-club-membership]',
      'record.custom-action[event=birth,customActionType=VALIDATE_DECLARATION|ISSUE_CERTIFIED_COPY|ESCALATE]',
      'record.custom-action[event=death,customActionType=VALIDATE_DECLARATION]'
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
      SCOPES.RECORD_READ,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.PERFORMANCE_READ,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.USER_READ_MY_JURISDICTION,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=assigned-to-you|recent|requires-completion|in-external-validation|escalated|potential-duplicate|pending-updates|pending-registration|pending-approval|pending-certification|pending-issuance|correction-requested]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]',
      'record.unassign-others[event=birth|death|tennis-club-membership]',
      'record.custom-action[event=birth,customActionType=ESCALATE|ISSUE_CERTIFIED_COPY]'
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
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.USER_CREATE_MY_JURISDICTION,
      'user.create[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|PROVINCIAL_REGISTRAR]',
      'user.edit[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|PROVINCIAL_REGISTRAR]',
      SCOPES.USER_UPDATE_MY_JURISDICTION,
      SCOPES.USER_READ_MY_JURISDICTION
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
      SCOPES.CONFIG_UPDATE_ALL,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.USER_CREATE,
      'user.create[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER|PROVINCIAL_REGISTRAR|EMBASSY_OFFICIAL]',
      'user.edit[role=HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER|PROVINCIAL_REGISTRAR|EMBASSY_OFFICIAL]',
      SCOPES.USER_READ,
      SCOPES.USER_UPDATE,
      SCOPES.PERFORMANCE_READ,
      SCOPES.RECORD_REINDEX,
      SCOPES.PERFORMANCE_READ_DASHBOARDS
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
      SCOPES.PERFORMANCE_READ,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PERFORMANCE_READ_DASHBOARDS
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
      SCOPES.RECORD_READ,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.PERFORMANCE_READ,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.USER_READ,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=assigned-to-you|recent|requires-completion|in-external-validation|pending-feedback-registrar-general|potential-duplicate|registration-registrar-general]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]',
      'record.custom-action[event=birth,customActionType=REGISTRAR_GENERAL_FEEDBACK|REVOKE_REGISTRATION|REINSTATE_REVOKE_REGISTRATION|APPROVE_DECLARATION]',
      'record.custom-action[event=death,customActionType=APPROVE_DECLARATION]',
      'record.unassign-others[event=birth|death|tennis-club-membership]'
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
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.USER_READ_MY_JURISDICTION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=recent|pending-feedback-provincinal-registrar|pending-approval|correction-requested]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.custom-action[event=birth,customActionType=APPROVE_DECLARATION|PROVINCIAL_REGISTER_FEEDBACK|REINSTATE_REVOKE_REGISTRATION|ESCALATE]',
      'record.custom-action[event=death,customActionType=APPROVE_DECLARATION]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]'
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
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=assigned-to-you|recent|pending-updates]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]'
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
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      'type=record.search&event=birth,death,tennis-club-membership',
      'workqueue[id=assigned-to-you|recent]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
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
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      'workqueue[id=assigned-to-you|recent|escalated|pending-updates|pending-certification|potential-duplicate]',
      'type=record.search&event=birth,death,tennis-club-membership&declaredIn=location',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.edit[event=birth|death|tennis-club-membership]',
      'record.custom-action[event=birth,customActionType=ESCALATE|ISSUE_CERTIFIED_COPY]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]'
    ]
  }
]
