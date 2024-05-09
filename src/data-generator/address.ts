import faker from '@faker-js/faker'
import { Location } from './location'

export function createAddressInput(location: Location, type: string) {
  return {
    country: 'FAR',
    state: location.partOf.split('/')[1],
    district: location.id,
    city: faker.address.city(),
    postalCode: faker.address.zipCode(),
    type,
    line: [
      faker.address.streetAddress(),
      faker.address.zipCode(),
      'URBAN',
      '',
      '',
      'URBAN'
    ]
  }
}
