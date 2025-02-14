import { expect, test } from 'vitest'
import { isValid, parse } from 'date-fns'

import { birthEvent } from './index'

test('birth configuration is parsed', async () => {
  // Replace all dates in the object with a placeholder for snapshot.
  // This is because the date is different every time the test is run, and mocking the date was unnecessarily complex.
  const replacedBirthEvent = JSON.parse(
    JSON.stringify(birthEvent),
    (_, value) =>
      isValid(parse(value, 'yyyy-MM-dd', new Date())) ? '<date here>' : value
  )

  expect(replacedBirthEvent).toMatchSnapshot()
})
