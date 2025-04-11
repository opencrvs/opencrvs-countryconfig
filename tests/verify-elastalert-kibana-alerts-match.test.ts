import { readdirSync, readFileSync } from 'fs'
import yaml from 'js-yaml'
import { join } from 'path'
import { expect, it } from 'vitest'

function findAllValuesByKey(obj: unknown, key: string): any[] {
  const result: any[] = []

  const recurse = (item: unknown) => {
    if (Array.isArray(item)) {
      for (const element of item) {
        recurse(element)
      }
    } else if (typeof item === 'object' && item !== null) {
      for (const k in item) {
        if (k === key) {
          result.push(item[k])
        }
        recurse(item[k])
      }
    }
  }

  recurse(obj)
  return result
}

it('all tests defined in Kibana config are also defined in Elastalert config', () => {
  const allAlertNames = readFileSync(
    join(__dirname, '../infrastructure/monitoring/kibana', 'config.ndjson'),
    'utf8'
  )
    .split('\n')
    .map((str) => JSON.parse(str))
    .filter((item) => item.type === 'alert')
    .map((item) => item.attributes.name)
    .sort()
    .filter((value, index, self) => self.indexOf(value) === index)

  const ruleNameFilters = readdirSync(
    join(__dirname, '../infrastructure/monitoring/elastalert/rules')
  )
    .map((file) =>
      join(__dirname, '../infrastructure/monitoring/elastalert/rules', file)
    )
    .map((file) => readFileSync(file, 'utf8'))
    .map((file) => yaml.load(file))
    .flatMap((rule) => findAllValuesByKey(rule, 'rule.name.keyword'))
    .map((x) => x.value)
    .sort()
    .filter((value, index, self) => self.indexOf(value) === index)

  expect(ruleNameFilters).toEqual(allAlertNames)
})
