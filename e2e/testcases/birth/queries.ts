import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'

export const CREATE_BIRTH_REGISTRATION = print(gql`
  mutation createBirthRegistration($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details) {
      trackingId
      compositionId
      isPotentiallyDuplicate
      __typename
    }
  }
`)

export const GET_BIRTH_REGISTRATION_FOR_REVIEW = print(gql`
  query fetchBirthRegistrationForReview($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        identifier {
          id
          type
          otherType
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
        birthDate
        gender
      }
      informant {
        id
        relationship
        otherRelationship
        _fhirIDPatient
        identifier {
          id
          type
          otherType
          fieldsModifiedByIdentity
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
        occupation
        nationality
        birthDate
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
      }
      mother {
        id
        name {
          use
          firstNames
          middleName
          familyName
        }
        multipleBirth
        birthDate
        maritalStatus
        occupation
        detailsExist
        reasonNotApplying
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
          fieldsModifiedByIdentity
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          middleName
          familyName
        }
        birthDate
        maritalStatus
        occupation
        detailsExist
        reasonNotApplying
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
          fieldsModifiedByIdentity
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        contactEmail
        duplicates {
          compositionId
          trackingId
        }
        informantsSignature
        attachments {
          data
          uri
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
          type
          timestamp
          office {
            name
            alias
            address {
              district
              state
            }
            partOf
          }
        }
        type
        trackingId
        registrationNumber
        mosipAid
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        id
        type
        address {
          line
          district
          state
          city
          postalCode
          country
        }
      }
      questionnaire {
        fieldId
        value
      }
      history {
        otherReason
        requester
        requesterOther
        noSupportingDocumentationRequired
        hasShowedVerifiedDocument
        date
        action
        regStatus
        dhis2Notification
        ipAddress
        documents {
          id
          data
          uri
          type
        }
        payment {
          id
          type
          amount
          outcome
          date
          attachmentURL
        }
        statusReason {
          text
        }
        reason
        location {
          id
          name
        }
        office {
          id
          name
          alias
          address {
            state
            district
          }
        }
        system {
          name
          type
        }
        user {
          id
          role {
            _id
            labels {
              lang
              label
            }
          }
          systemRole
          name {
            firstNames
            familyName
            use
          }
          avatar {
            data
            type
          }
        }
        signature {
          data
          type
        }
        comments {
          user {
            id
            username
            avatar {
              data
              type
            }
          }
          comment
          createdAt
        }
        input {
          valueCode
          valueId
          value
        }
        output {
          valueCode
          valueId
          value
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
            name {
              use
              firstNames
              familyName
            }
            telecom {
              system
              value
              use
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`)

export const REGISTER_BIRTH_DECLARATION = print(gql`
  mutation markBirthAsRegistered($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`)
