import { buildTypeScriptToJavaScript } from '@countryconfig/utils'
import * as Hapi from '@hapi/hapi'
import { join } from 'path'

export async function validatorsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response(
      await buildTypeScriptToJavaScript(join(__dirname, 'validators.ts'))
    )
    .type('text/javascript')
}
