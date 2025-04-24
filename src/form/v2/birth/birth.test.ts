import { expect, test } from 'vitest'

import { birthEvent } from './index'

test('birth configuration is parsed', async () => {
  expect(birthEvent).toMatchSnapshot()
})
