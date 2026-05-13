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

/**
 * Validates core-{lang}.csv and country-{lang}.csv translation files.
 *
 * Core keys are sourced from @opencrvs/toolkit (published by core).
 * Country keys are extracted from this countryconfig's TypeScript source.
 *
 * Checks:
 *   - Missing keys  (in source, not in CSV)
 *   - Unused keys   (in CSV, not in source)
 *   - Duplicate keys (id appears more than once in a CSV)
 *
 * Usage:
 *   yarn validate:translations
 */

/* eslint-disable no-console */
import * as fs from 'fs'
import * as path from 'path'
import ts from 'typescript'
import { MessageDescriptor } from 'react-intl'
import { sortBy } from 'lodash'
import prompts from 'prompts'
import { readCSVToJSON, writeJSONToCSV } from '@countryconfig/utils'
import { CSVRow } from './api/content/service'

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageEntry = { defaultMessage: string; description: string }
type TranslationSource = Record<string, MessageEntry>

interface FileIssues {
  file: string
  lang: string
  scope: 'core' | 'country'
  missing: string[]
  unused: string[]
  duplicates: string[]
  blank: string[]
}

// ─── Source: core keys from toolkit ──────────────────────────────────────────

function loadCoreSource(): TranslationSource {
  const jsonPath = require.resolve('@opencrvs/toolkit/translations')
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
}

// ─── Source: country keys from this repo's TypeScript source ─────────────────

function findSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (['node_modules', 'tests', '__tests__'].includes(entry.name)) continue
      results.push(...findSourceFiles(path.join(dir, entry.name)))
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec|stories)\.(ts|tsx)$/.test(entry.name)
    ) {
      results.push(path.join(dir, entry.name))
    }
  }
  return results
}

function getStringValue(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node)) return node.text
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return undefined
}

function extractDescriptorsFromSource(sourceCode: string): MessageDescriptor[] {
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
    const idProp = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'id'
    )
    const defaultMessageProp = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'defaultMessage'
    )

    const descriptionProp = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'description'
    )

    if (!(idProp && defaultMessageProp)) {
      ts.forEachChild(node, visit)
      return
    }

    try {
      const idNode = (idProp as ts.PropertyAssignment).initializer
      const msgNode = (defaultMessageProp as ts.PropertyAssignment).initializer
      const descriptionNode = (descriptionProp as ts.PropertyAssignment)
        ?.initializer

      const description =
        descriptionNode && ts.isStringLiteral(descriptionNode)
          ? descriptionNode.text
          : undefined

      const idVal = getStringValue(idNode)
      const msgVal = getStringValue(msgNode)

      if (idVal !== undefined && msgVal !== undefined) {
        matches.push({
          id: idVal,
          defaultMessage: msgVal,
          description: description
        })
      } else {
        console.warn(
          `Skipping non-literal descriptor : ${node.getText(sourceFile).slice(0, 80)}`
        )
      }
    } catch {
      console.warn(
        `Skipping dynamic descriptor : ${node.getText(sourceFile).slice(0, 80)}`
      )
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return matches
}

function loadCountrySource(): TranslationSource {
  const srcDir = path.join(__dirname)
  const messages: TranslationSource = {}
  for (const file of findSourceFiles(srcDir).filter((f) => f !== __filename)) {
    const contents = fs.readFileSync(file, 'utf8')
    for (const {
      id,
      defaultMessage,
      description
    } of extractDescriptorsFromSource(contents)) {
      if (id)
        messages[id as string] = {
          defaultMessage: defaultMessage?.toString() ?? '',
          description: description?.toString() ?? ''
        }
    }
  }
  return messages
}

// ─── Language detection ───────────────────────────────────────────────────────

function detectLanguages(translationsDir: string): string[] {
  return fs
    .readdirSync(translationsDir)
    .flatMap((f) => f.match(/^core-(.+)\.csv$/)?.[1] ?? [])
}

async function detectLanguagesFromLegacy(
  translationsDir: string
): Promise<string[]> {
  for (const name of ['client.csv', 'login.csv']) {
    const filePath = path.join(translationsDir, name)
    if (fs.existsSync(filePath)) {
      const rows = await readCSVToJSON<CSVRow[]>(filePath)
      if (rows.length > 0) {
        return Object.keys(rows[0]).filter(
          (k) => k !== 'id' && k !== 'description'
        )
      }
    }
  }
  return []
}

// ─── Validation ───────────────────────────────────────────────────────────────

async function validateFile(
  filePath: string,
  lang: string,
  scope: 'core' | 'country',
  source: TranslationSource,
  englishRows?: CSVRow[]
): Promise<FileIssues> {
  const rows = await readCSVToJSON<CSVRow[]>(filePath)
  const sourceKeys = new Set(Object.keys(source))

  const seen = new Set<string>()
  const duplicates: string[] = []
  for (const { id } of rows) {
    if (seen.has(id)) duplicates.push(id)
    else seen.add(id)
  }

  const csvIds = new Set(rows.map((r) => r.id))
  const missing = [...sourceKeys].filter((k) => !csvIds.has(k))
  const unused = rows
    .map((r) => r.id)
    .filter((id) => !sourceKeys.has(id) && !duplicates.includes(id))

  const unusedSet = new Set(unused)
  const enValues = new Map(englishRows?.map((r) => [r.id, r['en'] ?? '']) ?? [])
  const blank =
    lang === 'en'
      ? []
      : rows
          .filter(
            (r) =>
              !unusedSet.has(r.id) &&
              (r[lang] ?? '').trim() === '' &&
              (enValues.get(r.id) ?? '').trim() !== ''
          )
          .map((r) => r.id)

  return { file: filePath, lang, scope, missing, unused, duplicates, blank }
}

async function validateAll(
  translationsDir: string,
  languages: string[],
  coreSource: TranslationSource,
  countrySource: TranslationSource
): Promise<FileIssues[]> {
  const coreEnPath = path.join(translationsDir, 'core-en.csv')
  const countryEnPath = path.join(translationsDir, 'country-en.csv')
  const coreEnRows = fs.existsSync(coreEnPath)
    ? await readCSVToJSON<CSVRow[]>(coreEnPath)
    : undefined
  const countryEnRows = fs.existsSync(countryEnPath)
    ? await readCSVToJSON<CSVRow[]>(countryEnPath)
    : undefined

  const results: FileIssues[] = []
  for (const lang of languages) {
    const corePath = path.join(translationsDir, `core-${lang}.csv`)
    const countryPath = path.join(translationsDir, `country-${lang}.csv`)
    if (fs.existsSync(corePath))
      results.push(
        await validateFile(corePath, lang, 'core', coreSource, coreEnRows)
      )
    if (fs.existsSync(countryPath))
      results.push(
        await validateFile(
          countryPath,
          lang,
          'country',
          countrySource,
          countryEnRows
        )
      )
  }
  return results
}

function hasIssues(issues: FileIssues[]): boolean {
  return issues.some(
    (i) =>
      i.missing.length +
        i.unused.length +
        i.duplicates.length +
        i.blank.length >
      0
  )
}

// ─── Fix operations ───────────────────────────────────────────────────────────

async function addMissingKeys(
  issues: FileIssues[],
  coreSource: TranslationSource,
  countrySource: TranslationSource
): Promise<void> {
  for (const issue of issues.filter((i) => i.missing.length > 0)) {
    const source = issue.scope === 'core' ? coreSource : countrySource
    const rows = await readCSVToJSON<CSVRow[]>(issue.file)
    const newRows: CSVRow[] = issue.missing.map((id) => ({
      id,
      description: source[id]?.description ?? '',
      [issue.lang]:
        issue.lang === 'en' ? (source[id]?.defaultMessage ?? '') : ''
    }))
    await writeJSONToCSV(
      issue.file,
      sortBy([...rows, ...newRows], (r) => r.id)
    )
    console.log(
      `  Added ${newRows.length} keys to ${path.basename(issue.file)}`
    )
  }
}

async function deleteUnusedKeys(issues: FileIssues[]): Promise<void> {
  for (const issue of issues.filter((i) => i.unused.length > 0)) {
    const unused = new Set(issue.unused)
    const rows = await readCSVToJSON<CSVRow[]>(issue.file)
    const filtered = rows.filter((r) => !unused.has(r.id))
    await writeJSONToCSV(issue.file, filtered)
    console.log(
      `  Removed ${issue.unused.length} keys from ${path.basename(issue.file)}`
    )
  }
}

async function deleteDuplicateKeys(issues: FileIssues[]): Promise<void> {
  for (const issue of issues.filter((i) => i.duplicates.length > 0)) {
    const rows = await readCSVToJSON<CSVRow[]>(issue.file)
    const seen = new Set<string>()
    const deduped = rows.filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    await writeJSONToCSV(issue.file, deduped)
    console.log(
      `  Removed ${issue.duplicates.length} duplicate keys from ${path.basename(issue.file)}`
    )
  }
}

// ─── Legacy detection & migration ────────────────────────────────────────────

function detectLegacyFiles(translationsDir: string): boolean {
  return (
    fs.existsSync(path.join(translationsDir, 'client.csv')) ||
    fs.existsSync(path.join(translationsDir, 'login.csv')) ||
    fs.existsSync(path.join(translationsDir, 'notification.csv'))
  )
}

async function loadLegacyRows(
  translationsDir: string
): Promise<Map<string, CSVRow>> {
  const rows: CSVRow[] = []
  for (const name of ['client.csv', 'login.csv']) {
    const filePath = path.join(translationsDir, name)
    if (fs.existsSync(filePath)) {
      rows.push(...(await readCSVToJSON<CSVRow[]>(filePath)))
    }
  }
  const byId = new Map<string, CSVRow>()
  for (const row of rows) {
    if (!byId.has(row.id)) byId.set(row.id, row)
  }
  return byId
}

function migrateScopeKeys(
  source: TranslationSource,
  lang: string,
  legacyLang: Map<string, CSVRow>,
  fallbackIndex: Map<string, string>
): CSVRow[] {
  return Object.entries(source).map(([id, entry]) => {
    let translation = legacyLang.get(id)?.[lang] ?? ''

    if (!translation) {
      const fallbackId = fallbackIndex.get(
        `${entry.description}|||${entry.defaultMessage}`
      )
      if (fallbackId) translation = legacyLang.get(fallbackId)?.[lang] ?? ''
    }

    return { id, description: entry.description, [lang]: translation }
  })
}

async function migrateLegacyTranslations(
  translationsDir: string,
  languages: string[],
  coreSource: TranslationSource,
  countrySource: TranslationSource
): Promise<void> {
  const legacy = await loadLegacyRows(translationsDir)

  // Build fallback index: "description|||en_value" → legacy id
  const fallbackIndex = new Map<string, string>()
  for (const [id, row] of legacy) {
    const key = `${row.description}|||${row['en'] ?? ''}`
    if (!fallbackIndex.has(key)) fallbackIndex.set(key, id)
  }

  // Create English files from source defaultMessage if they don't exist yet
  for (const [scope, source] of [
    ['core', coreSource],
    ['country', countrySource]
  ] as [string, TranslationSource][]) {
    const enPath = path.join(translationsDir, `${scope}-en.csv`)
    if (!fs.existsSync(enPath)) {
      const rows = sortBy(
        Object.entries(source).map(([id, entry]) => ({
          id,
          description: entry.description,
          en: entry.defaultMessage
        })),
        (r) => r.id
      )
      await writeJSONToCSV(enPath, rows)
      console.log(`  Wrote ${rows.length} keys to ${path.basename(enPath)}`)
    } else {
      console.log(`  Skipping ${path.basename(enPath)} (already exists)`)
    }
  }

  for (const lang of languages.filter((l) => l !== 'en')) {
    for (const [scope, source] of [
      ['core', coreSource],
      ['country', countrySource]
    ] as [string, TranslationSource][]) {
      const filePath = path.join(translationsDir, `${scope}-${lang}.csv`)
      if (fs.existsSync(filePath)) {
        console.log(`  Skipping ${path.basename(filePath)} (already exists)`)
        continue
      }
      const rows = migrateScopeKeys(source, lang, legacy, fallbackIndex)
      await writeJSONToCSV(
        filePath,
        sortBy(rows, (r) => r.id)
      )
      console.log(
        `  Wrote ${rows.length} ${scope} keys to ${path.basename(filePath)}`
      )
    }
  }

  // Split notification.csv into per-language files
  const notificationPath = path.join(translationsDir, 'notification.csv')
  if (fs.existsSync(notificationPath)) {
    const rows = await readCSVToJSON<CSVRow[]>(notificationPath)
    const langs = Object.keys(rows[0]).filter(
      (k) => k !== 'id' && k !== 'description'
    )
    for (const lang of langs) {
      const outPath = path.join(translationsDir, `notification-${lang}.csv`)
      if (fs.existsSync(outPath)) {
        console.log(`  Skipping ${path.basename(outPath)} (already exists)`)
        continue
      }
      const langRows = rows.map((r) => ({
        id: r.id,
        description: r.description,
        [lang]: r[lang] ?? ''
      }))
      await writeJSONToCSV(outPath, sortBy(langRows, (r) => r.id))
      console.log(
        `  Wrote ${langRows.length} keys to ${path.basename(outPath)}`
      )
    }
  }
}

// ─── Display ──────────────────────────────────────────────────────────────────

function printIssues(issues: FileIssues[]): void {
  const withIssues = issues.filter(
    (i) =>
      i.missing.length +
        i.unused.length +
        i.duplicates.length +
        i.blank.length >
      0
  )
  if (withIssues.length === 0) return

  console.log('\nIssues found:\n')
  for (const issue of withIssues) {
    const parts: string[] = []
    if (issue.missing.length > 0) parts.push(`${issue.missing.length} missing`)
    if (issue.unused.length > 0) parts.push(`${issue.unused.length} unused`)
    if (issue.duplicates.length > 0)
      parts.push(`${issue.duplicates.length} duplicate`)
    if (issue.blank.length > 0) parts.push(`${issue.blank.length} blank`)
    console.warn(`  ${path.basename(issue.file)}: ${parts.join(', ')}`)
  }
}

function printBlankKeys(issues: FileIssues[]): void {
  const withBlanks = issues.filter((i) => i.blank.length > 0)
  if (withBlanks.length === 0) return
  console.log('\nBlank translation keys:\n')
  for (const issue of withBlanks) {
    console.log(`  ${path.basename(issue.file)}:`)
    issue.blank.forEach((id) => console.log(`    - ${id}`))
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function checkTranslations(
  warnOnly = false,
  ci = false
): Promise<void> {
  const translationsDir = path.join(__dirname, 'translations')

  if (warnOnly) {
    if (!fs.existsSync(translationsDir)) return
  }

  console.log('Loading translation sources...')
  const coreSource = loadCoreSource()
  const countrySource = loadCountrySource()
  const hasLegacy = detectLegacyFiles(translationsDir)
  let languages = detectLanguages(translationsDir)

  for (const f of fs.readdirSync(translationsDir)) {
    const m = f.match(/^country-(.+)\.csv$/)
    if (m && !languages.includes(m[1])) {
      console.warn(
        `country-${m[1]}.csv exists but core-${m[1]}.csv does not — language "${m[1]}" will not be validated`
      )
    }
  }

  if (languages.length === 0) {
    if (hasLegacy) {
      languages = await detectLanguagesFromLegacy(translationsDir)
    } else {
      if (warnOnly) return
      console.error(`No core-{lang}.csv files found in ${translationsDir}`)
      process.exit(1)
    }
  }

  if (!warnOnly) console.log(`Languages: ${languages.join(', ')}`)

  const issues = await validateAll(
    translationsDir,
    languages,
    coreSource,
    countrySource
  )

  if (!hasIssues(issues) && !hasLegacy) {
    if (!warnOnly) {
      console.log('\nAll translations are valid.')
      process.exit(0)
    }
    return
  }

  if (ci) {
    if (hasLegacy) {
      console.error(
        '\nLegacy translations detected. Run `yarn validate:translations` to migrate them to 2.0.\n'
      )
    }
    printIssues(issues)
    const withBlanks = issues.filter((i) => i.blank.length > 0)
    if (withBlanks.length > 0) {
      printBlankKeys(issues)
    }
    if (hasLegacy || hasIssues(issues)) {
      process.exit(1)
    }
    process.exit(0)
  }

  if (warnOnly) {
    if (hasLegacy) {
      console.warn(
        '\nWarning: Legacy translations detected. Run `yarn validate:translations` to migrate them to 2.0.\n'
      )
    }
    const withIssues = issues.filter(
      (i) =>
        i.missing.length +
          i.unused.length +
          i.duplicates.length +
          i.blank.length >
        0
    )
    if (withIssues.length > 0) {
      console.warn(
        '\nWarning: Translation issues detected. Run `yarn validate:translations` to fix them.\n'
      )
      for (const issue of withIssues) {
        const parts: string[] = []
        if (issue.missing.length > 0)
          parts.push(`${issue.missing.length} missing`)
        if (issue.unused.length > 0)
          parts.push(`${issue.unused.length} unused (stale)`)
        if (issue.duplicates.length > 0)
          parts.push(`${issue.duplicates.length} duplicate`)
        if (issue.blank.length > 0) parts.push(`${issue.blank.length} blank`)
        console.warn(`  ${path.basename(issue.file)}: ${parts.join(', ')}`)
      }
      console.warn('')
    }
    return
  }

  if (hasLegacy) {
    console.warn(
      '\nLegacy translations detected. Select "Migrate translations" to update them to 2.0.\n'
    )
  }

  // Interactive loop (warnOnly === false)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    languages = detectLanguages(translationsDir)
    const currentIssues = await validateAll(
      translationsDir,
      languages,
      coreSource,
      countrySource
    )
    const currentHasLegacy = detectLegacyFiles(translationsDir)

    if (!hasIssues(currentIssues) && !currentHasLegacy) {
      console.log('\nAll translations are valid.')
      process.exit(0)
    }

    printIssues(currentIssues)

    const hasCurrent =
      fs.existsSync(path.join(translationsDir, 'core-en.csv')) &&
      fs.existsSync(path.join(translationsDir, 'country-en.csv'))
    const hasMissing = currentIssues.some((i) => i.missing.length > 0)
    const hasUnused = currentIssues.some((i) => i.unused.length > 0)
    const hasDuplicates = currentIssues.some((i) => i.duplicates.length > 0)
    const hasBlank = currentIssues.some((i) => i.blank.length > 0)

    if (
      !currentHasLegacy &&
      !hasMissing &&
      !hasUnused &&
      !hasDuplicates &&
      !hasBlank
    ) {
      process.exit(0)
    }

    const choices = [
      currentHasLegacy && {
        title: 'Migrate legacy translations to 2.0',
        value: 'migrate' as const
      },
      hasCurrent &&
        hasMissing && {
          title: 'Add all missing keys',
          value: 'add-missing' as const
        },
      hasCurrent &&
        hasUnused && {
          title: 'Delete all unused keys',
          value: 'delete-unused' as const
        },
      hasCurrent &&
        hasDuplicates && {
          title: 'Delete all duplicate keys',
          value: 'delete-duplicates' as const
        },
      hasBlank && {
        title: 'Print blank translation keys',
        value: 'print-blank' as const
      },
      { title: 'Exit', value: 'exit' as const }
    ].filter(Boolean) as prompts.Choice[]

    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices
    })

    console.log()

    if (!action || action === 'exit') {
      process.exit(0)
    }

    if (action === 'migrate')
      await migrateLegacyTranslations(
        translationsDir,
        await detectLanguagesFromLegacy(translationsDir),
        coreSource,
        countrySource
      )
    if (action === 'add-missing')
      await addMissingKeys(currentIssues, coreSource, countrySource)
    if (action === 'delete-unused') await deleteUnusedKeys(currentIssues)
    if (action === 'delete-duplicates') await deleteDuplicateKeys(currentIssues)
    if (action === 'print-blank') printBlankKeys(currentIssues)
  }
}

async function main() {
  const ci = process.argv.includes('--ci')
  await checkTranslations(false, ci)
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
