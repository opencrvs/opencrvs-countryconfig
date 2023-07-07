import {
  AdminLevel,
  extractLocationTree
} from '@countryconfig/features/administrative/scripts/utils'
import { IFacility } from '@countryconfig/features/facilities/scripts/utils'
import { z } from 'zod'
import { IHumdataLocation, Location } from './validate-source-files'

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
  (maxAdminLevel: AdminLevel) =>
  (locations: Array<z.infer<typeof Location>>, ctx: z.RefinementCtx) =>
    extractLocationTree(locations, maxAdminLevel, ({ id, row, column }) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Conflicting value "${id}". The same location might have different parent locations in a different row. Please see rows using the same value.`,
        path: [row, column]
      })
    })

export function checkFacilityExistsInAnyLocation(
  maxAdminLevel: AdminLevel,
  locations: IHumdataLocation[],
  facility: IFacility
) {
  let location: IHumdataLocation | undefined
  for (let adminLevel = maxAdminLevel; adminLevel >= 0; adminLevel--) {
    location = locations.find(
      (locationData) =>
        facility.partOf ===
        `Location/${locationData[`admin${adminLevel}Pcode`]}`
    )
    if (location) {
      break
    }
  }
  return location
}
