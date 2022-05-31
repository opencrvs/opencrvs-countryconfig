import {
  createBirthDeclaration,
  createDeathDeclaration,
  fetchAlreadyGeneratedInterval,
  fetchDeathRegistration,
  fetchRegistration,
  sendBirthNotification
} from './declare'
import {
  createRegistrationDetails,
  createBirthRegistrationDetailsForNotification,
  markAsRegistered,
  markDeathAsRegistered
} from './register'
import {
  createBirthCertificationDetails,
  createDeathCertificationDetails,
  markAsCertified,
  markDeathAsCertified
} from './certify'

import fetch from 'node-fetch'

import {
  getDayOfYear,
  getDaysInYear,
  startOfYear,
  setYear,
  addDays,
  differenceInDays,
  sub,
  add,
  startOfDay,
  isWithinInterval
} from 'date-fns'

import { getToken, readToken, updateToken } from './auth'
import { getRandomFromBrackets, log } from './util'
import { getLocations, getFacilities } from './location'
import { COUNTRY_CONFIG_HOST } from './constants'
import { DistrictStatistic, getStatistics } from './statistics'
import { User, createUsers } from './users'
import PQueue from 'p-queue'
import { BirthRegistrationInput } from './gateway'

/*
 *
 * Configuration
 *
 */

// The script is required to log in with a demo system admin
// This prevents the script from being used in production, as there are no users with a "demo" scope there
const USERNAME = 'emmanuel.mayuka'
const PASSWORD = 'test'
export const VERIFICATION_CODE = '000000'

// Create 30 users for each location:
// 15 field agents, ten hospitals, four registration agents and one registrar
export const FIELD_AGENTS = 15
export const HOSPITAL_FIELD_AGENTS = 10
export const REGISTRATION_AGENTS = 4
export const LOCAL_REGISTRARS = 1

const CONCURRENCY = process.env.CONCURRENCY
  ? parseInt(process.env.CONCURRENCY, 10)
  : 3
const START_YEAR = 2021
const END_YEAR = 2022

const REGISTER = process.env.REGISTER !== 'false'
const CERTIFY = process.env.CERTIFY !== 'false'

const BIRTH_COMPLETION_DISTRIBUTION = [
  { range: [0, 45], weight: 0.8 },
  { range: [46, 365], weight: 0.15 },
  { range: [366, 365 * 5], weight: 0.025 },
  { range: [365 * 5 + 1, 365 * 20], weight: 0.025 }
]
const BIRTH_OVERALL_REGISTRATIONS_COMPARED_TO_ESTIMATE = 0.8

const DEATH_COMPLETION_DISTRIBUTION = [
  { range: [0, 45], weight: 0.75 },
  { range: [46, 365], weight: 0.125 },
  { range: [366, 365 * 5], weight: 0.125 }
]
const DEATH_OVERALL_REGISTRATIONS_COMPARED_TO_ESTIMATE = 0.4

const today = new Date()
const currentYear = today.getFullYear()

const queue = new PQueue({ concurrency: CONCURRENCY, timeout: 1000 * 60 })

let pauseTimeout: NodeJS.Timeout
function onError(error: Error) {
  console.error(error)
  clearTimeout(pauseTimeout)

  if (!queue.isPaused) {
    log('Stopping queue')
    queue.pause()
  } else {
    log('Extending queue stop for 30 more seconds')
  }

  pauseTimeout = setTimeout(() => {
    log('Queue starting up again')
    queue.start()
  }, 30000)
}

async function keepTokensValid(users: User[]) {
  users.forEach(user => {
    const data = readToken(user.token)
    setTimeout(() => updateToken(user), data.exp * 1000 - Date.now() - 60000)
  })
}

function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

function calculateCrudeDeathRateForYear(
  location: string,
  year: number,
  crudeDeathRate: number,
  statistics: DistrictStatistic[]
) {
  const statistic = statistics.find(({ id }) => id === location)

  if (!statistic) {
    throw new Error(`Cannot find statistics for location ${location}`)
  }

  const yearlyStats =
    statistic.statistics[
      'http://opencrvs.org/specs/id/statistics-total-populations'
    ][year]
  if (!yearlyStats) {
    throw new Error(
      `Cannot find statistics for location ${location}, year ${year}`
    )
  }

  return (yearlyStats / 1000) * crudeDeathRate
}

function calculateCrudeBirthRatesForYear(
  location: string,
  year: number,
  statistics: DistrictStatistic[]
) {
  const statistic = statistics.find(({ id }) => id === location)

  if (!statistic) {
    throw new Error(
      `Cannot find statistics for location ${location}, year ${year}`
    )
  }
  const femalePopulation =
    statistic.statistics[
      'http://opencrvs.org/specs/id/statistics-female-populations'
    ][year]
  const malePopulation =
    statistic.statistics[
      'http://opencrvs.org/specs/id/statistics-male-populations'
    ][year]
  const crudeBirthRate =
    statistic.statistics[
      'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
    ][year]
  if (
    [femalePopulation, malePopulation, crudeBirthRate].some(
      value => value === undefined
    )
  ) {
    throw new Error(
      `Cannot find statistics for location ${location}, year ${year}`
    )
  }

  return {
    male: (malePopulation / 1000) * crudeBirthRate,
    female: (femalePopulation / 1000) * crudeBirthRate
  }
}

async function getCrudeDeathRate(token: string): Promise<number> {
  const res = await fetch(`${COUNTRY_CONFIG_HOST}/crude-death-rate`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()

  return data.crudeDeathRate
}

async function main() {
  log('Fetching token for system administrator')
  const token = await getToken(USERNAME, PASSWORD)
  console.log('Got token for system administrator')
  let statistics: Awaited<ReturnType<typeof getStatistics>>
  try {
    statistics = await getStatistics(token)
  } catch (error) {
    console.error(`
      /statistics endpoint was not found or returned an error.
      Make sure the endpoint is implemented in your country config package
    `)
    return
  }

  log('Got token for system administrator')
  log('Fetching locations')
  const locations = await await getLocations(token)

  const facilities = await getFacilities(token)
  const crvsOffices = facilities.filter(({ type }) => type === 'CRVS_OFFICE')
  const healthFacilities = facilities.filter(
    ({ type }) => type === 'HEALTH_FACILITY'
  )

  log('Found', locations.length, 'locations')

  /*
   *
   * Loop through all locations
   *
   */

  for (const location of locations) {
    log('Fetching already generated interval')
    const generatedInterval = await fetchAlreadyGeneratedInterval(
      token,
      crvsOffices
        .filter(({ partOf }) => partOf === `Location/${location.id}`)
        .map(({ id }) => id)
    )

    if (generatedInterval.length === 0) {
      log('No events have been generated for this location')
    } else {
      log(
        'Events already exist for this location between',
        generatedInterval[0],
        '-',
        generatedInterval[1]
      )
    }

    /*
     *
     * Create required users & authorization tokens
     *
     */
    log('Creating users for', location.name, '(', location.id, ')')

    const users = await createUsers(token, location, {
      fieldAgents: FIELD_AGENTS,
      hospitalFieldAgents: HOSPITAL_FIELD_AGENTS,
      registrationAgents: REGISTRATION_AGENTS,
      localRegistrars: LOCAL_REGISTRARS
    })
    const allUsers = [
      ...users.fieldAgents,
      ...users.hospitals,
      ...users.registrationAgents,
      ...users.registrars
    ]

    // User tokens expire after 20 minutes, so we need to
    // keep on refreshing them as long as the user is in use
    keepTokensValid(allUsers)

    const deathDeclarers = [...users.fieldAgents, ...users.registrationAgents]
    const birthDeclararers = [
      ...users.fieldAgents,
      ...users.hospitals,
      ...users.registrationAgents
    ]

    const crudeDeathRate = await getCrudeDeathRate(users.fieldAgents[0].token)

    /*
     *
     * Loop through years (END_YEAR -> START_YEAR)
     *
     */

    for (let y = END_YEAR; y >= START_YEAR; y--) {
      const isCurrentYear = y === currentYear
      let totalDeathsThisYear =
        calculateCrudeDeathRateForYear(
          location.id,
          isCurrentYear ? currentYear - 1 : y,
          crudeDeathRate,
          statistics
        ) * DEATH_OVERALL_REGISTRATIONS_COMPARED_TO_ESTIMATE

      // Calculate crude birth & death rates for this district for both men and women
      const birthRates = calculateCrudeBirthRatesForYear(
        location.id,
        isCurrentYear ? currentYear - 1 : y,
        statistics
      )

      const days = Array.from({ length: getDaysInYear(y) }).map(() => 0)

      if (isCurrentYear) {
        // If we're processing the current year, only take into account
        // the days until today
        const currentDayNumber = getDayOfYear(today)

        // Adjust birth rates to the amount of days passed since the start of this year
        birthRates.female = (birthRates.female / days.length) * currentDayNumber
        birthRates.male = (birthRates.male / days.length) * currentDayNumber

        totalDeathsThisYear =
          (totalDeathsThisYear / days.length) * currentDayNumber

        // Remove future dates from the arrays
        days.splice(currentDayNumber - 1)
      }

      birthRates.female =
        birthRates.female * BIRTH_OVERALL_REGISTRATIONS_COMPARED_TO_ESTIMATE
      birthRates.male =
        birthRates.male * BIRTH_OVERALL_REGISTRATIONS_COMPARED_TO_ESTIMATE

      const femalesPerDay = days.slice(0)
      const malesPerDay = days.slice(0)
      const deathsPerDay = days.slice(0)

      for (let i = 0; i < birthRates.female; i++) {
        femalesPerDay[Math.floor(Math.random() * days.length)]++
      }
      for (let i = 0; i < birthRates.male; i++) {
        malesPerDay[Math.floor(Math.random() * days.length)]++
      }
      for (let i = 0; i < totalDeathsThisYear; i++) {
        deathsPerDay[Math.floor(Math.random() * days.length)]++
      }

      log('Creating declarations for', location)

      /*
       *
       * Loop through days in the year (last day of the year -> start of the year)
       *
       */
      for (let d = days.length - 1; d >= 0; d--) {
        const submissionDate = addDays(startOfYear(setYear(new Date(), y)), d)

        if (
          generatedInterval.length === 2 &&
          isWithinInterval(submissionDate, {
            start: generatedInterval[0],
            end: generatedInterval[1]
          })
        ) {
          log('Data for', submissionDate, 'already exists. Skipping.')
          continue
        }

        /*
         *
         * CREATE DEATH DECLARATIONS
         * - Declaring user is chosen randomly from users with declare role
         * -
         */

        const deathsToday = deathsPerDay[d]

        log(
          'Creating death declarations for',
          submissionDate,
          'total:',
          deathsToday
        )

        let operations = []
        for (let ix = 0; ix < deathsToday; ix++) {
          operations.push(
            (async (ix: number) => {
              try {
                const randomUser =
                  deathDeclarers[
                    Math.floor(Math.random() * deathDeclarers.length)
                  ]
                const completionDays = getRandomFromBrackets(
                  DEATH_COMPLETION_DISTRIBUTION
                )
                const submissionTime = add(startOfDay(submissionDate), {
                  seconds: 24 * 60 * 60 * Math.random()
                })
                const deathTime = sub(submissionTime, { days: completionDays })
                log('Declaring')
                const compositionId = await createDeathDeclaration(
                  randomUser,
                  deathTime,
                  Math.random() > 0.4 ? 'male' : 'female',
                  submissionTime,
                  location
                )

                if (!REGISTER) {
                  log('Death', submissionDate, ix, '/', deathsToday)
                  return
                }

                const randomRegistrar =
                  users.registrars[
                    Math.floor(Math.random() * users.registrars.length)
                  ]
                log('Registering', { compositionId })

                const declaration = await fetchDeathRegistration(
                  randomRegistrar,
                  compositionId
                )

                const registration = await markDeathAsRegistered(
                  randomRegistrar,
                  compositionId,
                  createRegistrationDetails(
                    add(new Date(submissionTime), {
                      days: 1
                    }),
                    declaration
                  )
                )
                log('Certifying', registration.id)
                await wait(2000)
                if (CERTIFY) {
                  await markDeathAsCertified(
                    registration.id,
                    randomRegistrar,
                    createDeathCertificationDetails(
                      add(new Date(submissionTime), {
                        days: 2
                      }),
                      registration
                    )
                  )
                }

                log('Death', submissionDate, ix, '/', deathsToday)
              } catch (error) {
                onError(error)
              }
            }).bind(null, ix)
          )
        }

        await queue.addAll(operations)

        /*
         *
         * CREATE BIRTH DECLARATIONS
         *
         * - Registration day is the one we're currently at in the loop
         * - Birthdate is randomised date in the past based on completion brackets
         * - Gender is randomised based on configured male / female birth rates
         * - Declaring / registering / certifying user is randomised from a pool of users
         *    with the correct role
         */

        log(
          'Creating birth declarations for',
          submissionDate,
          'male:',
          malesPerDay[d],
          'female',
          femalesPerDay[d]
        )

        operations = []
        // Create birth declarations
        const totalChildBirths = malesPerDay[d] + femalesPerDay[d]
        const probabilityForMale = malesPerDay[d] / totalChildBirths

        for (let ix = 0; ix < Math.round(totalChildBirths); ix++) {
          operations.push(
            (async (ix: number) => {
              try {
                const randomUser =
                  birthDeclararers[
                    Math.floor(Math.random() * birthDeclararers.length)
                  ]

                const randomRegistrar =
                  users.registrars[
                    Math.floor(Math.random() * users.registrars.length)
                  ]

                const isHospitalUser = users.hospitals.includes(randomUser)

                const sex =
                  Math.random() < probabilityForMale ? 'male' : 'female'
                // This is here so that no creation timestamps would be equal
                // InfluxDB will otherwise interpret the events as the same exact measurement
                const submissionTime = add(startOfDay(submissionDate), {
                  seconds: 24 * 60 * 60 * Math.random()
                })
                const completionDays = getRandomFromBrackets(
                  BIRTH_COMPLETION_DISTRIBUTION
                )
                const birthDate = sub(submissionTime, { days: completionDays })

                const crvsOffice = crvsOffices.find(
                  ({ id }) => id === randomUser.primaryOfficeId
                )

                if (!crvsOffice) {
                  throw new Error(
                    `CRVS office was not found with the id ${randomUser.primaryOfficeId}`
                  )
                }

                const districtFacilities = healthFacilities.filter(
                  ({ partOf }) => partOf?.split('/')[1] === location.id
                )

                if (districtFacilities.length === 0) {
                  throw new Error('Could not find any facilities for location')
                }

                const randomFacility =
                  districtFacilities[
                    Math.floor(Math.random() * districtFacilities.length)
                  ]

                const declaredToday =
                  differenceInDays(today, submissionTime) === 0

                let id: string
                let registrationDetails: BirthRegistrationInput
                if (isHospitalUser) {
                  log('Sending a DHIS2 Hospital notification')
                  id = await sendBirthNotification(
                    randomUser,
                    sex,
                    birthDate,
                    submissionTime,
                    randomFacility
                  )
                  const declaration = await fetchRegistration(
                    randomRegistrar,
                    id
                  )
                  try {
                    registrationDetails = await createBirthRegistrationDetailsForNotification(
                      add(new Date(submissionTime), {
                        days: 1
                      }),
                      location,
                      declaration
                    )
                  } catch (error) {
                    console.log(error)
                    console.log(JSON.stringify(declaration))
                    throw error
                  }
                } else {
                  id = await createBirthDeclaration(
                    randomUser,
                    sex,
                    birthDate,
                    submissionTime,
                    location
                  )
                  const declaration = await fetchRegistration(
                    randomRegistrar,
                    id
                  )
                  try {
                    registrationDetails = await createRegistrationDetails(
                      add(new Date(submissionTime), {
                        days: 1
                      }),
                      declaration
                    )
                  } catch (error) {
                    console.log(error)
                    console.log(JSON.stringify(declaration))
                    throw error
                  }
                  log('Registering', id)
                }

                if (!REGISTER) {
                  log(
                    'Birth',
                    submissionDate,
                    ix,
                    '/',
                    Math.round(totalChildBirths)
                  )
                  return
                }

                if (!declaredToday || Math.random() > 0.5) {
                  const registration = await markAsRegistered(
                    randomRegistrar,
                    id,
                    registrationDetails
                  )
                  if (CERTIFY && !declaredToday && registration) {
                    log('Certifying', id)
                    await markAsCertified(
                      registration.id,
                      randomRegistrar,
                      createBirthCertificationDetails(
                        add(new Date(submissionTime), {
                          days: 1
                        }),
                        registration
                      )
                    )
                  } else {
                    log(
                      'Will not register or certify because the declaration was added today'
                    )
                  }
                }
                log(
                  'Birth',
                  submissionDate,
                  ix,
                  '/',
                  Math.round(totalChildBirths)
                )
              } catch (error) {
                onError(error)
              }
            }).bind(null, ix)
          )
        }
        await queue.addAll(operations)
      }
    }

    allUsers.forEach(user => {
      user.stillInUse = false
    })
  }
}

main()
