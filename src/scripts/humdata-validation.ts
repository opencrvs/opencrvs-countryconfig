import { z } from 'zod'

export const zodValidateDuplicates =
  (column: string) =>
  (list: Array<Record<string, any>>, ctx: z.RefinementCtx) => {
    const existingColumnValues: string[] = []

    for (let i = 0; i < list.length; i++) {
      if (existingColumnValues.includes(list[i][column])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate value "${list[i][column]}"`,
          path: [i, column]
        })
        return false
      }
      existingColumnValues.push(list[i][column])
    }

    return true
  }

/** Validates location data by Map<Location, ParentLocation>. If there are locations that have different parent location than previously added ones, an error will be thrown */
export const validateSensicalityOfLocationTree =
  (maxAdminLevel: number) =>
  (data: Array<Record<string, any>>, ctx: z.RefinementCtx) => {
    type Location = string
    type ParentLocation = string

    const locationMap: Map<Location, ParentLocation> = new Map()

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      for (let adminLevel = maxAdminLevel; adminLevel >= 0; adminLevel--) {
        const column = `admin${adminLevel}Pcode`
        const locationId = row[column]
        const parentColumn = `admin${adminLevel - 1}Pcode`

        if (!locationMap.get(locationId)) {
          locationMap.set(locationId, row[parentColumn])
        } else {
          if (row[parentColumn] !== locationMap.get(locationId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Conflicting value "${locationId}". The same location might have different parent locations in a different row. Please see rows using the same value.`,
              path: [i, column]
            })
            return false
          }
        }
      }
    }

    return true
  }
