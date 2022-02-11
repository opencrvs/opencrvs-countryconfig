/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'

export const TEXT = 'TEXT'
export const TEL = 'TEL'
export const NUMBER = 'NUMBER'
export const RADIO_GROUP = 'RADIO_GROUP'
export const RADIO_GROUP_WITH_NESTED_FIELDS = 'RADIO_GROUP_WITH_NESTED_FIELDS'
export const INFORMATIVE_RADIO_GROUP = 'INFORMATIVE_RADIO_GROUP'
export const CHECKBOX_GROUP = 'CHECKBOX_GROUP'
export const DATE = 'DATE'
export const TEXTAREA = 'TEXTAREA'
export const SUBSECTION = 'SUBSECTION'
export const FIELD_GROUP_TITLE = 'FIELD_GROUP_TITLE'
export const LIST = 'LIST'
export const PARAGRAPH = 'PARAGRAPH'
export const DOCUMENTS = 'DOCUMENTS'
export const SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS'
export const SELECT_WITH_DYNAMIC_OPTIONS = 'SELECT_WITH_DYNAMIC_OPTIONS'
export const FIELD_WITH_DYNAMIC_DEFINITIONS = 'FIELD_WITH_DYNAMIC_DEFINITIONS'
export const IMAGE_UPLOADER_WITH_OPTIONS = 'IMAGE_UPLOADER_WITH_OPTIONS'
export const DOCUMENT_UPLOADER_WITH_OPTION = 'DOCUMENT_UPLOADER_WITH_OPTION'
export const SIMPLE_DOCUMENT_UPLOADER = 'SIMPLE_DOCUMENT_UPLOADER'
export const WARNING = 'WARNING'
export const LINK = 'LINK'
export const PDF_DOCUMENT_VIEWER = 'PDF_DOCUMENT_VIEWER'
export const DYNAMIC_LIST = 'DYNAMIC_LIST'
export const FETCH_BUTTON = 'FETCH_BUTTON'
export const LOCATION_SEARCH_INPUT = 'LOCATION_SEARCH_INPUT'

export const NATIONAL_ID = 'NATIONAL_ID'
export const BIRTH_REGISTRATION_NUMBER = 'BIRTH_REGISTRATION_NUMBER'

enum BirthSection {
  Child = 'child',
  Mother = 'mother',
  Father = 'father',
  Applicant = 'informant',
  Parent = 'primaryCaregiver',
  Registration = 'registration',
  Documents = 'documents',
  Preview = 'preview'
}

enum DeathSection {
  Deceased = 'deceased',
  Event = 'deathEvent',
  CauseOfDeath = 'causeOfDeath',
  Applicants = 'informant',
  DeathDocuments = 'documents',
  Preview = 'preview'
}

enum UserSection {
  User = 'user',
  Preview = 'preview'
}

enum CertificateSection {
  Collector = 'collector',
  CollectCertificate = 'collectCertificate',
  CollectDeathCertificate = 'collectDeathCertificate',
  CertificatePreview = 'certificatePreview'
}

enum PaymentSection {
  Payment = 'payment'
}

enum ReviewSection {
  Review = 'review'
}

enum REVIEW_OVERRIDE_POSITION {
  BEFORE = 'before',
  AFTER = 'after'
}

enum RadioSize {
  LARGE = 'large',
  NORMAL = 'normal'
}

enum THEME_MODE {
  DARK = 'dark'
}

enum ConditionOperation {
  MATCH = 'MATCH',
  DOES_NOT_MATCH = 'DOES_NOT_MATCH'
}

type Section =
  | ReviewSection
  | PaymentSection
  | BirthSection
  | DeathSection
  | UserSection
  | CertificateSection

type ViewType = 'form' | 'preview' | 'review' | 'hidden'

type Relation =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'EXTENDED_FAMILY'
  | 'OTHER'
  | 'INFORMANT'
  | 'PRINT_IN_ADVANCE'

type PaymentType = 'MANUAL'

type PaymentOutcomeType = 'COMPLETED' | 'ERROR' | 'PARTIAL'

type Payment = {
  paymentId?: string
  type: PaymentType
  total: string
  amount: string
  outcome: PaymentOutcomeType
  date: number
}

type IFormFieldValue =
  | string
  | string[]
  | number
  | boolean
  | Date
  | ICertificate
  | IFileValue
  | IAttachmentValue
  | FieldValueArray
  | FieldValueMap

type ICertificate = {
  collector?: Partial<{ type: Relation }>
  hasShowedVerifiedDocument?: boolean
  payments?: Payment
  data?: string
}

type IDynamicValueMapper = (key: string) => string

// Based on the need, add more here
type ConditionType = 'COMPARE_DATE_IN_DAYS'

type ExecutorKey = 'CURRENT_DATE'

type TransformerPayload =
  | IIntLabelPayload
  | IConditionExecutorPayload
  | IApplicantNamePayload
  | IFeildValuePayload
  | IDateFeildValuePayload
  | IFormattedFeildValuePayload
  | INumberFeildConversionPayload
  | IOfflineAddressPayload
  | ILanguagePayload
  | ILocationPayload
  | IPersonIdentifierValuePayload

type MutationFactoryOperation = {
  operation: string
  parameters: string[]
}

type MutationDefaultOperation = {
  operation: string
}

type IMutationDescriptor = MutationFactoryOperation | MutationDefaultOperation

type QueryFactoryOperation = {
  operation: string
  parameters: string[]
}

type QueryDefaultOperation = {
  operation: string
}

type IQueryDescriptor = QueryFactoryOperation | QueryDefaultOperation

type IFormField =
  | ITextFormField
  | ITelFormField
  | INumberFormField
  | ISelectFormFieldWithDynamicOptions
  | IRadioGroupFormField
  | IInformativeRadioGroupFormField
  | ICheckboxGroupFormField
  | IDateFormField
  | ITextareaFormField
  | ISubsectionFormField
  | IFieldGroupTitleField
  | IDocumentsFormField
  | IListFormField
  | IParagraphFormField
  | IImageUploaderWithOptionsFormField
  | IDocumentUploaderWithOptionsFormField
  | IWarningField
  | ILink
  | IPDFDocumentViewerFormField
  | IDynamicListFormField
  | ISimpleDocumentUploaderFormField
  | ILocationSearchInputFormField
  | ISelectFormFieldWithOptions
  | IFormFieldWithDynamicDefinitions
  | IRadioGroupWithNestedFields
  | ILoaderButton

type ValidationFactoryOperation = {
  operation: string
  parameters: [string]
}

type ValidationDefaultOperation = {
  operation: string
}
type IValidatorDescriptor =
  | ValidationFactoryOperation
  | ValidationDefaultOperation

interface IFileValue {
  optionValues: IFormFieldValue[]
  type: string
  data: string
}

interface FieldValueArray extends Array<IFormFieldValue> {}
interface FieldValueMap {
  [key: string]: IFormFieldValue
}

interface IAttachmentValue {
  type: string
  data: string
}

interface IFormSectionData {
  [key: string]: IFormFieldValue
}

interface IFormFieldBase {
  name: string
  type: IFormField['type']
  label: MessageDescriptor
  helperText?: MessageDescriptor
  tooltip?: MessageDescriptor
  validate: IValidatorDescriptor[]
  required?: boolean
  prefix?: string
  postfix?: string
  disabled?: boolean
  initialValue?: IFormFieldValue
  initialValueKey?: string
  extraValue?: IFormFieldValue
  conditionals?: IConditional[]
  description?: MessageDescriptor
  placeholder?: MessageDescriptor
  mapping?: {
    mutation?: IMutationDescriptor
    query?: IQueryDescriptor
  }
  hideAsterisk?: boolean
  hideHeader?: boolean
  mode?: THEME_MODE
  hidden?: boolean
  previewGroup?: string
  nestedFields?: { [key: string]: IFormField[] }
  hideValueInPreview?: boolean
  // This flag will only remove the change link from preview/review screen
  // Default false
  readonly?: boolean
  hideInPreview?: boolean
  ignoreNestedFieldWrappingInPreview?: boolean
  reviewOverrides?: {
    residingSection: string
    reference: {
      sectionID: string
      groupID: string
      fieldName: string
    }
    position?: REVIEW_OVERRIDE_POSITION
    labelAs?: MessageDescriptor
    conditionals?: IConditional[]
  }
  ignoreFieldLabelOnErrorMessage?: boolean
  ignoreBottomMargin?: boolean
}
interface IDynamicOptions {
  dependency: string
  resource?: string
  options?: { [key: string]: ISelectOption[] }
}

interface IStaticFieldType {
  kind: 'static'
  staticType: string
}

interface ISelectFormFieldWithDynamicOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_DYNAMIC_OPTIONS
  dynamicOptions: IDynamicOptions
}

interface IRadioGroupFormField extends IFormFieldBase {
  type: typeof RADIO_GROUP
  options: IRadioOption[]
  size?: RadioSize
  notice?: MessageDescriptor
}

interface IInformativeRadioGroupFormField extends IFormFieldBase {
  type: typeof INFORMATIVE_RADIO_GROUP
  information: IFormSectionData
  dynamicInformationRetriever?: (obj: any) => IFormSectionData
  options: any[]
}

interface ITextFormField extends IFormFieldBase {
  type: typeof TEXT
  maxLength?: number
}

interface ITelFormField extends IFormFieldBase {
  type: typeof TEL
  isSmallSized?: boolean
}
interface INumberFormField extends IFormFieldBase {
  type: typeof NUMBER
  step?: number
}
interface ICheckboxGroupFormField extends IFormFieldBase {
  type: typeof CHECKBOX_GROUP
  options: ICheckboxOption[]
}
interface IDateFormField extends IFormFieldBase {
  type: typeof DATE
  notice?: MessageDescriptor
  ignorePlaceHolder?: boolean
}
interface ITextareaFormField extends IFormFieldBase {
  type: typeof TEXTAREA
}
interface ISubsectionFormField extends IFormFieldBase {
  type: typeof SUBSECTION
}
interface IFieldGroupTitleField extends IFormFieldBase {
  type: typeof FIELD_GROUP_TITLE
}
interface IDocumentsFormField extends IFormFieldBase {
  type: typeof DOCUMENTS
}
interface IListFormField extends IFormFieldBase {
  type: typeof LIST
  items: MessageDescriptor[]
}

interface IDynamicItems {
  dependency: string
  valueMapper: IDynamicValueMapper
  items: { [key: string]: MessageDescriptor[] }
}

interface IDynamicListFormField extends IFormFieldBase {
  type: typeof DYNAMIC_LIST
  dynamicItems: IDynamicItems
}
interface IParagraphFormField extends IFormFieldBase {
  type: typeof PARAGRAPH
  fontSize?: string
}
interface IImageUploaderWithOptionsFormField extends IFormFieldBase {
  type: typeof IMAGE_UPLOADER_WITH_OPTIONS
  optionSection: IFormSection
}
interface IDocumentUploaderWithOptionsFormField extends IFormFieldBase {
  type: typeof DOCUMENT_UPLOADER_WITH_OPTION
  options: ISelectOption[]
  hideOnEmptyOption?: boolean
  splitView?: boolean
}
interface ISimpleDocumentUploaderFormField extends IFormFieldBase {
  type: typeof SIMPLE_DOCUMENT_UPLOADER
  allowedDocType?: string[]
}

interface ILocationSearchInputFormField extends IFormFieldBase {
  type: typeof LOCATION_SEARCH_INPUT
  searchableResource: Extract<
    keyof IOfflineData,
    'offices' | 'facilities' | 'locations'
  >
  locationList: ISearchLocation[]
  dispatchOptions?: IDispatchOptions
  searchableType: string
}
interface ISearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

interface IWarningField extends IFormFieldBase {
  type: typeof WARNING
}

interface ILink extends IFormFieldBase {
  type: typeof LINK
}

interface IPDFDocumentViewerFormField extends IFormFieldBase {
  type: typeof PDF_DOCUMENT_VIEWER
}
interface IFieldInput {
  name: string
  valueField: string
  type?: string
}
interface IDynamicValues {
  [key: string]: any
}
interface IQuery {
  query: any
  inputs: IFieldInput[]
  variables?: IDynamicValues
  modalInfoText: MessageDescriptor
  errorText: MessageDescriptor
  networkErrorText: MessageDescriptor
  responseTransformer: (response: any) => void
}

interface IFormTag {
  id: string
  label: MessageDescriptor
  fieldToRedirect?: string
  delimiter?: string
}

interface IFormSectionGroup {
  id: string
  title?: MessageDescriptor
  previewGroups?: IFormTag[]
  fields: IFormField[]
  disabled?: boolean
  ignoreSingleFieldView?: boolean
  conditionals?: IConditional[]
  error?: MessageDescriptor
  preventContinueIfError?: boolean
  showExitButtonOnly?: boolean
}

interface Operation {
  operation: string
}
interface IDynamicFormFieldDefinitions {
  label?: {
    dependency: string
    labelMapper: Operation
  }
  helperText?: {
    dependency: string
    helperTextMapper: Operation
  }
  tooltip?: {
    dependency: string
    tooltipMapper: Operation
  }
  type?:
    | IStaticFieldType
    | {
        kind: 'dynamic'
        dependency: string
        typeMapper: Operation
      }
  validate?: Array<{
    dependencies: string[]
    validator: Operation
  }>
}
interface IFormFieldWithDynamicDefinitions extends IFormFieldBase {
  type: typeof FIELD_WITH_DYNAMIC_DEFINITIONS
  dynamicDefinitions: IDynamicFormFieldDefinitions
}
interface ISelectFormFieldWithOptions extends IFormFieldBase {
  type: typeof SELECT_WITH_OPTIONS
  options: ISelectOption[] | { resource: string }
}
interface IQueryMap {
  [key: string]: {
    inputs: IFieldInput[]
    variables?: IDynamicValues
    modalInfoText: MessageDescriptor
    errorText: MessageDescriptor
    networkErrorText: MessageDescriptor
    responseTransformer: Operation
    query: Operation
  }
}
interface IRadioGroupWithNestedFields
  extends Omit<IRadioGroupFormField, 'type'> {
  type: typeof RADIO_GROUP_WITH_NESTED_FIELDS
  nestedFields: { [key: string]: IFormField[] }
}
interface ILoaderButton extends IFormFieldBase {
  type: typeof FETCH_BUTTON
  queryData?: IQuery
  querySelectorInput: IFieldInput
  onFetch?: (response: any) => void
  modalTitle: MessageDescriptor
  successTitle: MessageDescriptor
  errorTitle: MessageDescriptor
  queryMap: IQueryMap
}

interface IConditional {
  action: string
  expression: string
}

interface MessageDescriptor {
  id: string
  description?: string | object
  defaultMessage?: string
}

interface ILocation {
  id: string
  name: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  languages: ILanguage[]
  forms: {
    // @todo this is also used in review, so it could be named just form
    registerForm: {
      birth: IForm
      death: IForm
    }
    certificateCollectorDefinition: {
      birth: ICertificateCollectorDefinition
      death: ICertificateCollectorDefinition
    }
  }
  templates: {
    receipt?: IPDFTemplate
    certificates: {
      birth: IPDFTemplate
      death: IPDFTemplate
    }
  }
  assets: {
    logo: string
  }
}

interface IntlMessages {
  [key: string]: string
}

interface ILanguage {
  lang: string
  displayName: string
  messages: IntlMessages
}

interface IForm {
  sections: IFormSection[]
}
interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

interface ICertificateCollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField: string
  nationalityField: string
}

interface ICertificateCollectorDefinition {
  [collector: string]: ICertificateCollectorField
}

interface ISelectOption {
  value: string
  label: MessageDescriptor
}
interface IRadioOption {
  value: string
  label: MessageDescriptor
  conditionals?: IConditionals[]
}
interface ICheckboxOption {
  value: string
  label: MessageDescriptor
}

interface IDynamicOptions {
  dependency: string
  resource?: string
  options?: { [key: string]: ISelectOption[] }
}

interface IDispatchOptions {
  action: string
  payloadKey: string
}

interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: IFieldTransformer[]
}

interface IFieldTransformer {
  field: string
  operation: string
  parameters?: TransformerPayload
  valueIndex?: number // this will allow us to pick a specific char from the whole result
}

interface ILanguagePayload {
  language: string
}

interface ILocationPayload {
  language?: string
  jurisdictionType: string
}

interface IPersonIdentifierValuePayload {
  idTypeKey: string // ex: mother.iDType
  idTypeValue: string // ex: NATIONAL_ID
  idValueKey: string // ex: mother.iD
}
interface IFormattedFeildValuePayload {
  formattedKeys: string // ex: {child.firstName}, {child.lastName}
}

interface INumberFeildConversionPayload {
  valueKey: string // ex: child.dob
  conversionMap: { [key: string]: string } // { 0: '০', 1: '১'}
}

interface IOfflineAddressCondition {
  condition?: ICondition
  addressType: string
  addressKey: string
  addresses: {
    countryCode: string
    localAddress: string
    internationalAddress?: string
  }
}

interface IOfflineAddressPayload {
  language: string
  conditions: IOfflineAddressCondition[]
}
interface IDateFeildValuePayload {
  key?: {
    [event: string]: string // data key: child.dob || deceased.dod
  }
  format: string
  language?: string
  momentLocale?: {
    [language: string]: string // bn: 'locale/bn'
  }
}
interface IFeildValuePayload {
  valueKey: string // ex: child.dob
}

interface ICondition {
  key: string
  operation?: ConditionOperation
  values: string[]
}
interface IApplicantNameCondition {
  condition?: ICondition
  key: {
    [event: string]: string // data key: child || deceased
  }
  format: {
    [language: string]: string[] // corresponding field names
  }
}

interface IApplicantNamePayload {
  conditions: IApplicantNameCondition[]
  language?: string
  allCapital?: boolean
}
interface IIntLabelPayload {
  messageDescriptor: MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

interface IEventWiseKey {
  [event: string]: string // {birth: child.dob}
}

interface IConditionExecutorPayload {
  fromKey: IEventWiseKey | ExecutorKey
  toKey: IEventWiseKey | ExecutorKey
  conditions: {
    type: ConditionType
    minDiff: number
    maxDiff: number
    output: IIntLabelPayload // based on the we can add more type here
  }[]
}

export interface IFormSection {
  id: Section
  viewType: ViewType
  name: MessageDescriptor
  title: MessageDescriptor
  disabled?: boolean
  optional?: boolean
  notice?: MessageDescriptor
  hasDocumentSection?: boolean
  groups: IFormSectionGroup[]
  mapping?: {
    mutation?: IMutationDescriptor
    query?: IQueryDescriptor
  }
}

export interface IConditionals {
  isRegistrarRoleSelected: IConditional
  isOfficePreSelected: IConditional
}
