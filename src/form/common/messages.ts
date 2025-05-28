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
import { MessageDescriptor } from 'react-intl'
// FORMATJS MESSAGE CONSTANTS FOR MULTI-LINGUAL TRANSLATION

export const informantMessageDescriptors = {
  birthInformantTitle: {
    defaultMessage: 'Informant type',
    description: 'Who is applying for birth registration',
    id: 'register.selectInformant.birthInformantTitle'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  GRANDFATHER: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.informantRelation.grandfather'
  },
  GRANDMOTHER: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.informantRelation.grandmother'
  },
  BROTHER: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.informantRelation.brother'
  },
  SISTER: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.informantRelation.sister'
  },
  OTHER_FAMILY_MEMBER: {
    defaultMessage: 'Other family member',
    description: 'Label for other family member relation',
    id: 'form.field.label.relationOtherFamilyMember'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  OTHER: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  },
  deathInformantTitle: {
    defaultMessage: 'Who is applying for death registration?',
    description: 'Who is applying for death registration',
    id: 'register.selectInformant.deathInformantTitle'
  },
  SPOUSE: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'form.field.label.informantRelation.spouse'
  },
  SON: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'form.field.label.informantRelation.son'
  },
  DAUGHTER: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'form.field.label.informantRelation.daughter'
  },
  SON_IN_LAW: {
    defaultMessage: 'Son in law',
    description: 'Label for option Son in law',
    id: 'form.field.label.informantRelation.sonInLaw'
  },
  DAUGHTER_IN_LAW: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option Daughter in law',
    id: 'form.field.label.informantRelation.daughterInLaw'
  },
  GRANDSON: {
    defaultMessage: 'Grandson',
    description: 'Label for option Grandson',
    id: 'form.field.label.informantRelation.grandson'
  },
  GRANDDAUGHTER: {
    defaultMessage: 'Granddaughter',
    description: 'Label for option Granddaughter',
    id: 'form.field.label.informantRelation.granddaughter'
  },
  // selectContactPoint: {},
  selectContactPoint: {
    defaultMessage: 'Contact Point',
    description: 'Label for option Contact point',
    id: 'form.field.label.informantRelation.contactPoint'
  },
  marriageInformantTitle: {
    defaultMessage: 'Who is applying for marriage registration?',
    description: 'Who is applying for marriage registration',
    id: 'register.selectInformant.marriageInformantTitle'
  },
  GROOM: {
    defaultMessage: 'Groom',
    description: 'Label for option groom',
    id: 'form.field.label.informantRelation.groom'
  },
  BRIDE: {
    defaultMessage: 'Bride',
    description: 'Label for option bride',
    id: 'form.field.label.informantRelation.bride'
  },
  DOCTOR: {
    defaultMessage: 'Doctor',
    description: 'Label for option doctor',
    id: 'form.field.label.informantRelation.doctor'
  },
  MID_WIFE: {
    defaultMessage: 'Midwife',
    description: 'Label for option midwife',
    id: 'form.field.label.informantRelation.midwife'
  }
}

export const formMessageDescriptors = {
  primaryAddress: {
    defaultMessage: 'Usual place of residence',
    description: 'Title of the primary adress',
    id: 'form.field.label.primaryAddress'
  },
  middleName: {
    defaultMessage: 'Middle name',
    description: 'Label for middle name text input',
    id: 'form.field.label.middleName'
  },
  spouseSectionName: {
    defaultMessage: 'Spouse details',
    description: 'Title of the spouse section',
    id: 'form.section.deceased.spouse.title'
  },
  informantSecondaryAddress: {
    defaultMessage: 'Secondary Address',
    description: 'Title for the secondary address fields for the informant',
    id: 'form.field.label.informantSecondaryAddress'
  },
  secondaryAddress: {
    defaultMessage: 'Secondary Address',
    description: 'Title for the secondary address fields',
    id: 'form.field.label.secondaryAddress'
  },
  primaryAddressSameAsOtherPrimary: {
    defaultMessage: "Same as mother's usual place of residence?",
    description:
      "Title for the radio button to select that the persons primary address is the same as the mother's primary address",
    id: 'form.field.label.primaryAddressSameAsOtherPrimary'
  },
  deceasedPrimaryAddress: {
    defaultMessage: 'Usual place of residence',
    description: 'Title for the primary address fields for the deceased',
    id: 'form.field.label.deceasedPrimaryAddress'
  },
  deceasedSecondaryAddress: {
    defaultMessage: 'Secondary address?',
    description: 'Title for the secondary address fields for the deceased',
    id: 'form.field.label.deceasedSecondaryAddress'
  },
  primaryAddressSameAsDeceasedsPrimary: {
    defaultMessage: "Same as deceased's usual place of residence",
    description:
      "Label for informant's address to be same as deceased's usual place of residence",
    id: 'form.field.label.primaryAddressSameAsDeceasedsPrimary'
  },
  informantPrimaryAddress: {
    defaultMessage: 'Usual place of residence',
    description: 'Title for the primary address fields for the informant',
    id: 'form.field.label.informantPrimaryAddress'
  },
  attendantAtBirth: {
    defaultMessage: 'Attendant at birth',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirth'
  },
  formSelectPlaceholder: {
    defaultMessage: 'Select',
    description: 'Placeholder text for a select',
    id: 'form.field.select.placeholder'
  },
  physician: {
    defaultMessage: 'Physician',
    description: 'Label for form field: physician',
    id: 'form.field.label.physician'
  },
  attendantAtBirthHealthWorker: {
    defaultMessage: 'Health worker',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthHealthWorker'
  },
  attendantAtBirthNurse: {
    defaultMessage: 'Nurse',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthNurse'
  },
  attendantAtBirthMidwife: {
    defaultMessage: 'Midwife',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthMidwife'
  },
  attendantAtBirthOtherParamedicalPersonnel: {
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attBirthOtherParaPers'
  },
  attendantAtBirthLayperson: {
    defaultMessage: 'Layperson',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthLayperson'
  },
  attendantAtBirthTraditionalBirthAttendant: {
    defaultMessage: 'Traditional birth attendant',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthTraditionalBirthAttendant'
  },
  attendantAtBirthNone: {
    defaultMessage: 'None',
    description: 'Label for form field: Attendant at birth',
    id: 'form.field.label.attendantAtBirthNone'
  },
  birthTypeSingle: {
    defaultMessage: 'Single',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeSingle'
  },
  birthTypeTwin: {
    defaultMessage: 'Twin',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeTwin'
  },
  birthTypeTriplet: {
    defaultMessage: 'Triplet',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeTriplet'
  },
  birthTypeQuadruplet: {
    defaultMessage: 'Quadruplet',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeQuadruplet'
  },
  birthTypeHigherMultipleDelivery: {
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthTypeHigherMultipleDelivery'
  },
  weightAtBirth: {
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth',
    id: 'form.field.label.weightAtBirth'
  },
  phoneNumber: {
    defaultMessage: 'Phone number',
    description: 'Input label for phone input',
    id: 'form.field.label.phoneNumber'
  },
  email: {
    defaultMessage: 'Email',
    description: 'Input label for email',
    id: 'form.field.label.email'
  },
  // email: {},
  iDTypeNationalID: {
    defaultMessage: 'National ID number (in English)',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  nidVerified: {
    defaultMessage: 'Authenticated',
    description: 'label for unverified nid state',
    id: 'form.field.nidVerified'
  },
  nidNotVerified: {
    defaultMessage: 'Authenticate',
    description: 'label for verified nid state',
    id: 'form.field.nidNotVerified'
  },
  nidOffline: {
    defaultMessage:
      'National ID authentication is currently not available offline.',
    description:
      'Label for indicating offline status for the user. NID verification is not currently available offline.',
    id: 'form.field.nidVerificationOngoing'
  },
  educationAttainment: {
    defaultMessage: 'Level of education',
    description: 'Label for form field: Education Attainment',
    id: 'form.field.label.educationAttainment'
  },
  nameInEnglishPreviewGroup: {
    defaultMessage: 'Full name',
    description: 'Label for child name in english',
    id: 'form.preview.group.label.english.name'
  },
  dateOfBirth: {
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth',
    id: 'form.field.label.dateOfBirth'
  },
  sex: {
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name',
    id: 'form.field.label.sex'
  },
  sexMale: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexMale'
  },
  sexFemale: {
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexFemale'
  },
  sexUnknown: {
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexUnknown'
  },
  familyName: {
    defaultMessage: 'Last name',
    description: 'Label for family name text input',
    id: 'form.field.label.familyName'
  },
  nationality: {
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality',
    id: 'form.field.label.nationality'
  },
  previewName: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  previewTitle: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  reviewName: {
    defaultMessage: 'Review',
    description: 'Form section name for Review',
    id: 'review.form.section.review.name'
  },
  reviewTitle: {
    defaultMessage: 'Review',
    description: 'Form section title for Review',
    id: 'review.form.section.review.title'
  },
  placeOfBirthPreview: {
    defaultMessage: 'Place of delivery',
    description: 'Title for place of birth sub section',
    id: 'form.field.label.placeOfBirthPreview'
  },
  placeOfBirth: {
    defaultMessage: 'Location',
    description: 'Label for form field: Place of delivery',
    id: 'form.field.label.placeOfBirth'
  },
  healthInstitution: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  privateHome: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  otherInstitution: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  },
  informantsRelationWithChild: {
    defaultMessage: 'Relationship to child',
    description: 'Label for Relationship to child',
    id: 'form.field.label.informantsRelationWithChild'
  },
  relationshipPlaceHolder: {
    defaultMessage: 'eg. Grandmother',
    description: 'Relationship place holder',
    id: 'form.field.label.relationshipPlaceHolder'
  },
  reasonNA: {
    defaultMessage: 'Reason',
    description: 'Label for form field: reasonNotApplying',
    id: 'form.field.label.reasonNotApplying'
  },
  reasonMotherNotApplying: {
    defaultMessage: 'Reason',
    description: 'Label for form field: reasonMotherNotApplying',
    id: 'form.field.label.reasonMotherNotApplying'
  },
  reasonFatherNotApplying: {
    defaultMessage: 'Reason',
    description: 'Label for form field: reasonFatherNotApplying',
    id: 'form.field.label.reasonFatherNotApplying'
  },
  childTab: {
    defaultMessage: 'Child',
    description: 'Form section name for Child',
    id: 'form.section.child.name'
  },
  childTitle: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.section.child.title'
  },
  birthInformantTitle: {
    defaultMessage: "Informant's details?",
    description: 'Form section title for informants',
    id: 'form.section.informant.title'
  },
  ageOfInformant: {
    defaultMessage: 'Age of informant',
    description: 'Label for form field: Age of informant',
    id: 'form.field.label.ageOfInformant'
  },
  ageOfSpouse: {
    defaultMessage: 'Age of spouse',
    description: 'Label for form field: Age of spouse',
    id: 'form.field.label.ageOfSpouse'
  },
  motherName: {
    defaultMessage: 'Mother',
    description: 'Form section name for Mother',
    id: 'form.section.mother.name'
  },
  motherTitle: {
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother',
    id: 'form.section.mother.title'
  },
  mothersDetailsExist: {
    defaultMessage: "Mother's details are not available",
    description: "Question to ask the user if they have the mother's details",
    id: 'form.field.label.mothersDetailsExist'
  },
  spouseDetailsExist: {
    defaultMessage: "Spouse's details are not available",
    description: "Question to ask the user if they have the spouse's details",
    id: 'form.field.label.spouseDetailsExist'
  },
  ageOfMother: {
    defaultMessage: 'Age of mother',
    description: 'Label for form field: Age of mother',
    id: 'form.field.label.ageOfMother'
  },
  yearOfBirth: {
    defaultMessage: 'Year of birth',
    description: 'Label for form field: Year of birth',
    id: 'form.field.label.yearOfBirth'
  },
  prefixAround: {
    defaultMessage: 'Around',
    description: 'Label for prefix around in field: getYearOfBirth',
    id: 'form.field.label.prefixAround'
  },
  fathersDetailsExist: {
    defaultMessage: "Father's details are not available",
    description: "Question to ask the user if they have the father's details",
    id: 'form.field.label.fathersDetailsExist'
  },
  ageOfFather: {
    defaultMessage: 'Age of father',
    description: 'Label for form field: Age of father',
    id: 'form.field.label.ageOfFather'
  },
  documentsName: {
    defaultMessage: 'Documents',
    description: 'Form section name for Documents',
    id: 'form.section.documents.name'
  },
  documentsParagraph: {
    defaultMessage: 'The following documents are required',
    description: 'Documents Paragraph text',
    id: 'form.section.documents.birth.requirements'
  },
  proofOfBirth: {
    defaultMessage: 'Proof of birth',
    description: 'Label for list item Proof of birth',
    id: 'form.field.label.proofOfBirth'
  },
  docTypeChildBirthProof: {
    defaultMessage: 'Notification of birth (Recto)',
    description: 'Label for select option Notification of birth',
    id: 'form.field.label.docTypeChildBirthProof'
  },
  docTypeChildBirthProofVerso: {
    defaultMessage: 'Notification of birth (Verso)',
    description: 'Label for select option Notification of birth (verso)',
    id: 'form.field.label.docTypeChildBirthVersoProof'
  },
  docTypeAdoption: {
    defaultMessage: 'Adoption Letter',
    description: 'Label for select option radio option Adoption Letter',
    id: 'form.field.label.docTypeAdoption'
  },
  docTypeLivretDeFamille: {
    defaultMessage: 'Livret de Famille',
    description: 'Label for select option radio option Livret de Famille',
    id: 'form.field.label.docTypeLivretDeFamille'
  },
  proofOfRecognition: {
    defaultMessage: 'Proof of recognition',
    description: 'Label for list item Recognition Proof',
    id: 'form.field.label.proofOfRecognition'
  },
  proofOfMothersID: {
    defaultMessage: "Mother's identity",
    description: 'Label for list item Mother ID Proof',
    id: 'form.field.label.proofOfMothersID'
  },
  docTypeNID: {
    defaultMessage: 'National ID',
    description: 'Label for select option radio option NID',
    id: 'form.field.label.docTypeNID'
  },
  docTypePassport: {
    defaultMessage: 'Passport',
    description: 'Label for radio option Passport',
    id: 'form.field.label.docTypePassport'
  },
  docTypeBirthCert: {
    defaultMessage: 'Birth certificate',
    description: 'Label for select option birth certificate',
    id: 'form.field.label.docTypeBirthCert'
  },
  docTypeRecognitionAct: {
    defaultMessage: 'Recognition act',
    description: 'Label for select option Recognition act',
    id: 'form.field.label.docTypeRecognitionAct'
  },
  docTypeOther: {
    defaultMessage: 'Other',
    description: 'Label for radio option Other',
    id: 'form.field.label.docTypeOther'
  },
  proofOfFathersID: {
    defaultMessage: "Father's identity",
    description: 'Label for list item Father ID Proof',
    id: 'form.field.label.proofOfFathersID'
  },
  proofOfInformantsID: {
    defaultMessage: "Proof of informant's ID",
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.proofOfInformantsID'
  },
  otherBirthSupportingDocuments: {
    defaultMessage: 'Other',
    description: 'Option for other supporting documents',
    id: 'form.field.label.otherBirthSupportingDocuments'
  },
  legalGuardianProof: {
    defaultMessage: 'Proof of legal guardianship',
    description: 'Label for document option Proof of legal guardianship',
    id: 'form.field.label.legalGuardianProof'
  },
  assignedResponsibilityProof: {
    defaultMessage: 'Proof of assigned responsibility',
    description: 'Label for docuemnt option Proof of assigned responsibility',
    id: 'form.field.label.assignedResponsibilityProof'
  },
  // registrationName: {},
  // registrationTitle: {},
  registrationName: {
    defaultMessage: 'Registration Name',
    description: 'Label for registration name',
    id: 'form.field.label.registrationName'
  },
  informantTitle: {
    defaultMessage: "Informant's details",
    description: 'Label for informant details',
    id: 'form.field.label.informantTitle'
  },
  reviewLabelMainContact: {
    defaultMessage: 'Main Contact',
    description: 'Label for point of contact on the review page',
    id: 'form.review.label.mainContact'
  },
  selectContactPoint: {
    defaultMessage: 'Who is the main point of contact for this declaration?',
    description: 'Form section title for contact point',
    id: 'register.SelectContactPoint.heading'
  },
  deceasedName: {
    defaultMessage: 'Deceased',
    description: 'Form section name for Deceased',
    id: 'form.section.deceased.name'
  },
  relationshipToDeceased: {
    defaultMessage: 'Relationship to deceased',
    description: 'Relationship of applicant to the deceased person',
    id: 'form.section.deceased.relationship'
  },
  deceasedTitle: {
    defaultMessage: 'What are the deceased details?',
    description: 'Form section title for Deceased',
    id: 'form.section.deceased.title'
  },
  ageOfDeceased: {
    defaultMessage: 'Age of deceased',
    description: 'Label for form field: Age of deceased',
    id: 'form.field.label.ageOfDeceased'
  },
  firstName: {
    defaultMessage: 'First name',
    description: "Input label for certificate collector's first name",
    id: 'form.field.label.firstName'
  },
  maritalStatus: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  deathEventName: {
    defaultMessage: 'Death event details',
    description: 'Form section name for Death Event',
    id: 'form.section.deathEvent.name'
  },
  deathEventTitle: {
    defaultMessage: 'Death details?',
    description: 'Form section title for Death Event',
    id: 'form.section.deathEvent.title'
  },
  deathEventDate: {
    defaultMessage: 'Date of death',
    description: 'Form section title for date of Death Event',
    id: 'form.section.deathEvent.date'
  },
  manner: {
    defaultMessage: 'Manner of death',
    description: 'Label for form field: Manner of death',
    id: 'form.field.label.mannerOfDeath'
  },
  mannerNatural: {
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathNatural'
  },
  mannerAccident: {
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathAccident'
  },
  mannerSuicide: {
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathSuicide'
  },
  mannerHomicide: {
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathHomicide'
  },
  mannerUndetermined: {
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathUndetermined'
  },
  causeOfDeathEstablished: {
    defaultMessage: 'Cause of death has been established',
    description: 'Label for form field: Cause of Death Established',
    id: 'form.field.label.causeOfDeathEstablished'
  },
  causeOfDeathMethod: {
    defaultMessage: 'Source of cause of death',
    description: 'Source of cause of death',
    id: 'form.field.label.causeOfDeathMethod'
  },
  layReported: {
    defaultMessage: 'Lay reported',
    description: 'Label for form field: Lay reported',
    id: 'form.field.label.layReported'
  },
  verbalAutopsy: {
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: verbalAutopsy',
    id: 'form.field.label.verbalAutopsy'
  },
  medicallyCertified: {
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death',
    id: 'form.field.label.medicallyCertified'
  },
  deathDescription: {
    defaultMessage: 'Description',
    description:
      'Description of cause of death by lay person or verbal autopsy',
    id: 'form.field.label.deathDescription'
  },
  placeOfDeath: {
    defaultMessage: 'Where did the death occur?',
    description: 'Label for form field: Place of occurrence of death',
    id: 'form.field.label.placeOfDeath'
  },
  placeOfDeathSameAsPrimary: {
    defaultMessage: "Deceased's usual place of residence",
    description:
      'Option for place of occurrence of death same as deceased primary address  ',
    id: 'form.field.label.placeOfDeathSameAsPrimary'
  },
  informantName: {
    defaultMessage: 'Informant',
    description: 'Form section name for Informant',
    id: 'form.section.informant.name'
  },
  deathInformantTitle: {
    defaultMessage: "Informant's details?",
    description: 'Form section title for informants',
    id: 'form.section.informant.title'
  },
  documentsTitle: {
    defaultMessage: 'Attach supporting documents',
    description: 'Form section title for Documents',
    id: 'form.section.documents.title'
  },
  deceasedParagraph: {
    defaultMessage:
      'For this death registration, the following documents are required:',
    description: 'Documents Paragraph text',
    id: 'form.field.label.deceasedDocumentParagraph'
  },
  deathProofFromFokontany: {
    defaultMessage: 'Proof of death of from Fokontany',
    description:
      'Option for radio group field: Proof of death of from Fokontany',
    id: 'form.field.label.deathProofFromFokontany'
  },
  deceasedIDProof: {
    defaultMessage: "Proof of deceased's ID",
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedIDProof'
  },
  deceasedDeathProof: {
    defaultMessage: 'Proof of death of deceased',
    description: 'Option for radio group field: Type of Document To Upload',
    id: 'form.field.label.deceasedDeathProof'
  },
  docTypeLetterOfDeath: {
    defaultMessage: 'Attested letter of death',
    description: 'Label for select option Attested Letter of Death',
    id: 'form.field.label.docTypeLetterOfDeath'
  },
  docTypePoliceCertificate: {
    defaultMessage: 'Police certificate of death',
    description: 'Label for select option Police death certificate',
    id: 'form.field.label.docTypePoliceCertificate'
  },
  docTypeHospitalDeathCertificate: {
    defaultMessage: 'Hospital certificate of death',
    description: 'Label for select option Hospital certificate of death',
    id: 'form.field.label.docTypeHospitalDeathCertificate'
  },
  docTypeCoronersReport: {
    defaultMessage: "Coroner's report",
    description: "Label for select option Coroner's report",
    id: 'form.field.label.docTypeCoronersReport'
  },
  docTypeCopyOfBurialReceipt: {
    defaultMessage: 'Certified copy of burial receipt',
    description: 'Label for select option Certified Copy of Burial Receipt',
    id: 'form.field.label.docTypeCopyOfBurialReceipt'
  },
  causeOfDeathProof: {
    defaultMessage: 'Proof of cause of death',
    description: 'Label for doc section: Proof of cause of death',
    id: 'form.field.label.causeOfDeathProof'
  },
  verbalAutopsyReport: {
    defaultMessage: 'Verbal autopsy report',
    description: 'Option for form field: verbalAutopsyReport',
    id: 'form.field.label.verbalAutopsyReport'
  },
  groomName: {
    defaultMessage: 'Groom',
    description: 'Form section name for Groom',
    id: 'form.section.groom.name'
  },
  groomTitle: {
    defaultMessage: "Groom's details",
    description: 'Form section title for Groom',
    id: 'form.section.groom.title'
  },
  ageOfGroom: {
    defaultMessage: 'Age of groom',
    description: 'Label for form field: Age of groom',
    id: 'form.field.label.ageOfGroom'
  },
  marriedLastName: {
    defaultMessage: 'Married Last name (if different)',
    description: 'Label for married last name text input',
    id: 'form.field.label.marriedLastName'
  },
  lastNameAtBirth: {
    defaultMessage: 'Last name at birth (if different from above)',
    description: 'Label for a different last name text input',
    id: 'form.field.label.lastNameAtBirth'
  },
  brideName: {
    defaultMessage: 'Bride',
    description: 'Form section name for Bride',
    id: 'form.section.bride.name'
  },
  brideTitle: {
    defaultMessage: "Bride's details",
    description: 'Form section title for Bride',
    id: 'form.section.bride.title'
  },
  ageOfBride: {
    defaultMessage: 'Age of bride',
    description: 'Label for form field: Age of bride',
    id: 'form.field.label.ageOfBride'
  },
  marriageEventName: {
    defaultMessage: 'Marriage event details',
    description: 'Form section name for Marriage Event',
    id: 'form.section.marriageEvent.name'
  },
  marriageEventTitle: {
    defaultMessage: 'Marriage details?',
    description: 'Form section title for Marriage Event',
    id: 'form.section.marriageEvent.title'
  },
  marriageEventDate: {
    defaultMessage: 'Date of marriage',
    description: 'Form section title for date of Marriage Event',
    id: 'form.section.marriageEvent.date'
  },
  typeOfMarriage: {
    defaultMessage: 'Type of marriage',
    description: 'Option for form field: Type of marriage',
    id: 'form.field.label.typeOfMarriage'
  },
  monogamy: {
    defaultMessage: 'Monogamous',
    description: 'Option for form field: Monogamy',
    id: 'form.field.label.monogamy'
  },
  polygamy: {
    defaultMessage: 'Polygamous',
    description: 'Option for form field: Polygamy',
    id: 'form.field.label.polygamy'
  },
  placeOfMarriage: {
    defaultMessage: 'Place of marriage',
    description: 'Label for form field: Place of occurrence of marriage',
    id: 'form.field.label.placeOfMarriage'
  },
  witnessOneName: {
    defaultMessage: 'Witness 1',
    description: 'Form section name for Witness one',
    id: 'form.section.witnessOne.name'
  },
  witnessTwoName: {
    defaultMessage: 'Witness 2',
    description: 'Form section name for Witness two',
    id: 'form.section.witnessTwo.name'
  },
  witnessOneTitle: {
    defaultMessage: 'What are the witnesses one details?',
    description: 'Form section title for witnesses',
    id: 'form.section.witnessOne.title'
  },
  relationshipToSpouses: {
    defaultMessage: 'Relationship to spouses',
    description: "Input label for witness's relationship with spouses",
    id: 'form.field.label.relationshipToSpouses'
  },
  headOfGroomFamily: {
    defaultMessage: "Head of groom's family",
    description: 'Form select option for witness relationship',
    id: 'form.section.groom.headOfGroomFamily'
  },
  other: {
    defaultMessage: 'Other',
    description: 'Option for form field: Other',
    id: 'form.field.label.other'
  },
  witnessTwoTitle: {
    defaultMessage: 'What are the witnesses two details?',
    description: 'Form section title for witnesses',
    id: 'form.section.witnessTwo.title'
  },
  headOfBrideFamily: {
    defaultMessage: "Head of bride's family",
    description: 'Form select option for witness relationship',
    id: 'form.section.bride.headOfBrideFamily'
  },
  proofOfMarriageNotice: {
    defaultMessage: 'Notice of intention to marriage',
    description: 'Label for list item notice of marriage',
    id: 'form.field.label.proofOfMarriageNotice'
  },
  docTypeMarriageNotice: {
    defaultMessage: 'Notice of marriage',
    description: 'Label for document section for marriage notice',
    id: 'form.field.label.docTypeMarriageNotice'
  },
  proofOfGroomsID: {
    defaultMessage: "Proof of Groom's identity",
    description: 'Label for list item Groom ID Proof',
    id: 'form.field.label.proofOfGroomsID'
  },
  proofOfBridesID: {
    defaultMessage: "Proof of Bride's identity",
    description: 'Label for list item Bride ID Proof',
    id: 'form.field.label.proofOfBridesID'
  },
  iDTypePassport: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  iDTypeDrivingLicense: {
    defaultMessage: 'Drivers License',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeDrivingLicense'
  },
  iDTypeBRN: {
    defaultMessage: 'Birth registration number (in English)',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBRN'
  },
  iDTypeRefugeeNumber: {
    defaultMessage: 'Refugee Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeRefugeeNumber'
  },
  iDTypeAlienNumber: {
    defaultMessage: 'Alien Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeAlienNumber'
  },
  iDTypeNoId: {
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNoID'
  },
  iDTypeOther: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  },
  helperTextNID: {
    defaultMessage:
      'The National ID can only be numeric and must be 10 digits long',
    description: 'Helper text for nid input field',
    id: 'form.field.helpertext.nid'
  },
  tooltipNationalID: {
    defaultMessage:
      'The National ID can only be numeric and must be 10 digits long',
    description: 'Tooltip for form field: iD number',
    id: 'form.field.tooltip.tooltipNationalID'
  },
  iD: {
    defaultMessage: 'ID Number',
    description: 'Label for form field: ID Number',
    id: 'form.field.label.iD'
  },
  iDTypeDRN: {
    defaultMessage: 'Death Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeDRN'
  },
  nui: {
    defaultMessage: 'NUI',
    description: 'text for generated NUI form field',
    id: 'form.field.label.NUI'
  },
  generateNUI: {
    defaultMessage: 'Generate NUI',
    description: 'text for NUI button form field',
    id: 'form.field.label.generateNUI'
  },
  generatingNUI: {
    defaultMessage: 'Generating...',
    description: 'Label for form field: Generating NUI',
    id: 'form.field.label.generatingNUI'
  }
}

export function getMotherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getFatherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getDateOfMarriageLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  }
}

export const mentionMessageDescriptors = {
  sectionName: {
    defaultMessage: 'Marginal notes',
    description: 'Form section name for Mention',
    id: 'form.section.mention.name'
  },
  sectionTitle: {
    defaultMessage: 'Marginal notes',
    description: 'Form section title for Mention',
    id: 'form.section.mention.title'
  },
  typeOfMention: {
    id: 'form.field.label.typeOfMention',
    defaultMessage: 'Type of marginal note',
    description: 'Label for Type of marginal note'
  },
  // TODO: add the following messages in client.csv
  RECOGNITION: {
    id: 'form.field.label.mentionType.recognition',
    defaultMessage: 'Recognition',
    description: 'Label for mention type Recognition'
  },
  SIMPLE_ADOPTION: {
    id: 'form.field.label.mentionType.simpleAdoption',
    defaultMessage: 'Simple adoption',
    description: 'Label for mention type Simple adoption'
  },
  JUDICIAL_ADOPTION: {
    id: 'form.field.label.mentionType.judicialAdoption',
    defaultMessage: 'Judicial adoption',
    description: 'Label for mention type Judicial adoption'
  },
  NAME_CHANGE: {
    id: 'form.field.label.mentionType.nameChange',
    defaultMessage: 'Name change',
    description: 'Label for mention type Name change'
  },
  MARRIAGE: {
    id: 'form.field.label.mentionType.marriage',
    defaultMessage: 'Marriage',
    description: 'Label for mention type Marriage'
  },
  DIVORCE: {
    id: 'form.field.label.mentionType.divorce',
    defaultMessage: 'Divorce',
    description: 'Label for mention type Divorce'
  },
  REJECTION: {
    id: 'form.field.label.mentionType.rejection',
    defaultMessage: 'Rejection',
    description: 'Label for mention type Rejection'
  },
  DEATH: {
    id: 'form.field.label.mentionType.death',
    defaultMessage: 'Death',
    description: 'Label for mention type Death'
  },
  actNumber: {
    id: 'form.field.label.mention.actNumber',
    defaultMessage:
      '{type, select, RECOGNITION{Recognition} SIMPLE_ADOPTION{Simple adoption} JUDICIAL_ADOPTION{Adoption} NAME_CHANGE{Name change} MARRIAGE{Marriage} DIVORCE{Divorce} REJECTION{Rejection} DEATH{Death} other{Other}} Act number',
    description: 'Label for mention act number'
  },
  dateOfMention: {
    id: 'form.field.label.mention.dateOfMention',
    defaultMessage:
      'Date of {type, select, RECOGNITION{recognition} SIMPLE_ADOPTION{adoption} JUDICIAL_ADOPTION{registration of the judicial act at the commune} NAME_CHANGE{registration of the judicial act at the commune} MARRIAGE{marriage} DIVORCE{registration of the judicial act at the commune} REJECTION{Rejection} DEATH{registration of the death at the municipality} other{Other}}',
    description: 'Label for mention date'
  },
  placeOfMention: {
    id: 'form.field.label.mention.placeOfMention',
    defaultMessage:
      'Name of the commune where {type, select, RECOGNITION{recognition} MARRIAGE{marriage} DEATH{death} other{other}} was done',
    description: 'Label for mention place'
  },
  adoptiveParent: {
    id: 'form.field.label.mention.adoptiveParent',
    defaultMessage: 'Adoptive parent {number}',
    description: 'Label for adoptive parent header'
  },
  judgementDecisionNumber: {
    id: 'form.field.label.mention.judgmentDecisionNumber',
    defaultMessage: 'Judgement decision number',
    description: 'Label for Judgement decision number'
  },
  judgementDecisionDate: {
    id: 'form.field.label.mention.judgmentDecisionDate',
    defaultMessage: 'Judgement decision date',
    description: 'Label for Judgement decision date'
  },
  tribunalOfFirstInstanceAct: {
    id: 'form.field.label.mention.tribunalOfFirstInstanceAct',
    defaultMessage: 'Tribunal of first instance act',
    description: 'Label for Tribunal of first instance act'
  },
  brideOrGroom: {
    id: 'form.field.label.mention.brideOrGroom',
    defaultMessage: 'Bride/Groom',
    description: 'Label for Bride/Groom'
  },
  wifeOrHusband: {
    id: 'form.field.label.mention.wifeOrHusband',
    defaultMessage: 'Wife/Husband',
    description: 'Label for Wife/Husband'
  },
  modification: {
    id: 'form.field.label.mention.modification',
    defaultMessage:
      'Any modification : name of the child/name of father/name of mother',
    description: 'Label for modification'
  },
  placeOfDeath: {
    id: 'form.field.label.mention.placeOfDeath',
    defaultMessage: 'Commune of death',
    description: 'Label for place of death'
  },
  notes: {
    id: 'form.field.label.mention.notes',
    defaultMessage: 'Notes',
    description: 'Label for notes'
  },
  mentionDetailsExist: {
    id: 'form.field.label.mentionDetailsExist',
    defaultMessage: 'Mention details exist',
    description: 'Label for Mention details exist checkbox'
  },
  typeMention: {
    id: 'form.preview.group.label.typeMention',
    defaultMessage: 'Details of the mention {i}',
    description: 'Label for details preview group title'
  },
  recognitionFatherFirstName: {
    id: 'form.field.label.mention.fatherFirstName',
    defaultMessage: 'Father first name',
    description: 'Label for father first name field'
  },
  recognitionFatherLastName: {
    id: 'form.field.label.mention.fatherLastName',
    defaultMessage: 'Father last name',
    description: 'Label for father last name field'
  }
}
