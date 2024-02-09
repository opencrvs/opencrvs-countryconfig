import ShortUIDGen from 'short-uid'

const EVENTS = {
  BIRTH: 'BIRTH' as const,
  DEATH: 'DEATH' as const,
  MARRIAGE: 'MARRIAGE' as const
}
type ValueOf<T> = T[keyof T]
type EVENT_TYPE = ValueOf<typeof EVENTS>

const FHIR_TO_OPENCRVS_EVENT_MAP = {
  'birth-notification': EVENTS.BIRTH,
  'birth-declaration': EVENTS.BIRTH,
  'death-notification': EVENTS.DEATH,
  'death-declaration': EVENTS.DEATH,
  'marriage-notification': EVENTS.MARRIAGE,
  'marriage-declaration': EVENTS.MARRIAGE
}

function getCompositionEventType(composition: fhir.Composition) {
  const eventType = composition?.type?.coding?.[0]
    .code as keyof typeof FHIR_TO_OPENCRVS_EVENT_MAP
  return eventType && (FHIR_TO_OPENCRVS_EVENT_MAP[eventType] as EVENT_TYPE)
}

function getEventType(fhirBundle: fhir.Bundle) {
  const composition = fhirBundle.entry?.find(
    (item) => item.resource?.resourceType === 'Composition'
  )?.resource as fhir.Composition
  if (composition) {
    return getCompositionEventType(composition as fhir.Composition)
  }
  throw new Error('Composition not found in FHIR bundle')
}

export function generateTrackingId(bundle: fhir.Bundle): string {
  const eventType = getEventType(bundle)
  // using first letter of eventType for prefix
  // TODO: for divorce, need to think about prefix as Death & Divorce prefix is same 'D'
  const prefix = eventType.charAt(0)
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}
