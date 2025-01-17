import GlobalLoader from './globalLoader.js'
let currentPage = 1
let rowsPerPage = 10
let totalPages = 1
let sortDirection = 'desc'
let sortColumn = '' // 'desc' by default
var defaultLang = 'fr'

var countryData = {
  AFG: { fr: 'Afghanistan', en: 'Afghanistan' },
  ALB: { fr: 'Albanie', en: 'Albania' },
  DZA: { fr: 'Algérie', en: 'Algeria' },
  AND: { fr: 'Andorre', en: 'Andorra' },
  AGO: { fr: 'Angola', en: 'Angola' },
  ARG: { fr: 'Argentine', en: 'Argentina' },
  ARM: { fr: 'Arménie', en: 'Armenia' },
  AUS: { fr: 'Australie', en: 'Australia' },
  AUT: { fr: 'Autriche', en: 'Austria' },
  AZE: { fr: 'Azerbaïdjan', en: 'Azerbaijan' },
  BHS: { fr: 'Bahamas', en: 'Bahamas' },
  BHR: { fr: 'Bahreïn', en: 'Bahrain' },
  BGD: { fr: 'Bangladesh', en: 'Bangladesh' },
  BLR: { fr: 'Biélorussie', en: 'Belarus' },
  BEL: { fr: 'Belgique', en: 'Belgium' },
  BLZ: { fr: 'Belize', en: 'Belize' },
  BEN: { fr: 'Bénin', en: 'Benin' },
  BTN: { fr: 'Bhoutan', en: 'Bhutan' },
  BOL: { fr: 'Bolivie', en: 'Bolivia' },
  BIH: { fr: 'Bosnie-Herzégovine', en: 'Bosnia and Herzegovina' },
  BWA: { fr: 'Botswana', en: 'Botswana' },
  BRA: { fr: 'Brésil', en: 'Brazil' },
  BRN: { fr: 'Brunei', en: 'Brunei' },
  BGR: { fr: 'Bulgarie', en: 'Bulgaria' },
  BFA: { fr: 'Burkina Faso', en: 'Burkina Faso' },
  BDI: { fr: 'Burundi', en: 'Burundi' },
  KHM: { fr: 'Cambodge', en: 'Cambodia' },
  CMR: { fr: 'Cameroun', en: 'Cameroon' },
  CAN: { fr: 'Canada', en: 'Canada' },
  CPV: { fr: 'Cap-Vert', en: 'Cape Verde' },
  CAF: { fr: 'République centrafricaine', en: 'Central African Republic' },
  TCD: { fr: 'Tchad', en: 'Chad' },
  CHL: { fr: 'Chili', en: 'Chile' },
  CHN: { fr: 'Chine', en: 'China' },
  COL: { fr: 'Colombie', en: 'Colombia' },
  COM: { fr: 'Comores', en: 'Comoros' },
  COG: { fr: 'Congo', en: 'Congo' },
  COD: { fr: 'Congo (RDC)', en: 'Congo (DRC)' },
  CRI: { fr: 'Costa Rica', en: 'Costa Rica' },
  HRV: { fr: 'Croatie', en: 'Croatia' },
  CUB: { fr: 'Cuba', en: 'Cuba' },
  CYP: { fr: 'Chypre', en: 'Cyprus' },
  CZE: { fr: 'Tchéquie', en: 'Czech Republic' },
  DNK: { fr: 'Danemark', en: 'Denmark' },
  DJI: { fr: 'Djibouti', en: 'Djibouti' },
  DMA: { fr: 'Dominique', en: 'Dominica' },
  DOM: { fr: 'République dominicaine', en: 'Dominican Republic' },
  ECU: { fr: 'Équateur', en: 'Ecuador' },
  EGY: { fr: 'Égypte', en: 'Egypt' },
  SLV: { fr: 'Salvador', en: 'El Salvador' },
  GNQ: { fr: 'Guinée équatoriale', en: 'Equatorial Guinea' },
  ERI: { fr: 'Érythrée', en: 'Eritrea' },
  EST: { fr: 'Estonie', en: 'Estonia' },
  SWZ: { fr: 'Eswatini', en: 'Eswatini' },
  ETH: { fr: 'Éthiopie', en: 'Ethiopia' },
  FJI: { fr: 'Fidji', en: 'Fiji' },
  FIN: { fr: 'Finlande', en: 'Finland' },
  FRA: { fr: 'France', en: 'France' },
  GAB: { fr: 'Gabon', en: 'Gabon' },
  GMB: { fr: 'Gambie', en: 'Gambia' },
  GEO: { fr: 'Géorgie', en: 'Georgia' },
  DEU: { fr: 'Allemagne', en: 'Germany' },
  GHA: { fr: 'Ghana', en: 'Ghana' },
  GRC: { fr: 'Grèce', en: 'Greece' },
  GRD: { fr: 'Grenade', en: 'Grenada' },
  GTM: { fr: 'Guatemala', en: 'Guatemala' },
  GIN: { fr: 'Guinée', en: 'Guinea' },
  GNB: { fr: 'Guinée-Bissau', en: 'Guinea-Bissau' },
  GUY: { fr: 'Guyana', en: 'Guyana' },
  HTI: { fr: 'Haïti', en: 'Haiti' },
  HND: { fr: 'Honduras', en: 'Honduras' },
  HUN: { fr: 'Hongrie', en: 'Hungary' },
  ISL: { fr: 'Islande', en: 'Iceland' },
  IND: { fr: 'Inde', en: 'India' },
  IDN: { fr: 'Indonésie', en: 'Indonesia' },
  IRN: { fr: 'Iran', en: 'Iran' },
  IRQ: { fr: 'Irak', en: 'Iraq' },
  IRL: { fr: 'Irlande', en: 'Ireland' },
  ISR: { fr: 'Israël', en: 'Israel' },
  ITA: { fr: 'Italie', en: 'Italy' },
  JAM: { fr: 'Jamaïque', en: 'Jamaica' },
  JPN: { fr: 'Japon', en: 'Japan' },
  JOR: { fr: 'Jordanie', en: 'Jordan' },
  KAZ: { fr: 'Kazakhstan', en: 'Kazakhstan' },
  KEN: { fr: 'Kenya', en: 'Kenya' },
  KIR: { fr: 'Kiribati', en: 'Kiribati' },
  KWT: { fr: 'Koweït', en: 'Kuwait' },
  KGZ: { fr: 'Kirghizistan', en: 'Kyrgyzstan' },
  LAO: { fr: 'Laos', en: 'Laos' },
  LVA: { fr: 'Lettonie', en: 'Latvia' },
  LBN: { fr: 'Liban', en: 'Lebanon' },
  LSO: { fr: 'Lesotho', en: 'Lesotho' },
  LBR: { fr: 'Liberia', en: 'Liberia' },
  LBY: { fr: 'Libye', en: 'Libya' },
  LIE: { fr: 'Liechtenstein', en: 'Liechtenstein' },
  LTU: { fr: 'Lituanie', en: 'Lithuania' },
  LUX: { fr: 'Luxembourg', en: 'Luxembourg' },
  MDG: { fr: 'Madagascar', en: 'Madagascar' },
  MWI: { fr: 'Malawi', en: 'Malawi' },
  MYS: { fr: 'Malaisie', en: 'Malaysia' },
  MDV: { fr: 'Maldives', en: 'Maldives' },
  MLI: { fr: 'Mali', en: 'Mali' },
  MLT: { fr: 'Malte', en: 'Malta' },
  MHL: { fr: 'Îles Marshall', en: 'Marshall Islands' },
  MRT: { fr: 'Mauritanie', en: 'Mauritania' },
  MUS: { fr: 'Maurice', en: 'Mauritius' },
  MEX: { fr: 'Mexique', en: 'Mexico' },
  FSM: { fr: 'Micronésie', en: 'Micronesia' },
  MDA: { fr: 'Moldavie', en: 'Moldova' },
  MCO: { fr: 'Monaco', en: 'Monaco' },
  MNG: { fr: 'Mongolie', en: 'Mongolia' },
  MNE: { fr: 'Monténégro', en: 'Montenegro' },
  MAR: { fr: 'Maroc', en: 'Morocco' },
  MOZ: { fr: 'Mozambique', en: 'Mozambique' },
  MMR: { fr: 'Birmanie', en: 'Myanmar' },
  NAM: { fr: 'Namibie', en: 'Namibia' },
  NRU: { fr: 'Nauru', en: 'Nauru' },
  NPL: { fr: 'Népal', en: 'Nepal' },
  NLD: { fr: 'Pays-Bas', en: 'Netherlands' },
  NZL: { fr: 'Nouvelle-Zélande', en: 'New Zealand' },
  NIC: { fr: 'Nicaragua', en: 'Nicaragua' },
  NER: { fr: 'Niger', en: 'Niger' },
  NGA: { fr: 'Nigéria', en: 'Nigeria' },
  PRK: { fr: 'Corée du Nord', en: 'North Korea' },
  MKD: { fr: 'Macédoine du Nord', en: 'North Macedonia' },
  NOR: { fr: 'Norvège', en: 'Norway' },
  OMN: { fr: 'Oman', en: 'Oman' },
  PAK: { fr: 'Pakistan', en: 'Pakistan' },
  PLW: { fr: 'Palaos', en: 'Palau' },
  PSE: { fr: 'Palestine', en: 'Palestine' },
  PAN: { fr: 'Panama', en: 'Panama' },
  PNG: { fr: 'Papouasie-Nouvelle-Guinée', en: 'Papua New Guinea' },
  PRY: { fr: 'Paraguay', en: 'Paraguay' },
  PER: { fr: 'Pérou', en: 'Peru' },
  PHL: { fr: 'Philippines', en: 'Philippines' },
  POL: { fr: 'Pologne', en: 'Poland' },
  PRT: { fr: 'Portugal', en: 'Portugal' },
  QAT: { fr: 'Qatar', en: 'Qatar' },
  ROU: { fr: 'Roumanie', en: 'Romania' },
  RUS: { fr: 'Russie', en: 'Russia' },
  RWA: { fr: 'Rwanda', en: 'Rwanda' },
  KNA: { fr: 'Saint-Christophe-et-Niévès', en: 'Saint Kitts and Nevis' },
  LCA: { fr: 'Sainte-Lucie', en: 'Saint Lucia' },
  VCT: {
    fr: 'Saint-Vincent-et-les-Grenadines',
    en: 'Saint Vincent and the Grenadines'
  },
  WSM: { fr: 'Samoa', en: 'Samoa' },
  SMR: { fr: 'Saint-Marin', en: 'San Marino' },
  STP: { fr: 'Sao Tomé-et-Principe', en: 'Sao Tome and Principe' },
  SAU: { fr: 'Arabie Saoudite', en: 'Saudi Arabia' },
  SEN: { fr: 'Sénégal', en: 'Senegal' },
  SRB: { fr: 'Serbie', en: 'Serbia' },
  SYC: { fr: 'Seychelles', en: 'Seychelles' },
  SLE: { fr: 'Sierra Leone', en: 'Sierra Leone' },
  SGP: { fr: 'Singapour', en: 'Singapore' },
  SVK: { fr: 'Slovaquie', en: 'Slovakia' },
  SVN: { fr: 'Slovénie', en: 'Slovenia' },
  SLB: { fr: 'Îles Salomon', en: 'Solomon Islands' },
  SOM: { fr: 'Somalie', en: 'Somalia' },
  ZAF: { fr: 'Afrique du Sud', en: 'South Africa' },
  KOR: { fr: 'Corée du Sud', en: 'South Korea' },
  SSD: { fr: 'Soudan du Sud', en: 'South Sudan' },
  ESP: { fr: 'Espagne', en: 'Spain' },
  LKA: { fr: 'Sri Lanka', en: 'Sri Lanka' },
  SDN: { fr: 'Soudan', en: 'Sudan' },
  SUR: { fr: 'Suriname', en: 'Suriname' },
  SWE: { fr: 'Suède', en: 'Sweden' },
  CHE: { fr: 'Suisse', en: 'Switzerland' },
  SYR: { fr: 'Syrie', en: 'Syria' },
  TWN: { fr: 'Taïwan', en: 'Taiwan' },
  TJK: { fr: 'Tadjikistan', en: 'Tajikistan' },
  TZA: { fr: 'Tanzanie', en: 'Tanzania' },
  THA: { fr: 'Thaïlande', en: 'Thailand' },
  TLS: { fr: 'Timor-Leste', en: 'Timor-Leste' },
  TGO: { fr: 'Togo', en: 'Togo' },
  TON: { fr: 'Tonga', en: 'Tonga' },
  TTO: { fr: 'Trinité-et-Tobago', en: 'Trinidad and Tobago' },
  TUN: { fr: 'Tunisie', en: 'Tunisia' },
  TUR: { fr: 'Turquie', en: 'Turkey' },
  TKM: { fr: 'Turkménistan', en: 'Turkmenistan' },
  TUV: { fr: 'Tuvalu', en: 'Tuvalu' },
  UGA: { fr: 'Ouganda', en: 'Uganda' },
  UKR: { fr: 'Ukraine', en: 'Ukraine' },
  ARE: { fr: 'Émirats Arabes Unis', en: 'United Arab Emirates' },
  GBR: { fr: 'Royaume-Uni', en: 'United Kingdom' },
  USA: { fr: 'États-Unis', en: 'United States' },
  URY: { fr: 'Uruguay', en: 'Uruguay' },
  UZB: { fr: 'Ouzbékistan', en: 'Uzbekistan' },
  VUT: { fr: 'Vanuatu', en: 'Vanuatu' },
  VAT: { fr: 'Vatican', en: 'Vatican City' },
  VEN: { fr: 'Venezuela', en: 'Venezuela' },
  VNM: { fr: 'Vietnam', en: 'Vietnam' },
  YEM: { fr: 'Yémen', en: 'Yemen' },
  ZMB: { fr: 'Zambie', en: 'Zambia' },
  ZWE: { fr: 'Zimbabwe', en: 'Zimbabwe' }
}

const eventType = {
  Birth: 'Naissance'
}
let currentRegistrarOffice
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  let interval = Math.floor(seconds / 31536000) // years
  if (interval > 1)
    return 'il y a ' + interval + ` an${interval > 1 ? 's' : ''}`
  interval = Math.floor(seconds / 2592000) // months
  if (interval > 1) return 'il y a ' + interval + ' mois'
  interval = Math.floor(seconds / 86400) // days
  if (interval >= 1)
    return 'il y a ' + interval + ` jour${interval > 1 ? 's' : ''}`
  interval = Math.floor(seconds / 3600) // hours
  if (interval >= 1)
    return 'il y a ' + interval + ` heure${interval > 1 ? 's' : ''}`
  interval = Math.floor(seconds / 60) // minutes
  if (interval >= 1)
    return 'il y a ' + interval + ` minute${interval > 1 ? 's' : ''}`
  return seconds < 5 ? "à l'instant" : 'il y a ' + seconds + ' secondes'
}

/** HOF for async function with global loader */
const handleAsyncFunction = async (asyncFunc) => {
  try {
    GlobalLoader.showLoader()
    return await asyncFunc()
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    GlobalLoader.hideLoader()
  }
}

/** Event Location by event id */
const fetchLocationById = (eventLocationId) =>
  handleAsyncFunction(async () => {
    if (eventLocationId) {
      const apiUrl = window.config.API_GATEWAY_URL
      const formattedApiUrl = apiUrl.endsWith('/')
        ? apiUrl.slice(0, -1)
        : apiUrl
      const response = await fetch(
        `${formattedApiUrl}/location/${eventLocationId}`,
        {
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
            // Authorization: `Bearer ${token}`
          }
        }
      )
      const locationData = await response.json()
      return locationData
    }
    return undefined
  })

/** Locations */
const fetchLocations = () =>
  handleAsyncFunction(async () => {
    const apiUrl = window.config.API_GATEWAY_URL
    const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const response = await fetch(
      `${formattedApiUrl}/locations?type=ADMIN_STRUCTURE&status=active&_count=0`,
      {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    const locationData = await response.json()
    return locationData.entry?.map((item) => ({
      id: item.resource.id,
      alias: item.resource.alias,
      name: item.resource.name,
      partOf: item.resource.partOf?.reference,
      status: item.resource.status
    }))
  })

/** Birth location by id */
const fetchOtherBirthLocation = (id) =>
  handleAsyncFunction(async () => {
    const query = `
  query fetchBirthRegistrationEventLocationForCertificate($id: ID!) {
    fetchBirthRegistration(id: $id) {
        _fhirIDMap
        id
        eventLocation {
          id
          type
          address {
              type
              line
              lineName
              district
              districtName
              state
              stateName
              city
              postalCode
              country
          }
        }
        questionnaire {
          fieldId
          value
        }
      }
    }
  `

    const response = await fetch('/graphql', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: { id }
      })
    })

    if (!response.ok) {
      throw new Error(
        'Something went wrong with the graphql request: fetchOtherBirthLocation'
      )
    }

    const data = await response.json()
    return data
  })

/** Fetch Events list */
const fetchEvents = (variables) =>
  handleAsyncFunction(async () => {
    const query = `
    query(
      $userId: String
      $advancedSearchParameters: AdvancedSearchParametersInput!
      $count: Int
      $skip: Int
      $sort: String
      $sortColumn: String
      $sortBy: [SortBy!]
    ) {
      searchEvents(
        userId: $userId
        advancedSearchParameters: $advancedSearchParameters
        count: $count
        skip: $skip
        sort: $sort
        sortColumn: $sortColumn
        sortBy: $sortBy
      ) {
        totalItems
        results {
          id
          type
          registration {
            createdAt
            status
            dateOfDeclaration
            registrationNumber
            assignment {
              firstName
              lastName
              officeName
            }
          }
          ... on BirthEventSearchSet {
            dateOfBirth
            childName {
              firstNames
              middleName
              familyName
              use
            }
          }
          __typename
        }
      }
    }`

    const response = await fetch('/graphql', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error('Something went wrong with the graphql request')
    }

    const data = await response.json()

    if (data?.errors?.[0].extensions.code === 'UNAUTHENTICATED') {
      window.location.href =
        window.config.LOGIN_URL +
        '?redirectTo=' +
        encodeURIComponent(window.config.COUNTRY_CONFIG_URL)
    }
    return data
  })

/**Fetch connected user primary office */
const fetchUser = (variables) =>
  handleAsyncFunction(async () => {
    const query = `
    query(
      $userId: String
    ) {
      getUser(
        userId: $userId
      ) {
        primaryOffice {
          hierarchy {
            id
            name
            type
          }
          status
          name
          alias
        }
      }
    }`

    const response = await fetch('/graphql', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error('Something went wrong with the graphql request')
    }

    const data = await response.json()

    if (data?.errors?.[0].extensions.code === 'UNAUTHENTICATED') {
      window.location.href =
        window.config.LOGIN_URL +
        '?redirectTo=' +
        encodeURIComponent(window.config.COUNTRY_CONFIG_URL)
    }
    return data
  })

/** Get & Generate child birth location by id and type */
const getChildBirthLocation = (eventLocationId, type, id) =>
  handleAsyncFunction(async () => {
    if (eventLocationId && type) {
      switch (type) {
        case 'HEALTH_FACILITY':
          const healthFacility = await fetchLocationById(eventLocationId)
          const healthFacilityCommune = await fetchLocationById(
            healthFacility?.partOf?.reference?.split?.('/')[1]
          )
          const healthFacilityDistrict = await fetchLocationById(
            healthFacilityCommune?.partOf?.reference?.split?.('/')[1]
          )

          return {
            name: healthFacility?.name,
            stateName: healthFacilityCommune?.name,
            districtName: healthFacilityDistrict.name
          }
        case 'OTHER':
          const other = await fetchLocationById(eventLocationId)
          return other.address
        default:
          const home = await fetchOtherBirthLocation(id)
          return home.data.fetchBirthRegistration.eventLocation.address
      }
    }
  })

/** Main fetch for birth registration information */
const fetchBirthRegistrationForCertificate = (variables) =>
  handleAsyncFunction(async () => {
    const query = `
      query fetchBirthRegistrationForCertificate($id: ID!) {
        fetchBirthRegistration(id: $id) {
          _fhirIDMap
          id
          child {
            id
            multipleBirth
            identifier {
              id
              type
              otherType
            }
            name {
              use
              firstNames
              middleName
              familyName
            }
            birthDate
            gender
          }
          mother {
            id
            name {
              use
              firstNames
              middleName
              familyName
            }
            birthDate
            maritalStatus
            dateOfMarriage
            educationalAttainment
            nationality
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            identifier {
              id
              type
              otherType
            }
            address {
              type
              line
              lineName
              district
              districtName
              state
              stateName
              city
              postalCode
              country
            }
            telecom {
              system
              value
            }
          }
          father {
            id
            name {
              use
              firstNames
              middleName
              familyName
            }
            birthDate
            maritalStatus
            dateOfMarriage
            educationalAttainment
            nationality
            occupation
            detailsExist
            reasonNotApplying
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            identifier {
              id
              type
              otherType
            }
            address {
              type
              line
              lineName
              district
              districtName
              state
              stateName
              city
              postalCode
              country
            }
            telecom {
              system
              value
            }
          }
          informant {
            id
            relationship
            otherRelationship
            _fhirIDPatient
            identifier {
              id
              type
              otherType
            }
            name {
              use
              firstNames
              middleName
              familyName
            }
            nationality
            occupation
            birthDate
            ageOfIndividualInYears
            exactDateOfBirthUnknown
            address {
              type
              line
              lineName
              district
              districtName
              state
              stateName
              city
              postalCode
              country
            }
          }
          createdAt
          registration {
            id
            informantType
            otherInformantType
            contact
            contactPhoneNumber
            contactEmail
            status {
              comments {
                comment
              }
              type
              timestamp
              location {
                name
                alias
              }
              office {
                name
                alias
                address {
                  district
                  state
                }
                partOf
              }
            }
            trackingId
            registrationNumber
            mosipAid
            assignment {
              firstName
              lastName
              officeName
            }
          }
          attendantAtBirth
          weightAtBirth
          birthType
          questionnaire {
            fieldId
            value
          }
          eventLocation {
            id
            type
          }
          history {
            date
            action
            regStatus
            dhis2Notification
            ipAddress
            statusReason {
              text
            }
            reason
            otherReason
            location {
              id
              name
            }
            office {
              id
              name
              alias
              address {
                state
                district
              }
            }
            system {
              name
              type
            }
            user {
              id
              role {
                _id
                labels {
                  lang
                  label
                }
              }
              systemRole
              name {
                firstNames
                familyName
                use
              }
              avatar {
                data
                type
              }
            }
            signature {
              data
              type
            }
            comments {
              user {
                id
                username
                avatar {
                  data
                  type
                }
              }
              comment
              createdAt
            }
            input {
              valueCode
              valueId
              value
            }
            output {
              valueCode
              valueId
              value
            }
            certificates {
              hasShowedVerifiedDocument
              collector {
                relationship
                otherRelationship
                name {
                  use
                  firstNames
                  familyName
                }
                telecom {
                  system
                  value
                  use
                }
              }
            }
            duplicateOf
            potentialDuplicates
          }
        }
      }`

    const response = await fetch('/graphql', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) {
      throw new Error('Something went wrong with the graphql request')
    }

    const data = await response.json()
    return data
  })

// Recursive function to build the hierarchical name structure
function buildLocationHierarchy(locations) {
  const result = []
  const locationMap = {}
  locations.forEach((location) => {
    locationMap[location.id] = location
  })

  locations.forEach((location) => {
    let locationName = location.name
    let parentId = location.partOf.split('/')[1]

    if (parentId !== '0' && locationMap[parentId]) {
      let parentLocation = locationMap[parentId]
      locationName = `${location.name}, District ${parentLocation.name}`
      result.push({
        id: location.id,
        name: locationName
      })
    }
  })

  return [
    ...new Map(result.map((item) => [JSON.stringify(item), item])).values()
  ]
}

// Function to render table rows with pagination
const renderTable = async () => {
  const startDate = document.getElementById('startDate').value
  const endDate = document.getElementById('endDate').value
  const search = document.getElementById('searchInput').value
  const location = document.getElementById('locationSearchInput')?.dataset.id

  const fetchUserVariables = {
    userId: connectedUserIdFromJwt
  }

  const connectedRegistrar = await fetchUser(fetchUserVariables)
  const locationHierarchy =
    connectedRegistrar?.data?.getUser?.primaryOffice?.hierarchy

  currentRegistrarOffice = locationHierarchy

  if (connectedRegistrar && !location) {
    document.getElementById('locationSearchInput').value =
      locationHierarchy?.[0]?.name ?? ''
  }

  const variables = {
    advancedSearchParameters: {
      registrationStatuses: ['CERTIFIED', 'ISSUED'],
      dateOfRegistrationStart: startDate,
      dateOfRegistrationEnd: endDate,
      name: search,
      declarationJurisdictionId: !!location
        ? location
        : locationHierarchy?.[0]?.id
    },
    count: rowsPerPage,
    skip: (currentPage - 1) * rowsPerPage,
    sort: sortDirection
  }

  const events = await fetchEvents(variables)

  totalPages = Math.ceil(events.data.searchEvents?.totalItems / rowsPerPage)

  const tableBody = document.getElementById('data-table')
  tableBody.innerHTML = ''
  const searchResults = events.data.searchEvents?.results

  if (searchResults.length > 0) {
    searchResults.forEach((item) => {
      const row = document.createElement('tr')
      row.classList.add('bg-white', 'hover:bg-gray-50')

      row.innerHTML = `
      <td class="px-4 py-2 border-b border-gray-300 text-blue-600"> ${[
        item.childName[0].familyName,
        item.childName[0].firstNames,
        item.childName[0].middleName
      ]
        .join(' ')
        .trim()}</td>
      <td class="px-4 py-2 border-b border-gray-300">${
        eventType[item.type]
      }</td>
      <td class="px-4 py-2 border-b border-gray-300">${timeAgo(
        item.dateOfBirth
      )}</td>
      <td class="px-4 py-2 border-b border-gray-300">${timeAgo(
        item.registration.dateOfDeclaration
      )}</td>
      <td  class="px-4 py-2 border-b border-gray-300"><button class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded" onclick="openPrintModal('${
        item.id
      }')">Imprimer</button></td>
    `
      tableBody.appendChild(row)
    })
    renderPagination()
  } else {
    const noDataRow = document.createElement('tr')
    noDataRow.classList.add('bg-white')
    noDataRow.innerHTML = `
    <td colspan="5" class="px-4 py-2 border-b border-gray-300 text-center text-gray-500">
      Aucun enregistrement
    </td>
  `
    tableBody.appendChild(noDataRow)
  }
}

window.nextPage = function nextPage() {
  if (currentPage < totalPages) {
    currentPage++
    renderTable()
  }
}

window.prevPage = function prevPage() {
  if (currentPage > 1) {
    currentPage--
    renderTable()
  }
}

window.openPrintModal = async function openPrintModal(id) {
  const person = await fetchBirthRegistrationForCertificate({ id })

  if (person.data.fetchBirthRegistration) {
    const eventLocationId =
      person.data.fetchBirthRegistration.eventLocation.id ?? ''
    const eventLocationType =
      person.data.fetchBirthRegistration.eventLocation.type ?? ''
    const childBirthLocation = await getChildBirthLocation(
      eventLocationId,
      eventLocationType,
      id
    )

    const modal = document.getElementById('printModal')
    modal.classList.remove('hidden')

    const event = person.data.fetchBirthRegistration

    const legacyDate = event?.questionnaire?.find(
      (q) =>
        q.fieldId === 'birth.child.child-view-group.legacyBirthRegistrationDate'
    )

    const createdDate =
      legacyDate && legacyDate.value ? legacyDate.value : event.createdAt // Retirer le 'Z' à la fin

    const isFatherHasFormallyRecognisedChild = (
      event?.questionnaire?.find(
        (q) =>
          q.fieldId ===
          'birth.father.father-view-group.fatherHasFormallyRecognisedChild'
      ) || { value: '' }
    ).value

    const title =
      isFatherHasFormallyRecognisedChild == 'true'
        ? 'FAHATERAHANA SY FANJANAHANA'
        : 'FAHATERAHANA'

    // child info
    const childFirstName = event.child.name[0].familyName
    const childLastName = [
      event.child.name[0].middleName,
      event.child.name[0].firstNames
    ]
      .join(' ')
      .trim()

    const birthChildBirthTime = (
      event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.child.child-view-group.birthTime'
      ) || { value: '' }
    ).value

    const childLegacyBirthRegistrationNumber = event.questionnaire?.find(
      (q) =>
        q.fieldId ===
        'birth.child.child-view-group.legacyBirthRegistrationNumber'
    )?.value
    const childNUI = (
      event?.child?.identifier?.find((q) => q.type === 'NATIONAL_ID') || {
        id: ''
      }
    ).id

    const eventStatementContext = {
      eventDate: event.child.birthDate,
      birthChildBirthTime: birthChildBirthTime,
      countryPlaceofbirth: childBirthLocation?.country
        ? countryData[childBirthLocation?.country][defaultLang]
        : '',
      placeOfBirthFacility: childBirthLocation?.name,
      birthChildFokontanyCustomAddress:
        typeof childBirthLocation === 'object'
          ? event?.questionnaire?.find(
              (q) =>
                q.fieldId ===
                'birth.child.child-view-group.fokontanyCustomAddress'
            )?.value
          : undefined,
      placeOfBirthDistrict: childBirthLocation?.stateName,
      placeOfBirthState: childBirthLocation?.districtName,
      childFamilyName: event.child.name[0].familyName,
      childFirstName: [
        event.child.name[0].middleName,
        event.child.name[0].firstNames
      ]
        .join(' ')
        .trim(),
      childGender: event.child.gender,
      internationalStatePlaceofbirth: childBirthLocation?.state,
      internationalDistrictPlaceofbirth: childBirthLocation?.district,
      internationalCityPlaceofbirth: childBirthLocation?.city,
      internationalAddressLine1Placeofbirth: childBirthLocation?.line?.[6],
      internationalAddressLine2Placeofbirth: childBirthLocation?.line?.[7],
      internationalAddressLine3Placeofbirth: childBirthLocation?.line?.[8],
      internationalPostalCodePlaceofbirth: childBirthLocation?.postalCode
    }

    const fatherDetailsContext = {
      fatherReasonNotApplying: event.father.reasonNotApplying,
      fatherFamilyName:
        event.father.name && event.father.name[0]
          ? event.father.name[0].familyName
          : '',
      fatherFirstName: [
        event.father.name && event.father.name[0]
          ? event.father.name[0].middleName
          : '',
        event.father.name && event.father.name[0]
          ? event.father.name[0].firstNames
          : ''
      ]
        .join(' ')
        .trim(),
      birthFatherCustomizedExactDateOfBirthUnknown:
        (
          event?.questionnaire?.find(
            (q) =>
              q.fieldId ===
              'birth.father.father-view-group.customizedExactDateOfBirthUnknown'
          ) || { value: false }
        ).value == 'true'
          ? true
          : false,
      birthFatherYearOfBirth: (
        event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.father.father-view-group.yearOfBirth'
        ) || { value: '' }
      ).value,
      fatherBirthDate: event.father.birthDate,
      birthFatherBirthPlace: (
        event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.father.father-view-group.birthPlace'
        ) || { value: '' }
      ).value,
      birthFatherFatherIsDeceased:
        (
          event?.questionnaire?.find(
            (q) =>
              q.fieldId === 'birth.father.father-view-group.fatherIsDeceased'
          ) || {
            value: false
          }
        ).value == 'true'
          ? true
          : false,
      countryPrimaryFather: event.father.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.country
        ? countryData[
            event.father.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
              ?.country
          ][defaultLang]
        : '',
      birthFatherFokontanyCustomAddress: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.mother.mother-view-group.fokontanyCustomAddress'
        ) || { value: '' }
      ).value,
      birthMotherFokontanyCustomAddress: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.mother.mother-view-group.fokontanyCustomAddress'
        ) || { value: '' }
      ).value,
      fatherPrimaryDistrict: event.father.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.districtName,
      fatherOccupation: event.father.occupation,
      birthFatherFatherHasFormallyRecognisedChild:
        isFatherHasFormallyRecognisedChild,
      motherReasonNotApplying: event.mother.reasonNotApplying,
      internationalStatePrimaryFather: event.father.address?.state,
      internationalDistrictPrimaryFather: event.father.address?.district,
      internationalCityPrimaryFather: event.father.address?.city,
      internationalAddressLine1PrimaryFather: event.father.address?.line?.[6],
      internationalAddressLine2PrimaryFather: event.father.address?.line?.[7],
      internationalAddressLine3PrimaryFather: event.father.address?.line?.[8],
      internationalPostalCodePrimaryFather: event.father.address?.postalCode
    }

    const motherDetailsContext = {
      motherPrimaryDistrict: event.mother.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.districtName,
      motherReasonNotApplying: event.mother.reasonNotApplying,
      motherFamilyName:
        event.mother.name && event.mother.name[0]
          ? event.mother.name[0].familyName
          : '',
      motherFirstName: [
        event.mother.name && event.mother.name[0]
          ? event.mother.name[0].middleName
          : '',
        event.mother.name && event.mother.name[0]
          ? event.mother.name[0].firstNames
          : ''
      ]
        .join(' ')
        .trim(),
      birthMotherCustomizedExactDateOfBirthUnknown:
        event.mother.exactDateOfBirthUnknown,
      birthMotherYearOfBirth: (
        event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.mother.mother-view-group.yearOfBirth'
        ) || { value: '' }
      ).value,
      motherBirthDate: event.mother.birthDate,
      birthMotherBirthPlace: (
        event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.mother.mother-view-group.birthPlace'
        ) || { value: '' }
      ).value,
      birthMotherMotherIsDeceased:
        (
          event?.questionnaire?.find(
            (q) =>
              q.fieldId === 'birth.mother.mother-view-group.motherIsDeceased'
          ) || { value: false }
        ).value == 'true'
          ? true
          : false,
      countryPrimaryMother: event.mother.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.country
        ? countryData[
            event.mother.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
              ?.country
          ][defaultLang]
        : '',
      birthMotherFokontanyCustomAddress: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.mother.mother-view-group.fokontanyCustomAddress'
        ) || { value: '' }
      ).value,
      motherOccupation: event.mother.occupation,
      internationalStatePrimaryMother: event.mother.address?.state,
      internationalDistrictPrimaryMother: event.mother.address?.district,
      internationalCityPrimaryMother: event.mother.address?.city,
      internationalAddressLine1PrimaryMother: event.mother.address?.line?.[6],
      internationalAddressLine2PrimaryMother: event.mother.address?.line?.[7],
      internationalAddressLine3PrimaryMother: event.mother.address?.line?.[8],
      internationalPostalCodePrimaryMother: event.mother.address?.postalCode
    }

    const registrationStatementContext = {
      birthChildLegacyBirthRegistrationDate: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.child.child-view-group.legacyBirthRegistrationDate'
        ) || { value: '' }
      ).value,
      birthChildLegacyBirthRegistrationTime: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.child.child-view-group.legacyBirthRegistrationTime'
        ) || { value: '' }
      ).value,
      registrarDate: event.createdAt,
      timezone: 'Africa/Nairobi',
      informantType: event.informant.relationship,
      informantFamilyName: event.informant.name[0].familyName,
      informantFirstName: [
        event.informant.name[0].middleName,
        event.informant.name[0].firstNames
      ]
        .join(' ')
        .trim(),
      birthInformantCustomizedExactDateOfBirthUnknown:
        event.informant.exactDateOfBirthUnknown,
      birthInformantYearOfBirth: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId === 'birth.informant.informant-view-group.yearOfBirth'
        ) || { value: '' }
      ).value,
      informantBirthDate: event.informant.birthDate,
      birthInformantBirthPlace: (
        event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.informant.informant-view-group.birthPlace'
        ) || { value: '' }
      ).value,
      countryPrimaryInformant: event.informant.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.country
        ? countryData[
            event.informant.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
              ?.country
          ][defaultLang]
        : '',
      birthInformantFokontanyCustomAddress: (
        event?.questionnaire?.find(
          (q) =>
            q.fieldId ===
            'birth.informant.informant-view-group.fokontanyCustomAddress'
        ) || { value: '' }
      ).value,
      informantPrimaryDistrict: event.informant?.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.districtName,
      informantOccupation: event.informant.occupation,
      registrarName: [
        event.registration.assignment.firstName,
        event.registration.assignment.lastName
      ]
        .join(' ')
        .trim(),
      registrationDistrict: event.registration.assignment.officeName,
      internationalStatePrimaryInformant: event.informant.address?.state,
      internationalDistrictPrimaryInformant: event.informant.address?.district,
      internationalCityPrimaryInformant: event.informant.address?.city,
      internationalAddressLine1PrimaryInformant:
        event.informant.address?.line?.[6],
      internationalAddressLine2PrimaryInformant:
        event.informant.address?.line?.[7],
      internationalAddressLine3PrimaryInformant:
        event.informant.address?.line?.[8],
      internationalPostalCodePrimaryInformant:
        event.informant.address?.postalCode
    }

    const printableData = {
      soratra: childLegacyBirthRegistrationNumber,
      nataoNy: window.setLocaleDateCustomString(createdDate.split('T')[0]),
      title: title,
      anarana: childFirstName,
      fanampinAnarana: childLastName,
      lft: childNUI,
      dateOfBirth: window.setLocaleDateCustomString(event.child.birthDate),
      firstParagraph: window.eventStatementSimplified(
        eventStatementContext,
        fatherDetailsContext,
        motherDetailsContext
      ),
      secondParagraph: window.registrationStatementSimplified(
        registrationStatementContext
      )
    }
    document.getElementById('soratra').textContent = printableData.soratra
    document.getElementById('nataoNy').textContent = printableData.nataoNy
    document.getElementById('anarana').textContent = printableData.anarana
    document.getElementById('title').textContent = printableData.title
    document.getElementById('lft').textContent = printableData.lft
    document.getElementById('dateOfBirth').textContent =
      printableData.dateOfBirth
    document.getElementById('fanampinAnarana').textContent =
      printableData.fanampinAnarana
    document.getElementById('firstParagraph').textContent =
      printableData.firstParagraph
    document.getElementById('secondParagraph').textContent =
      printableData.secondParagraph
  }
}

window.closePrintModal = function closePrintModal() {
  const modal = document.getElementById('printModal')
  modal.classList.add('hidden')
}

const renderPagination = () => {
  const paginationNumbers = document.getElementById('pagination-numbers')
  paginationNumbers.innerHTML = ''

  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement('button')
      pageNumber.classList.add('hover:bg-gray-300', 'px-3', 'py-1', 'rounded')
      if (i === currentPage)
        pageNumber.classList.add('bg-blue-500', 'text-white')

      pageNumber.innerText = i
      pageNumber.onclick = () => {
        currentPage = i
        renderTable()
      }

      paginationNumbers.appendChild(pageNumber)
    }
  } else {
    const firstPage = 1
    const lastPage = totalPages

    const firstPageButton = document.createElement('button')
    firstPageButton.classList.add(
      'hover:bg-gray-300',
      'px-3',
      'py-1',
      'rounded'
    )
    if (currentPage === firstPage)
      firstPageButton.classList.add('bg-blue-500', 'text-white')
    firstPageButton.innerText = firstPage
    firstPageButton.onclick = () => {
      currentPage = firstPage
      renderTable()
    }
    paginationNumbers.appendChild(firstPageButton)

    if (currentPage > 2) {
      const ellipsis = document.createElement('span')
      ellipsis.innerText = '...'
      paginationNumbers.appendChild(ellipsis)
    }

    if (currentPage > firstPage && currentPage < lastPage) {
      const currentPageButton = document.createElement('button')
      currentPageButton.classList.add(
        'hover:bg-gray-300',
        'px-3',
        'py-1',
        'rounded'
      )
      currentPageButton.classList.add('bg-blue-500', 'text-white')
      currentPageButton.innerText = currentPage
      paginationNumbers.appendChild(currentPageButton)
    }

    if (currentPage < totalPages - 1) {
      const ellipsis = document.createElement('span')
      ellipsis.innerText = '...'
      paginationNumbers.appendChild(ellipsis)
    }

    const lastPageButton = document.createElement('button')
    lastPageButton.classList.add('hover:bg-gray-300', 'px-3', 'py-1', 'rounded')
    if (currentPage === lastPage)
      lastPageButton.classList.add('bg-blue-500', 'text-white')
    lastPageButton.innerText = lastPage
    lastPageButton.onclick = () => {
      currentPage = lastPage
      renderTable()
    }
    paginationNumbers.appendChild(lastPageButton)
  }
}

window.changePageSize = function changePageSize() {
  const pageSizeSelect = document.getElementById('pageSize')
  rowsPerPage = parseInt(pageSizeSelect.value)
  currentPage = 1
  renderTable()
}

window.sortTable = function sortTable(column) {
  sortColumn = column
  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
  updateSortIcons()
  renderTable()
}

const updateSortIcons = () => {
  document.getElementById('sort-nom').textContent =
    sortColumn === 'nom' ? (sortDirection === 'asc' ? '▲' : '▼') : ''
  document.getElementById('sort-event').textContent =
    sortColumn === 'event' ? (sortDirection === 'asc' ? '▲' : '▼') : ''
  document.getElementById('sort-dateEvent').textContent =
    sortColumn === 'dateEvent' ? (sortDirection === 'asc' ? '▲' : '▼') : ''
  document.getElementById('sort-registered').textContent =
    sortColumn === 'registered' ? (sortDirection === 'asc' ? '▲' : '▼') : ''
}

window.filterByDate = function filterByDate() {
  currentPage = 1
  const startDateInput = document.getElementById('startDate')
  const endDateInput = document.getElementById('endDate')
  const startDateValue = startDateInput.value
  const endDateValue = endDateInput.value
  startDateValue
    ? (endDateInput.min = startDateValue)
    : endDateInput.removeAttribute('min')
  endDateValue
    ? (startDateInput.max = endDateValue)
    : startDateInput.removeAttribute('max')
}

window.filterBySearch = function filterBySearch() {
  currentPage = 1
  renderTable()
}

window.filterByLocation = function filterByLocation() {
  currentPage = 1
  renderTable()
}

window.resetDateFilter = function resetDateFilter() {
  document.getElementById('startDate').value = ''
  document.getElementById('endDate').value = ''
  document.getElementById('searchInput').value = ''
  document.getElementById('locationSearchInput').value = ''
  document.getElementById('locationSearchInput').dataset.id = ''
  currentPage = 1
  renderTable()
}

window.logout = function logout() {
  resetDateFilter()
  window.location.href =
    window.config.LOGIN_URL +
    '?redirectTo=' +
    encodeURIComponent(window.config.COUNTRY_CONFIG_URL)
}

window.generatePDF = function generatePDF(filename) {
  const { jsPDF } = window.jspdf
  const element = document.getElementById('document')

  element.style.background = 'white'
  element.style.boxShadow = 'none'
  element.style.border = 'none'

  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')

    // Add the image to the PDF with consistent margins
    const margin = 20 // 20 points margin on left and right
    const imgWidth = 595.28 - 2 * margin // A4 width (595.28 points) minus left and right margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add image with margin
    pdf.addImage(imgData, 'PNG', margin, 20, imgWidth, imgHeight) // 20 points top margin
    pdf.save(filename ?? 'registre.pdf')

    element.style.background = ''
    element.style.boxShadow = ''
    closePrintModal()
  })
}

const locationSearchInput = document.getElementById('locationSearchInput')
const locationDropdownList = document.getElementById('locationDropdownList')
async function initializeLocationsDropdown() {
  try {
    const locations = await fetchLocations()
    const deepest = buildLocationHierarchy(locations)
    populateDropdown(deepest)
    setupSearchAndSelection(deepest)
  } catch (error) {
    console.error('Error initializing dropdown:', error)
  }
}

function populateDropdown(locations) {
  locationDropdownList.innerHTML = locations
    .map(
      (location) =>
        `<li class="px-3 py-2 hover:bg-blue-100 cursor-pointer" data-id="${location.id}">
          ${location.name}
        </li>`
    )
    .join('')
}

function toggleDropdown(show) {
  locationDropdownList.classList.toggle('hidden', !show)
}

locationSearchInput.addEventListener('blur', () => {
  if (!locationSearchInput.value.toLowerCase().trim()) {
    locationSearchInput.value = currentRegistrarOffice?.[0]?.name
    locationSearchInput.dataset.id = currentRegistrarOffice?.[0]?.id
  }
})

function setupSearchAndSelection(locations) {
  locationSearchInput.addEventListener('input', () => {
    const filteredLocations = locations.filter((location) =>
      location.name
        .toLowerCase()
        .includes(locationSearchInput.value.toLowerCase().trim())
    )

    populateDropdown(filteredLocations)
    toggleDropdown(filteredLocations.length > 0)
  })

  locationDropdownList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
      const selectedId = event.target.getAttribute('data-id')
      const selectedName = event.target.textContent
      locationSearchInput.value = selectedName.trim()
      locationSearchInput.dataset.id = selectedId
      toggleDropdown(false)
      currentPage = 1
      renderTable()
    }
  })

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      toggleDropdown(false)
    }
  })
}

//Initial render
initializeLocationsDropdown()
renderTable()
