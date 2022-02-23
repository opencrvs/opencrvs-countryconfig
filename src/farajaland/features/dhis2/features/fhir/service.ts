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
import { v4 as uuid } from 'uuid'

export interface IIncomingAddress {
  division: {
    id: string
    name: string
  }
  district: {
    id: string
    name: string
  }
  upazila: {
    id: string
    name: string
  }
  city_corporation: {
    id: string
    name: string
  }
  municipality: {
    id: string
    name: string
  }
  ward: {
    id: string
    name: string
  }
  union: {
    id: string
    name: string
  }
}

export function createBundle(entries: fhir.BundleEntry[], lastModified: Date) {
  return {
    resourceType: 'Bundle',
    type: 'document',
    meta: {
      lastUpdated: lastModified.toISOString()
    },
    entry: entries
  }
}

export function createBirthComposition(
  childSectionRef: string,
  motherSectionRef: string,
  fatherSectionRef: string,
  encounterSectionRef: string,
  createdAt: Date
) {
  const composition = createComposition(
    'BIRTH',
    childSectionRef,
    encounterSectionRef,
    createdAt
  )
  composition.resource.section = composition.resource.section.concat([
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
      entry: [{ reference: motherSectionRef }]
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
      entry: [{ reference: fatherSectionRef }]
    }
  ])
  return composition
}

export function createDeathComposition(
  deceasedSectionRef: string,
  motherSectionRef: string,
  fatherSectionRef: string,
  informantSectionRef: string,
  encounterSectionRef: string,
  createdAt: Date
) {
  const composition = createComposition(
    'DEATH',
    deceasedSectionRef,
    encounterSectionRef,
    createdAt
  )
  composition.resource.section = composition.resource.section.concat([
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
      entry: [{ reference: motherSectionRef }]
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
      entry: [{ reference: fatherSectionRef }]
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
      entry: [{ reference: informantSectionRef }]
    }
  ])
  return composition
}

function createComposition(
  eventType: 'BIRTH' | 'DEATH',
  subjectRef: string,
  encounterSectionRef: string,
  createdAt: Date
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: `urn:uuid:${uuid()}`
      },
      resourceType: 'Composition',
      status: 'final',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-types',
            // TODO add support for notification event detection in workflow 'death-notification'
            code:
              eventType === 'BIRTH'
                ? 'birth-notification'
                : 'death-notification'
          }
        ],
        text:
          eventType === 'BIRTH' ? 'Birth Notification' : 'Death Notification'
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
        reference: subjectRef
      },
      date: createdAt.toISOString(),
      author: [],
      title:
        eventType === 'BIRTH' ? 'Birth Notification' : 'Death Notification',
      section: [
        {
          title: eventType === 'BIRTH' ? 'Child details' : 'Deceased details',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code:
                  eventType === 'BIRTH' ? 'child-details' : 'deceased-details'
              }
            ],
            text: eventType === 'BIRTH' ? 'Child details' : 'Deceased details'
          },
          entry: [{ reference: subjectRef }]
        },
        {
          title: eventType === 'BIRTH' ? 'Birth encounter' : 'Death encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code:
                  eventType === 'BIRTH' ? 'birth-encounter' : 'death-encounter'
              }
            ],
            text: eventType === 'BIRTH' ? 'Birth encounter' : 'Death encounter'
          },
          entry: [{ reference: encounterSectionRef }]
        }
      ]
    }
  }
}

export function createRelatedPersonEntry(
  relationShipType: string,
  informantEntryRef: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'RelatedPerson',
      relationship: {
        coding: [
          {
            system:
              'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
            code: relationShipType
          }
        ]
      },
      patient: {
        reference: informantEntryRef
      }
    }
  }
}

export async function createPersonEntry(
  nid: string | null,
  firstNames: [string] | null,
  lastName: string,
  gender: 'male' | 'female' | 'unknown',
  phoneNumber: string | null,
  birthDate: string | null,
  deathDate: string | null
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Patient',
      active: true,
      identifier: nid
        ? [
            {
              use: 'official',
              type: 'NATIONAL_ID',
              value: nid
            }
          ]
        : [],
      name: [
        {
          use: 'en',
          family: (lastName && [lastName]) || [''],
          given: firstNames || ['']
        }
      ],
      gender,
      telecom: phoneNumber
        ? [
            {
              use: 'mobile',
              system: 'phone',
              value: phoneNumber
            }
          ]
        : [],
      // Date values are expected to YYYY-MM-DD from DHIS2
      birthDate: birthDate,
      deceasedBoolean: !!deathDate,
      // Date values are expected to YYYY-MM-DD from DHIS2
      deceasedDateTime: deathDate,
      multipleBirthInteger: 2,
      maritalStatus: {
        coding: [
          {
            system: `http://hl7.org/fhir/StructureDefinition/marital-status`,
            code: 'M'
          }
        ],
        text: 'MARRIED'
      }
    }
  }
}

export function createBirthEncounterEntry(
  locationRef: string,
  subjectRef: string
) {
  return {
    fullUrl: 'urn:uuid:<uuid>', // use this to refer to the resource before it's created
    resource: {
      resourceType: 'Encounter',
      status: 'finished',
      class: {
        system: 'http://hl7.org/fhir/v3/ActCode',
        code: 'OBS',
        display: 'Obstetrics'
      },
      type: [
        {
          coding: [
            {
              system: 'http://opencrvs.org/encounter-type',
              code: 'birth-encounter',
              display: 'Birth Encounter'
            }
          ]
        }
      ],
      location: [
        {
          location: {
            reference: locationRef
          }
        }
      ],
      subject: {
        reference: subjectRef
      }
    }
  }
}

export function createBirthWeightObservation(
  encounterRef: string,
  birthWeight: number
) {
  return {
    fullUrl: 'urn:uuid:<uuid>', // use this to refer to the resource before it's created
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '3141-9',
            display: 'Body weight Measured'
          }
        ]
      },
      valueQuantity: {
        value: birthWeight,
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      }
    } as fhir.Observation
  }
}

export function createDeathEncounterEntry(
  locationRef: string,
  subjectRef: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`, // use this to refer to the resource before it's created
    resource: {
      resourceType: 'Encounter',
      status: 'finished',
      class: {
        system: 'http://hl7.org/fhir/v3/ActCode',
        code: 'OBS',
        display: 'Obstetrics'
      },
      type: [
        {
          coding: [
            {
              system: 'http://opencrvs.org/encounter-type',
              code: 'death-encounter',
              display: 'Death Encounter'
            }
          ]
        }
      ],
      location: [
        {
          location: {
            reference: locationRef
          }
        }
      ],
      subject: {
        reference: subjectRef
      }
    }
  }
}

export async function createTaskEntry(
  compositionRef: string,
  lastRegLocation: fhir.Location,
  eventType: 'BIRTH' | 'DEATH',
  contactPerson: string,
  contactNumber: string,
  dhis2Identifier: string | undefined,
  createdAt: Date
) {
  const taskResource: fhir.Task = {
    resourceType: 'Task',
    status: 'draft',
    intent: 'unknown',
    code: {
      coding: [{ system: 'http://opencrvs.org/specs/types', code: eventType }]
    },
    focus: {
      reference: compositionRef
    },
    extension: [
      {
        url: 'http://opencrvs.org/specs/extension/contact-person',
        valueString: contactPerson
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
        valueString: contactNumber
      },
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      {
        url: 'http://opencrvs.org/specs/extension/in-complete-fields',
        valueString: 'N/A' // don't want to populate any list for notifications
      }
    ],
    lastModified: createdAt.toISOString()
  }

  if (lastRegLocation.id) {
    taskResource.extension?.push({
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: {
        reference: `Location/${lastRegLocation.id}`
      }
    })

    taskResource.extension?.push({
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: `Location/${lastRegLocation.id}`
      }
    })
  }

  if (dhis2Identifier) {
    taskResource.identifier = [
      {
        system: 'http://opencrvs.org/specs/id/dhis2_event_identifier',
        value: dhis2Identifier
      }
    ]
  }
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: taskResource
  }
}

export function createDeathObservation(
  encounterRef: string,
  causeOfDeath: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: 'ICD10',
            display: 'Cause of death'
          }
        ]
      },
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://hl7.org/fhir/ValueSet/icd-10',
            code: causeOfDeath
          }
        ]
      }
    }
  }
}

export function createPresentAtEventObservation(
  encounterRef: string,
  presentAtEvent: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      category: {
        coding: [
          {
            system: 'http://hl7.org/fhir/observation-category',
            code: 'procedure',
            display: 'Procedure'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: 'present-at-birth-reg',
            display: 'Present at birth registration'
          }
        ]
      },
      valueString: presentAtEvent
    }
  }
}
export function createWeightAtBirthObservation(encounterRef: string) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '3141-9',
            display: 'Body weight Measured'
          }
        ]
      },
      valueQuantity: {
        value: 0.9,
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      }
    }
  }
}

export function createAttendantAtBirthObservation(encounterRef: string) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'procedure',
              display: 'Procedure'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '73764-3',
            display: 'Birth attendant title'
          }
        ]
      },
      valueString: 'PHYSICIAN'
    }
  }
}

export function getIDFromResponse(resBody: fhir.Bundle): string {
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR did not send a valid response`)
  }
  // return the Composition's id
  return resBody.entry[0].response.location.split('/')[3]
}
