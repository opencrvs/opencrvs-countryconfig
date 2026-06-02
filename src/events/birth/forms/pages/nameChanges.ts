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
    defineFormPage,
    FieldType,
    PageTypes,
    TranslationConfig,
    and,
    field,
    user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'

const NameChangeSource = {
    DEED_POLL: 'DEED_POLL',
    NATIVE_ADOPTION: 'NATIVE_ADOPTION'
} as const

const nameChangeSourceMessageDescriptors = {
    DEED_POLL: {
        defaultMessage: 'Deed poll',
        description: 'Option for source of name change: deed poll',
        id: 'form.field.label.nameChangeSourceDeedPoll'
    },
    NATIVE_ADOPTION: {
        defaultMessage: 'Native adoption',
        description: 'Option for source of name change: native adoption',
        id: 'form.field.label.nameChangeSourceNativeAdoption'
    }
} satisfies Record<keyof typeof NameChangeSource, TranslationConfig>

const nameChangeSourceOptions = createSelectOptions(
    NameChangeSource,
    nameChangeSourceMessageDescriptors
)

const showNameChanges = and(
    field('child.nameChangedAfterRegistration').isEqualTo(true),
    not(user.hasRole('HOSPITAL_CLERK'))
)

const showChange2 = and(
    showNameChanges,
    field('nameChanges.addAnother1').isEqualTo(true)
)

const showChange3 = and(
    showChange2,
    field('nameChanges.addAnother2').isEqualTo(true)
)

export const nameChanges = defineFormPage({
    id: 'nameChanges',
    type: PageTypes.enum.FORM,
    title: {
        defaultMessage: 'Name changes',
        description: 'Form section title for name changes',
        id: 'event.birth.action.declare.form.section.nameChanges.title'
    },
    conditional: showNameChanges,
    fields: [
        {
            id: 'nameChanges.header1',
            type: FieldType.HEADING,
            label: {
                defaultMessage: 'Name Change #1',
                description: 'Header for first name change section',
                id: 'event.birth.action.declare.form.section.nameChanges.field.header1.label'
            },
            configuration: { styles: { fontVariant: 'h3' } }
        },
        {
            id: 'nameChanges.source1',
            type: FieldType.SELECT,
            required: false,
            analytics: true,
            label: {
                defaultMessage: 'Source of name change',
                description: 'Label for source of first name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.source1.label'
            },
            options: nameChangeSourceOptions
        },
        {
            id: 'nameChanges.newFirstName1',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New given name(s)',
                description: 'Label for new given names in first name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newFirstName1.label'
            }
        },
        {
            id: 'nameChanges.newSurname1',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New surname',
                description: 'Label for new surname in first name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newSurname1.label'
            }
        },
        {
            id: 'nameChanges.date1',
            type: FieldType.DATE,
            required: false,
            label: {
                defaultMessage: 'Date of name change',
                description: 'Label for date of first name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.date1.label'
            }
        },
        {
            id: 'nameChanges.reason1',
            type: FieldType.TEXTAREA,
            required: false,
            label: {
                defaultMessage: 'Reason for name change',
                description: 'Label for reason for first name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.reason1.label'
            }
        },
        {
            id: 'nameChanges.addAnother1',
            type: FieldType.CHECKBOX,
            required: false,
            defaultValue: false,
            label: {
                defaultMessage: 'Add another name change',
                description: 'Checkbox to add a second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.addAnother1.label'
            }
        },
        {
            id: 'nameChanges.divider1',
            type: FieldType.DIVIDER,
            label: emptyMessage,
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ]
        },
        // --- Name Change #2 ---
        {
            id: 'nameChanges.header2',
            type: FieldType.HEADING,
            label: {
                defaultMessage: 'Name Change #2',
                description: 'Header for second name change section',
                id: 'event.birth.action.declare.form.section.nameChanges.field.header2.label'
            },
            configuration: { styles: { fontVariant: 'h3' } },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: field('nameChanges.addAnother1').isEqualTo(true)
                }
            ]
        },
        {
            id: 'nameChanges.source2',
            type: FieldType.SELECT,
            required: false,
            analytics: true,
            label: {
                defaultMessage: 'Source of name change',
                description: 'Label for source of second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.source2.label'
            },
            options: nameChangeSourceOptions,
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ],
            parent: field('nameChanges.addAnother1')
        },
        {
            id: 'nameChanges.newFirstName2',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New given name(s)',
                description: 'Label for new given names in second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newFirstName2.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ],
            parent: field('nameChanges.addAnother1')
        },
        {
            id: 'nameChanges.newSurname2',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New surname',
                description: 'Label for new surname in second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newSurname2.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ],
            parent: field('nameChanges.addAnother1')
        },
        {
            id: 'nameChanges.date2',
            type: FieldType.DATE,
            required: false,
            label: {
                defaultMessage: 'Date of name change',
                description: 'Label for date of second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.date2.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ],
            parent: field('nameChanges.addAnother1')
        },
        {
            id: 'nameChanges.reason2',
            type: FieldType.TEXTAREA,
            required: false,
            label: {
                defaultMessage: 'Reason for name change',
                description: 'Label for reason for second name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.reason2.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ],
            parent: field('nameChanges.addAnother1')
        },
        {
            id: 'nameChanges.addAnother2',
            type: FieldType.CHECKBOX,
            required: false,
            defaultValue: false,
            label: {
                defaultMessage: 'Add another name change',
                description: 'Checkbox to add a third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.addAnother2.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange2
                }
            ]
        },
        {
            id: 'nameChanges.divider2',
            type: FieldType.DIVIDER,
            label: emptyMessage,
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ]
        },
        // --- Name Change #3 ---
        {
            id: 'nameChanges.header3',
            type: FieldType.HEADING,
            label: {
                defaultMessage: 'Name Change #3',
                description: 'Header for third name change section',
                id: 'event.birth.action.declare.form.section.nameChanges.field.header3.label'
            },
            configuration: { styles: { fontVariant: 'h3' } },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ]
        },
        {
            id: 'nameChanges.source3',
            type: FieldType.SELECT,
            required: false,
            analytics: true,
            label: {
                defaultMessage: 'Source of name change',
                description: 'Label for source of third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.source3.label'
            },
            options: nameChangeSourceOptions,
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ],
            parent: field('nameChanges.addAnother2')
        },
        {
            id: 'nameChanges.newFirstName3',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New given name(s)',
                description: 'Label for new given names in third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newFirstName3.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ],
            parent: field('nameChanges.addAnother2')
        },
        {
            id: 'nameChanges.newSurname3',
            type: FieldType.TEXT,
            required: false,
            label: {
                defaultMessage: 'New surname',
                description: 'Label for new surname in third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.newSurname3.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ],
            parent: field('nameChanges.addAnother2')
        },
        {
            id: 'nameChanges.date3',
            type: FieldType.DATE,
            required: false,
            label: {
                defaultMessage: 'Date of name change',
                description: 'Label for date of third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.date3.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ],
            parent: field('nameChanges.addAnother2')
        },
        {
            id: 'nameChanges.reason3',
            type: FieldType.TEXTAREA,
            required: false,
            label: {
                defaultMessage: 'Reason for name change',
                description: 'Label for reason for third name change',
                id: 'event.birth.action.declare.form.section.nameChanges.field.reason3.label'
            },
            conditionals: [
                {
                    type: ConditionalType.SHOW,
                    conditional: showChange3
                }
            ],
            parent: field('nameChanges.addAnother2')
        }
    ]
})
