export function log(...params: Parameters<typeof console.log>) {
  console.log(new Date().toISOString(), ...params)
}
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomFromBrackets(
  completionBrackets: { range: number[]; weight: number }[]
) {
  const completion = Math.random()
  const index = completionBrackets.find((_val, index) => {
    const total = completionBrackets
      .slice(0, index + 1)
      .reduce((m, n) => m + n.weight, 0)
    return total > completion
  })!
  const completionDays = getRandomInt(index.range[0], index.range[1])
  return completionDays
}

// Utility function for adding concurrency for async for loops
export function createConcurrentBuffer(concurrency: number) {
  let currentPromises: Array<Promise<void>> = []

  return <T>(
    handler: (...props: T[]) => Promise<void>,
    ...variablesToBind: T[]
  ) => {
    const prom = handler(...variablesToBind).catch(err => log(err))
    currentPromises.push(prom)

    prom.finally(() => currentPromises.splice(currentPromises.indexOf(prom), 1))

    if (currentPromises.length < concurrency) {
      return Promise.resolve()
    }

    return Promise.race(currentPromises)
  }
}

export function nullsToEmptyString(object: object) {
  for (const key of Object.keys(object)) {
    const value = object[key]
    if (value === null) {
      object[key] = ''
      continue
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      nullsToEmptyString(value)
      continue
    }
    if (Array.isArray(value)) {
      value.forEach(nullsToEmptyString)
    }
  }
}

export type RecursiveRequired<T> = Required<
  {
    [P in keyof T]: Exclude<RecursiveRequired<T[P]>, null>
  }
>
