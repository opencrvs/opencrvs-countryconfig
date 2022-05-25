import * as csv2json from 'csv2json'
import { createReadStream } from 'fs'
import { sumBy, uniq } from 'lodash'
import { join } from 'path'

type Year = {
  year: number
  male_population: number
  female_population: number
  population: number
  male_female_ratio: number
  crude_birth_rate: number
}

export type LocationStatistic = {
  statisticalID: string
  years: Year[]
}

type LocationItem = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  physicalType: string
}

export async function getStatisticsForProvinces() {
  const districts = await readCSVToJSON<LocationItem[]>(
    './source/districts.csv'
  )
  const provinces = await readCSVToJSON<LocationItem[]>(
    './source/provinces.csv'
  )
  const districtStatistics = await getStatistics()

  const statistics = provinces.map<LocationStatistic>(province => {
    const districtsInProvince = districts
      .filter(({ partOf }) => partOf === `Location/${province.statisticalID}`)
      .map(({ statisticalID }) => statisticalID)
    const statsForProvince = districtStatistics.filter(({ statisticalID }) =>
      districtsInProvince.includes(statisticalID)
    )

    const allYears = uniq(
      statsForProvince.flatMap(s => s.years.map(({ year }) => year))
    ).sort()

    return {
      statisticalID: province.statisticalID,
      years: allYears.map(y => {
        const allStatsForThisYear = statsForProvince.flatMap(s =>
          s.years.filter(({ year }) => year === y)
        )
        return {
          year: y,
          male_population: sumBy(allStatsForThisYear, 'male_population'),
          female_population: sumBy(allStatsForThisYear, 'female_population'),
          population: sumBy(allStatsForThisYear, 'population'),
          male_female_ratio:
            sumBy(allStatsForThisYear, 'male_female_ratio') /
            allStatsForThisYear.length,
          crude_birth_rate:
            sumBy(allStatsForThisYear, 'crude_birth_rate') /
            allStatsForThisYear.length
        }
      })
    }
  })

  return statistics
}

export async function getStatistics() {
  const data = await readCSVToJSON<
    Array<Record<string, string> & { statisticalID: string }>
  >('./source/crude_birth_rates_by_division.csv')

  return data.map<LocationStatistic>(item => {
    const { statisticalID, ...yearKeys } = item
    return {
      statisticalID: statisticalID,
      years: Object.keys(yearKeys)
        .map(key => key.split('_').pop())
        .map(Number)
        .filter((value, index, list) => list.indexOf(value) == index)
        .map(year => ({
          year,
          male_population: parseFloat(yearKeys[`male_population_${year}`]),
          female_population: parseFloat(yearKeys[`female_population_${year}`]),
          population: parseFloat(yearKeys[`population_${year}`]),
          male_female_ratio: parseFloat(yearKeys[`male_female_ratio_${year}`]),
          crude_birth_rate: parseFloat(yearKeys[`crude_birth_rate_${year}`])
        }))
    }
  })
}
async function readCSVToJSON<T>(filename: string) {
  return await new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    createReadStream(join(__dirname, filename))
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', chunk => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}
