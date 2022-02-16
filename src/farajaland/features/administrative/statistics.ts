import * as csv2json from 'csv2json'
import { createReadStream } from 'fs'
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
  name: string
  years: Year[]
}

export async function getStatistics() {
  const data = await new Promise<
    Array<Record<string, string> & { reference: string }>
  >((resolve, reject) => {
    const chunks: string[] = []
    createReadStream(
      join(__dirname, './source/crude_birth_rates_by_division.csv')
    )
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

  return data.map<LocationStatistic>(item => {
    const { reference, ...yearKeys } = item
    return {
      name: reference,
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
