// Copypasted types from @opencrvs/commons
// For this reason, here are shortcuts and `!` assertions, as we haven't copypasted ALL types from @opencrvs/commons

declare const __nominal__type: unique symbol
type Nominal<Type, Identifier extends string> = Type & {
  readonly [__nominal__type]: Identifier
}

type FhirResourceType =
  | fhir3.FhirResource['resourceType']
  | 'TaskHistory'
  | 'CompositionHistory'

type UUID = Nominal<string, 'UUID'>

// Patient/${UUID}
type ResourceIdentifier<
  Resource extends { resourceType: FhirResourceType } = {
    resourceType: FhirResourceType
  }
> = `${Resource['resourceType']}/${UUID}`

export type TrackingID = Nominal<string, 'TrackingID'>
export type RegistrationNumber = Nominal<string, 'RegistrationNumber'>

export type TaskStatus =
  | 'IN_PROGRESS'
  | 'ARCHIVED'
  | 'DECLARED'
  | 'DECLARATION_UPDATED'
  | 'WAITING_VALIDATION'
  | 'CORRECTION_REQUESTED'
  | 'VALIDATED'
  | 'REGISTERED'
  | 'CERTIFIED'
  | 'REJECTED'
  | 'ISSUED'
export type Resource = fhir3.Resource
export type Task = Omit<
  fhir3.Task,
  | 'lastModified'
  | 'status'
  | 'extension'
  | 'businessStatus'
  | 'intent'
  | 'identifier'
  | 'code'
> & {
  lastModified: string
  status: 'ready' | 'requested' | 'draft' | 'accepted' | 'rejected'
  // Keeping this any, as it may be not be required to be typed for now
  extension: Array<any>
  businessStatus: Omit<fhir3.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/reg-status'
        code: TaskStatus
      }
    >
  }
  intent?: fhir3.Task['intent']
  // Keeping this any, as it may be not be required to be typed for now
  identifier: Array<any>
  code: Omit<fhir3.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/types'
        code: 'BIRTH' | 'DEATH' | 'MARRIAGE'
      }
    >
  }
  // This field is missing from the fhir3 spec
  // @todo Where exactly it's used?
  encounter?: fhir3.Reference
}

export type SavedTask = Omit<Task, 'focus' | 'id'> & {
  id: UUID
  focus: {
    reference: ResourceIdentifier
  }
}

export function isComposition<T extends Resource>(
  resource: T
): resource is T & fhir3.Composition & { id: UUID } {
  return resource.resourceType === 'Composition'
}

export function getComposition<T extends fhir3.Bundle>(bundle: T) {
  const composition = bundle
    .entry!.map(({ resource }) => resource!)
    .find(isComposition)

  if (!composition) {
    throw new Error('Composition not found in bundle')
  }

  return composition
}

export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

const DETECT_EVENT: Record<string, EVENT_TYPE> = {
  'birth-notification': EVENT_TYPE.BIRTH,
  'birth-declaration': EVENT_TYPE.BIRTH,
  'death-notification': EVENT_TYPE.DEATH,
  'death-declaration': EVENT_TYPE.DEATH,
  'marriage-notification': EVENT_TYPE.MARRIAGE,
  'marriage-declaration': EVENT_TYPE.MARRIAGE
}

function getTaskEventType(task: Task) {
  const eventType = task?.code?.coding?.[0].code
  return eventType
}

function getCompositionEventType(composition: fhir3.Composition) {
  const eventType = composition?.type?.coding?.[0].code
  return eventType && DETECT_EVENT[eventType]
}

export function getEventType(fhirBundle: fhir3.Bundle) {
  if (fhirBundle.entry && fhirBundle.entry[0] && fhirBundle.entry[0].resource) {
    const firstEntry = fhirBundle.entry[0].resource
    if (firstEntry.resourceType === 'Composition') {
      return getCompositionEventType(
        firstEntry as fhir3.Composition
      ) as EVENT_TYPE
    } else {
      return getTaskEventType(firstEntry as Task) as EVENT_TYPE
    }
  }

  throw new Error('Invalid FHIR bundle found')
}

function getFromBundleById(bundle: fhir3.Bundle, id: string) {
  const resource = bundle.entry?.find((item) => item.resource?.id === id)

  if (!resource) {
    throw new Error('Resource not found in bundle with id ' + id)
  }

  if (!resource.fullUrl) {
    throw new Error(
      'A resource was found but it did not have a fullUrl. This should not happen.'
    )
  }

  return resource
}

function findCompositionSection<T extends fhir3.Composition>(
  code: string,
  composition: T
) {
  return composition.section!.find((section) =>
    section.code!.coding!.some((coding) => coding.code === code)
  )
}

export function findEntry(
  code: string,
  composition: fhir3.Composition,
  bundle: fhir3.Bundle
) {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return undefined
  }
  const reference = patientSection.entry[0].reference
  return getFromBundleById(bundle, reference!.split('/')[1]).resource
}

export function getChild(record: fhir3.Bundle) {
  const composition = getComposition(record)
  return findEntry('child-details', composition, record) as fhir3.Patient
}

export function findQuestionnaireResponse(record: fhir3.Bundle, item: string) {
  const questionnaireResponses = record.entry?.find(
    ({ resource }) => resource?.resourceType === 'QuestionnaireResponse'
  )?.resource as fhir3.QuestionnaireResponse | undefined

  return questionnaireResponses?.item?.find(({ text }) => text === item)
    ?.answer?.[0].valueString
}
