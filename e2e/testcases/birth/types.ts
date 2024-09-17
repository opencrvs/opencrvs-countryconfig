export type BirthInputDetails = {
  informant: {
    type: 'MOTHER' | 'FATHER' | 'BROTHER'
  }
  child: {
    firstNames: string
    familyName: string
    birthDate?: string
    gender: 'male' | 'female'
    birthType?: 'SINGLE' | 'MULTIPLE'
    weightAtBirth?: number
  }
  mother: {
    firstNames: string
    familyName: string
    birthDate?: string
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
  }
  father: {
    firstNames: string
    familyName: string
    birthDate?: string
  }
  attendant: {
    type: 'PHYSICIAN' | 'NURSE' | 'MIDWIFE' | 'OTHER'
  }
}

export type BirthDeclaration = {
  _fhirIDMap: {
    composition: string
    encounter: string
    eventLocation: string
    observation: {
      birthType: string
      weightAtBirth: string
      attendantAtBirth: string
    }
    questionnaireResponse: string
  }
  id: string
  child: {
    id: string
    identifier: {
      id: string
      type: string
      otherType: string | null
    }[]
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    birthDate: string
    gender: string
  }
  informant: {
    id: string
    relationship: string
    otherRelationship: string | null
    _fhirIDPatient: string
    identifier: {
      id: string
      type: string
      otherType: string | null
      fieldsModifiedByIdentity: string | null
    }[]
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    occupation: string | null
    nationality: string[]
    birthDate: string
    ageOfIndividualInYears: number | null
    exactDateOfBirthUnknown: boolean | null
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
  mother: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    multipleBirth: boolean | null
    birthDate: string
    maritalStatus: string
    occupation: string | null
    detailsExist: boolean
    reasonNotApplying: string | null
    ageOfIndividualInYears: number | null
    exactDateOfBirthUnknown: boolean | null
    dateOfMarriage: string | null
    educationalAttainment: string
    nationality: string[]
    identifier: {
      id: string
      type: string
      otherType: string | null
      fieldsModifiedByIdentity: string | null
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
    telecom: string | null
  }
  father: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName: string
      familyName: string
    }[]
    birthDate: string
    maritalStatus: string
    occupation: string | null
    detailsExist: boolean
    reasonNotApplying: string | null
    ageOfIndividualInYears: number | null
    exactDateOfBirthUnknown: boolean | null
    dateOfMarriage: string | null
    educationalAttainment: string
    nationality: string[]
    identifier: {
      id: string
      type: string
      otherType: string | null
      fieldsModifiedByIdentity: string | null
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
    telecom: string | null
  }
  registration: {
    id: string
    informantType: string
    otherInformantType: string | null
    contact: string | null
    contactRelationship: string | null
    contactPhoneNumber: string
    contactEmail: string
    duplicates: string | null
    informantsSignature: string
    informantsSignatureURI: string
    attachments: string | null
    status: {
      comments: string | null
      type: string
      timestamp: string
      office: {
        name: string
        alias: string[]
        address: string | null
        partOf: string
      }
    }[]
    type: string
    trackingId: string
    registrationNumber: string
    mosipAid: string | null
  }
  attendantAtBirth: string
  weightAtBirth: number
  birthType: string
  eventLocation: {
    id: string
    type: string
    address: {
      type: string
      line: string[]
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }
  }
  questionnaire: {
    fieldId: string
    value: string
  }[]
  history: {
    otherReason: string
    requester: string
    requesterOther: string
    noSupportingDocumentationRequired: boolean
    hasShowedVerifiedDocument: boolean
    date: string
    action: string | null
    regStatus: string
    dhis2Notification: boolean
    ipAddress: string | null
    documents: string[]
    payment: string | null
    statusReason: string | null
    reason: string | null
    location: {
      id: string
      name: string
    }
    office: {
      id: string
      name: string
      alias: string[]
      address: string | null
    }
    system: string | null
    user: {
      id: string
      role: {
        _id: string
        labels: {
          lang: string
          label: string
        }[]
      }
      systemRole: string
      name: {
        firstNames: string
        familyName: string
        use: string
      }[]
      avatar: string | null
    }
    signature: string | null
    comments: string[]
    input: string[]
    output: string[]
    certificates: string[]
    duplicateOf: string | null
    potentialDuplicates: string | null
  }[]
}
