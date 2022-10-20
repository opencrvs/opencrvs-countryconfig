import {
  ADMIN_STRUCTURE_SOURCE,
  EMPLOYEES_SOURCE,
  FACILITIES_SOURCE
} from '@countryconfig/constants'
import { range } from 'lodash'
import { z } from 'zod'
import chalk from 'chalk'
import { basename } from 'path'
import { readCSVToJSON } from '@countryconfig/utils'

const Location = z.object({
  statisticalID: z.string(),
  name: z.string(),
  partOf: z
    .string()
    .regex(
      /^Location\//,
      'Invalid format: partOf needs to be in Location/<id> format e.g. Location/KozcEjeTyuD'
    ),
  code: z.enum(['ADMIN_STRUCTURE'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  }),
  physicalType: z.enum(['Jurisdiction'], {
    required_error:
      'Field "physicalType" missing, make sure all rows define all required fields'
  })
})

const Facility = Location.extend({
  physicalType: z.undefined(),
  code: z.enum(['HEALTH_FACILITY'], {
    required_error:
      'Field "code" missing, make sure all rows define all required fields'
  })
})

const CRVSFacility = Facility.extend({
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
  statisticalID: z.string(),
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

const DISTRICTS = `${ADMIN_STRUCTURE_SOURCE}source/districts.csv`
const STATISTICS = `${ADMIN_STRUCTURE_SOURCE}source/statistics.csv`
const STATES = `${ADMIN_STRUCTURE_SOURCE}source/states.csv`
const EMPLOYEES = `${EMPLOYEES_SOURCE}source/test-employees.csv`
const CRVS_FACILITIES = `${FACILITIES_SOURCE}source/crvs-facilities.csv`
const HEALTH_FACILITIES = `${FACILITIES_SOURCE}source/health-facilities.csv`

async function main() {
  log(chalk.yellow('Validating file:'), chalk.bold(STATES))
  const rawStates = await readCSVToJSON(STATES)
  const states = Location.array().parse(rawStates)
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating file:'), chalk.bold(DISTRICTS))

  const rawDistricts = await readCSVToJSON(DISTRICTS)

  const districts = Location.array().parse(rawDistricts)

  for (const district of districts) {
    const state = states.find(
      (state) => district.partOf === `Location/${state.statisticalID}`
    )
    if (!state) {
      error(
        DISTRICTS,
        `Line ${districts.indexOf(district) + 2}`,
        'District',
        district.name,
        'is not part of any known state'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')
  log(chalk.yellow('Validating file:'), chalk.bold(STATISTICS))
  const rawStatistics = await readCSVToJSON(STATISTICS)

  const statistics = Statistic.array().parse(rawStatistics)

  for (const district of districts) {
    const state = states.find(
      (state) => district.partOf === `Location/${state.statisticalID}`
    )
    if (!state) {
      error(
        DISTRICTS,
        chalk.yellow(`Line ${districts.indexOf(district) + 2}`),
        'District',
        district.name,
        'is not part of any known state'
      )
      process.exit(1)
    }
  }

  for (const statistic of statistics) {
    const district = districts.find(
      (district) => district.statisticalID === statistic.statisticalID
    )
    if (!district) {
      error(
        chalk.blue(basename(STATISTICS)),
        chalk.yellow(`Line ${statistics.indexOf(statistic) + 2}`),
        'District',
        statistic.name,
        'is not part of any known district'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating file:'), chalk.bold(HEALTH_FACILITIES))
  const rawFacilities = await readCSVToJSON(HEALTH_FACILITIES)

  const facilities = Facility.array().parse(rawFacilities)

  for (const facility of facilities) {
    const district = districts.find(
      (district) => facility.partOf === `Location/${district.statisticalID}`
    )
    if (!district) {
      error(
        chalk.blue(basename(HEALTH_FACILITIES)),
        chalk.yellow(`Line ${facilities.indexOf(facility) + 2}`),
        'Facility',
        facility.name,
        'is not part of any known district'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')

  log(chalk.yellow('Validating file:'), chalk.bold(CRVS_FACILITIES))
  const rawCRVSFacilities = await readCSVToJSON(CRVS_FACILITIES)

  const crvsFacilities = CRVSFacility.array().parse(rawCRVSFacilities)

  for (const facility of crvsFacilities) {
    const partOf = districts
      .concat(states)
      .find(
        (district) => facility.partOf === `Location/${district.statisticalID}`
      )
    if (!partOf) {
      error(
        chalk.yellow(chalk.bold(basename(CRVS_FACILITIES))),
        chalk.yellow(`Line ${crvsFacilities.indexOf(facility) + 2}`),
        'CRVS Facility',
        facility.name,
        'is not part of any known state or district'
      )
      process.exit(1)
    }
  }
  log(chalk.green('File is valid'), '✅', '\n')
  log(chalk.yellow('Validating file:'), chalk.bold(EMPLOYEES))
  const rawEmployees = await readCSVToJSON(EMPLOYEES)

  const employees = Employee.array().parse(rawEmployees)

  for (const employee of employees) {
    const facility = crvsFacilities.find(
      (facility) =>
        employee.facilityId === `CRVS_OFFICE_${facility.statisticalID}`
    )
    if (!facility) {
      error(
        chalk.blue(EMPLOYEES),
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
