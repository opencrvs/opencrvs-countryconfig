import { logger } from '@countryconfig/logger'
import * as Hapi from '@hapi/hapi'
import * as fs from 'fs'
import { join } from 'path'
import { IScriptTag, IStyleTag } from './types'

// Get list of available files
export async function listCustomFilesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const jsFiles = fs
      .readdirSync(join(__dirname, 'js'))
      .filter((file) => file.endsWith('.js'))
    const cssFiles = fs
      .readdirSync(join(__dirname, 'css'))
      .filter((file) => file.endsWith('.css'))

    return h
      .response({
        scripts: jsFiles.map((file) => ({
          url: `/custom-files/js/${file}`,
          activateOn: ['client', 'login'],
          options: {
            // async: true
            defer: false
            // nomodule: false,
            // onload: null,
            // onerror: null,
            // crossorigin: '',
            // integrity: ''
          }
        })) satisfies Partial<IScriptTag>[],
        styles: cssFiles.map((file) => ({
          url: `/custom-files/css/${file}`,
          activateOn: ['client', 'login'],
          options: {
            // media: '',
            // crossorigin: '',
            // integrity: '',
            // title: '',
            // disabled: false,
            // type: ''
          }
        })) satisfies Partial<IStyleTag>[]
      })
      .type('application/json')
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Serve individual JS file
export async function getJsFileHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const filename = request.params.filename
    const filePath = join(__dirname, 'js', filename)

    if (!fs.existsSync(filePath) || !filename.endsWith('.js')) {
      return h.response('File not found').code(404)
    }

    const content = fs.readFileSync(filePath, 'utf8')
    return h.response(content).type('application/javascript')
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Serve individual CSS file
export async function getCssFileHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const filename = request.params.filename
    const filePath = join(__dirname, 'css', filename)

    if (!fs.existsSync(filePath) || !filename.endsWith('.css')) {
      return h.response('File not found').code(404)
    }

    const content = fs.readFileSync(filePath, 'utf8')
    return h.response(content).type('text/css')
  } catch (err) {
    logger.error(err)
    throw err
  }
}
