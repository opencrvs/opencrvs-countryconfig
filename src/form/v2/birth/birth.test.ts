import { expect, test } from 'vitest'

import { birthEvent } from './index'

// @TODO: remove this skip
test.skip('birth configuration is parsed', async () => {
  expect(birthEvent).toMatchSnapshot()
})
