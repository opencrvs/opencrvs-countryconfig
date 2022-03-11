import fetch from 'node-fetch'
import { COUNTRY_CONFIG_HOST } from './constants'

type StatisticUrls =
  | 'http://opencrvs.org/specs/id/statistics-male-populations'
  | 'http://opencrvs.org/specs/id/statistics-female-populations'
  | 'http://opencrvs.org/specs/id/statistics-total-populations'
  | 'http://opencrvs.org/specs/id/statistics-male-female-ratios'
  | 'http://opencrvs.org/specs/id/statistics-crude-birth-rates'

export type DistrictStatistic = {
  id: string
  statistics: Record<StatisticUrls, { [year: string]: number }>
}
type Statistics = Array<DistrictStatistic>

export async function getStatistics(token: string): Promise<Statistics> {
  const res = await fetch(`${COUNTRY_CONFIG_HOST}/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-correlation-id': 'statistics-' + Date.now().toString()
    }
  })
  return await res.json()
}
