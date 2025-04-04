import { AUTH_URL, GATEWAY_HOST } from '../../constants'
import fetch from 'node-fetch'

export async function getTokenForSystemClient(
  clientId: string,
  clientSecret: string
) {
  const authenticateResponse = await fetch(
    `${AUTH_URL}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': clientId + '-' + Date.now()
      }
    }
  )
  const res = await authenticateResponse.json()
  return res as { access_token: string }
}

export async function fetchEvents(trackingId: string, token: string) {
  const query = `
    query SearchEvents(
      $advancedSearchParameters: AdvancedSearchParametersInput!
    ) {
      searchEvents(
        advancedSearchParameters: $advancedSearchParameters
      ) {
        totalItems
      }
    }
  `

  const variables = {
    advancedSearchParameters: {
      trackingId
    }
  }

  const response = await fetch(GATEWAY_HOST + '/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ query, variables })
  })

  const data = await response.json()
  return data as { data: { searchEvents: { totalItems: number } } }
}

export async function getLocationById(fhirId: string) {
  const url = `${GATEWAY_HOST}/location/${fhirId}`

  const res = await fetch(url, {
    method: 'GET'
  })

  const response = await res.json()
  return response
}

export async function getOffices() {
  const resCRVSOffices = await fetch(
    `${GATEWAY_HOST}/location?type=CRVS_OFFICE&_count=0&status=active`
  )

  const officeList = await resCRVSOffices.json()
  return officeList?.entry
}

export const eventNotificationPayload = (
  officeId: string,
  districtId: string,
  stateId: string,
  facilityId: string
) => ({
  resourceType: 'Bundle',
  type: 'document',
  meta: {
    lastUpdated: '2022-08-14T14:43:47.000Z'
  },
  entry: [
    {
      fullUrl: 'urn:uuid:37dd8e55-69c0-493d-b1a0-b7462a1d806a',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '8f793c5a-3d53-4c9b-898b-1c04759716c6'
        },
        resourceType: 'Composition',
        status: 'final',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'birth-notification'
            }
          ],
          text: 'Birth Notification'
        },
        class: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/classes',
              code: 'crvs-document'
            }
          ],
          text: 'CRVS Document'
        },
        subject: {
          reference: 'urn:uuid:760c393e-4dc3-4572-83f6-b70765963ef1'
        },
        date: '2022-08-14T14:43:47.000Z',
        title: 'Birth Notification',
        section: [
          {
            title: 'Child details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'child-details'
                }
              ],
              text: 'Child details'
            },
            entry: [
              {
                reference: 'urn:uuid:760c393e-4dc3-4572-83f6-b70765963ef1'
              }
            ]
          },
          {
            title: 'Birth encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'birth-encounter'
                }
              ],
              text: 'Birth encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:7cb1d9cc-ea4b-4046-bea0-38bdf3082f56'
              }
            ]
          },
          {
            title: "Mother's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'mother-details'
                }
              ],
              text: "Mother's details"
            },
            entry: [
              {
                reference: 'urn:uuid:d9d3a8c8-6a47-47a1-be86-0493a4ec55a7'
              }
            ]
          },
          {
            title: "Informant's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'informant-details'
                }
              ],
              text: "Informant's details"
            },
            entry: [
              {
                reference: 'urn:uuid:b74fbd0e-8536-4c11-833d-781e89a4b553'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            entry: [
              {
                reference: 'urn:uuid:ad1e15bb-51da-449a-8a12-c7dae10728e4'
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:8546aaf3-8a60-4150-bc24-ab5579bc0fa2',
      resource: {
        resourceType: 'Task',
        status: 'draft',
        intent: 'unknown',
        identifier: [],
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:37dd8e55-69c0-493d-b1a0-b7462a1d806a'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260759205190'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'axon@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 0
          },
          {
            url: 'http://opencrvs.org/specs/extension/in-complete-fields',
            valueString: 'N/A'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: `Location/${officeId}`
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:760c393e-4dc3-4572-83f6-b70765963ef1',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            family: 'Min',
            given: ['Child']
          }
        ],
        gender: 'male',
        birthDate: '2022-06-29',
        deceasedBoolean: false,
        multipleBirthBoolean: false
      }
    },
    {
      fullUrl: 'urn:uuid:d9d3a8c8-6a47-47a1-be86-0493a4ec55a7',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            family: 'Ratke',
            given: ['Mom']
          }
        ],
        gender: 'female',
        birthDate: '2002-06-29',
        deceasedBoolean: false,
        multipleBirthBoolean: false,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'URBAN'],
            city: 'Meghnan',
            district: districtId,
            state: stateId,
            postalCode: '52275',
            country: 'FAR'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'urn:iso:std:iso:3166',
                      code: 'FAR'
                    }
                  ]
                }
              },
              {
                url: 'period',
                valuePeriod: {
                  start: '',
                  end: ''
                }
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b74fbd0e-8536-4c11-833d-781e89a4b553',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'MOTHER'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:d9d3a8c8-6a47-47a1-be86-0493a4ec55a7'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:ad1e15bb-51da-449a-8a12-c7dae10728e4',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            family: 'Ratke',
            given: ['Dad']
          }
        ],
        gender: 'male',
        birthDate: '2002-06-29',
        deceasedBoolean: false,
        multipleBirthBoolean: false,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'URBAN'],
            city: 'Meghnan',
            district: districtId,
            state: stateId,
            postalCode: '52275',
            country: 'FAR'
          }
        ],
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'urn:iso:std:iso:3166',
                      code: 'FAR'
                    }
                  ]
                }
              },
              {
                url: 'period',
                valuePeriod: {
                  start: '',
                  end: ''
                }
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:7cb1d9cc-ea4b-4046-bea0-38bdf3082f56',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: `Location/${facilityId}`
            }
          }
        ]
      }
    }
  ]
})
