import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'

export const CREATE_DEATH_REGISTRATION = print(gql`
  mutation createDeathRegistration($details: DeathRegistrationInput!) {
    createDeathRegistration(details: $details) {
      trackingId
      compositionId
      isPotentiallyDuplicate
      __typename
    }
  }
`)

export const GET_DEATH_REGISTRATION_FOR_REVIEW = print(gql`
  query fetchDeathRegistrationForReview($id: ID!) {
    fetchDeathRegistration(id: $id) {
      _fhirIDMap
      id
      deceased {
        id
        name {
          use
          firstNames
          middleName
          familyName
        }
        birthDate
        age
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        gender
        maritalStatus
        occupation
        nationality
        identifier {
          id
          type
          otherType
        }
        gender
        deceased {
          deathDate
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
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
        nationality
        occupation
        birthDate
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        telecom {
          system
          value
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
      mother {
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
      spouse {
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
      medicalPractitioner {
        name
        qualification
        lastVisitDate
      }
      registration {
        id
        contact
        informantType
        otherInformantType
        contactRelationship
        contactPhoneNumber
        contactEmail
        certificates {
          hasShowedVerifiedDocument
          certificateTemplateId
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
      }
      eventLocation {
        id
        type
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
      questionnaire {
        fieldId
        value
      }
      mannerOfDeath
      causeOfDeathEstablished
      causeOfDeathMethod
      causeOfDeath
      deathDescription
      maleDependentsOfDeceased
      femaleDependentsOfDeceased
      history {
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
        otherReason
        requester
        requesterOther
        hasShowedVerifiedDocument
        certificateTemplateId
        noSupportingDocumentationRequired
        date
        action
        regStatus
        dhis2Notification
        ipAddress
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
            id
            label {
              id
              defaultMessage
              description
            }
          }

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
          certificateTemplateId
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
          certifier {
            name {
              use
              firstNames
              familyName
            }
            role {
              id
              label {
                id
                defaultMessage
                description
              }
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`)
