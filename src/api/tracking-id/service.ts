import * as ShortUIDGen from 'short-uid'

export function generateTrackingId(eventType: string): string {
  // using first letter of eventType for prefix
  // TODO: for divorce, need to think about prefix as Death & Divorce prefix is same 'D'
  const prefix = eventType.charAt(0)
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}
