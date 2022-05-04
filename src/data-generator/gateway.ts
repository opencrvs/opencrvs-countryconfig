export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Date: any
  Map: any
}

export type Address = {
  __typename?: 'Address'
  city?: Maybe<Scalars['String']>
  country?: Maybe<Scalars['String']>
  district?: Maybe<Scalars['String']>
  districtName?: Maybe<Scalars['String']>
  from?: Maybe<Scalars['Date']>
  line?: Maybe<Array<Maybe<Scalars['String']>>>
  lineName?: Maybe<Array<Maybe<Scalars['String']>>>
  postalCode?: Maybe<Scalars['String']>
  state?: Maybe<Scalars['String']>
  stateName?: Maybe<Scalars['String']>
  text?: Maybe<Scalars['String']>
  to?: Maybe<Scalars['Date']>
  type?: Maybe<AddressType>
  use?: Maybe<Scalars['String']>
}

export type AddressInput = {
  city?: InputMaybe<Scalars['String']>
  country?: InputMaybe<Scalars['String']>
  district?: InputMaybe<Scalars['String']>
  from?: InputMaybe<Scalars['Date']>
  line?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  postalCode?: InputMaybe<Scalars['String']>
  state?: InputMaybe<Scalars['String']>
  text?: InputMaybe<Scalars['String']>
  to?: InputMaybe<Scalars['Date']>
  type?: InputMaybe<AddressType>
  use?: InputMaybe<Scalars['String']>
}

export enum AddressType {
  AdminStructure = 'ADMIN_STRUCTURE',
  CrvsOffice = 'CRVS_OFFICE',
  HealthFacility = 'HEALTH_FACILITY',
  IdpCamp = 'IDP_CAMP',
  MilitaryBaseOrCantonment = 'MILITARY_BASE_OR_CANTONMENT',
  Other = 'OTHER',
  DeceasedUsualResidence = 'DECEASED_USUAL_RESIDENCE',
  PrivateHome = 'PRIVATE_HOME',
  PrimaryAddress = 'PRIMARY_ADDRESS',
  SecondaryAddress = 'SECONDARY_ADDRESS',
  UnhcrCamp = 'UNHCR_CAMP'
}

export type DeclarationsStartedMetrics = {
  __typename?: 'DeclarationsStartedMetrics'
  fieldAgentDeclarations: Scalars['Int']
  hospitalDeclarations: Scalars['Int']
  officeDeclarations: Scalars['Int']
}

export type Attachment = {
  __typename?: 'Attachment'
  _fhirID?: Maybe<Scalars['ID']>
  contentType?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['Date']>
  data?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  id: Scalars['ID']
  originalFileName?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  subject?: Maybe<AttachmentSubject>
  systemFileName?: Maybe<Scalars['String']>
  type?: Maybe<AttachmentType>
}

export type AttachmentInput = {
  _fhirID?: InputMaybe<Scalars['ID']>
  contentType?: InputMaybe<Scalars['String']>
  createdAt?: InputMaybe<Scalars['Date']>
  data?: InputMaybe<Scalars['String']>
  description?: InputMaybe<Scalars['String']>
  originalFileName?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Scalars['String']>
  subject?: InputMaybe<AttachmentSubject>
  systemFileName?: InputMaybe<Scalars['String']>
  type?: InputMaybe<AttachmentType>
}

export enum AttachmentSubject {
  InformantAthorityToApplyProof = 'INFORMANT_ATHORITY_TO_APPLY_PROOF',
  InformantIdProof = 'INFORMANT_ID_PROOF',
  AssignedResponsibilityProof = 'ASSIGNED_RESPONSIBILITY_PROOF',
  CauseOfDeath = 'CAUSE_OF_DEATH',
  Child = 'CHILD',
  ChildAge = 'CHILD_AGE',
  CoronersReport = 'CORONERS_REPORT',
  DeceasedBirthProof = 'DECEASED_BIRTH_PROOF',
  DeceasedDeathProof = 'DECEASED_DEATH_PROOF',
  DeceasedIdProof = 'DECEASED_ID_PROOF',
  DeceasedParmanentAddressProof = 'DECEASED_PARMANENT_ADDRESS_PROOF',
  Father = 'FATHER',
  LegalGuardianProof = 'LEGAL_GUARDIAN_PROOF',
  Mother = 'MOTHER',
  Other = 'OTHER',
  Parent = 'PARENT',
  WardCouncillorProof = 'WARD_COUNCILLOR_PROOF'
}

export enum AttachmentType {
  AttestedDeathCertificate = 'ATTESTED_DEATH_CERTIFICATE',
  AttestedDeathLetter = 'ATTESTED_DEATH_LETTER',
  BirthAttendant = 'BIRTH_ATTENDANT',
  BirthPlaceDateProof = 'BIRTH_PLACE_DATE_PROOF',
  BirthRegistration = 'BIRTH_REGISTRATION',
  BroughtInDeadCertificate = 'BROUGHT_IN_DEAD_CERTIFICATE',
  BurialReceipt = 'BURIAL_RECEIPT',
  CauseOfDeath = 'CAUSE_OF_DEATH',
  CoronersReport = 'CORONERS_REPORT',
  DeceasedBirthProofPaper = 'DECEASED_BIRTH_PROOF_PAPER',
  DeceasedDeathProof = 'DECEASED_DEATH_PROOF',
  DischargeCertificate = 'DISCHARGE_CERTIFICATE',
  DoctorCertificate = 'DOCTOR_CERTIFICATE',
  EpiCard = 'EPI_CARD',
  EpiStaffCertificate = 'EPI_STAFF_CERTIFICATE',
  FuneralReceipt = 'FUNERAL_RECEIPT',
  HospitalDischargeCertificate = 'HOSPITAL_DISCHARGE_CERTIFICATE',
  ImmunisationCertificate = 'IMMUNISATION_CERTIFICATE',
  LetterFromCouncillor = 'LETTER_FROM_COUNCILLOR',
  MedicalInstitution = 'MEDICAL_INSTITUTION',
  NationalIdBack = 'NATIONAL_ID_BACK',
  NationalIdFront = 'NATIONAL_ID_FRONT',
  NotificationOfBirth = 'NOTIFICATION_OF_BIRTH',
  OriginalBirthRecord = 'ORIGINAL_BIRTH_RECORD',
  Other = 'OTHER',
  PaperForm = 'PAPER_FORM',
  Passport = 'PASSPORT',
  PassportPhoto = 'PASSPORT_PHOTO',
  PostMortemCertificate = 'POST_MORTEM_CERTIFICATE',
  ProofOfAssignedResponsibility = 'PROOF_OF_ASSIGNED_RESPONSIBILITY',
  ProofOfDeath = 'PROOF_OF_DEATH',
  ProofOfLegalGuardianship = 'PROOF_OF_LEGAL_GUARDIANSHIP',
  SchoolCertificate = 'SCHOOL_CERTIFICATE',
  SignedAffidavit = 'SIGNED_AFFIDAVIT',
  TaxReceipt = 'TAX_RECEIPT',
  UnderFiveCard = 'UNDER_FIVE_CARD'
}

export enum AttendantType {
  Layperson = 'LAYPERSON',
  Midwife = 'MIDWIFE',
  None = 'NONE',
  Nurse = 'NURSE',
  NurseMidwife = 'NURSE_MIDWIFE',
  Other = 'OTHER',
  OtherParamedicalPersonnel = 'OTHER_PARAMEDICAL_PERSONNEL',
  Physician = 'PHYSICIAN'
}

export type Avatar = {
  __typename?: 'Avatar'
  data: Scalars['String']
  type: Scalars['String']
}

export type AvatarInput = {
  data: Scalars['String']
  type: Scalars['String']
}

export type BirthEventSearchSet = EventSearchSet & {
  __typename?: 'BirthEventSearchSet'
  childName?: Maybe<Array<Maybe<HumanName>>>
  dateOfBirth?: Maybe<Scalars['Date']>
  id: Scalars['ID']
  operationHistories?: Maybe<Array<Maybe<OperationHistorySearchSet>>>
  registration?: Maybe<RegistrationSearchSet>
  type?: Maybe<Scalars['String']>
}

export enum BirthRegPresence {
  BothParents = 'BOTH_PARENTS',
  Father = 'FATHER',
  Informant = 'INFORMANT',
  Mother = 'MOTHER',
  Other = 'OTHER'
}

export type BirthRegResultSet = {
  __typename?: 'BirthRegResultSet'
  results?: Maybe<Array<Maybe<BirthRegistration>>>
  totalItems?: Maybe<Scalars['Int']>
}

export enum BirthRegType {
  BothParents = 'BOTH_PARENTS',
  FatherOnly = 'FATHER_ONLY',
  InformantOnly = 'INFORMANT_ONLY',
  MotherOnly = 'MOTHER_ONLY',
  Self = 'SELF'
}

export type BirthRegistration = EventRegistration & {
  __typename?: 'BirthRegistration'
  _fhirIDMap?: Maybe<Scalars['Map']>
  attendantAtBirth?: Maybe<AttendantType>
  birthRegistrationType?: Maybe<BirthRegType>
  birthType?: Maybe<BirthType>
  child?: Maybe<Person>
  childrenBornAliveToMother?: Maybe<Scalars['Int']>
  createdAt?: Maybe<Scalars['Date']>
  eventLocation?: Maybe<Location>
  father?: Maybe<Person>
  foetalDeathsToMother?: Maybe<Scalars['Int']>
  id: Scalars['ID']
  informant?: Maybe<RelatedPerson>
  lastPreviousLiveBirth?: Maybe<Scalars['Date']>
  mother?: Maybe<Person>
  otherAttendantAtBirth?: Maybe<Scalars['String']>
  otherPresentAtBirthRegistration?: Maybe<Scalars['String']>
  presentAtBirthRegistration?: Maybe<BirthRegPresence>
  primaryCaregiver?: Maybe<PrimaryCaregiver>
  registration?: Maybe<Registration>
  updatedAt?: Maybe<Scalars['Date']>
  weightAtBirth?: Maybe<Scalars['Float']>
}

export type BirthRegistrationInput = {
  _fhirIDMap?: InputMaybe<Scalars['Map']>
  attendantAtBirth?: InputMaybe<AttendantType>
  birthRegistrationType?: InputMaybe<BirthRegType>
  birthType?: InputMaybe<BirthType>
  child?: InputMaybe<PersonInput>
  childrenBornAliveToMother?: InputMaybe<Scalars['Int']>
  createdAt?: InputMaybe<Scalars['Date']>
  eventLocation?: InputMaybe<LocationInput>
  father?: InputMaybe<PersonInput>
  foetalDeathsToMother?: InputMaybe<Scalars['Int']>
  informant?: InputMaybe<RelatedPersonInput>
  lastPreviousLiveBirth?: InputMaybe<Scalars['Date']>
  mother?: InputMaybe<PersonInput>
  otherAttendantAtBirth?: InputMaybe<Scalars['String']>
  otherPresentAtBirthRegistration?: InputMaybe<Scalars['String']>
  presentAtBirthRegistration?: InputMaybe<BirthRegPresence>
  primaryCaregiver?: InputMaybe<PrimaryCaregiverInput>
  registration?: InputMaybe<RegistrationInput>
  updatedAt?: InputMaybe<Scalars['Date']>
  weightAtBirth?: InputMaybe<Scalars['Float']>
}

export enum BirthType {
  HigherMultipleDelivery = 'HIGHER_MULTIPLE_DELIVERY',
  Quadruplet = 'QUADRUPLET',
  Single = 'SINGLE',
  Triplet = 'TRIPLET',
  Twin = 'TWIN'
}

export enum CauseOfDeathMethodType {
  MedicallyCertified = 'MEDICALLY_CERTIFIED',
  VerbalAutopsy = 'VERBAL_AUTOPSY'
}

export type Certificate = {
  __typename?: 'Certificate'
  collector?: Maybe<RelatedPerson>
  data?: Maybe<Scalars['String']>
  hasShowedVerifiedDocument?: Maybe<Scalars['Boolean']>
  payments?: Maybe<Array<Maybe<Payment>>>
}

export type CertificateInput = {
  collector?: InputMaybe<RelatedPersonInput>
  data?: InputMaybe<Scalars['String']>
  hasShowedVerifiedDocument?: InputMaybe<Scalars['Boolean']>
  payments?: InputMaybe<Array<InputMaybe<PaymentInput>>>
}

export type CertificationPaymentDetailsMetrics = {
  __typename?: 'CertificationPaymentDetailsMetrics'
  locationId: Scalars['String']
  total: Scalars['Int']
}

export type CertificationPaymentMetrics = {
  __typename?: 'CertificationPaymentMetrics'
  details?: Maybe<Array<CertificationPaymentDetailsMetrics>>
  total?: Maybe<CertificationPaymentTotalCount>
}

export type CertificationPaymentTotalCount = {
  __typename?: 'CertificationPaymentTotalCount'
  total: Scalars['Int']
}

export type Comment = {
  __typename?: 'Comment'
  comment?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['Date']>
  id: Scalars['ID']
  user?: Maybe<User>
}

export type CommentInput = {
  comment?: InputMaybe<Scalars['String']>
  createdAt?: InputMaybe<Scalars['Date']>
  user?: InputMaybe<UserInput>
}

export type ContactPoint = {
  __typename?: 'ContactPoint'
  system?: Maybe<Scalars['String']>
  use?: Maybe<Scalars['String']>
  value?: Maybe<Scalars['String']>
}

export type ContactPointInput = {
  system?: InputMaybe<Scalars['String']>
  use?: InputMaybe<Scalars['String']>
  value?: InputMaybe<Scalars['String']>
}

export type CreatedIds = {
  __typename?: 'CreatedIds'
  compositionId?: Maybe<Scalars['String']>
  registrationNumber?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
}

export type DeathEventSearchSet = EventSearchSet & {
  __typename?: 'DeathEventSearchSet'
  dateOfDeath?: Maybe<Scalars['Date']>
  deceasedName?: Maybe<Array<Maybe<HumanName>>>
  id: Scalars['ID']
  operationHistories?: Maybe<Array<Maybe<OperationHistorySearchSet>>>
  registration?: Maybe<RegistrationSearchSet>
  type?: Maybe<Scalars['String']>
}

export type DeathRegistration = EventRegistration & {
  __typename?: 'DeathRegistration'
  _fhirIDMap?: Maybe<Scalars['Map']>
  causeOfDeath?: Maybe<Scalars['String']>
  causeOfDeathMethod?: Maybe<CauseOfDeathMethodType>
  createdAt?: Maybe<Scalars['Date']>
  deceased?: Maybe<Person>
  eventLocation?: Maybe<Location>
  father?: Maybe<Person>
  femaleDependentsOfDeceased?: Maybe<Scalars['Float']>
  id: Scalars['ID']
  informant?: Maybe<RelatedPerson>
  maleDependentsOfDeceased?: Maybe<Scalars['Float']>
  mannerOfDeath?: Maybe<MannerOfDeath>
  medicalPractitioner?: Maybe<MedicalPractitioner>
  mother?: Maybe<Person>
  registration?: Maybe<Registration>
  spouse?: Maybe<Person>
  updatedAt?: Maybe<Scalars['Date']>
}

export type DeathRegistrationInput = {
  _fhirIDMap?: InputMaybe<Scalars['Map']>
  causeOfDeath?: InputMaybe<Scalars['String']>
  causeOfDeathMethod?: InputMaybe<CauseOfDeathMethodType>
  createdAt?: InputMaybe<Scalars['Date']>
  deceased?: InputMaybe<PersonInput>
  eventLocation?: InputMaybe<LocationInput>
  father?: InputMaybe<PersonInput>
  femaleDependentsOfDeceased?: InputMaybe<Scalars['Float']>
  informant?: InputMaybe<RelatedPersonInput>
  maleDependentsOfDeceased?: InputMaybe<Scalars['Float']>
  mannerOfDeath?: InputMaybe<MannerOfDeath>
  medicalPractitioner?: InputMaybe<MedicalPractitionerInput>
  mother?: InputMaybe<PersonInput>
  registration?: InputMaybe<RegistrationInput>
  spouse?: InputMaybe<PersonInput>
  updatedAt?: InputMaybe<Scalars['Date']>
}

export type Deceased = {
  __typename?: 'Deceased'
  deathDate?: Maybe<Scalars['String']>
  deceased?: Maybe<Scalars['Boolean']>
}

export type DeceasedInput = {
  deathDate?: InputMaybe<Scalars['String']>
  deceased?: InputMaybe<Scalars['Boolean']>
}

export type Dummy = {
  __typename?: 'Dummy'
  dummy: Scalars['String']
}

export enum EducationType {
  FirstStageTertiaryIsced_5 = 'FIRST_STAGE_TERTIARY_ISCED_5',
  LowerSecondaryIsced_2 = 'LOWER_SECONDARY_ISCED_2',
  NotStated = 'NOT_STATED',
  NoSchooling = 'NO_SCHOOLING',
  PostSecondaryIsced_4 = 'POST_SECONDARY_ISCED_4',
  PrimaryIsced_1 = 'PRIMARY_ISCED_1',
  SecondStageTertiaryIsced_6 = 'SECOND_STAGE_TERTIARY_ISCED_6',
  UpperSecondaryIsced_3 = 'UPPER_SECONDARY_ISCED_3'
}

export type Estimate45DayTotalCount = {
  __typename?: 'Estimate45DayTotalCount'
  estimatedRegistration: Scalars['Float']
  estimationPercentage: Scalars['Float']
  registrationIn45Day: Scalars['Int']
}

export type Estimated45DayMetrics = {
  __typename?: 'Estimated45DayMetrics'
  estimatedRegistration: Scalars['Float']
  estimationLocationLevel: Scalars['String']
  estimationPercentage: Scalars['Float']
  estimationYear: Scalars['Int']
  locationId: Scalars['String']
  registrationIn45Day: Scalars['Int']
}

export type EstimationMetrics = {
  __typename?: 'EstimationMetrics'
  actualRegistration: Scalars['Int']
  estimatedPercentage: Scalars['Float']
  estimatedRegistration: Scalars['Float']
  femalePercentage: Scalars['Float']
  malePercentage: Scalars['Float']
}

export type EventEstimationMetrics = {
  __typename?: 'EventEstimationMetrics'
  birth45DayMetrics?: Maybe<EstimationMetrics>
  death45DayMetrics?: Maybe<EstimationMetrics>
}

export type EventIn45DayEstimationCount = {
  __typename?: 'EventIn45DayEstimationCount'
  actual45DayRegistration: Scalars['Int']
  actualTotalRegistration: Scalars['Int']
  estimated45DayPercentage: Scalars['Float']
  estimatedRegistration: Scalars['Float']
}

export type EventProgressData = {
  __typename?: 'EventProgressData'
  timeInProgress?: Maybe<Scalars['Int']>
  timeInReadyForReview?: Maybe<Scalars['Int']>
  timeInReadyToPrint?: Maybe<Scalars['Int']>
  timeInRequiresUpdates?: Maybe<Scalars['Int']>
  timeInWaitingForApproval?: Maybe<Scalars['Int']>
  timeInWaitingForBRIS?: Maybe<Scalars['Int']>
}

export type EventProgressResultSet = {
  __typename?: 'EventProgressResultSet'
  results?: Maybe<Array<Maybe<EventProgressSet>>>
  totalItems?: Maybe<Scalars['Int']>
}

export type EventProgressSet = {
  __typename?: 'EventProgressSet'
  dateOfEvent?: Maybe<Scalars['Date']>
  id: Scalars['ID']
  name?: Maybe<Array<Maybe<HumanName>>>
  progressReport?: Maybe<EventProgressData>
  registration?: Maybe<RegistrationSearchSet>
  startedAt?: Maybe<Scalars['Date']>
  startedBy?: Maybe<User>
  startedByFacility?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type EventRegistration = {
  createdAt?: Maybe<Scalars['Date']>
  id: Scalars['ID']
  registration?: Maybe<Registration>
}

export type EventSearchResultSet = {
  __typename?: 'EventSearchResultSet'
  results?: Maybe<Array<Maybe<EventSearchSet>>>
  totalItems?: Maybe<Scalars['Int']>
}

export type EventSearchSet = {
  id: Scalars['ID']
  operationHistories?: Maybe<Array<Maybe<OperationHistorySearchSet>>>
  registration?: Maybe<RegistrationSearchSet>
  type?: Maybe<Scalars['String']>
}

export type GenderBasisDetailsMetrics = {
  __typename?: 'GenderBasisDetailsMetrics'
  femaleOver18: Scalars['Int']
  femaleUnder18: Scalars['Int']
  location: Scalars['ID']
  maleOver18: Scalars['Int']
  maleUnder18: Scalars['Int']
  total: Scalars['Int']
}

export type GenderBasisTotalCount = {
  __typename?: 'GenderBasisTotalCount'
  femaleOver18: Scalars['Int']
  femaleUnder18: Scalars['Int']
  maleOver18: Scalars['Int']
  maleUnder18: Scalars['Int']
  total: Scalars['Int']
}

export type HumanName = {
  __typename?: 'HumanName'
  familyName?: Maybe<Scalars['String']>
  firstNames?: Maybe<Scalars['String']>
  use?: Maybe<Scalars['String']>
}

export type HumanNameInput = {
  familyName?: InputMaybe<Scalars['String']>
  firstNames?: InputMaybe<Scalars['String']>
  use?: InputMaybe<Scalars['String']>
}

export type Identifier = {
  __typename?: 'Identifier'
  system?: Maybe<Scalars['String']>
  value?: Maybe<Scalars['String']>
}

export enum IdentityIdType {
  AlienNumber = 'ALIEN_NUMBER',
  BirthRegistrationNumber = 'BIRTH_REGISTRATION_NUMBER',
  DeathRegistrationNumber = 'DEATH_REGISTRATION_NUMBER',
  DrivingLicense = 'DRIVING_LICENSE',
  NationalId = 'NATIONAL_ID',
  NoId = 'NO_ID',
  Other = 'OTHER',
  Passport = 'PASSPORT',
  RefugeeNumber = 'REFUGEE_NUMBER',
  SocialSecurityNo = 'SOCIAL_SECURITY_NO'
}

export type IdentityInput = {
  id?: InputMaybe<Scalars['ID']>
  otherType?: InputMaybe<Scalars['String']>
  type?: InputMaybe<IdentityIdType>
}

export type IdentityType = {
  __typename?: 'IdentityType'
  id?: Maybe<Scalars['ID']>
  otherType?: Maybe<Scalars['String']>
  type?: Maybe<IdentityIdType>
}

export type LocalRegistrar = {
  __typename?: 'LocalRegistrar'
  name: Array<Maybe<HumanName>>
  role: Scalars['String']
  signature?: Maybe<Signature>
}

export type Location = {
  __typename?: 'Location'
  _fhirID?: Maybe<Scalars['ID']>
  address?: Maybe<Address>
  alias?: Maybe<Array<Maybe<Scalars['String']>>>
  altitude?: Maybe<Scalars['Float']>
  description?: Maybe<Scalars['String']>
  geoData?: Maybe<Scalars['String']>
  id: Scalars['ID']
  identifier?: Maybe<Array<Maybe<Identifier>>>
  latitude?: Maybe<Scalars['Float']>
  longitude?: Maybe<Scalars['Float']>
  name?: Maybe<Scalars['String']>
  partOf?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  telecom?: Maybe<Array<Maybe<ContactPoint>>>
  type?: Maybe<LocationType>
}

export type LocationInput = {
  _fhirID?: InputMaybe<Scalars['ID']>
  address?: InputMaybe<AddressInput>
  alias?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  altitude?: InputMaybe<Scalars['Float']>
  description?: InputMaybe<Scalars['String']>
  geoData?: InputMaybe<Scalars['String']>
  identifier?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>
  latitude?: InputMaybe<Scalars['Float']>
  longitude?: InputMaybe<Scalars['Float']>
  name?: InputMaybe<Scalars['String']>
  partOf?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Scalars['String']>
  telecom?: InputMaybe<Array<InputMaybe<ContactPointInput>>>
  type?: InputMaybe<LocationType>
}

export enum LocationType {
  AdminStructure = 'ADMIN_STRUCTURE',
  CrvsOffice = 'CRVS_OFFICE',
  Current = 'CURRENT',
  HealthFacility = 'HEALTH_FACILITY',
  Hospital = 'HOSPITAL',
  IdpCamp = 'IDP_CAMP',
  MilitaryBaseOrCantonment = 'MILITARY_BASE_OR_CANTONMENT',
  Other = 'OTHER',
  OtherHealthInstitution = 'OTHER_HEALTH_INSTITUTION',
  Permanent = 'PERMANENT',
  PrivateHome = 'PRIVATE_HOME',
  UnhcrCamp = 'UNHCR_CAMP'
}

export type LocationWise45DayEstimation = {
  __typename?: 'LocationWise45DayEstimation'
  actual45DayRegistration: Scalars['Int']
  actualTotalRegistration: Scalars['Int']
  estimated45DayPercentage: Scalars['Float']
  estimatedRegistration: Scalars['Float']
  locationId: Scalars['String']
  locationName: Scalars['String']
}

export type LocationWiseEstimationMetrics = {
  __typename?: 'LocationWiseEstimationMetrics'
  details?: Maybe<Array<Maybe<LocationWise45DayEstimation>>>
  total?: Maybe<EventIn45DayEstimationCount>
}

export enum MannerOfDeath {
  Accident = 'ACCIDENT',
  Homicide = 'HOMICIDE',
  NaturalCauses = 'NATURAL_CAUSES',
  Suicide = 'SUICIDE',
  Undetermined = 'UNDETERMINED'
}

export enum MaritalStatusType {
  Divorced = 'DIVORCED',
  Married = 'MARRIED',
  NotStated = 'NOT_STATED',
  Separated = 'SEPARATED',
  Single = 'SINGLE',
  Widowed = 'WIDOWED'
}

export type MedicalPractitioner = {
  __typename?: 'MedicalPractitioner'
  lastVisitDate?: Maybe<Scalars['Date']>
  name?: Maybe<Scalars['String']>
  qualification?: Maybe<Scalars['String']>
}

export type MedicalPractitionerInput = {
  lastVisitDate?: InputMaybe<Scalars['Date']>
  name?: InputMaybe<Scalars['String']>
  qualification?: InputMaybe<Scalars['String']>
}

export type MonthWise45DayEstimation = {
  __typename?: 'MonthWise45DayEstimation'
  actual45DayRegistration: Scalars['Int']
  actualTotalRegistration: Scalars['Int']
  endOfMonth: Scalars['String']
  estimated45DayPercentage: Scalars['Float']
  estimatedRegistration: Scalars['Float']
  month: Scalars['String']
  startOfMonth: Scalars['String']
  year: Scalars['String']
}

export type MonthWiseEstimationMetrics = {
  __typename?: 'MonthWiseEstimationMetrics'
  details?: Maybe<Array<Maybe<MonthWise45DayEstimation>>>
  total?: Maybe<EventIn45DayEstimationCount>
}

export type Mutation = {
  __typename?: 'Mutation'
  activateUser?: Maybe<Scalars['String']>
  auditUser?: Maybe<Scalars['String']>
  changeAvatar?: Maybe<Scalars['String']>
  changePassword?: Maybe<Scalars['String']>
  changePhone?: Maybe<Scalars['String']>
  createBirthRegistration: CreatedIds
  createDeathRegistration: CreatedIds
  createNotification: Notification
  createOrUpdateUser: User
  markBirthAsCertified: Scalars['ID']
  markBirthAsRegistered: BirthRegistration
  markBirthAsValidated?: Maybe<Scalars['ID']>
  markBirthAsVerified?: Maybe<BirthRegistration>
  markDeathAsCertified: Scalars['ID']
  markDeathAsRegistered: DeathRegistration
  markDeathAsValidated?: Maybe<Scalars['ID']>
  markDeathAsVerified?: Maybe<DeathRegistration>
  markEventAsVoided: Scalars['ID']
  notADuplicate: Scalars['ID']
  resendSMSInvite?: Maybe<Scalars['String']>
  updateBirthRegistration: Scalars['ID']
  updateDeathRegistration: Scalars['ID']
  voidNotification?: Maybe<Notification>
}

export type MutationActivateUserArgs = {
  password: Scalars['String']
  securityQNAs: Array<InputMaybe<SecurityQuestionAnswer>>
  userId: Scalars['String']
}

export type MutationAuditUserArgs = {
  action: Scalars['String']
  comment?: InputMaybe<Scalars['String']>
  reason: Scalars['String']
  userId: Scalars['String']
}

export type MutationChangeAvatarArgs = {
  avatar: AvatarInput
  userId: Scalars['String']
}

export type MutationChangePasswordArgs = {
  existingPassword: Scalars['String']
  password: Scalars['String']
  userId: Scalars['String']
}

export type MutationChangePhoneArgs = {
  nonce: Scalars['String']
  phoneNumber: Scalars['String']
  userId: Scalars['String']
  verifyCode: Scalars['String']
}

export type MutationCreateBirthRegistrationArgs = {
  details: BirthRegistrationInput
}

export type MutationCreateDeathRegistrationArgs = {
  details: DeathRegistrationInput
}

export type MutationCreateNotificationArgs = {
  details: NotificationInput
}

export type MutationCreateOrUpdateUserArgs = {
  user: UserInput
}

export type MutationMarkBirthAsCertifiedArgs = {
  details: BirthRegistrationInput
  id: Scalars['ID']
}

export type MutationMarkBirthAsRegisteredArgs = {
  details?: InputMaybe<BirthRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkBirthAsValidatedArgs = {
  details?: InputMaybe<BirthRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkBirthAsVerifiedArgs = {
  details?: InputMaybe<BirthRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkDeathAsCertifiedArgs = {
  details: DeathRegistrationInput
  id: Scalars['ID']
}

export type MutationMarkDeathAsRegisteredArgs = {
  details?: InputMaybe<DeathRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkDeathAsValidatedArgs = {
  details?: InputMaybe<DeathRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkDeathAsVerifiedArgs = {
  details?: InputMaybe<DeathRegistrationInput>
  id: Scalars['ID']
}

export type MutationMarkEventAsVoidedArgs = {
  comment?: InputMaybe<Scalars['String']>
  id: Scalars['String']
  reason: Scalars['String']
}

export type MutationNotADuplicateArgs = {
  duplicateId: Scalars['String']
  id: Scalars['String']
}

export type MutationResendSmsInviteArgs = {
  userId: Scalars['String']
}

export type MutationUpdateBirthRegistrationArgs = {
  details: BirthRegistrationInput
  id: Scalars['ID']
}

export type MutationUpdateDeathRegistrationArgs = {
  details: DeathRegistrationInput
  id: Scalars['ID']
}

export type MutationVoidNotificationArgs = {
  id: Scalars['ID']
}

export type Notification = {
  __typename?: 'Notification'
  child?: Maybe<Person>
  createdAt?: Maybe<Scalars['Date']>
  father?: Maybe<Person>
  id: Scalars['ID']
  informant?: Maybe<Person>
  location?: Maybe<Location>
  mother?: Maybe<Person>
  updatedAt?: Maybe<Scalars['Date']>
}

export type NotificationInput = {
  child?: InputMaybe<PersonInput>
  createdAt?: InputMaybe<Scalars['Date']>
  father?: InputMaybe<PersonInput>
  informant?: InputMaybe<PersonInput>
  location?: InputMaybe<LocationInput>
  mother?: InputMaybe<PersonInput>
  updatedAt?: InputMaybe<Scalars['Date']>
}

export type OperationHistorySearchSet = {
  __typename?: 'OperationHistorySearchSet'
  notificationFacilityAlias?: Maybe<Array<Maybe<Scalars['String']>>>
  notificationFacilityName?: Maybe<Scalars['String']>
  operatedOn?: Maybe<Scalars['Date']>
  operationType?: Maybe<Scalars['String']>
  operatorName?: Maybe<Array<Maybe<HumanName>>>
  operatorOfficeAlias?: Maybe<Array<Maybe<Scalars['String']>>>
  operatorOfficeName?: Maybe<Scalars['String']>
  operatorRole?: Maybe<Scalars['String']>
  rejectComment?: Maybe<Scalars['String']>
  rejectReason?: Maybe<Scalars['String']>
}

export enum ParentDetailsType {
  FatherOnly = 'FATHER_ONLY',
  MotherAndFather = 'MOTHER_AND_FATHER',
  MotherOnly = 'MOTHER_ONLY',
  None = 'NONE'
}

export type Payment = {
  __typename?: 'Payment'
  amount?: Maybe<Scalars['Float']>
  date?: Maybe<Scalars['Date']>
  outcome?: Maybe<PaymentOutcomeType>
  paymentId?: Maybe<Scalars['ID']>
  total?: Maybe<Scalars['Float']>
  type?: Maybe<PaymentType>
}

export type PaymentInput = {
  amount?: InputMaybe<Scalars['Float']>
  date?: InputMaybe<Scalars['Date']>
  outcome?: InputMaybe<PaymentOutcomeType>
  paymentId?: InputMaybe<Scalars['ID']>
  total?: InputMaybe<Scalars['Float']>
  type?: InputMaybe<PaymentType>
}

export enum PaymentOutcomeType {
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Partial = 'PARTIAL'
}

export enum PaymentType {
  Manual = 'MANUAL'
}

export type Person = {
  __typename?: 'Person'
  _fhirID?: Maybe<Scalars['ID']>
  address?: Maybe<Array<Maybe<Address>>>
  age?: Maybe<Scalars['Float']>
  birthDate?: Maybe<Scalars['String']>
  dateOfMarriage?: Maybe<Scalars['Date']>
  deceased?: Maybe<Deceased>
  educationalAttainment?: Maybe<EducationType>
  gender?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['ID']>
  identifier?: Maybe<Array<Maybe<IdentityType>>>
  maritalStatus?: Maybe<MaritalStatusType>
  multipleBirth?: Maybe<Scalars['Int']>
  name?: Maybe<Array<Maybe<HumanName>>>
  nationality?: Maybe<Array<Maybe<Scalars['String']>>>
  occupation?: Maybe<Scalars['String']>
  photo?: Maybe<Array<Maybe<Attachment>>>
  telecom?: Maybe<Array<Maybe<ContactPoint>>>
}

export type PersonInput = {
  _fhirID?: InputMaybe<Scalars['ID']>
  address?: InputMaybe<Array<InputMaybe<AddressInput>>>
  age?: InputMaybe<Scalars['Float']>
  birthDate?: InputMaybe<Scalars['String']>
  dateOfMarriage?: InputMaybe<Scalars['Date']>
  deceased?: InputMaybe<DeceasedInput>
  educationalAttainment?: InputMaybe<EducationType>
  gender?: InputMaybe<Scalars['String']>
  identifier?: InputMaybe<Array<InputMaybe<IdentityInput>>>
  maritalStatus?: InputMaybe<MaritalStatusType>
  multipleBirth?: InputMaybe<Scalars['Int']>
  name?: InputMaybe<Array<InputMaybe<HumanNameInput>>>
  nationality?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  occupation?: InputMaybe<Scalars['String']>
  photo?: InputMaybe<Array<InputMaybe<AttachmentInput>>>
  telecom?: InputMaybe<Array<InputMaybe<ContactPointInput>>>
}

export type PrimaryCaregiver = {
  __typename?: 'PrimaryCaregiver'
  parentDetailsType?: Maybe<ParentDetailsType>
  primaryCaregiver?: Maybe<Person>
  reasonsNotApplying?: Maybe<Array<Maybe<ReasonsNotApplying>>>
}

export type PrimaryCaregiverInput = {
  parentDetailsType?: InputMaybe<ParentDetailsType>
  primaryCaregiver?: InputMaybe<PersonInput>
  reasonsNotApplying?: InputMaybe<Array<InputMaybe<ReasonsNotApplyingInput>>>
}

export enum PrimaryCaregiverType {
  Father = 'FATHER',
  Informant = 'INFORMANT',
  LegalGuardian = 'LEGAL_GUARDIAN',
  Mother = 'MOTHER',
  MotherAndFather = 'MOTHER_AND_FATHER',
  Other = 'OTHER'
}

export type Query = {
  __typename?: 'Query'
  fetchBirthRegistration?: Maybe<BirthRegistration>
  fetchDeathRegistration?: Maybe<DeathRegistration>
  fetchEventRegistration?: Maybe<EventRegistration>
  fetchLocationWiseEventMetrics?: Maybe<LocationWiseEstimationMetrics>
  fetchMonthWiseEventMetrics?: Maybe<MonthWiseEstimationMetrics>
  fetchRegistration?: Maybe<EventRegistration>
  fetchRegistrationCountByStatus?: Maybe<RegistrationCountResult>
  fetchRegistrationMetrics?: Maybe<RegistrationMetrics>
  fetchTimeLoggedMetricsByPractitioner?: Maybe<TimeLoggedMetricsResultSet>
  getDeclarationsStartedMetrics?: Maybe<DeclarationsStartedMetrics>
  getEventEstimationMetrics?: Maybe<EventEstimationMetrics>
  getEventsWithProgress?: Maybe<EventProgressResultSet>
  getRoles?: Maybe<Array<Maybe<Role>>>
  getUser?: Maybe<User>
  hasChildLocation?: Maybe<Location>
  listBirthRegistrations?: Maybe<BirthRegResultSet>
  listNotifications?: Maybe<Array<Maybe<Notification>>>
  locationById?: Maybe<Location>
  locationsByParent?: Maybe<Array<Maybe<Location>>>
  queryPersonByIdentifier?: Maybe<Person>
  queryPersonByNidIdentifier?: Maybe<Person>
  queryRegistrationByIdentifier?: Maybe<BirthRegistration>
  searchBirthRegistrations?: Maybe<Array<Maybe<BirthRegistration>>>
  searchDeathRegistrations?: Maybe<Array<Maybe<DeathRegistration>>>
  searchEvents?: Maybe<EventSearchResultSet>
  searchFieldAgents?: Maybe<SearchFieldAgentResult>
  searchUsers?: Maybe<SearchUserResult>
  verifyPasswordById?: Maybe<VerifyPasswordResult>
}

export type QueryFetchBirthRegistrationArgs = {
  id: Scalars['ID']
}

export type QueryFetchDeathRegistrationArgs = {
  id: Scalars['ID']
}

export type QueryFetchEventRegistrationArgs = {
  id: Scalars['ID']
}

export type QueryFetchLocationWiseEventMetricsArgs = {
  event: Scalars['String']
  locationId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryFetchMonthWiseEventMetricsArgs = {
  event: Scalars['String']
  locationId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryFetchRegistrationArgs = {
  id: Scalars['ID']
}

export type QueryFetchRegistrationCountByStatusArgs = {
  locationId: Scalars['String']
  status: Array<InputMaybe<Scalars['String']>>
}

export type QueryFetchRegistrationMetricsArgs = {
  event: Scalars['String']
  locationId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryFetchTimeLoggedMetricsByPractitionerArgs = {
  count: Scalars['Int']
  locationId: Scalars['String']
  practitionerId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryGetDeclarationsStartedMetricsArgs = {
  locationId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryGetEventEstimationMetricsArgs = {
  locationId: Scalars['String']
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QueryGetEventsWithProgressArgs = {
  count?: InputMaybe<Scalars['Int']>
  locationId?: InputMaybe<Scalars['String']>
  skip?: InputMaybe<Scalars['Int']>
  sort?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  type?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
}

export type QueryGetRolesArgs = {
  active?: InputMaybe<Scalars['Boolean']>
  sortBy?: InputMaybe<Scalars['String']>
  sortOrder?: InputMaybe<Scalars['String']>
  title?: InputMaybe<Scalars['String']>
  type?: InputMaybe<Scalars['String']>
  value?: InputMaybe<Scalars['String']>
}

export type QueryGetUserArgs = {
  userId?: InputMaybe<Scalars['String']>
}

export type QueryHasChildLocationArgs = {
  parentId?: InputMaybe<Scalars['String']>
}

export type QueryListBirthRegistrationsArgs = {
  count?: InputMaybe<Scalars['Int']>
  from?: InputMaybe<Scalars['Date']>
  locationIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  skip?: InputMaybe<Scalars['Int']>
  status?: InputMaybe<Scalars['String']>
  to?: InputMaybe<Scalars['Date']>
  userId?: InputMaybe<Scalars['String']>
}

export type QueryListNotificationsArgs = {
  from?: InputMaybe<Scalars['Date']>
  locationIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  status?: InputMaybe<Scalars['String']>
  to?: InputMaybe<Scalars['Date']>
  userId?: InputMaybe<Scalars['String']>
}

export type QueryLocationByIdArgs = {
  locationId?: InputMaybe<Scalars['String']>
}

export type QueryLocationsByParentArgs = {
  parentId?: InputMaybe<Scalars['String']>
  type?: InputMaybe<Scalars['String']>
}

export type QueryQueryPersonByIdentifierArgs = {
  identifier: Scalars['ID']
}

export type QueryQueryPersonByNidIdentifierArgs = {
  country?: InputMaybe<Scalars['String']>
  dob?: InputMaybe<Scalars['String']>
  nid?: InputMaybe<Scalars['String']>
}

export type QueryQueryRegistrationByIdentifierArgs = {
  identifier: Scalars['ID']
}

export type QuerySearchBirthRegistrationsArgs = {
  fromDate?: InputMaybe<Scalars['Date']>
  toDate?: InputMaybe<Scalars['Date']>
}

export type QuerySearchDeathRegistrationsArgs = {
  fromDate?: InputMaybe<Scalars['Date']>
  toDate?: InputMaybe<Scalars['Date']>
}

export type QuerySearchEventsArgs = {
  contactNumber?: InputMaybe<Scalars['String']>
  count?: InputMaybe<Scalars['Int']>
  locationIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  name?: InputMaybe<Scalars['String']>
  registrationNumber?: InputMaybe<Scalars['String']>
  skip?: InputMaybe<Scalars['Int']>
  sort?: InputMaybe<Scalars['String']>
  sortColumn?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  trackingId?: InputMaybe<Scalars['String']>
  type?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  userId?: InputMaybe<Scalars['String']>
}

export type QuerySearchFieldAgentsArgs = {
  count?: InputMaybe<Scalars['Int']>
  event?: InputMaybe<Scalars['String']>
  language?: InputMaybe<Scalars['String']>
  locationId?: InputMaybe<Scalars['String']>
  primaryOfficeId?: InputMaybe<Scalars['String']>
  skip?: InputMaybe<Scalars['Int']>
  sort?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Scalars['String']>
  timeEnd: Scalars['String']
  timeStart: Scalars['String']
}

export type QuerySearchUsersArgs = {
  count?: InputMaybe<Scalars['Int']>
  locationId?: InputMaybe<Scalars['String']>
  mobile?: InputMaybe<Scalars['String']>
  primaryOfficeId?: InputMaybe<Scalars['String']>
  role?: InputMaybe<Scalars['String']>
  skip?: InputMaybe<Scalars['Int']>
  sort?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Scalars['String']>
  username?: InputMaybe<Scalars['String']>
}

export type QueryVerifyPasswordByIdArgs = {
  id: Scalars['String']
  password: Scalars['String']
}

export type ReasonsNotApplying = {
  __typename?: 'ReasonsNotApplying'
  isDeceased?: Maybe<Scalars['Boolean']>
  primaryCaregiverType?: Maybe<PrimaryCaregiverType>
  reasonNotApplying?: Maybe<Scalars['String']>
}

export type ReasonsNotApplyingInput = {
  isDeceased?: InputMaybe<Scalars['Boolean']>
  primaryCaregiverType?: InputMaybe<PrimaryCaregiverType>
  reasonNotApplying?: InputMaybe<Scalars['String']>
}

export enum RegStatus {
  Certified = 'CERTIFIED',
  Declared = 'DECLARED',
  InProgress = 'IN_PROGRESS',
  Registered = 'REGISTERED',
  Rejected = 'REJECTED',
  Validated = 'VALIDATED',
  WaitingValidation = 'WAITING_VALIDATION'
}

export type RegWorkflow = {
  __typename?: 'RegWorkflow'
  comments?: Maybe<Array<Maybe<Comment>>>
  id: Scalars['ID']
  location?: Maybe<Location>
  office?: Maybe<Location>
  reason?: Maybe<Scalars['String']>
  timeLogged?: Maybe<Scalars['Int']>
  timestamp?: Maybe<Scalars['Date']>
  type?: Maybe<RegStatus>
  user?: Maybe<User>
}

export type RegWorkflowInput = {
  comments?: InputMaybe<Array<InputMaybe<CommentInput>>>
  location?: InputMaybe<LocationInput>
  reason?: InputMaybe<Scalars['String']>
  timeLoggedMS?: InputMaybe<Scalars['Int']>
  timestamp?: InputMaybe<Scalars['Date']>
  type?: InputMaybe<RegStatus>
  user?: InputMaybe<UserInput>
}

export type Registration = {
  __typename?: 'Registration'
  _fhirID?: Maybe<Scalars['ID']>
  attachments?: Maybe<Array<Maybe<Attachment>>>
  book?: Maybe<Scalars['String']>
  certificates?: Maybe<Array<Maybe<Certificate>>>
  contact?: Maybe<RegistrationContactType>
  contactPhoneNumber?: Maybe<Scalars['String']>
  contactRelationship?: Maybe<Scalars['String']>
  draftId?: Maybe<Scalars['String']>
  duplicates?: Maybe<Array<Maybe<Scalars['ID']>>>
  id?: Maybe<Scalars['ID']>
  inCompleteFields?: Maybe<Scalars['String']>
  page?: Maybe<Scalars['String']>
  paperFormID?: Maybe<Scalars['String']>
  registrationNumber?: Maybe<Scalars['String']>
  status?: Maybe<Array<Maybe<RegWorkflow>>>
  trackingId?: Maybe<Scalars['String']>
  type?: Maybe<RegistrationType>
}

export type Registration45DayEstimatedMetrics = {
  __typename?: 'Registration45DayEstimatedMetrics'
  details?: Maybe<Array<Estimated45DayMetrics>>
  total?: Maybe<Estimate45DayTotalCount>
}

export enum RegistrationContactType {
  Informant = 'INFORMANT',
  Both = 'BOTH',
  Father = 'FATHER',
  Mother = 'MOTHER',
  Other = 'OTHER'
}

export type RegistrationCountResult = {
  __typename?: 'RegistrationCountResult'
  results: Array<Maybe<StatusWiseRegistrationCount>>
  total: Scalars['Int']
}

export type RegistrationGenderBasisMetrics = {
  __typename?: 'RegistrationGenderBasisMetrics'
  details?: Maybe<Array<GenderBasisDetailsMetrics>>
  total?: Maybe<GenderBasisTotalCount>
}

export type RegistrationInput = {
  _fhirID?: InputMaybe<Scalars['ID']>
  attachments?: InputMaybe<Array<InputMaybe<AttachmentInput>>>
  book?: InputMaybe<Scalars['String']>
  certificates?: InputMaybe<Array<InputMaybe<CertificateInput>>>
  contact?: InputMaybe<RegistrationContactType>
  contactPhoneNumber?: InputMaybe<Scalars['String']>
  contactRelationship?: InputMaybe<Scalars['String']>
  draftId?: InputMaybe<Scalars['String']>
  inCompleteFields?: InputMaybe<Scalars['String']>
  location?: InputMaybe<LocationInput>
  page?: InputMaybe<Scalars['String']>
  paperFormID?: InputMaybe<Scalars['String']>
  registrationNumber?: InputMaybe<Scalars['String']>
  status?: InputMaybe<Array<InputMaybe<RegWorkflowInput>>>
  trackingId?: InputMaybe<Scalars['String']>
  type?: InputMaybe<RegistrationType>
}

export type RegistrationMetrics = {
  __typename?: 'RegistrationMetrics'
  estimated45DayMetrics?: Maybe<Registration45DayEstimatedMetrics>
  genderBasisMetrics?: Maybe<RegistrationGenderBasisMetrics>
  payments?: Maybe<CertificationPaymentMetrics>
  timeFrames?: Maybe<RegistrationTimeFrameMetrics>
}

export type RegistrationSearchSet = {
  __typename?: 'RegistrationSearchSet'
  comment?: Maybe<Scalars['String']>
  contactNumber?: Maybe<Scalars['String']>
  contactRelationship?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['String']>
  dateOfDeclaration?: Maybe<Scalars['Date']>
  duplicates?: Maybe<Array<Maybe<Scalars['ID']>>>
  eventLocationId?: Maybe<Scalars['String']>
  modifiedAt?: Maybe<Scalars['String']>
  reason?: Maybe<Scalars['String']>
  registeredLocationId?: Maybe<Scalars['String']>
  registrationNumber?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
}

export type RegistrationTimeFrameMetrics = {
  __typename?: 'RegistrationTimeFrameMetrics'
  details?: Maybe<Array<TimeFrameDetailMetrics>>
  total?: Maybe<TimeFrameTotalCount>
}

export enum RegistrationType {
  Birth = 'BIRTH',
  Death = 'DEATH'
}

export type RelatedPerson = {
  __typename?: 'RelatedPerson'
  _fhirID?: Maybe<Scalars['ID']>
  affidavit?: Maybe<Array<Maybe<Attachment>>>
  id?: Maybe<Scalars['ID']>
  individual?: Maybe<Person>
  otherRelationship?: Maybe<Scalars['String']>
  relationship?: Maybe<RelationshipType>
}

export type RelatedPersonInput = {
  _fhirID?: InputMaybe<Scalars['ID']>
  affidavit?: InputMaybe<Array<InputMaybe<AttachmentInput>>>
  id?: InputMaybe<Scalars['ID']>
  individual?: InputMaybe<PersonInput>
  otherRelationship?: InputMaybe<Scalars['String']>
  relationship?: InputMaybe<RelationshipType>
}

export enum RelationshipType {
  BothParents = 'BOTH_PARENTS',
  Brother = 'BROTHER',
  Daughter = 'DAUGHTER',
  DaughterInLaw = 'DAUGHTER_IN_LAW',
  DriverOfTheVehicle = 'DRIVER_OF_THE_VEHICLE',
  ExtendedFamily = 'EXTENDED_FAMILY',
  Father = 'FATHER',
  Granddaughter = 'GRANDDAUGHTER',
  Grandfather = 'GRANDFATHER',
  Grandmother = 'GRANDMOTHER',
  Grandson = 'GRANDSON',
  HeadOfTheInstitute = 'HEAD_OF_THE_INSTITUTE',
  HouseOwner = 'HOUSE_OWNER',
  Informant = 'INFORMANT',
  InstitutionHeadPlaceOfBirth = 'INSTITUTION_HEAD_PLACE_OF_BIRTH',
  LegalGuardian = 'LEGAL_GUARDIAN',
  Mother = 'MOTHER',
  OfficerInCharge = 'OFFICER_IN_CHARGE',
  OfficeInCharge = 'OFFICE_IN_CHARGE',
  Operator = 'OPERATOR',
  Other = 'OTHER',
  OtherFamilyMember = 'OTHER_FAMILY_MEMBER',
  OwnerOfTheHouse = 'OWNER_OF_THE_HOUSE',
  Sister = 'SISTER',
  Son = 'SON',
  SonInLaw = 'SON_IN_LAW',
  Spouse = 'SPOUSE'
}

export type Role = {
  __typename?: 'Role'
  active?: Maybe<Scalars['Boolean']>
  id: Scalars['ID']
  title?: Maybe<Scalars['String']>
  types?: Maybe<Array<Maybe<Scalars['String']>>>
  value?: Maybe<Scalars['String']>
}

export type SearchFieldAgentResponse = {
  __typename?: 'SearchFieldAgentResponse'
  averageTimeForDeclaredDeclarations?: Maybe<Scalars['Int']>
  creationDate?: Maybe<Scalars['String']>
  fullName?: Maybe<Scalars['String']>
  practitionerId?: Maybe<Scalars['String']>
  primaryOfficeId?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  totalNumberOfDeclarationStarted?: Maybe<Scalars['Int']>
  totalNumberOfInProgressAppStarted?: Maybe<Scalars['Int']>
  totalNumberOfRejectedDeclarations?: Maybe<Scalars['Int']>
  type?: Maybe<Scalars['String']>
}

export type SearchFieldAgentResult = {
  __typename?: 'SearchFieldAgentResult'
  results?: Maybe<Array<Maybe<SearchFieldAgentResponse>>>
  totalItems?: Maybe<Scalars['Int']>
}

export type SearchUserResult = {
  __typename?: 'SearchUserResult'
  results?: Maybe<Array<Maybe<User>>>
  totalItems?: Maybe<Scalars['Int']>
}

export type SecurityQuestionAnswer = {
  answer?: InputMaybe<Scalars['String']>
  questionKey?: InputMaybe<Scalars['String']>
}

export type Signature = {
  __typename?: 'Signature'
  data?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type SignatureInput = {
  data?: InputMaybe<Scalars['String']>
  type?: InputMaybe<Scalars['String']>
}

export type StatusWiseRegistrationCount = {
  __typename?: 'StatusWiseRegistrationCount'
  count: Scalars['Int']
  status: Scalars['String']
}

export type TimeFrameDetailMetrics = {
  __typename?: 'TimeFrameDetailMetrics'
  locationId: Scalars['String']
  regOver5yr: Scalars['Int']
  regWithin1yrTo5yr: Scalars['Int']
  regWithin45d: Scalars['Int']
  regWithin45dTo1yr: Scalars['Int']
  total: Scalars['Int']
}

export type TimeFrameTotalCount = {
  __typename?: 'TimeFrameTotalCount'
  regOver5yr: Scalars['Int']
  regWithin1yrTo5yr: Scalars['Int']
  regWithin45d: Scalars['Int']
  regWithin45dTo1yr: Scalars['Int']
  total: Scalars['Int']
}

export type TimeLoggedMetrics = {
  __typename?: 'TimeLoggedMetrics'
  eventType: Scalars['String']
  status: Scalars['String']
  time: Scalars['String']
  trackingId?: Maybe<Scalars['String']>
}

export type TimeLoggedMetricsResultSet = {
  __typename?: 'TimeLoggedMetricsResultSet'
  results?: Maybe<Array<Maybe<TimeLoggedMetrics>>>
  totalItems?: Maybe<Scalars['Int']>
}

export type User = {
  __typename?: 'User'
  avatar?: Maybe<Avatar>
  catchmentArea?: Maybe<Array<Maybe<Location>>>
  creationDate?: Maybe<Scalars['String']>
  device?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['ID']>
  identifier?: Maybe<Identifier>
  localRegistrar: LocalRegistrar
  mobile?: Maybe<Scalars['String']>
  name?: Maybe<Array<Maybe<HumanName>>>
  practitionerId?: Maybe<Scalars['String']>
  primaryOffice?: Maybe<Location>
  role?: Maybe<Scalars['String']>
  signature?: Maybe<Signature>
  status?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
  underInvestigation?: Maybe<Scalars['Boolean']>
  userMgntUserID?: Maybe<Scalars['ID']>
  username?: Maybe<Scalars['String']>
}

export type UserIdentifierInput = {
  system?: InputMaybe<Scalars['String']>
  use?: InputMaybe<Scalars['String']>
  value?: InputMaybe<Scalars['String']>
}

export type UserInput = {
  catchmentArea?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  device?: InputMaybe<Scalars['String']>
  email?: InputMaybe<Scalars['String']>
  id?: InputMaybe<Scalars['ID']>
  identifier?: InputMaybe<Array<InputMaybe<UserIdentifierInput>>>
  mobile?: InputMaybe<Scalars['String']>
  name?: InputMaybe<Array<InputMaybe<HumanNameInput>>>
  primaryOffice?: InputMaybe<Scalars['String']>
  role?: InputMaybe<Scalars['String']>
  signature?: InputMaybe<SignatureInput>
  type?: InputMaybe<Scalars['String']>
  username?: InputMaybe<Scalars['String']>
}

export type VerifyPasswordResult = {
  __typename?: 'VerifyPasswordResult'
  id?: Maybe<Scalars['String']>
  mobile?: Maybe<Scalars['String']>
  scrope?: Maybe<Array<Maybe<Scalars['String']>>>
  status?: Maybe<Scalars['String']>
  username?: Maybe<Scalars['String']>
}
