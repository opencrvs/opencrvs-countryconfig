import {
  getCustomFieldMapping,
  getFieldMapping
} from '@countryconfig/utils/mapping/field-mapping-utils'
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
    initialValue: false,
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
function notMentionType(type: MentionType): Conditional[] {
  return [
    {
      action: 'hide',
      expression: `values.typeOfMention !== '${type}'`
    }
  ]
}

export function typeOfMention(): SerializedFormField {
  const fieldId = 'birth.mention.mention-view-group.typeOfMention'
  return {
    name: 'typeOfMention',
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
    mapping: getCustomFieldMapping(fieldId)
  }
}

function getMentionActNumber(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}ActNumber`
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
    conditionals: notMentionType(type)
  }
}

function getMentionDate(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}Date`
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
    conditionals: notMentionType(type)
  }
}

function getMentionPlace(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}Place`
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
    conditionals: notMentionType(type)
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
    initialValue: '',
    validator: [],
    conditionals,
    labelParam
  }
}

export const getFamilyNameField = (
  fieldName: string,
  previewGroup: string,
  conditionals: Conditional[],
  certificateHandlebar: string
) =>
  ({
    name: fieldName, // A field with this name MUST exist
    previewGroup,
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
    mapping: getFieldMapping('familyName', certificateHandlebar)
  } satisfies SerializedFormField)

export const getFirstNameField = (
  fieldName: string,
  previewGroup: string,
  conditionals: Conditional[],
  certificateHandlebar: string
) =>
  ({
    name: fieldName, // A field with this name MUST exist
    previewGroup,
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
    mapping: getFieldMapping('firstNames', certificateHandlebar)
  } satisfies SerializedFormField)

function getNUIWithCustomFieldName(
  fieldName: string,
  conditionals: Conditional[],
  fieldSpecificValidators: Validator[] = [],
  required: boolean = true,
  certificateHandlebar: string
) {
  return {
    ...getNUI(
      conditionals,
      fieldSpecificValidators,
      required,
      certificateHandlebar
    ),
    name: fieldName
  }
}

function getJudgementDecisionNumber(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}JudgementDecisionNumber`
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
    conditionals: notMentionType(type)
  }
}

function getJudgementDecisionDate(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}JudgementDecisionDate`
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
    conditionals: notMentionType(type)
  }
}

function getTribunalOfFirstInstanceAct(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}TribunalOfFirstInstanceAct`
  const fieldId = `birth.mention.mention-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_OPTIONS',
    customQuestionMappingId: fieldId,
    initialValue: '',
    label: mentionMessageDescriptors.tribunalOfFirstInstanceAct,
    required: false,
    options: [],
    custom: true,
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: notMentionType(type)
  }
}

function getModification(type: MentionType): SerializedFormField {
  const fieldName = 'modification'
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
    conditionals: notMentionType(type)
  }
}

function getDateOfDeath(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}dateOfDeath`
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
    conditionals: notMentionType(type)
  }
}

function getDeathPlace(type: MentionType): SerializedFormField {
  const fieldName = `${camelCase(type)}DeathPlace`
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
    conditionals: notMentionType(type)
  }
}

export function getNotes(): SerializedFormField {
  const fieldName = 'notes'
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
    conditionals: [
      {
        action: 'hide',
        expression: '!values.typeOfMention'
      }
    ]
  }
}

export function getRecognitionMentionFields() {
  const type = 'RECOGNITION'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getMentionPlace(type),
    getFamilyNameField(
      'childFamilyName',
      'name',
      notMentionType(type),
      'mentionChildFamilyName'
    ),
    getFirstNameField(
      'childFirstName',
      'name',
      notMentionType(type),
      'mentionChildFirstName'
    ),
    getNUIWithCustomFieldName(
      'mentionChildNID',
      notMentionType(type),
      [],
      false,
      'mentionChildNID'
    )
  ]
}

export function getSimpleAdoptionMentionFields() {
  const type = 'SIMPLE_ADOPTION'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getSubsectionHeader(
      'adoptionParent1Header',
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type),
      { number: '1' }
    ),
    getFamilyNameField(
      'adoptionParent1FamilyName',
      'adoptionParent1Name',
      notMentionType(type),
      'mentionAdoptionParent1FamilyName'
    ),
    getFirstNameField(
      'adoptionParent1FirstName',
      'adoptionParent1Name',
      notMentionType(type),
      'mentionAdoptionParent1FirstName'
    ),
    getNUIWithCustomFieldName(
      'adoptionParent1NID',
      notMentionType(type),
      [],
      false,
      'mentionAdoptionParent1NID'
    ),
    getSubsectionHeader(
      'adoptionParent2Header',
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type),
      { number: '2' }
    ),
    getFamilyNameField(
      'adoptionParent2FamilyName',
      'adoptionParent2Name',
      notMentionType(type),
      'mentionAdoptionParent2FamilyName'
    ),
    getFirstNameField(
      'adoptionParent2FirstName',
      'adoptionParent2Name',
      notMentionType(type),
      'mentionAdoptionParent2FirstName'
    ),
    getNUIWithCustomFieldName(
      'adoptionParent2NID',
      notMentionType(type),
      [],
      false,
      'mentionAdoptionParent2NID'
    )
  ]
}

export function getJudicialAdoptionMentionFields() {
  const type = 'JUDICIAL_ADOPTION'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getJudgementDecisionNumber(type),
    getJudgementDecisionDate(type),
    getTribunalOfFirstInstanceAct(type),
    getSubsectionHeader(
      'judicialAdoptionParent1Header',
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type),
      { number: '1' }
    ),
    getFamilyNameField(
      'judicialAdoptionParent1FamilyName',
      'judicialAdoptionParent1Name',
      notMentionType(type),
      'mentionJudicialAdoptionParent1FamilyName'
    ),
    getFirstNameField(
      'judicialAdoptionParent1FirstName',
      'judicialAdoptionParent1Name',
      notMentionType(type),
      'mentionJudicialAdoptionParent1FirstName'
    ),
    getNUIWithCustomFieldName(
      'judicialAdoptionParent1NID',
      notMentionType(type),
      [],
      false,
      'mentionJudicialAdoptionParent1NID'
    ),
    getSubsectionHeader(
      'judicialAdoptionParent2Header',
      mentionMessageDescriptors.adoptiveParent,
      notMentionType(type),
      { number: '2' }
    ),
    getFamilyNameField(
      'judicialAdoptionParent2FamilyName',
      'judicialAdoptionParent2Name',
      notMentionType(type),
      'mentionJudicialAdoptionParent2FamilyName'
    ),
    getFirstNameField(
      'judicialAdoptionParent2FirstName',
      'judicialAdoptionParent2Name',
      notMentionType(type),
      'mentionJudicialAdoptionParent2FirstName'
    ),
    getNUIWithCustomFieldName(
      'judicialAdoptionParent2NID',
      notMentionType(type),
      [],
      false,
      'mentionJudicialAdoptionParent2NID'
    )
  ]
}

export function getMarriageMentionFields() {
  const type = 'MARRIAGE'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getJudgementDecisionNumber(type),
    getJudgementDecisionDate(type),
    getTribunalOfFirstInstanceAct(type),
    getSubsectionHeader(
      'brideOrGroomHeader',
      mentionMessageDescriptors.brideOrGroom,
      notMentionType(type)
    ),
    getFamilyNameField(
      'brideOrGroomFamilyName',
      'brideOrGroomName',
      notMentionType(type),
      'mentionMarriageBrideOrGroomFamilyName'
    ),
    getFirstNameField(
      'brideOrGroomFirstName',
      'brideOrGroomName',
      notMentionType(type),
      'mentionMarriageBrideOrGroomFirstName'
    ),
    getNUIWithCustomFieldName(
      'brideOrGroomNID',
      notMentionType(type),
      [],
      false,
      'mentionMarriageBrideOrGroomNID'
    )
  ]
}

export function getDivorceMentionFields() {
  const type = 'DIVORCE'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getMentionPlace(type),
    getSubsectionHeader(
      'wifeOrHusbandHeader',
      mentionMessageDescriptors.wifeOrHusband,
      notMentionType(type)
    ),
    getFamilyNameField(
      'wifeOrHusbandFamilyName',
      'wifeOrHusbandName',
      notMentionType(type),
      'mentionDivorceWifeOrHusbandFamilyName'
    ),
    getFirstNameField(
      'wifeOrHusbandFirstName',
      'wifeOrHusbandName',
      notMentionType(type),
      'mentionDivorceWifeOrHusbandFirstName'
    ),
    getNUIWithCustomFieldName(
      'wifeOrHusbandNID',
      notMentionType(type),
      [],
      false,
      'mentionDivorceWifeOrHusbandNID'
    )
  ]
}

export function getNameChangeMentionFields() {
  const type = 'NAME_CHANGE'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getJudgementDecisionNumber(type),
    getJudgementDecisionDate(type),
    getTribunalOfFirstInstanceAct(type),
    getModification(type)
  ]
}

export function getDeathMentionFields() {
  const type = 'DEATH'
  return [
    getMentionActNumber(type),
    getMentionDate(type),
    getMentionPlace(type),
    getDateOfDeath(type),
    getDeathPlace(type)
  ]
}
