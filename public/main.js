const token = new URLSearchParams(window.location.search).get('token')

if (!token) {
  window.location.href =
    window.config.LOGIN_URL +
    '?redirectTo=' +
    encodeURIComponent(window.location.href)
}

async function downloadRecords() {
  const res = await fetch('/graphql', {
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'searchEvents',
      variables: {
        advancedSearchParameters: {
          registrationStatuses: ['REGISTERED', 'CERTIFIED', 'ISSUED']
        },
        count: 10,
        skip: 0
      },
      query:
        'query searchEvents($advancedSearchParameters: AdvancedSearchParametersInput!, $sort: String, $count: Int, $skip: Int) {\n  searchEvents(\n    advancedSearchParameters: $advancedSearchParameters\n    sort: $sort\n    count: $count\n    skip: $skip\n  ) {\n    totalItems\n    results {\n      id\n      type\n      registration {\n        status\n        contactNumber\n        contactEmail\n        trackingId\n        registrationNumber\n        registeredLocationId\n        duplicates\n        assignment {\n          practitionerId\n          firstName\n          lastName\n          officeName\n          avatarURL\n          __typename\n        }\n        createdAt\n        modifiedAt\n        __typename\n      }\n      operationHistories {\n        operationType\n        operatedOn\n        __typename\n      }\n      ... on BirthEventSearchSet {\n        dateOfBirth\n        childName {\n          firstNames\n          middleName\n          familyName\n          use\n          __typename\n        }\n        __typename\n      }\n      ... on DeathEventSearchSet {\n        dateOfDeath\n        deceasedName {\n          firstNames\n          middleName\n          familyName\n          use\n          __typename\n        }\n        __typename\n      }\n      ... on MarriageEventSearchSet {\n        dateOfMarriage\n        brideName {\n          firstNames\n          middleName\n          familyName\n          use\n          __typename\n        }\n        groomName {\n          firstNames\n          middleName\n          familyName\n          use\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n'
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })

  return res.json()
}

const $results = document.getElementById('results')
downloadRecords()
  .then((data) => renderTable(data.data.searchEvents.results))
  .catch((err) => console.error(err))

function renderTable(results) {
  const rows = results
    .map((event) => {
      let row = ''
      if (event.__typename === 'BirthEventSearchSet') {
        row = `
      <tr>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">${event.registration.trackingId}</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${event.registration.registrationNumber}</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${event.dateOfBirth}</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${event.childName[0].firstNames} ${event.childName[0].middleName} ${event.childName[0].familyName}</td>
      </tr>
    `
      }
      return row
    })
    .join('')

  $results.innerHTML = rows
}
