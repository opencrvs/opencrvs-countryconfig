import GlobalLoader from './globalLoader.js'
let currentPage = 1
let rowsPerPage = 10
let totalPages = 1
let sortDirection = 'desc'
let sortColumn = '' // 'desc' by default
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
      if (type === 'HEALTH_FACILITY') {
        const birthLocation = await fetchLocationById(eventLocationId)
        return birthLocation.name
      } else {
        const birthLocation = await fetchOtherBirthLocation(id)
        return birthLocation.data.fetchBirthRegistration.eventLocation.address
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
        new Date(Number(item.registration.createdAt))
          .toISOString()
          .split('T')[0]
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

    console.log({ event, childBirthLocation })

    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000 // Décalage horaire en millisecondes
    const createdDate = new Date(now - offset).toISOString().slice(0, -1) // Retirer le 'Z' à la fin

    // child info
    const childFirstName = event.child.name[0].familyName
    const childLastName = [
      event.child.name[0].middleName,
      event.child.name[0].firstNames
    ]
      .join(' ')
      .trim()

    const birthChildBirthTime = (event?.questionnaire?.find(
      (q) => q.fieldId === 'birth.child.child-view-group.birthTime'
    )).value

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
      countryPlaceofbirth: 'Madagascar',
      placeOfBirthFacility:
        typeof childBirthLocation === 'string' ? childBirthLocation : undefined,
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
      internationalStatePlaceofbirth: '',
      internationalDistrictPlaceofbirth: '',
      internationalCityPlaceofbirth: '',
      internationalAddressLine1Placeofbirth: '',
      internationalAddressLine2Placeofbirth: '',
      internationalAddressLine3Placeofbirth: '',
      internationalPostalCodePlaceofbirth: ''
    }

    const fatherDetailsContext = {
      fatherReasonNotApplying: event.father.reasonNotApplying,
      fatherFamilyName: event.father.name[0].familyName,
      fatherFirstName: [
        event.father.name[0].middleName,
        event.father.name[0].firstNames
      ]
        .join(' ')
        .trim(),
      birthFatherCustomizedExactDateOfBirthUnknown: '',
      birthFatherYearOfBirth: '',
      fatherBirthDate: event.father.birthDate,
      birthFatherBirthPlace: (event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.father.father-view-group.birthPlace'
      )).value,
      birthFatherFatherIsDeceased:
        !!(event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.father.father-view-group.fatherIsDeceased'
        )).value == 'false'
          ? false
          : true,
      countryPrimaryFather:
        event.father.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
          ?.country === 'MDG'
          ? 'Madagascar'
          : '',
      birthFatherFokontanyCustomAddress: (event?.questionnaire?.find(
        (q) =>
          q.fieldId === 'birth.mother.mother-view-group.fokontanyCustomAddress'
      )).value,
      birthMotherFokontanyCustomAddress: (event?.questionnaire?.find(
        (q) =>
          q.fieldId === 'birth.mother.mother-view-group.fokontanyCustomAddress'
      )).value,
      fatherPrimaryDistrict: event.father.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.districtName,
      fatherOccupation: event.father.occupation,
      birthFatherFatherHasFormallyRecognisedChild: '',
      motherReasonNotApplying: event.mother.reasonNotApplying,
      internationalStatePrimaryFather: '',
      internationalDistrictPrimaryFather: '',
      internationalCityPrimaryFather: '',
      internationalAddressLine1PrimaryFather: '',
      internationalAddressLine2PrimaryFather: '',
      internationalAddressLine3PrimaryFather: '',
      internationalPostalCodePrimaryFather: ''
    }

    const motherDetailsContext = {
      motherPrimaryDistrict: event.mother.address?.find(
        (a) => a.type === 'PRIMARY_ADDRESS'
      )?.districtName,
      motherReasonNotApplying: event.mother.reasonNotApplying,
      motherFamilyName: event.mother.name[0].familyName,
      motherFirstName: [
        event.mother.name[0].middleName,
        event.mother.name[0].firstNames
      ]
        .join(' ')
        .trim(),
      birthMotherCustomizedExactDateOfBirthUnknown: '',
      birthMotherYearOfBirth: '',
      motherBirthDate: event.mother.birthDate,
      birthMotherBirthPlace: (event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.mother.mother-view-group.birthPlace'
      )).value,
      birthMotherMotherIsDeceased:
        (event?.questionnaire?.find(
          (q) => q.fieldId === 'birth.mother.mother-view-group.motherIsDeceased'
        )).value === 'false'
          ? false
          : true,
      countryPrimaryMother:
        event.mother.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
          ?.country === 'MDG'
          ? 'Madagascar'
          : '',
      birthMotherFokontanyCustomAddress: (event?.questionnaire?.find(
        (q) =>
          q.fieldId === 'birth.mother.mother-view-group.fokontanyCustomAddress'
      )).value,
      motherOccupation: event.mother.occupation,
      internationalStatePrimaryMother: '',
      internationalDistrictPrimaryMother: '',
      internationalCityPrimaryMother: '',
      internationalAddressLine1PrimaryMother: '',
      internationalAddressLine2PrimaryMother: '',
      internationalAddressLine3PrimaryMother: '',
      internationalPostalCodePrimaryMother: ''
    }

    const registrationStatementContext = {
      birthChildLegacyBirthRegistrationDate: '',
      birthChildLegacyBirthRegistrationTime: '',
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
      birthInformantCustomizedExactDateOfBirthUnknown: '',
      birthInformantYearOfBirth: '',
      informantBirthDate: event.informant.birthDate,
      birthInformantBirthPlace: '',
      countryPrimaryInformant: '',
      birthInformantFokontanyCustomAddress: '',
      informantPrimaryDistrict: '',
      informantOccupation: event.informant.occupation,
      registrarName: [
        event.registration.assignment.firstName,
        event.registration.assignment.lastName
      ]
        .join(' ')
        .trim(),
      registrationDistrict: event.registration.assignment.officeName,
      internationalStatePrimaryInformant: '',
      internationalDistrictPrimaryInformant: '',
      internationalCityPrimaryInformant: '',
      internationalAddressLine1PrimaryInformant: '',
      internationalAddressLine2PrimaryInformant: '',
      internationalAddressLine3PrimaryInformant: '',
      internationalPostalCodePrimaryInformant: ''
    }

    const printableData = {
      soratra: childLegacyBirthRegistrationNumber,
      nataoNy: window.setLocaleDateCustomString(createdDate.split('T')[0]),
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
