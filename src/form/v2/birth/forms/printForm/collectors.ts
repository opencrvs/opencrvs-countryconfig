/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

export const printCertificateCollectors: FieldConfig[] = [
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.MOTHER)
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to Informant (Mother)',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.FATHER)
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Informant (Father)',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.BROTHER
        )
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.informant.label',
          defaultMessage: 'Print and issue to Informant (Brother)',
          description: 'This is the label for the field'
        },
        value: InformantType.BROTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.GRANDFATHER
        )
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.informant.label',
          defaultMessage: 'Print and issue to Informant (Grandfather)',
          description: 'This is the label for the field'
        },
        value: InformantType.GRANDFATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.GRANDMOTHER
        )
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.informant.label',
          defaultMessage: 'Print and issue to Informant (Grandmother)',
          description: 'This is the label for the field'
        },
        value: InformantType.GRANDMOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.SISTER)
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.informant.label',
          defaultMessage: 'Print and issue to Informant (Sister)',
          description: 'This is the label for the field'
        },
        value: InformantType.SISTER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.LEGAL_GUARDIAN
        )
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.informant.label',
          defaultMessage: 'Print and issue to Informant (Legal Guardian)',
          description: 'This is the label for the field'
        },
        value: InformantType.LEGAL_GUARDIAN
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
          defaultMessage: 'Print and issue to Father',
          description: 'This is the label for the field'
        },
        value: InformantType.FATHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
          defaultMessage: 'Print and issue to mother',
          description: 'This is the label for the field'
        },
        value: InformantType.MOTHER
      },
      {
        label: {
          id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
          defaultMessage: 'Print and issue to someone else',
          description: 'This is the label for the field'
        },
        value: InformantType.OTHER
      }
    ]
  }
]
