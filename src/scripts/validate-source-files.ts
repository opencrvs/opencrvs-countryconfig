import { range /*, difference */ } from 'lodash'
import { z } from 'zod'
import chalk from 'chalk'
import { basename } from 'path'
import { readCSVToJSON } from '@countryconfig/features/utils'
import {
  validateSensicalityOfLocationTree,
  zodValidateDuplicates,
  checkFacilityExistsInAnyLocation
} from './humdata-validation'

export interface IHumdataLocation {
  admin0Pcode: string
  admin0Name_en: string
  admin0Name_alias?: string

  admin1Pcode?: string
  admin1Name_en?: string
  admin1Name_alias?: string

  admin2Pcode?: string
  admin2Name_en?: string
  admin2Name_alias?: string

  admin3Pcode?: string
  admin3Name_en?: string
  admin3Name_alias?: string

  admin4Pcode?: string
  admin4Name_en?: string
  admin4Name_alias?: string
}

export const Location = z.object({
  admin0Pcode: z.string(),
  admin0Name_en: z.string(),
  admin0Name_alias: z.string().optional(),

  admin1Pcode: z.string(),
  admin1Name_en: z.string(),
  admin1Name_alias: z.string().optional(),

  admin2Pcode: z.string().optional(),
  admin2Name_en: z.string().optional(),
  admin2Name_alias: z.string().optional(),

  admin3Pcode: z.string().optional(),
  admin3Name_en: z.string().optional(),
  admin3Name_alias: z.string().optional(),

  admin4Pcode: z.string().optional(),
  admin4Name_en: z.string().optional(),
  admin4Name_alias: z.string().optional()
})

const Locations = (maxAdminLevel: number) =>
  z
    .array(Location)
    .superRefine(zodValidateDuplicates(`admin${maxAdminLevel}Pcode`))
    .superRefine(validateSensicalityOfLocationTree(maxAdminLevel))

const Facility = z.object({
  id: z.string(),
  name: z.string(),
  partOf: z
    .string()
    .regex(
      /^Location\//,
      'Invalid format: partOf needs to be in Location/<id> format e.g. Location/KozcEjeTyuD'
    )
})

const HealthFacility = Facility.extend({
  code: z.enum(['HEALTH_FACILITY'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  })
})

const HealthFacilities = HealthFacility.array().superRefine(
  zodValidateDuplicates('id')
)

const CRVSFacility = HealthFacility.extend({
  code: z.enum(['CRVS_OFFICE'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  })
})

const CRVSFacilities = CRVSFacility.array().superRefine(
  zodValidateDuplicates('id')
)

const Employee = z.object({
  facilityId: z
    .string()
    .regex(
      /^CRVS_OFFICE_/,
      'Invalid format: facilityId needs to be in a CRVS_OFFICE_<id> format e.g. CRVS_OFFICE_oEBf29y8JP8'
    ),
  environment: z.enum(['development', 'production']),
  username: z.string(),
  givenNames: z.string(),
  familyName: z.string(),
  gender: z.string(),
  role: z.enum([
    'FIELD_AGENT',
    'REGISTRATION_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'NATIONAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'NATIONAL_REGISTRAR'
  ]),
  type: z.enum([
    'DATA_ENTRY_CLERK',
    'DISTRICT_REGISTRAR',
    'POLICE_OFFICER',
    'SOCIAL_WORKER',
    'LOCAL_LEADER',
    'HEALTHCARE_WORKER',
    'DNRPC',
    'ENTREPENEUR',
    ''
  ]),
  mobile: z.string(),
  email: z.string(),
  signature: z
    .string()
    .regex(
      /^$|^data:image\/png;base64,/, // Empty or base64 encoded image
      'Invalid format: signature needs to be in a base64-format, starting with data:image/png;base64,'
    )
    .nullable()
    .optional()
})

const Employees = Employee.array().superRefine(
  zodValidateDuplicates('username')
)

const parsedNumber = z
  .string()
  .regex(
    /^[+-]?([0-9]*[.])?[0-9]+$/,
    'Numbers can only contain digits (0-9) and dots (.)'
  )
  .transform(parseFloat)
  .refine((val: number) => !Number.isNaN(val), 'Failed to parse number')

const Statistic = z.object({
  adminPcode: z.string(),
  name: z.string(),
  ...Object.fromEntries(
    range(2007, 2021).flatMap((year) => [
      [`male_population_${year}`, parsedNumber],
      [`female_population_${year}`, parsedNumber],
      [`population_${year}`, parsedNumber],
      [`crude_birth_rate_${year}`, parsedNumber]
    ])
  )
})

export const Statistics = Statistic.array().superRefine(
  zodValidateDuplicates('adminPcode')
)

function printIssue(issue: z.ZodIssue) {
  // eslint-disable-next-line no-console
  console.log(
    chalk.red(
      chalk.bold(
        `Line ${(issue.path[0] as number) + 2}, column "${issue.path[1]}":`
      )
    ),
    chalk.red(issue.message)
  )
}

function log(...params: any[]) {
  // eslint-disable-next-line no-console
  console.log(...params)
}

function error(...params: any[]) {
  // eslint-disable-next-line no-console
  console.error(...params.map((p) => chalk.red(p)))
}

async function main() {
  log(chalk.yellow('Validating locations file.'))
  const rawLocations: [] = await readCSVToJSON(process.argv[2])
  const countryExpression = /^admin0name$/i
  const nameExpression = /^admin(\d+)name_en$/i
  const aliasExpression = /^admin(\d+)name_alias$/i
  const pcodeExpression = /^admin(\d+)Pcode$/i
  const csvLocationHeaders = [...new Set(rawLocations.flatMap(Object.keys))]
  for (const header of csvLocationHeaders) {
    let headersOK: RegExpExecArray | null
    headersOK = countryExpression.exec(header)
    if (!headersOK) {
      headersOK = nameExpression.exec(header)
      if (!headersOK) {
        headersOK = aliasExpression.exec(header)
        if (!headersOK) {
          headersOK = pcodeExpression.exec(header)
          if (!headersOK) {
            error(
              chalk.blue(`LOCATIONS ERROR!:`),
              'Header',
              chalk.yellow(header),
              'is not supported'
            )
            process.exit(1)
          }
        }
      }
    }
  }

  /** The most granular admin level, bigger number = lower level of administration */
  let MAX_ADMIN_LEVEL: 0 | 1 | 2 | 3 | 4 = 0

  for (const header of csvLocationHeaders) {
    const currentLevel = pcodeExpression.exec(header)
    if (currentLevel) {
      MAX_ADMIN_LEVEL < Number(currentLevel[1])
        ? (MAX_ADMIN_LEVEL = Number(currentLevel[1]) as any)
        : MAX_ADMIN_LEVEL
    }
  }

  const locations = Locations(MAX_ADMIN_LEVEL).parse(rawLocations)

  log(chalk.green('Admin levels parsed'), '✅', '\n')

  log(chalk.yellow('Validating statistics file.'))
  const rawStatistics = await readCSVToJSON(process.argv[6])
  const statistics = Statistics.parse(rawStatistics)

  for (const statistic of statistics) {
    let location
    for (let i = MAX_ADMIN_LEVEL; i > 0; i--) {
      if (!location) {
        location = locations.find(
          (locationData) =>
            locationData[`admin${i}Pcode`] === statistic.adminPcode
        )
      }
    }
    if (!location) {
      error(
        chalk.blue(
          `LOCATIONS ERROR!: Parsed MAX_ADMIN_LEVEL: ${MAX_ADMIN_LEVEL}`
        ),
        chalk.yellow(`Line ${statistics.indexOf(statistic) + 2}`),
        statistic.name,
        'is not part of any known location'
      )
      process.exit(1)
    }
  }

  /*const MAX_ADMIN_LEVEL_LOCATIONS = locations.map(
    (location) => location[`admin${MAX_ADMIN_LEVEL}Pcode`]!
  )
  const hasStatisticAllMaxAdminLevelLocations =
    difference(
      MAX_ADMIN_LEVEL_LOCATIONS,
      statistics.map((s) => s.adminPcode)
    ).length === 0

  if (!hasStatisticAllMaxAdminLevelLocations) {
    error(
      chalk.blue('LOCATIONS ERROR! '),
      chalk.yellow(
        `Statistic locations do not include all admin${MAX_ADMIN_LEVEL}Pcode rows in locations file`
      )
    )
    process.exit(1)
  }*/
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating health facilities file.'))
  const rawFacilities = await readCSVToJSON(process.argv[4])
  const facilities = HealthFacilities.parse(rawFacilities)

  for (const facility of facilities) {
    const location = checkFacilityExistsInAnyLocation(
      MAX_ADMIN_LEVEL,
      locations,
      facility
    )
    if (!location) {
      error(
        chalk.blue('FACILITIES ERROR! '),
        chalk.yellow(`Line ${facilities.indexOf(facility) + 2}`),
        'Facility',
        facility.name,
        'is not part of any known location'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating crvs offices file.'))
  const rawCRVSFacilities = await readCSVToJSON(process.argv[3])
  const crvsFacilities = CRVSFacilities.parse(rawCRVSFacilities)

  for (const facility of crvsFacilities) {
    const location = checkFacilityExistsInAnyLocation(
      MAX_ADMIN_LEVEL,
      locations,
      facility
    )
    if (!location) {
      error(
        chalk.blue('CRVS OFFICES ERROR! '),
        chalk.yellow(`Line ${crvsFacilities.indexOf(facility) + 2}`),
        'CRVS Facility',
        facility.name,
        'is not part of any known state or location'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')
  log(chalk.yellow('Validating employees file.'))
  const rawEmployees = await readCSVToJSON(process.argv[5])

  const employees = Employees.parse(rawEmployees)

  for (const employee of employees) {
    const facility = crvsFacilities.find(
      (facility) => employee.facilityId === `CRVS_OFFICE_${facility.id}`
    )
    if (!facility) {
      error(
        chalk.blue('EMPLOYEES ERROR! '),
        chalk.yellow(`Line ${employees.indexOf(employee) + 2}`),
        'Employee',
        employee.username,
        `has an invalid or unknown facilityId (${employee.facilityId}). Make sure facility the id after CRVS_OFFICE_ matches one of the facilities in crvs-facilities.csv`
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')
}

main().catch((err) => {
  if (err instanceof z.ZodError) {
    err.issues.forEach(printIssue)
    process.exit(1)
  }

  if (err.code === 'ENOENT') {
    error(
      chalk.red('File not found'),
      chalk.bold(basename(err.path)),
      chalk.red('Please make sure the file is located in'),
      chalk.bold(err.path)
    )
    process.exit(1)
  }
  throw err
})
