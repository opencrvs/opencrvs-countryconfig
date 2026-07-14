import { ConditionalType, field, FieldType, not } from '@opencrvs/toolkit/events'

export const collectPayment = [
    {
        id: 'collector.collect.payment.data',
        type: FieldType.DATA,
        label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.death.action.certificate.form.section.collectPayment.data.label'
        },
        configuration: {
            data: [
                {
                    id: 'service',
                    label: {
                        defaultMessage: 'Service',
                        description: 'Title for the data entry',
                        id: 'event.death.action.certificate.form.section.collectPayment.service.label'
                    },
                    value: {
                        defaultMessage: 'Death registration and certificate issuance',
                        description:
                            'Death registration and certificate issuance service name',
                        id: 'event.death.action.certificate.form.section.collectPayment.service.label.deathCertificateIssuance'
                    }
                },
                {
                    id: 'fee',
                    label: {
                        defaultMessage: 'Fee',
                        description: 'Title for the data entry',
                        id: 'event.death.action.certificate.form.section.collectPayment.fee.label'
                    },
                    value: '$25.00'
                }
            ]
        }
    },
    {
        id: 'collector.collect.payment.feeWaived',
        type: FieldType.CHECKBOX,
        defaultValue: false,
        label: {
            defaultMessage: 'Fee is waived / not collected',
            description: 'Label for the fee waived checkbox',
            id: 'event.death.action.certificate.form.section.collectPayment.feeWaived.label'
        }
    },
    {
        id: 'collector.collect.payment.amountCollected',
        type: FieldType.NUMBER,
        required: true,
        label: {
            defaultMessage: 'Confirm amount collected',
            description: 'Label for the amount collected field',
            id: 'event.death.action.certificate.form.section.collectPayment.amountCollected.label'
        },
        configuration: {
            min: 0,
            prefix: {
                defaultMessage: '$',
                description: 'Prefix for the amount collected field',
                id: 'event.death.action.certificate.form.section.collectPayment.amountCollected.prefix'
            }
        },
        conditionals: [
            {
                type: ConditionalType.SHOW,
                conditional: not(
                    field('collector.collect.payment.feeWaived').isEqualTo(true)
                )
            }
        ]
    },
    {
        id: 'collector.collect.payment.receiptNumber',
        type: FieldType.TEXT,
        required: true,
        label: {
            defaultMessage: 'Receipt number',
            description: 'Label for the receipt number field',
            id: 'event.death.action.certificate.form.section.collectPayment.receiptNumber.label'
        },
        conditionals: [
            {
                type: ConditionalType.SHOW,
                conditional: not(
                    field('collector.collect.payment.feeWaived').isEqualTo(true)
                )
            }
        ]
    },
    {
        id: 'collector.collect.payment.feeWaiverReason',
        type: FieldType.TEXT,
        required: true,
        label: {
            defaultMessage: 'Reason for fee waiver / non-collection',
            description:
                'Label for the reason for fee waiver / non-collection field',
            id: 'event.death.action.certificate.form.section.collectPayment.feeWaiverReason.label'
        },
        conditionals: [
            {
                type: ConditionalType.SHOW,
                conditional: field(
                    'collector.collect.payment.feeWaived'
                ).isEqualTo(true)
            }
        ],
        configuration: { maxLength: 500 }
    }
]