import { Conditional } from '@countryconfig/form/types/types'
import { InformantType } from '@countryconfig/form/v2/birth/forms/pages/informant'
import { ConditionalType, field } from '@opencrvs/toolkit/events'
import { compact as removeUndefineds } from 'lodash'

export const upgradeConditionals = (
  fieldName: string,
  conditional: Conditional[]
) => {
  const conditionals = conditional.map(({ action, expression }) => {
    if (
      action === 'hide' &&
      expression === 'values.informantType !== "OTHER"'
    ) {
      return {
        type: ConditionalType.SHOW,
        conditional: field(fieldName).isEqualTo(InformantType.OTHER)
      }
    }

    console.warn(
      `Conditional '${JSON.stringify({ action, expression })}' not reckognized.`
    )
    return undefined
  })

  return removeUndefineds(conditionals)
}
