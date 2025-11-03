/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
/* eslint-disable */
import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import chalk from 'chalk'
import csv2json from 'csv2json'
import { stringify } from 'csv-stringify'
import { sortBy } from 'lodash'
import ts from 'typescript'

interface MessageDescriptor {
  id?: string
  defaultMessage?: string
  description?: string | object
}

export async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = stringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv as any, 'utf8')
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    fs.createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk: string) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}

type CountryCSVRow = { id: string; description: string } & Record<
  string,
  string
>

function findObjectLiteralsWithIdAndDefaultMessage(
  filePath: string,
  sourceCode: string
): MessageDescriptor[] {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )
  const matches: MessageDescriptor[] = []

  function visit(node: ts.Node) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit)
      return
    }
    const idProperty = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'id'
    )
    const defaultMessageProperty = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'defaultMessage'
    )

    if (!(idProperty && defaultMessageProperty)) {
      ts.forEachChild(node, visit)
      return
    }

    const objectText = node.getText(sourceFile)

    try {
      const func = new Function(`return (${objectText});`)
      const objectValue = func()
      matches.push(objectValue)
    } catch (error) {
      console.log(chalk.yellow.bold('Warning'))
      console.error(
        `Found a dynamic message identifier in file ${filePath}.`,
        'Message identifiers should never be dynamic and should always be hardcoded instead.',
        '\n',
        objectText,
        '\n'
      )
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return matches
}

async function extractUsedTranslations() {
  // Determine paths - __dirname gives us the src directory where this script is located
  const COUNTRY_CONFIG_PATH = path.resolve(__dirname, '..')
  const CORE_PATH = path.resolve(COUNTRY_CONFIG_PATH, '../opencrvs-core')
  const CORE_CLIENT_PATH = path.join(CORE_PATH, 'packages/client')

  console.log(chalk.blue.bold('Auditing translation keys...'))
  console.log()

  // Verify paths exist
  if (!fs.existsSync(CORE_CLIENT_PATH)) {
    console.log(chalk.red.bold('✗ Error:'))
    console.log(`Could not find opencrvs-core at: ${CORE_PATH}`)
    console.log(
      'This script expects opencrvs-core to be at the same level as this country config.'
    )
    process.exit(1)
  }

  // Scan core project files
  console.log('Scanning opencrvs-core project...')
  const coreFiles = await glob('src/**/*.@(tsx|ts)', {
    cwd: CORE_CLIENT_PATH,
    ignore: [
      '**/*.test.@(tsx|ts)',
      'src/tests/**/*.*',
      '**/*.stories.@(tsx|ts)'
    ]
  })

  console.log(`Found ${coreFiles.length} files in core project`)

  const coreMessages: MessageDescriptor[] = coreFiles
    .map((f: string) => {
      const fullPath = path.join(CORE_CLIENT_PATH, f)
      const contents = fs.readFileSync(fullPath).toString()
      return findObjectLiteralsWithIdAndDefaultMessage(fullPath, contents)
    })
    .flat()

  // Scan country config files
  console.log('Scanning country config project...')
  const countryConfigFiles = await glob('src/**/*.@(tsx|ts)', {
    cwd: COUNTRY_CONFIG_PATH,
    ignore: [
      '**/*.test.@(tsx|ts)',
      'src/tests/**/*.*',
      '**/*.stories.@(tsx|ts)'
    ]
  })

  console.log(`Found ${countryConfigFiles.length} files in country config`)

  const countryConfigMessages: MessageDescriptor[] = countryConfigFiles
    .map((f: string) => {
      const fullPath = path.join(COUNTRY_CONFIG_PATH, f)
      const contents = fs.readFileSync(fullPath).toString()
      return findObjectLiteralsWithIdAndDefaultMessage(fullPath, contents)
    })
    .flat()

  // Combine messages from both core and country config
  const allMessages = [...coreMessages, ...countryConfigMessages]

  // Remove duplicates based on id and create a Set for fast lookup
  const usedKeysSet = new Set(
    allMessages.filter((msg) => msg.id).map((msg) => msg.id!)
  )

  console.log(
    `Found ${usedKeysSet.size} unique translation keys used across projects`
  )
  console.log()

  // Read existing translations from country config
  const translationFile = path.join(
    COUNTRY_CONFIG_PATH,
    'src/translations/client.csv'
  )

  try {
    console.log(chalk.blue.bold('Reading country config translations...'))
    const countryTranslations =
      await readCSVToJSON<CountryCSVRow[]>(translationFile)
    console.log(
      `Found ${countryTranslations.length} translations in country config`
    )
    console.log()

    // Create a Set of IDs from country translations for fast lookup
    const countryTranslationIds = new Set(
      countryTranslations.map(({ id }) => id)
    )

    // Filter country config translations into used and unused
    const usedTranslations = countryTranslations.filter(({ id }) =>
      usedKeysSet.has(id)
    )
    const unusedTranslations = countryTranslations.filter(
      ({ id }) => !usedKeysSet.has(id)
    )

    // Find missing translations (used in code but not in country config)
    const missingKeys = Array.from(usedKeysSet).filter(
      (key) => !countryTranslationIds.has(key)
    )

    // Get language columns from country config (exclude id and description)
    const languageColumns =
      countryTranslations.length > 0
        ? Object.keys(countryTranslations[0]).filter(
            (key) => !['id', 'description'].includes(key)
          )
        : ['en']

    // Create missing translations entries
    const missingTranslations = missingKeys.map((id) => {
      const msg = allMessages.find((m) => m.id === id)!
      const entry: CountryCSVRow = {
        id,
        description: typeof msg.description === 'string' ? msg.description : ''
      }
      // Add language columns
      languageColumns.forEach((lang) => {
        if (lang === 'en') {
          // Use defaultMessage for English
          entry[lang] = msg.defaultMessage || ''
        } else {
          // Empty strings for other languages
          entry[lang] = ''
        }
      })
      return entry
    })

    // Match missing translations with unused ones based on:
    // 1. Same description and en value
    // 2. Key variations (e.g., v2.something vs something)
    const matchedTranslations: CountryCSVRow[] = []
    const unmatchedMissing: CountryCSVRow[] = []
    const matchedUnusedIds = new Set<string>() // Track which unused keys were matched

    missingTranslations.forEach((missingTranslation) => {
      // Try to find an unused translation with the same description and en value
      let matchingUnused = unusedTranslations.find(
        (unused) =>
          unused.description === missingTranslation.description &&
          unused.en === missingTranslation.en &&
          unused.description && // Don't match on empty descriptions
          unused.en // Don't match on empty en values
      )

      // If no exact match, try matching with v2 prefix variations
      if (!matchingUnused) {
        matchingUnused = unusedTranslations.find((unused) => {
          // Check if unused key is v2.{missingKey}
          const unusedWithoutV2 = unused.id.replace(/^v2\./, '')
          const missingWithV2 = `v2.${missingTranslation.id}`

          return (
            // Case 1: unused = v2.something, missing = something
            (unused.id.startsWith('v2.') &&
              unusedWithoutV2 === missingTranslation.id) ||
            // Case 2: unused = something, missing = v2.something (less common but possible)
            (missingTranslation.id.startsWith('v2.') &&
              unused.id === missingTranslation.id.replace(/^v2\./, ''))
          )
        })
      }

      if (matchingUnused) {
        // Create a new entry with:
        // - ID from MISSING (new key used in code)
        // - Description and all language values from UNUSED (old key's translations)
        const matchedEntry: CountryCSVRow = {
          id: missingTranslation.id, // Use the new key ID
          description: matchingUnused.description // Use old key's description
        }
        // Copy all language values from the unused (old) translation
        languageColumns.forEach((lang) => {
          matchedEntry[lang] = matchingUnused[lang]
        })
        matchedTranslations.push(matchedEntry)
        matchedUnusedIds.add(matchingUnused.id) // Track that this unused key was matched
      } else {
        unmatchedMissing.push(missingTranslation)
      }
    })

    // Remove matched unused translations from the unused list
    const filteredUnusedTranslations = unusedTranslations.filter(
      ({ id }) => !matchedUnusedIds.has(id)
    )

    // Sort by id
    const sortedUsedTranslations = sortBy(usedTranslations, (row) => row.id)
    const sortedUnusedTranslations = sortBy(
      filteredUnusedTranslations,
      (row) => row.id
    )
    const sortedMissingTranslations = sortBy(unmatchedMissing, (row) => row.id)
    const sortedMatchedTranslations = sortBy(
      matchedTranslations,
      (row) => row.id
    )

    // Write used translations
    const usedOutputFile = path.join(
      COUNTRY_CONFIG_PATH,
      'src/translations/client.used.csv'
    )
    await writeJSONToCSV(usedOutputFile, sortedUsedTranslations)

    // Write unused translations
    const unusedOutputFile = path.join(
      COUNTRY_CONFIG_PATH,
      'src/translations/client.unused.csv'
    )
    await writeJSONToCSV(unusedOutputFile, sortedUnusedTranslations)

    // Write missing translations
    const missingOutputFile = path.join(
      COUNTRY_CONFIG_PATH,
      'src/translations/client.missing.csv'
    )
    await writeJSONToCSV(missingOutputFile, sortedMissingTranslations)

    // Write matched translations
    const matchedOutputFile = path.join(
      COUNTRY_CONFIG_PATH,
      'src/translations/client.matched.csv'
    )
    await writeJSONToCSV(matchedOutputFile, sortedMatchedTranslations)

    console.log(chalk.green.bold('✓ Success!'))
    console.log(
      `Written ${sortedUsedTranslations.length} used translations to ${chalk.white(usedOutputFile)}`
    )
    console.log(
      `Written ${sortedUnusedTranslations.length} unused translations to ${chalk.white(unusedOutputFile)}`
    )
    console.log(
      `Written ${sortedMissingTranslations.length} missing translations to ${chalk.white(missingOutputFile)}`
    )
    console.log(
      `Written ${sortedMatchedTranslations.length} matched translations to ${chalk.white(matchedOutputFile)}`
    )
    console.log()

    console.log(chalk.cyan('Summary:'))
    console.log(
      `  Total translations in country config: ${countryTranslations.length}`
    )
    console.log(`  ${chalk.green('Used in code')}: ${usedTranslations.length}`)
    console.log(
      `  ${chalk.yellow('Unused in code')}: ${sortedUnusedTranslations.length}`
    )
    console.log(
      `  ${chalk.red('Missing from config')}: ${unmatchedMissing.length}`
    )
    console.log(
      `  ${chalk.blue('Matched (renamed keys)')}: ${matchedTranslations.length}`
    )
    console.log(
      `  (${coreMessages.length} keys from core, ${countryConfigMessages.length} keys from country config)`
    )
    console.log()
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(chalk.red.bold('✗ Error:'))
      console.log(
        `Could not find translation file: ${chalk.white(translationFile)}`
      )
      console.log(
        'Please ensure the country config has a src/translations/client.csv file'
      )
      process.exit(1)
    } else {
      throw error
    }
  }

  process.exit(0)
}

extractUsedTranslations()
