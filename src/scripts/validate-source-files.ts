import { range } from 'lodash'
import { z } from 'zod'
import chalk from 'chalk'
import { basename } from 'path'
import { readCSVToJSON } from '@countryconfig/features/utils'

const Facility = z.object({
  adminPcode: z.string(),
  name: z.string(),
  partOf: z
    .string()
    .regex(
      /^Location\//,
      'Invalid format: partOf needs to be in Location/<id> format e.g. Location/KozcEjeTyuD'
    )
})

const HealthFacility = Facility.extend({
  physicalType: z.undefined(),
  code: z.enum(['HEALTH_FACILITY'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  })
})

const CRVSFacility = HealthFacility.extend({
  code: z.enum(['CRVS_OFFICE'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  }),
  district: z.string({
    required_error:
      "CRVS Facility's district name is missing. This will be shown in the facility's address details"
  }),
  state: z.string({
    required_error:
      "CRVS Facility's state name is missing. This will be shown in the facility's address details"
  }),
  physicalType: z.enum(['Building'], {
    required_error:
      'Field "physicalType" missing, make sure all rows define all required fields'
  })
})

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

function printIssue(issue: z.ZodIssue) {
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
  console.log(...params)
}

function error(...params: any[]) {
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
  csvLocationHeaders.map((header: string) => {
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
              chalk.yellow(`Header ${header}`),
              'is not a supported header'
            )
            process.exit(1)
          }
        }
      }
    }

  let MAX_ADMIN_LEVEL = 0

  for (const header of csvLocationHeaders) {
    const currentLevel = /^admin(\d+)pcode/i.exec(header)
    if (currentLevel) {
      MAX_ADMIN_LEVEL < Number(currentLevel[1])
        ? (MAX_ADMIN_LEVEL = Number(currentLevel[1]))
        : MAX_ADMIN_LEVEL
    }
  }

  log(chalk.green('Admin levels parsed'), '✅', '\n')

  log(chalk.yellow('Validating statistics file.'))
  const rawStatistics = await readCSVToJSON(process.argv[6])
  const statistics = Statistic.array().parse(rawStatistics)

  for (const statistic of statistics) {
    let location
    for (let i = MAX_ADMIN_LEVEL; i > 0; i--) {
      if (!location) {
        location = rawLocations.find(
          (locationData) =>
            locationData[`admin${i}Pcode`] === statistic.adminPcode
        )
      }
    }
    if (!location) {
      error(
        chalk.blue(`LOCATIONS ERROR!: Parsed ADMIN_LEVELS: ${ADMIN_LEVELS}`),
        chalk.yellow(`Line ${statistics.indexOf(statistic) + 2}`),
        statistic.name,
        'is not part of any known location'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating health facilities file.'))
  const rawFacilities = await readCSVToJSON(process.argv[4])
  const facilities = HealthFacility.array().parse(rawFacilities)

  for (const facility of facilities) {
    const location = rawLocations.find(
      (locationData) =>
        facility.partOf ===
        `Location/${locationData[`admin${MAX_ADMIN_LEVEL}Pcode`]}`
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
  const crvsFacilities = CRVSFacility.array().parse(rawCRVSFacilities)

  for (const facility of crvsFacilities) {
    const partOf = rawLocations.find(
      (locationData) =>
        facility.partOf ===
        `Location/${locationData[`admin${MAX_ADMIN_LEVEL}Pcode`]}`
    )
    if (!partOf) {
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

  const employees = Employee.array().parse(rawEmployees)

  for (const employee of employees) {
    const facility = crvsFacilities.find(
      (facility) => employee.facilityId === `CRVS_OFFICE_${facility.adminPcode}`
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
