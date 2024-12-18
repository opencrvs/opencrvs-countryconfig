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
import { rmdirSync, writeFileSync } from 'fs'
import { camelCase, snakeCase } from 'lodash'
import { join } from 'path'
import { logger } from './logger'
import { readCSVToJSON, writeJSONToCSV } from './utils'

const DEFAULT_ROLE_SCOPES_PRE_1_7 = {
  FIELD_AGENT: ['declare'],
  REGISTRATION_AGENT: ['validate', 'performance', 'certify'],
  LOCAL_REGISTRAR: ['register', 'performance', 'certify'],
  LOCAL_SYSTEM_ADMIN: ['sysadmin'],
  NATIONAL_SYSTEM_ADMIN: ['sysadmin', 'natlsysadmin'],
  PERFORMANCE_MANAGEMENT: ['performance'],
  NATIONAL_REGISTRAR: ['register', 'performance', 'certify', 'config', 'teams']
} as const

async function main() {
  await upgradeRolesDefinitions()
}

async function upgradeRolesDefinitions() {
  const roles = await readCSVToJSON<any[]>(
    join(__dirname, './data-seeding/roles/source/roles.csv')
  ).catch((err) => {
    if (err.code === 'ENOENT') {
      logger.warn(
        'data-seeding/roles/source/roles.csv does not exist in the codebase. Looks like this codebase has been upgraded already.'
      )
    }

    process.exit(1)
  })

  const rolesWithGeneratedIds = roles.map((role) => ({
    id: snakeCase(role.label_en).toUpperCase(),
    label: {
      defaultMessage: role.label_en,
      description: `Name for user role ${role.label_en}`,
      id: `userRole.${camelCase(role.label_en)}`
    },
    oldLabels: Object.fromEntries(
      Object.keys(role)
        .filter((key) => key.startsWith('label_'))
        .map((key) => [key.split('_')[1], role[key]])
    ),
    systemRole: role.systemRole,
    scopes:
      DEFAULT_ROLE_SCOPES_PRE_1_7[
        role.systemRole as keyof typeof DEFAULT_ROLE_SCOPES_PRE_1_7
      ]
  }))

  /*
   * Add language items to src/translations/client.csv
   */
  const copy = await readCSVToJSON<any[]>(
    join(__dirname, './translations/client.csv')
  )

  rolesWithGeneratedIds.forEach((role) => {
    if (copy.find((item) => item.id === role.label.id)) {
      logger.warn(
        `Skipping role ${role.id} as it already exists in the client.csv`
      )
      return
    }
    const copyItem = {
      id: role.label.id,
      description: role.label.description,
      ...role.oldLabels
    }
    logger.info(
      `Adding language items for role ${role.id}: ${JSON.stringify(copyItem)}`
    )
    copy.push(copyItem)
  })

  /*
   * Fix role references in default-employees.csv from "National System Admin" to "NATIONAL_SYSTEM_ADMIN"
   */

  const defaultEmployees = await readCSVToJSON<any[]>(
    join(__dirname, './data-seeding/employees/source/default-employees.csv')
  )

  const defaultEmployeesWithRoles = defaultEmployees.map((employee) => {
    const role = rolesWithGeneratedIds.find(
      (role) => role.oldLabels.en === employee.role
    )
    if (!role) {
      logger.error(`Role with id ${employee.role} not found in roles.csv`)
      process.exit(1)
    }
    return {
      ...employee,
      role: role.id
    }
  })

  /*
   * Create the new "roles.json" file with the updated roles and new format
   */

  const rolesWithoutOldLabels = rolesWithGeneratedIds.map((role) => {
    const { oldLabels, ...rest } = role
    return rest
  })

  /*
   * Persist changes
   */
  logger.info('Creating roles file')
  writeFileSync(
    join(__dirname, './data-seeding/roles/roles.json'),
    JSON.stringify(rolesWithoutOldLabels, null, 2)
  )

  logger.info('Updating copy file')
  await writeJSONToCSV(join(__dirname, './translations/client.csv'), copy)

  logger.info('Updating default employees file')
  await writeJSONToCSV(
    join(__dirname, './data-seeding/employees/source/default-employees.csv'),
    defaultEmployeesWithRoles
  )

  logger.info('Removing old roles file')
  rmdirSync(join(__dirname, './data-seeding/roles/source'), {
    recursive: true
  })
}

main()
