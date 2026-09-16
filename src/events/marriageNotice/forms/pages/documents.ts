import {
  ConditionalType,
  defineFormPage,
  DocumentMimeType,
  FieldType,
  ImageMimeType,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const identityOptions = [
  { value: 'PASSPORT', label: { defaultMessage: 'Passport', description: 'Identity document option', id: 'form.field.label.marriageNoticePassport' } },
  { value: 'BIRTH_CERTIFICATE', label: { defaultMessage: 'Birth certificate', description: 'Identity document option', id: 'form.field.label.marriageNoticeBirthCertificate' } },
  { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Identity document option', id: 'form.field.label.marriageNoticeOtherIdentity' } }
]

const intentionOptions = [
  { value: 'NOTICE_OF_INTENDED_MARRIAGE', label: { defaultMessage: 'Notice of intended marriage', description: 'Marriage intention document option', id: 'form.field.label.noticeOfIntendedMarriage' } },
  { value: 'STATUTORY_DECLARATION', label: { defaultMessage: 'Statutory declaration', description: 'Marriage intention document option', id: 'form.field.label.statutoryDeclaration' } },
  { value: 'CONSENT_PARENTS_BRIDEGROOM', label: { defaultMessage: "Parents' consent for bridegroom", description: 'Marriage intention document option', id: 'form.field.label.consentParentsBridegroom' } },
  { value: 'CONSENT_PARENTS_BRIDE', label: { defaultMessage: "Parents' consent for bride", description: 'Marriage intention document option', id: 'form.field.label.consentParentsBride' } }
]

const dissolutionOptions = [
  { value: 'DIVORCE_CERTIFICATE', label: { defaultMessage: 'Divorce certificate', description: 'Dissolution document option', id: 'form.field.label.divorceCertificate' } },
  { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Dissolution document option', id: 'form.field.label.otherDissolution' } }
]

const deathOptions = [
  { value: 'DEATH_CERTIFICATE_FORMER_SPOUSE', label: { defaultMessage: 'Death certificate of former spouse', description: 'Former spouse death document option', id: 'form.field.label.deathCertificateFormerSpouse' } },
  { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Former spouse death document option', id: 'form.field.label.otherFormerSpouseDeath' } }
]

const consentOptions = [
  { value: 'PARENTAL_CONSENT_FORM', label: { defaultMessage: 'Parental consent form', description: 'Parental consent document option', id: 'form.field.label.parentalConsentForm' } },
  { value: 'COURT_ORDER', label: { defaultMessage: 'Court order', description: 'Parental consent document option', id: 'form.field.label.courtOrder' } },
  { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Parental consent document option', id: 'form.field.label.otherParentalConsent' } }
]

const waiverOptions = [
  { value: 'WAIVER_AUTHORIZATION', label: { defaultMessage: 'Waiver authorization', description: 'Three-day notice waiver option', id: 'form.field.label.waiverAuthorization' } },
  { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Three-day notice waiver option', id: 'form.field.label.otherWaiver' } }
]

const fileField = (
  id: string,
  label: string,
  labelId: string,
  options: typeof identityOptions,
  conditionals?: { type: 'SHOW'; conditional: any }[]
) => ({
  id,
  type: FieldType.FILE_WITH_OPTIONS,
  required: false,
  uncorrectable: true,
  label: { defaultMessage: label, description: `Supporting document: ${label}`, id: labelId },
  configuration: DEFAULT_FILE_CONFIGURATION,
  options,
  ...(conditionals ? { conditionals } : {})
})

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Title for Marriage Notice supporting documents',
    id: 'event.marriageNotice.action.declare.form.section.documents.title'
  },
  fields: [
    fileField('documents.proofOfBridegroomIdentity', 'Proof of bridegroom identity', 'event.marriageNotice.action.declare.form.section.documents.field.proofOfBridegroomIdentity.label', identityOptions),
    fileField('documents.proofOfBrideIdentity', 'Proof of bride identity', 'event.marriageNotice.action.declare.form.section.documents.field.proofOfBrideIdentity.label', identityOptions),
    fileField('documents.intentionAndCapacityToMarry', 'Intention and capacity to marry', 'event.marriageNotice.action.declare.form.section.documents.field.intentionAndCapacityToMarry.label', intentionOptions),
    fileField('documents.bridegroomProofOfDissolution', 'Bridegroom proof of dissolution', 'event.marriageNotice.action.declare.form.section.documents.field.bridegroomProofOfDissolution.label', dissolutionOptions, [{ type: ConditionalType.SHOW, conditional: field('brideGroom.conjugalStatus').isEqualTo('DIVORCED') }]),
    fileField('documents.brideProofOfDissolution', 'Bride proof of dissolution', 'event.marriageNotice.action.declare.form.section.documents.field.brideProofOfDissolution.label', dissolutionOptions, [{ type: ConditionalType.SHOW, conditional: field('bride.conjugalStatus').isEqualTo('DIVORCED') }]),
    fileField('documents.bridegroomProofOfDeathFormerSpouse', 'Bridegroom proof of death of former spouse', 'event.marriageNotice.action.declare.form.section.documents.field.bridegroomProofOfDeathFormerSpouse.label', deathOptions, [{ type: ConditionalType.SHOW, conditional: field('brideGroom.conjugalStatus').isEqualTo('WIDOWER') }]),
    fileField('documents.brideProofOfDeathFormerSpouse', 'Bride proof of death of former spouse', 'event.marriageNotice.action.declare.form.section.documents.field.brideProofOfDeathFormerSpouse.label', deathOptions, [{ type: ConditionalType.SHOW, conditional: field('bride.conjugalStatus').isEqualTo('WIDOW') }]),
    fileField('documents.bridegroomParentalConsent', 'Bridegroom parental consent', 'event.marriageNotice.action.declare.form.section.documents.field.bridegroomParentalConsent.label', consentOptions),
    fileField('documents.brideParentalConsent', 'Bride parental consent', 'event.marriageNotice.action.declare.form.section.documents.field.brideParentalConsent.label', consentOptions),
    fileField('documents.waiverOfThreeDayNotice', 'Waiver of three-day notice', 'event.marriageNotice.action.declare.form.section.documents.field.waiverOfThreeDayNotice.label', waiverOptions, [{ type: ConditionalType.SHOW, conditional: field('noticeOfIntendedMarriageDetails.dateOfMarriage').isAfter().date(field('noticeOfIntendedMarriageDetails.dateOfNoticeLodgement')) }])
  ]
})
