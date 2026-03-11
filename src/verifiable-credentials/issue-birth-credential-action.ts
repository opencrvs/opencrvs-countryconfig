import {
  ActionConfig,
  ActionType,
  ConditionalType,
  FieldType,
  and,
  field,
  flag,
  not,
  window,
  status
} from '@opencrvs/toolkit/events'
import { CREDENTIAL_OFFER_HANDLER_URL } from './routes'

const qrGenerated = not(
  field('get-credential-offer')
    .get('data.credential_offer_uri_qr')
    .isUndefined()
)

export const issueBirthCredentialAction = {
  type: ActionType.CUSTOM,
  customActionType: 'ISSUE_VERIFIABLE_CREDENTIAL',
  label: {
    defaultMessage: 'Issue a verifiable credential',
    description: '',
    id: 'event.birth.action.issue-vc.label'
  },
  auditHistoryLabel: {
    defaultMessage: 'Verifiable Credential issued',
    description: '',
    id: 'event.birth.action.issue-vc.audit-history-label'
  },
  flags: [
    // Adding this flag to prevents the action from being shown again after the credential is issued.
    // {
    //   id: 'vc-issued',
    //   operation: 'add'
    // }
  ],
  conditionals: [
    {
      type: ConditionalType.ENABLE,
      conditional: not(flag('vc-issued'))
    },
    {
      type: ConditionalType.SHOW,
      conditional: and(not(flag('vc-issued')), status('REGISTERED'))
    }
  ],
  form: [
    {
      id: 'supporting-copy',
      // NOTE!
      // Setting PARAGRAPH to required disables submission before the VC is issued.
      required: true,
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Check the requesters details and issue the verifiable credential.',
        description:
          'This is the confirmation text for the registrar general feedback action',
        id: 'event.birth.action.registrar-general-feedback.supportingCopy'
      },
      configuration: { styles: { fontVariant: 'reg16', hint: true } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(qrGenerated)
        }
      ]
    },
    {
      id: 'requester.type',
      type: FieldType.SELECT,
      required: true,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(qrGenerated)
        }
      ],
      options: [
        {
          value: 'MOTHER',
          label: {
            defaultMessage: 'Mother',
            description: 'Option label for mother requester type',
            id: 'event.birth.custom.action.issue-vc.field.requester.option.mother'
          }
        },
        {
          value: 'FATHER',
          label: {
            defaultMessage: 'Father',
            description: 'Option label for father requester type',
            id: 'event.birth.custom.action.issue-vc.field.requester.option.father'
          }
        }
      ],
      label: {
        defaultMessage: 'Requester',
        description: 'Select who is requesting the VC',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      }
    },
    {
      parent: field('requester.type'),
      id: 'padding-for-layout-1',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: '<div style="height:60px"></div>',
        description: '60px padding for layout',
        id: 'form.field.label.padding.60px'
      },
      configuration: {},
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isUndefined(),
            not(qrGenerated)
          )
        }
      ]
    },
    {
      parent: field('requester.type'),
      id: 'requester.data.mother',
      type: FieldType.DATA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isEqualTo('MOTHER'),
            not(qrGenerated)
          )
        }
      ],
      label: {
        defaultMessage: 'Details in the birth record',
        description: 'Title for the data section',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      },
      configuration: {
        data: [
          { fieldId: 'mother.idType' },
          { fieldId: 'mother.nid' },
          { fieldId: 'mother.passport' },
          { fieldId: 'mother.brn' },
          { fieldId: 'mother.name' },
          { fieldId: 'mother.dob' },
          { fieldId: 'mother.age' },
          { fieldId: 'mother.nationality' }
        ]
      }
    },
    {
      parent: field('requester.type'),
      id: 'requester.data.father',
      type: FieldType.DATA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('requester.type').isEqualTo('FATHER'),
            not(qrGenerated)
          )
        }
      ],
      label: {
        defaultMessage: 'Details in the birth record',
        description: 'Title for the data section',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      },
      configuration: {
        data: [
          { fieldId: 'father.idType' },
          { fieldId: 'father.nid' },
          { fieldId: 'father.passport' },
          { fieldId: 'father.brn' },
          { fieldId: 'father.name' },
          { fieldId: 'father.dob' },
          { fieldId: 'father.age' },
          { fieldId: 'father.nationality' }
        ]
      }
    },
    {
      parent: field('requester.type'),
      id: 'request-credential-offer-button',
      type: FieldType.BUTTON,
      required: true,
      label: {
        defaultMessage: 'Verifiable credential offer',
        description: 'Button to request the credential offer from issuer',
        id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.label'
      },
      configuration: {
        text: {
          defaultMessage: 'Generate',
          description: 'Button to request the credential offer from issuer',
          id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.configuration.text'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('requester.type').isUndefined()),
            not(qrGenerated)
          )
        }
      ]
    },
    {
      id: 'get-credential-offer',
      parent: field('request-credential-offer-button'),
      type: FieldType.HTTP,
      label: {
        defaultMessage: 'Get Credential Offer',
        description: 'HTTP request to get the credential offer from the issuer',
        id: 'event.birth.custom.action.issue-vc.field.get-credential-offer.label'
      },
      configuration: {
        trigger: field('request-credential-offer-button'),
        url: CREDENTIAL_OFFER_HANDLER_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { pathname: window().location.get('pathname') },
        timeout: 10000
      }
    },
    {
      id: 'qr-code-explain-paragraph',
      parent: field('get-credential-offer'),
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Scan the QR code below with your digital wallet to receive your Verifiable Credential.',
        description: 'Explanation for the QR code field',
        id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.text'
      },
      configuration: {
        styles: { fontVariant: 'reg16', hint: true, textAlign: 'center' }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: qrGenerated
        }
      ]
    },
    {
      id: 'qr-code',
      parent: field('get-credential-offer'),
      type: FieldType.IMAGE_VIEW,
      label: {
        defaultMessage: 'QR Code',
        description: 'Upload the QR code image for the VC',
        id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.alt'
      },
      hideLabel: true,
      value: field('get-credential-offer').get('data.credential_offer_uri_qr'),
      configuration: {
        textAlign: 'center',
        width: '30%'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: qrGenerated
        }
      ]
    }
  ]
} satisfies ActionConfig
