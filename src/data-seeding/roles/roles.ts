import { SCOPES, Scope, AnyScope, encodeScope } from '@opencrvs/toolkit/scopes'
import { MessageDescriptor } from 'react-intl'

type Role = {
  id: string
  label: MessageDescriptor
  scopes: Scope[]
}

type RoleWithDecodedScopes = {
  id: string
  label: MessageDescriptor
  scopes: AnyScope[]
}

const rolesWithDecodedScopes: RoleWithDecodedScopes[] = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      {
        type: 'record.search',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Officer',
      description: 'Name for user role Registration Officer',
      id: 'userRole.registrationOfficer'
    },
    scopes: [
      { type: SCOPES.RECORD_READ },
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_FOR_APPROVAL },
      { type: SCOPES.RECORD_SUBMIT_FOR_UPDATES },
      { type: SCOPES.RECORD_DECLARATION_EDIT },
      { type: SCOPES.RECORD_REVIEW_DUPLICATES },
      { type: SCOPES.RECORD_DECLARATION_ARCHIVE },
      { type: SCOPES.RECORD_DECLARATION_REINSTATE },
      { type: SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES },
      { type: SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION },
      { type: SCOPES.PERFORMANCE_READ },
      { type: SCOPES.PERFORMANCE_READ_DASHBOARDS },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredIn: 'administrativeArea'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review',
            'sent-for-approval',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.request-correction',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['birth', 'death'],
          customActionType: ['VALIDATE_DECLARATION']
        }
      }
    ]
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: [
      { type: SCOPES.RECORD_READ },
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_FOR_UPDATES },
      { type: SCOPES.RECORD_UNASSIGN_OTHERS },
      { type: SCOPES.RECORD_DECLARATION_EDIT },
      { type: SCOPES.RECORD_DECLARATION_ARCHIVE },
      { type: SCOPES.RECORD_DECLARATION_REINSTATE },
      { type: SCOPES.RECORD_REVIEW_DUPLICATES },
      { type: SCOPES.RECORD_REGISTER },
      { type: SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES },
      { type: SCOPES.PROFILE_ELECTRONIC_SIGNATURE },
      { type: SCOPES.RECORD_REGISTRATION_CORRECT },
      { type: SCOPES.RECORD_CONFIRM_REGISTRATION },
      { type: SCOPES.RECORD_REJECT_REGISTRATION },
      { type: SCOPES.PERFORMANCE_READ },
      { type: SCOPES.PERFORMANCE_READ_DASHBOARDS },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE },
      { type: SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION },
      { type: SCOPES.USER_READ_MY_OFFICE },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredIn: 'administrativeArea'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review-all',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue',
            'pending-certification',
            'escalated'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.correct',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.unassign-others',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['birth'],
          customActionType: [
            'ESCALATE',
            'ISSUE_CERTIFIED_COPY',
            'VALIDATE_DECLARATION'
          ]
        }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['death'],
          customActionType: ['VALIDATE_DECLARATION']
        }
      }
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
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION },
      { type: SCOPES.USER_CREATE_MY_JURISDICTION },
      {
        type: 'user.create',
        options: {
          role: [
            'FIELD_AGENT',
            'HOSPITAL_CLERK',
            'COMMUNITY_LEADER',
            'REGISTRATION_AGENT',
            'LOCAL_REGISTRAR'
          ]
        }
      },
      { type: SCOPES.USER_UPDATE_MY_JURISDICTION },
      {
        type: 'user.edit',
        options: {
          role: [
            'FIELD_AGENT',
            'HOSPITAL_CLERK',
            'COMMUNITY_LEADER',
            'REGISTRATION_AGENT',
            'LOCAL_REGISTRAR'
          ]
        }
      },
      { type: SCOPES.USER_READ_MY_JURISDICTION }
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
      { type: SCOPES.CONFIG_UPDATE_ALL },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS },
      { type: SCOPES.USER_CREATE },
      {
        type: 'user.create',
        options: {
          role: [
            'FIELD_AGENT',
            'POLICE_OFFICER',
            'HOSPITAL_CLERK',
            'HEALTHCARE_WORKER',
            'COMMUNITY_LEADER',
            'REGISTRATION_AGENT',
            'LOCAL_REGISTRAR',
            'NATIONAL_REGISTRAR',
            'LOCAL_SYSTEM_ADMIN',
            'NATIONAL_SYSTEM_ADMIN',
            'PERFORMANCE_MANAGER',
            'PROVINCIAL_REGISTRAR'
          ]
        }
      },
      {
        type: 'user.edit',
        options: {
          role: [
            'FIELD_AGENT',
            'POLICE_OFFICER',
            'HOSPITAL_CLERK',
            'HEALTHCARE_WORKER',
            'COMMUNITY_LEADER',
            'REGISTRATION_AGENT',
            'LOCAL_REGISTRAR',
            'NATIONAL_REGISTRAR',
            'LOCAL_SYSTEM_ADMIN',
            'NATIONAL_SYSTEM_ADMIN',
            'PERFORMANCE_MANAGER',
            'PROVINCIAL_REGISTRAR'
          ]
        }
      },
      { type: SCOPES.USER_READ },
      { type: SCOPES.USER_UPDATE },
      { type: SCOPES.PERFORMANCE_READ },
      { type: SCOPES.PERFORMANCE_READ_DASHBOARDS },
      { type: SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS },
      { type: SCOPES.RECORD_REINDEX }
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
      { type: SCOPES.PERFORMANCE_READ },
      { type: SCOPES.PERFORMANCE_READ_DASHBOARDS },
      { type: SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS }
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
      { type: SCOPES.RECORD_READ },
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_FOR_UPDATES },
      { type: SCOPES.RECORD_UNASSIGN_OTHERS },
      { type: SCOPES.RECORD_DECLARATION_EDIT },
      { type: SCOPES.RECORD_DECLARATION_ARCHIVE },
      { type: SCOPES.RECORD_DECLARATION_REINSTATE },
      { type: SCOPES.RECORD_REVIEW_DUPLICATES },
      { type: SCOPES.RECORD_REGISTER },
      { type: SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES },
      { type: SCOPES.PROFILE_ELECTRONIC_SIGNATURE },
      { type: SCOPES.RECORD_REGISTRATION_CORRECT },
      { type: SCOPES.RECORD_CONFIRM_REGISTRATION },
      { type: SCOPES.RECORD_REJECT_REGISTRATION },
      { type: SCOPES.PERFORMANCE_READ },
      { type: SCOPES.PERFORMANCE_READ_DASHBOARDS },
      { type: SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE },
      { type: SCOPES.USER_READ_MY_OFFICE },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      { type: SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          eventLocation: 'all'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review-all',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue',
            'pending-feedback-registrar-general'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.correct',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['birth'],
          customActionType: ['REGISTRAR_GENERAL_FEEDBACK']
        }
      },
      {
        type: 'record.unassign-others',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
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
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['birth'],
          customActionType: [
            'APPROVE_DECLARATION',
            'PROVINCIAL_REGISTER_FEEDBACK'
          ]
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'late-registration-approval-required',
            'recent',
            'pending-feedback-provincinal-registrar'
          ]
        }
      },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredIn: 'administrativeArea'
        }
      }
    ]
  },
  {
    id: 'HOSPITAL_CLERK',
    label: {
      defaultMessage: 'Hospital Clerk',
      description: 'Name for user role Hospital Clerk',
      id: 'userRole.hospitalClerk'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredIn: 'location'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
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
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      { type: SCOPES.USER_READ_ONLY_MY_AUDIT },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredBy: 'user'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: ['assigned-to-you', 'recent', 'sent-for-review', 'ready-to-print']
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  },
  {
    id: 'POLICE_OFFICER',
    label: {
      defaultMessage: 'Police Officer',
      description: 'Name for user role Police Officer',
      id: 'userRole.policeOfficer'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          declaredIn: 'location'
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  },
  {
    id: 'SOCIAL_WORKER',
    label: {
      defaultMessage: 'Social Worker',
      description: 'Name for user role Social Worker',
      id: 'userRole.socialWorker'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  },
  {
    id: 'HEALTHCARE_WORKER',
    label: {
      defaultMessage: 'Healthcare Worker',
      description: 'Name for user role Healthcare Worker',
      id: 'userRole.healthcareWorker'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  },
  {
    id: 'LOCAL_LEADER',
    label: {
      defaultMessage: 'Local Leader',
      description: 'Name for user role Local Leader',
      id: 'userRole.LocalLeader'
    },
    scopes: [
      { type: SCOPES.RECORD_DECLARE_BIRTH },
      { type: SCOPES.RECORD_DECLARE_DEATH },
      { type: SCOPES.RECORD_DECLARE_MARRIAGE },
      { type: SCOPES.RECORD_SUBMIT_INCOMPLETE },
      { type: SCOPES.RECORD_SUBMIT_FOR_REVIEW },
      { type: SCOPES.SEARCH_BIRTH },
      { type: SCOPES.SEARCH_DEATH },
      { type: SCOPES.SEARCH_MARRIAGE },
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      },
      {
        type: 'workqueue',
        options: {
          id: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.edit',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ]
  }
]

export const roles: Role[] = rolesWithDecodedScopes.map(
  ({ scopes, ...rest }) => ({
    ...rest,
    scopes: scopes.map((scope) => encodeScope(scope))
  })
)
