import GlobalLoader from './globalLoader.js'
let currentPage = 1
let rowsPerPage = 10
let totalPages = 1
let sortDirection = 'desc'
let sortColumn = '' // 'desc' by default
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
          id
          _fhirID
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
        if (birthLocation) return `tao amin'ny ${birthLocation?.name || '-'}`
      } else {
        const birthLocation = await fetchOtherBirthLocation(id)
        return `tao amin'ny${(() => {
          const _fokotany =
            birthLocation?.data?.fetchBirthRegistration?.questionnaire?.find(
              (q) =>
                q.fieldId ===
                'birth.child.child-view-group.fokontanyCustomAddress'
            )?.value
          return _fokotany ? ' fokotany ' + _fokotany : ' - '
        })()}${(() => {
          const _commune =
            birthLocation?.data?.fetchBirthRegistration?.eventLocation?.address
              ?.districtName
          return _commune ? ', kaominina ' + _commune : ' - '
        })()}${(() => {
          const _district =
            birthLocation?.data?.fetchBirthRegistration?.eventLocation?.address
              ?.districtName
          return _district ? ', distrikta ' + _district : ' - '
        })()},`
      }
    }
    return ''
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

// Function to render table rows with pagination
const renderTable = async () => {
  const startDate = document.getElementById('startDate').value
  const endDate = document.getElementById('endDate').value
  const search = document.getElementById('searchInput').value
  const location = document.getElementById('locationFilter').value

  const fetchUserVariables = {
    userId: connectedUserIdFromJwt
  }

  const connectedRegistrar = await fetchUser(fetchUserVariables)

  const variables = {
    advancedSearchParameters: {
      registrationStatuses: ['CERTIFIED', 'ISSUED'],
      dateOfRegistrationStart: startDate,
      dateOfRegistrationEnd: endDate,
      name: search,
      declarationJurisdictionId: !!location
        ? location
        : connectedRegistrar?.data?.getUser?.primaryOffice?.id
    },
    count: rowsPerPage,
    skip: (currentPage - 1) * rowsPerPage,
    sort: sortDirection
  }

  const events = await fetchEvents(variables)

  totalPages = Math.ceil(events.data.searchEvents?.totalItems / rowsPerPage)

  const tableBody = document.getElementById('data-table')
  tableBody.innerHTML = ''

  if (events.data.searchEvents?.results.length > 0) {
    events.data.searchEvents?.results.forEach((item) => {
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
      <td class="px-4 py-2 border-b border-gray-300">${item.type}</td>
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
      }', '${[
        item.registration?.assignment?.firstName || '',
        item.registration?.assignment?.lastName || ''
      ]
        .join(' ')
        //// escape '
        .trim()
        .replace(
          /'/g,
          "\\'"
        )}', '${item.registration?.assignment?.officeName.replace(
        /'/g,
        "\\'"
      )}')">Imprimer</button></td>
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

window.openPrintModal = async function openPrintModal(
  id,
  registrarFullName,
  officeName
) {
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
    const dateFormatter = window.translateDate()
    const timeFormatter = window.translateTime()
    const officeNameFormatter = window.customizeOfficeNameLocation()

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
    const childGender =
      event.child.gender.toLowerCase() === 'female' ? 'zazavavy' : 'zazalahy'
    const childDob = dateFormatter(event.child.birthDate)
    const childBirthTime = (
      event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.child.child-view-group.birthTime'
      ) || { value: '' }
    ).value
    const childHourOfBirth = childBirthTime ? timeFormatter(childBirthTime) : ''
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

    // father info
    const fatherInfoNotIsAvailable =
      event.father.reasonNotApplying != null &&
      Array.isArray(event.father.name) &&
      event.father.name.length == 0

    const fatherFullName =
      Array.isArray(event.father.name) && event.father.name.length > 0
        ? `${[
            event.father.name[0].familyName,
            event.father.name[0].middleName,
            event.father.name[0].firstNames
          ]
            .join(' ')
            .trim()}`
        : ''
    const fatherDateOfBirth =
      Array.isArray(event.father.name) && event.father.name.length > 0
        ? `${dateFormatter(event.father.birthDate)}`
        : ''
    const fatherPlaceOfBirth = (
      event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.father.father-view-group.birthPlace'
      ) || { value: '' }
    ).value
    const fatherFkt = (
      event?.questionnaire?.find(
        (q) =>
          q.fieldId === 'birth.mother.mother-view-group.fokontanyCustomAddress'
      ) || { value: '' }
    ).value

    const fatherAddress = `fokontany ${fatherFkt}, kaominina ${
      event.father.address?.find((a) => a.type === 'PRIMARY_ADDRESS')?.stateName
    }, distrika ${
      event.father.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
        ?.districtName
    }`

    const outputFather = `${
      fatherInfoNotIsAvailable
        ? "zanak'i "
        : "zanak'i " +
          fatherFullName +
          ", teraka tamin'ny " +
          fatherDateOfBirth +
          ' tao ' +
          fatherPlaceOfBirth +
          " , monina ao amin'ny " +
          fatherAddress +
          ' , ' +
          event.father.occupation +
          ' , sy '
    }`

    // mother info
    const motherFullName =
      Array.isArray(event.mother.name) && event.mother.name.length > 0
        ? `${event.mother.name[0].familyName} ${event.mother.name[0].middleName} ${event.mother.name[0].firstNames}`
        : ''
    const motherDateOfBirth =
      Array.isArray(event.mother.name) && event.mother.name.length > 0
        ? `${dateFormatter(event.mother.birthDate)}`
        : ''
    const motherOccupation = event?.mother?.occupation
    const motherPlaceOfBirth = (
      event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.mother.mother-view-group.birthPlace'
      ) || { value: '' }
    ).value
    const motherFkt = (
      event?.questionnaire?.find(
        (q) =>
          q.fieldId === 'birth.mother.mother-view-group.fokontanyCustomAddress'
      ) || { value: '' }
    ).value

    const motherAddress = `fokontany ${motherFkt}, kaominina ${
      event.mother.address.find((a) => a.type === 'PRIMARY_ADDRESS')?.stateName
    }, distrika ${
      event.mother.address.find((a) => a.type === 'PRIMARY_ADDRESS')
        ?.districtName
    }`
    const motherInfoNotIsAvailable = event.mother.reasonNotApplying != null
    const outputMother = `${
      motherInfoNotIsAvailable
        ? ''
        : motherFullName +
          ", teraka tamin'ny " +
          motherDateOfBirth +
          'tao ' +
          motherPlaceOfBirth +
          ", monina ao amin'ny " +
          motherAddress +
          ', ' +
          motherOccupation
    }`
    // informant info
    const relationMap = {
      mother: 'reniny',
      father: 'rainy',
      brother: 'zokiny lahy',
      sister: 'zokiny vavy',
      auncle: 'dadatoany',
      aunt: 'nenitoany',
      grandfather: 'raibeny',
      grandmother: 'renibeny'
    }
    const birthInformantLastName = `${
      event?.informant?.name ? event?.informant?.name[0]?.familyName : ''
    }`
    const birthInformanFirstNames = `${
      event?.informant?.name ? event?.informant?.name[0]?.firstNames : ''
    }`
    const birthInformantFullName = `${birthInformantLastName} ${birthInformanFirstNames}`
    const birthInformantType =
      relationMap[event.informant?.relationship?.toLowerCase()] || ''

    const birthInformantDob = `${dateFormatter(event.informant?.birthDate)}`
    const birthInformantoRelationship = `${event?.informant?.relationship}`
    const birthInformantInfo =
      birthInformantoRelationship.toLowerCase() === 'mother' ||
      birthInformantoRelationship.toLowerCase() === 'father'
        ? `ny ${birthInformantType} `
        : `i ${birthInformantFullName}, ${birthInformantType}`
    const informantOccupation = `${event?.informant?.occupation ?? ''}`
    const informantFkt = (
      event?.questionnaire?.find(
        (q) =>
          q.fieldId ===
          (event.informant?.relationship.toLowerCase() === 'mother'
            ? 'birth.mother.mother-view-group.fokontanyCustomAddress'
            : event.informant?.relationship.toLowerCase() === 'father'
            ? 'birth.father.father-view-group.fokontanyCustomAddress'
            : 'birth.informant.informant-view-group.fokontanyCustomAddress')
      ) || { value: '' }
    ).value

    const informantAddress = `fokontany ${informantFkt}, kaominina ${
      event.informant?.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
        ?.stateName
    }, distrikta ${
      event.informant?.address?.find((a) => a.type === 'PRIMARY_ADDRESS')
        ?.districtName
    }`

    // registration info
    const birthRegistrationDate = dateFormatter(createdDate.split('T')[0])
    const birthRegistrationTime = timeFormatter(createdDate.split('T')[1])
    const registrarName = registrarFullName
    const civilRegistrationCenterNname = officeNameFormatter(officeName || '')

    const printableData = {
      soratra: childLegacyBirthRegistrationNumber,
      nataoNy: window.setLocaleDateCustomString(createdDate.split('T')[0]),
      anarana: childFirstName,
      fanampinAnarana: childLastName,
      lft: childNUI,
      dateOfBirth: window.setLocaleDateCustomString(event.child.birthDate),
      firstParagraph: `---Tamin'ny ${childDob} tamin'ny ${childHourOfBirth}, no teraka ${childBirthLocation} i ${[
        childFirstName,
        childLastName
      ]
        .join(' ')
        .trim()}, ${childGender}, ${outputFather} ${outputMother}. ---`,
      secondParagraph: `---Nosoratana androany ${birthRegistrationDate} tamin'ny ${birthRegistrationTime}, araka ny fanambarana nataon' ${birthInformantInfo}, teraka tamin'ny ${birthInformantDob}, monina ao ${informantAddress}, ${informantOccupation}, izay miara-manao sonia aminay ${registrarName}, Mpandraikitra ny fiankohonana eto amin'ny Kaominina ${civilRegistrationCenterNname}, rehefa novakiana tamin'ity soratra ity.---`
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
  document.getElementById('locationFilter').value = ''
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

//Initial render
renderTable()
