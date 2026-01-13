import { SCOPES } from '@opencrvs/toolkit/scopes'

export const testRoles = [
  {
    id: 'FIELD_AGENT_TEST',
    label: {
      defaultMessage: 'Field Agent (Test)',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent.test'
    },
    scopes: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=my-jurisdiction]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|requires-updates-self|sent-for-review]',
      `record.create[event=birth|death|tennis-club-membership]`,
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'POLICE_OFFICER_TEST',
    label: {
      defaultMessage: 'Police Officer (Test)',
      description: 'Name for user role Police Officer',
      id: 'userRole.policeOfficer.test'
    },
    scopes: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      `record.create[event=birth|death|tennis-club-membership]`,
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'HOSPITAL_CLERK_TEST',
    label: {
      defaultMessage: 'Hospital Clerk (Test)',
      description: 'Name for user role Hospital Clerk',
      id: 'userRole.hospitalClerk.test'
    },
    scopes: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|requires-updates-self|sent-for-review]',
      `record.create[event=birth|death|tennis-club-membership]`,
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'HEALTHCARE_WORKER_TEST',
    label: {
      defaultMessage: 'Healthcare Worker (Test)',
      description: 'Name for user role Healthcare Worker',
      id: 'userRole.healthcareWorker.test'
    },
    scopes: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      `record.create[event=birth|death|tennis-club-membership]`,
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'COMMUNITY_LEADER_TEST',
    label: {
      defaultMessage: 'Community Leader (Test)',
      description: 'Name for user role Community Leader',
      id: 'userRole.communityLeader.test'
    },
    scopes: [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|sent-for-review|ready-to-print]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'REGISTRATION_AGENT_TEST',
    label: {
      defaultMessage: 'Registration Agent (Test)',
      description: 'Name for user role Registration Agent',
      id: 'userRole.registrationAgent.test'
    },
    scopes: [
      SCOPES.RECORD_READ,
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_DECLARATION_EDIT,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REVIEW_DUPLICATES,
      SCOPES.RECORD_DECLARATION_ARCHIVE,
      SCOPES.RECORD_DECLARATION_REINSTATE,
      SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|requires-completion|requires-updates-office|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.validate[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.request-correction[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'LOCAL_REGISTRAR_TEST',
    label: {
      defaultMessage: 'Local Registrar (Test)',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar.test'
    },
    scopes: [
      SCOPES.RECORD_READ,
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_DECLARATION_EDIT,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REVIEW_DUPLICATES,
      SCOPES.RECORD_DECLARATION_ARCHIVE,
      SCOPES.RECORD_DECLARATION_REINSTATE,
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_REGISTRATION_CORRECT,
      SCOPES.RECORD_UNASSIGN_OTHERS,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.RECORD_CONFIRM_REGISTRATION,
      SCOPES.RECORD_REJECT_REGISTRATION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|requires-completion|requires-updates-office|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]',
      'record.unassign-others[event=birth|death|tennis-club-membership]'
    ]
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN_TEST',
    label: {
      defaultMessage: 'Local System Admin (Test)',
      description: 'Name for user role Local System Admin',
      id: 'userRole.localSystemAdmin.test'
    },
    scopes: [
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.USER_CREATE_MY_JURISDICTION,
      SCOPES.USER_UPDATE_MY_JURISDICTION,
      'user.create[role=FIELD_AGENT|POLICE_OFFICER|HOSPITAL_CLERK|HEALTHCARE_WORKER|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|FIELD_AGENT_TEST|POLICE_OFFICER_TEST|HOSPITAL_CLERK_TEST|HEALTHCARE_WORKER_TEST|COMMUNITY_LEADER_TEST|REGISTRATION_AGENT_TEST|LOCAL_REGISTRAR_TEST]',
      'user.edit[role=FIELD_AGENT|POLICE_OFFICER|HOSPITAL_CLERK|HEALTHCARE_WORKER|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|FIELD_AGENT_TEST|POLICE_OFFICER_TEST|HOSPITAL_CLERK_TEST|HEALTHCARE_WORKER_TEST|COMMUNITY_LEADER_TEST|REGISTRATION_AGENT_TEST|LOCAL_REGISTRAR_TEST]',
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER_TEST',
    label: {
      defaultMessage: 'Performance Manager (Test)',
      description: 'Name for user role Performance Manager',
      id: 'userRole.performanceManager.test'
    },
    scopes: [
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      SCOPES.ORGANISATION_READ_LOCATIONS
    ]
  },
  {
    id: 'NATIONAL_REGISTRAR_TEST',
    label: {
      defaultMessage: 'National Registrar (Test)',
      description: 'Name for user role National Registrar',
      id: 'userRole.nationalRegistrar.test'
    },
    scopes: [
      SCOPES.RECORD_READ,
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REVIEW_DUPLICATES,
      SCOPES.RECORD_DECLARATION_ARCHIVE,
      SCOPES.RECORD_DECLARATION_REINSTATE,
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_REGISTRATION_CORRECT,
      SCOPES.RECORD_UNASSIGN_OTHERS,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.RECORD_CONFIRM_REGISTRATION,
      SCOPES.RECORD_REJECT_REGISTRATION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'workqueue[id=assigned-to-you|recent|requires-completion|requires-updates-office|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]',
      'record.unassign-others[event=birth|death|tennis-club-membership]'
    ]
  }
]
