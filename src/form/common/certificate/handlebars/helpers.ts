import * as Handlebars from 'handlebars'
import { type IntlShape } from 'react-intl'

type FactoryProps = {
  intl: IntlShape
}
export function noop(props: FactoryProps): Handlebars.HelperDelegate {
  return function (this: any, value: string) {
    // eslint-disable-next-line no-console
    console.log(props)

    return value
  }
}
