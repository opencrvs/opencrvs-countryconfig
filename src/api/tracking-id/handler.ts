import * as Hapi from '@hapi/hapi'
import { generateTrackingId } from './service'

export function trackingIDHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const trackingId = generateTrackingId(request.payload as fhir.Bundle)
  return h.response(trackingId)
}
