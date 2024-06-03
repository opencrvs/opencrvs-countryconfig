import faker from '@faker-js/faker'
import { getRandomDate } from '../../../helpers'

export const declaration = {
  deceased: {
    name: {
      firstNames: faker.name.firstName('male'),
      familyName: faker.name.lastName('male')
    },
    gender: 'male',
    birthDate: getRandomDate(75, 200),
    nationality: 'FAR',
    identifier: {
      type: 'NATIONAL_ID',
      id: faker.random.numeric(10)
    },
    address: {
      country: 'FAR',
      province: 'Sulaka',
      district: 'Zobwe',
      urbanOrRural: 'Urban',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      postcodeOrZip: faker.address.zipCode()
    }
  },
  event: {
    manner: 'Natural causes',
    date: getRandomDate(0, 20),
    cause: {
      established: true,
      source: 'Physician'
    },
    place: "Deceased's usual place of residence"
  },
  informantType: 'Spouse',
  informantEmail: faker.internet.email(),
  spouse: {
    name: {
      firstNames: faker.name.firstName('female'),
      familyName: faker.name.lastName('female')
    },
    birthDate: getRandomDate(50, 200),
    nationality: 'Farajaland',
    identifier: {
      id: faker.random.numeric(10),
      type: 'NATIONAL_ID'
    },
    address: {
      sameAsDeceased: true
    }
  }
}
