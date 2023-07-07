import { buildTypeScriptToJavaScript } from '@countryconfig/features/utils'
import * as Hapi from '@hapi/hapi'
import { join } from 'path'

export async function conditionalsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response(
      await buildTypeScriptToJavaScript(join(__dirname, 'conditionals.ts'))
    )
    .type('text/javascript')
}
