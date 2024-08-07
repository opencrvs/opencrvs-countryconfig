import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { Conditional, SerializedFormField } from '../types/types'
import { MessageDescriptor } from 'react-intl'
import {
  formMessageDescriptors,
  mentionMessageDescriptors
} from '../common/messages'
import { Validator } from '../types/validators'
import { camelCase } from 'lodash'

/**
 *  Handlebar field: birthChildBirthTime
 */
export function getTimeOfBirth(): SerializedFormField {
  const fieldName: string = 'birthTime'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TIME', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.childTimeOfBirth',
      description: 'A form field that asks for child birth time',
      defaultMessage: 'Birth Time'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields: birthMotherBirthPlace / birthFatherBirthPlace
 */
export function getPlaceOfBirth(
  subject: 'mother' | 'father',
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = 'birthPlace'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.birthPlace',
      description: 'A form field that asks for the persons birthPlace',
      defaultMessage: 'Place of birth'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 255
  }
}

/**
 *  Handlebar fields: birthChildLegacyBirthRegistrationNumber
 */
export function getLegacyBirthRegistrationNumber(
  subject: 'child'
): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationNumber'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationNumber',
      description:
        'A form field that asks for legacy birth registration number',
      defaultMessage: 'Legacy birth registration number'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    maxLength: 6
  }
}

/**
 *  Handlebar field: birthChildLegacyBirthRegistrationDate
 */
export function getLegacyBirthRegistrationDate(): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationDate'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'DATE', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationDate',
      description: 'A form field that asks for legacy birth registration date',
      defaultMessage: 'Legacy birth registration date'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar field: birthChildLegacyBirthRegistrationTime
 */
export function getLegacyBirthRegistrationTime(): SerializedFormField {
  const fieldName: string = 'legacyBirthRegistrationTime'
  const fieldId: string = `birth.child.child-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'TIME', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.field.label.legacyBirthRegistrationTime',
      description: 'A form field that asks for legacy birth registration time',
      defaultMessage: 'Legacy birth registration time'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [] // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields:
 *  birthMotherCustomizedExactDateOfBirthUnknown / birthFatherCustomizedExactDateOfBirthUnknown / birthInformantCustomizedExactDateOfBirthUnknown
 */
export function getCustomizedExactDateOfBirthUnknown(
  subject: 'mother' | 'father' | 'informant',
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = 'customizedExactDateOfBirthUnknown'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    hideHeader: true,
    hideInPreview: true,
    type: 'CHECKBOX', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'Checkbox for exact date of birth unknown',
      id: 'form.field.label.exactDateOfBirthUnknown'
    },
    checkedValue: 'true',
    uncheckedValue: 'false',
    initialValue: 'false',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals // EDIT VALIDATORS AS YOU SEE FIT
  }
}

/**
 *  Handlebar fields:
 *  birthMotherYearOfBirth / birthFatherYearOfBirth / birthInformantYearOfBirth
 */
export function getYearOfBirth(
  subject: 'mother' | 'father' | 'informant',
  conditionals: Conditional[] = [],
  validators: Validator[]
): SerializedFormField {
  const fieldName: string = 'yearOfBirth'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'NUMBER', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: formMessageDescriptors.yearOfBirth,
    initialValue: '',
    validator: validators, // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    prefix: 'vers', //formMessageDescriptors.prefixAround,
    inputFieldWidth: '78px'
  }
}

/**
 *  Handlebar fields:
 *  birthChildFokontanyCustomAddress / birthMotherFokontanyCustomAddress
 *  birthFatherFokontanyCustomAddress / birthInformantFokontanyCustomAddress
 */
export function getFokontanyCustomAdress(
  subject: 'child' | 'mother' | 'father' | 'informant',
  conditionals: Conditional[] = [],
  required: boolean,
  labelOfFokontanyCustomAddress: MessageDescriptor
): SerializedFormField {
  const fieldName: string = 'fokontanyCustomAddress'
  const fieldId: string = `birth.${subject}.${subject}-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: required,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: labelOfFokontanyCustomAddress,
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals, // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 255
  }
}

export function getNUI(
  conditionals: Conditional[],
  fieldSpecificValidators: Validator[] = [],
  required: boolean = true,
  certificateHandlebar: string
): SerializedFormField {
  return {
    name: 'iD',
    type: 'TEXT',
    label: formMessageDescriptors.nui,
    required,
    custom: true,
    initialValue: '',
    maxLength: 10,
    conditionals,
    validator: [
      {
        operation: 'validIDNumberCustom' as const,
        parameters: ['NATIONAL_ID']
      },
      ...fieldSpecificValidators
    ],
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      mutation: {
        operation: 'fieldToIdentityTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      query: {
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      }
    }
  }
}

export function getFatherHasFormallyRecognisedChild(
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'fatherHasFormallyRecognisedChild'
  const fieldId: string = `birth.father.father-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'CHECKBOX',
    hideHeader: true,
    label: {
      id: 'form.field.label.fatherHasFormallyRecognisedChild',
      defaultMessage: 'Father has formally recognised child'
    },
    initialValue: false,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}

export const availableMentionTypes = [
  'RECOGNITION',
  'SIMPLE_ADOPTION',
  'JUDICIAL_ADOPTION',
  'NAME_CHANGE',
  'MARRIAGE',
  'DIVORCE',
  'REJECTION',
  'DEATH'
] as const

type MentionType = (typeof availableMentionTypes)[number]
function notMentionType(type: MentionType, index: number): Conditional[] {
  return [
    {
      action: 'hide',
      expression: `values['typeOfMention__${index}'] !== '${type}'`
    }
  ]
}

function detailsMentionExist(index: number): Conditional[] {
  return [
    {
      action: 'hide',
      expression: `values['detailsMentionExist__${index}'] === 'false'`
    }
  ]
}

export function typeOfMention(index: number): SerializedFormField {
  const fieldName = 'typeOfMention__' + index
  const fieldId = 'birth.mention.mention-view-group.' + fieldName
  return {
    name: fieldName,
    type: 'SELECT_WITH_OPTIONS',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.typeOfMention,
    required: false,
    custom: true,
    validator: [],
    options: availableMentionTypes.map((type) => ({
      label: mentionMessageDescriptors[type],
      value: type
    })),
    conditionals: detailsMentionExist(index),
    previewGroup: 'mention' + index,
    mapping: getCustomFieldMapping(fieldId)
  }
}

function getMentionActNumber(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = `${camelCase(type)}ActNumber__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'TEXT',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.actNumber,
    labelParam: {
      type
    },
    required: true,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getMentionDate(type: MentionType, index: number): SerializedFormField {
  const fieldName = `${camelCase(type)}Date__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'DATE',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.dateOfMention,
    labelParam: {
      type
    },
    required: true,
    custom: true,
    validator: [
      {
        operation: 'dateNotInFuture',
        parameters: []
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getMentionPlace(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = `${camelCase(type)}Place__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.placeOfMention,
    labelParam: {
      type
    },
    dynamicOptions: {
      dependency: ' ',
      resource: 'locations',
      jurisdictionType: 'DISTRICT'
    },
    required: true,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getSubsectionHeader(
  fieldName: string,
  label: MessageDescriptor,
  conditionals: Conditional[],
  labelParam?: Record<string, string>
): SerializedFormField {
  return {
    name: fieldName,
    type: 'HEADING3',
    label,
    hideInPreview: true,
    initialValue: '',
    validator: [],
    conditionals,
    labelParam
  }
}

export const getFamilyNameField = (
  fieldName: string,
  previewGroup: string,
  conditionals: Conditional[]
) => {
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName, // A field with this name MUST exist
    previewGroup,
    customQuestionMappingId: fieldId,
    conditionals,
    type: 'TEXT',
    label: formMessageDescriptors.familyName,
    maxLength: 255,
    required: true,
    initialValue: '',
    validator: [
      {
        operation: 'englishOnlyNameFormat'
      }
    ],
    mapping: getCustomFieldMapping(fieldId)
  } satisfies SerializedFormField
}

export const getFirstNameField = (
  fieldName: string,
  previewGroup: string,
  conditionals: Conditional[]
) => {
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName, // A field with this name MUST exist
    previewGroup,
    custom: true,
    customQuestionMappingId: fieldId,
    type: 'TEXT',
    label: {
      defaultMessage: 'First name(s)',
      description: 'Label for form field: First names',
      id: 'form.field.label.firstNames'
    },
    conditionals,
    maxLength: 255,
    required: false,
    initialValue: '',
    validator: [
      {
        operation: 'englishOnlyNameFormat'
      }
    ],
    mapping: getCustomFieldMapping(fieldId)
  } satisfies SerializedFormField
}

function getNUIWithCustomFieldName(
  fieldName: string,
  conditionals: Conditional[],
  fieldSpecificValidators: Validator[] = [],
  required: boolean = true,
  previewGroup: string,
  certificateHandlebar: string
): SerializedFormField {
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    ...getNUI(
      conditionals,
      fieldSpecificValidators,
      required,
      certificateHandlebar
    ),
    custom: true,
    customQuestionMappingId: fieldId,
    name: fieldName,
    previewGroup,
    mapping: getCustomFieldMapping(fieldId)
  }
}

function getJudgementDecisionNumber(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = `${camelCase(type)}JudgementDecisionNumber__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'TEXT',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.judgementDecisionNumber,
    required: true,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getJudgementDecisionDate(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = `${camelCase(type)}JudgementDecisionDate__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'DATE',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.judgementDecisionDate,
    required: true,
    custom: true,
    validator: [
      {
        operation: 'dateNotInFuture',
        parameters: []
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

const courtNames = [
  'TPI Antananarivo',
  'TPI Antananarivo Avaradrano',
  'TPI Ankazobe',
  'TPI Tsiroanomandidy',
  'TPI Miarinarivo',
  'TPI Arivonimamo',
  'TPI Antsirabe',
  'TPI Ambatolampy',
  'TPI Toamasina',
  'TPI Vatomandry',
  'TPI Mahanoro',
  'TPI Ambatondrazaka',
  'TPI Moramanga',
  'TPI Fenoarivo Atsinanana',
  'TPI Maroantsetra',
  'TPI Sainte Marie',
  'TPI Fianarantsoa',
  'TPI Ambositra',
  'TPI Ambatofinandrahana',
  'TPI Manakara',
  'TPI Ikongo',
  'TPI Mananjary',
  'TPI Farafangana',
  'TPI Vangaindrano',
  'TPI Ihosy',
  'TPI Toliara',
  'TPI Morombe',
  'TPI Ankazoabo Sud',
  'TPI Beroroha',
  'TPI Ampanihy',
  'TPI Ambovombe',
  'TPI Tolagnaro',
  'TPI Betroka',
  'TPI Mahajanga',
  'TPI Maevatanana',
  'TPI Antsohihy',
  'TPI Analalava',
  'TPI Bealanana',
  'TPI Befandriana Avaratra',
  'TPI Mampikony',
  'TPI Mandritsara',
  'TPI Boriziny',
  'TPI Maintirano',
  'TPI Besalampy',
  'TPI Antsiranana',
  'TPI Ambanja',
  'TPI Ambilobe',
  'TPI Nosy Be',
  'TPI Sambava',
  'TPI Antalaha'
]

function getTribunalOfFirstInstanceAct(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = `${camelCase(type)}TribunalOfFirstInstanceAct__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_OPTIONS',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.tribunalOfFirstInstanceAct,
    required: false,
    options: courtNames.map((name) => ({
      value: name,
      label: {
        id: 'form.field.label.courtName.' + name.replace(/\s/, ''),
        defaultMessage: name
      }
    })),
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getModification(
  type: MentionType,
  index: number
): SerializedFormField {
  const fieldName = 'modification__' + index
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'TEXT',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.modification,
    required: true,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getDateOfDeath(type: MentionType, index: number): SerializedFormField {
  const fieldName = `${camelCase(type)}dateOfDeath__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'DATE',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: formMessageDescriptors.deathEventDate,
    required: true,
    custom: true,
    validator: [
      {
        operation: 'dateNotInFuture',
        parameters: []
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

function getDeathPlace(type: MentionType, index: number): SerializedFormField {
  const fieldName = `${camelCase(type)}DeathPlace__${index}`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.placeOfDeath,
    labelParam: {
      type
    },
    dynamicOptions: {
      dependency: ' ',
      resource: 'locations',
      jurisdictionType: 'DISTRICT'
    },
    required: true,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type, index).concat(
      detailsMentionExist(index)
    ),
    previewGroup: 'mention' + index
  }
}

export function getNotes(index: number): SerializedFormField {
  const fieldName = 'notes__' + index
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'TEXTAREA',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.notes,
    required: false,
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    previewGroup: 'mention' + index,
    conditionals: [
      {
        action: 'hide',
        expression: `!values['typeOfMention__${index}']`
      }
    ].concat(detailsMentionExist(index))
  }
}

export function getRecognitionMentionFields(i: number): SerializedFormField[] {
  const type = 'RECOGNITION'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getMentionPlace(type, i),
    getFamilyNameField(
      'childFamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'childFirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'mentionChildNID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionChildNID__' + i
    )
  ]
}

export function getSimpleAdoptionMentionFields(
  i: number
): SerializedFormField[] {
  const type = 'SIMPLE_ADOPTION'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getSubsectionHeader(
      'simpleAdoptionParent1Header__' + i,
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      { number: '1' }
    ),
    getFamilyNameField(
      'simpleAdoptionParent1FamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'simpleAdoptionParent1FirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'simpleAdoptionParent1NID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionAdoptionParent1NID__' + i
    ),
    getSubsectionHeader(
      'simpleAdoptionParent2Header__' + i,
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      { number: '2' }
    ),
    getFamilyNameField(
      'simpleAdoptionParent2FamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'simpleAdoptionParent2FirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'simpleAdoptionParent2NID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionAdoptionParent2NID__' + i
    )
  ]
}

export function getJudicialAdoptionMentionFields(
  i: number
): SerializedFormField[] {
  const type = 'JUDICIAL_ADOPTION'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getJudgementDecisionNumber(type, i),
    getJudgementDecisionDate(type, i),
    getTribunalOfFirstInstanceAct(type, i),
    getSubsectionHeader(
      'judicialAdoptionParent1Header__' + i,
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      { number: '1' }
    ),
    getFamilyNameField(
      'judicialAdoptionParent1FamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'judicialAdoptionParent1FirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'judicialAdoptionParent1NID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionJudicialAdoptionParent1NID__' + i
    ),
    getSubsectionHeader(
      'judicialAdoptionParent2Header__' + i,
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      { number: '2' }
    ),
    getFamilyNameField(
      'judicialAdoptionParent2FamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'judicialAdoptionParent2FirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'judicialAdoptionParent2NID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionJudicialAdoptionParent2NID__' + i
    )
  ]
}

export function getMarriageMentionFields(i: number): SerializedFormField[] {
  const type = 'MARRIAGE'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getJudgementDecisionNumber(type, i),
    getJudgementDecisionDate(type, i),
    getTribunalOfFirstInstanceAct(type, i),
    getSubsectionHeader(
      'brideOrGroomHeader__' + i,
      mentionMessageDescriptors.brideOrGroom,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFamilyNameField(
      'brideOrGroomFamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'brideOrGroomFirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'brideOrGroomNID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionMarriageBrideOrGroomNID__' + i
    )
  ]
}

export function getDivorceMentionFields(i: number): SerializedFormField[] {
  const type = 'DIVORCE'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getMentionPlace(type, i),
    getSubsectionHeader(
      'wifeOrHusbandHeader__' + i,
      mentionMessageDescriptors.wifeOrHusband,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFamilyNameField(
      'wifeOrHusbandFamilyName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getFirstNameField(
      'wifeOrHusbandFirstName__' + i,
      'mention' + i,
      notMentionType(type, i).concat(detailsMentionExist(i))
    ),
    getNUIWithCustomFieldName(
      'wifeOrHusbandNID__' + i,
      notMentionType(type, i).concat(detailsMentionExist(i)),
      [],
      false,
      'mention' + i,
      'mentionDivorceWifeOrHusbandNID__' + i
    )
  ]
}

export function getNameChangeMentionFields(i: number): SerializedFormField[] {
  const type = 'NAME_CHANGE'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getJudgementDecisionNumber(type, i),
    getJudgementDecisionDate(type, i),
    getTribunalOfFirstInstanceAct(type, i),
    getModification(type, i)
  ]
}

export function getDeathMentionFields(i: number): SerializedFormField[] {
  const type = 'DEATH'
  return [
    getMentionActNumber(type, i),
    getMentionDate(type, i),
    getMentionPlace(type, i),
    getDateOfDeath(type, i),
    getDeathPlace(type, i)
  ]
}

export const getDetailsMentionExist = (index: number) => {
  const fieldName: string = 'detailsMentionExist__' + index
  const fieldId: string = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    type: 'CHECKBOX',
    label: mentionMessageDescriptors.mentionDetailsExist,
    required: false,
    checkedValue: 'true',
    uncheckedValue: 'false',
    hideHeader: true,
    initialValue: 'false',
    validator: [],
    custom: true,
    conditionals:
      index === 0
        ? [
            {
              action: 'hideInPreview',
              expression: `${index} !== 0 || values['detailsMentionExist__${index}'] === "true"`
            }
          ]
        : [
            {
              action: 'hideInPreview',
              expression: `${index} !== 0 || values['detailsMentionExist__${index}'] === "true"`
            },
            {
              action: 'hide',
              expression: `!values['detailsMentionExist__${index - 1}']`
            }
          ],
    mapping: getCustomFieldMapping(fieldId),
    ignoreBottomMargin: false
  } satisfies SerializedFormField
}
