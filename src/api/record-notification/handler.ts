import * as Hapi from '@hapi/hapi'
import { notificationForRecord } from '../application/application-config'

export function recordNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response(notificationForRecord)
}
