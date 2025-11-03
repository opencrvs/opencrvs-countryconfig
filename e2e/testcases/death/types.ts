export type DeathDeclaration = {
  _fhirIDMap: {
    composition: string
    encounter: string
    eventLocation: string
    observation: {
      causeOfDeathEstablished: string
      causeOfDeath: string
    }
    questionnaireResponse: string
  }
  id: string
  deceased: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    birthDate: string
    age: any | null
    ageOfIndividualInYears: any | null
    exactDateOfBirthUnknown: any | null
    gender: string
    maritalStatus: any | null
    occupation: any | null
    nationality: string[]
    identifier: { id: string; type: string; otherType: any | null }[]
    deceased: { deathDate: string }
    address: {
      type: string
      line: string[]
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }[]
  }
  informant: {
    id: string
    relationship: string
    otherRelationship: any | null
    _fhirIDPatient: string
    identifier: { id: string; type: string; otherType: any | null }[]
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    nationality: string[]
    occupation: any | null
    birthDate: string
    ageOfIndividualInYears: any | null
    exactDateOfBirthUnknown: any | null
    telecom: any | null
    address: {
      type: string
      line: string[]
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }[]
  }
  father: any | null
  mother: any | null
  spouse: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    birthDate: string
    maritalStatus: any | null
    occupation: any | null
    detailsExist: boolean
    reasonNotApplying: any | null
    ageOfIndividualInYears: any | null
    exactDateOfBirthUnknown: any | null
    dateOfMarriage: any | null
    educationalAttainment: any | null
    nationality: string[]
    identifier: {
      id: string
      type: string
      otherType: any | null
      fieldsModifiedByIdentity: any | null
    }[]
    address: {
      type: string
      line: string[]
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }[]
    telecom: any | null
  }
  medicalPractitioner: any | null
  registration: {
    id: string
    contact: any | null
    informantType: string
    otherInformantType: any | null
    contactRelationship: any | null
    contactPhoneNumber: any | null
    contactEmail: string
    duplicates: any | null
    informantsSignature: string
    informantsSignatureURI: string
    attachments: any | null
    status: {
      comments: any | null
      type: string
      timestamp: string
      office: {
        name: string
        alias: string[]
        address: any | null
        partOf: string
      }
    }[]
    type: string
    trackingId: string
    registrationNumber: string
  }
  eventLocation: { id: string; type: string; address: any | null }
  questionnaire: { fieldId: string; value: string }[]
  mannerOfDeath: any | null
  causeOfDeathEstablished: string
  causeOfDeathMethod: any | null
  causeOfDeath: string
  deathDescription: any | null
  maleDependentsOfDeceased: any | null
  femaleDependentsOfDeceased: any | null
  history: {
    documents: any[]
    payment: any | null
    otherReason: string
    requester: string
    hasShowedVerifiedDocument: boolean
    noSupportingDocumentationRequired: boolean
    date: string
    action: string | null
    regStatus: string
    dhis2Notification: boolean
    ipAddress: any | null
    statusReason: any | null
    reason: any | null
    location: { id: string; name: string }
    office: { id: string; name: string; alias: string[]; address: any | null }
    system: any | null
    user: {
      id: string
      role: { _id: string; labels: { lang: string; label: string }[] }
      systemRole: string
      name: { firstNames: string; familyName: string; use: string }[]
      avatar: any | null
    }
    signature: any | null
    comments: any[]
    input: any[]
    output: any[]
    certificates: any[]
    duplicateOf: any | null
    potentialDuplicates: any | null
  }[]
}
