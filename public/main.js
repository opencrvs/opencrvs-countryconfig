import { translateDate } from '../src/form/common/certificate/handlebars/helpers.ts'
/*
 * Check user has an authorization token. If not, redirect to login page.
 */
const token = new URLSearchParams(window.location.search).get('token')
console.log('BONJOUR========')
if (!token) {
  window.location.href =
    window.config.LOGIN_URL +
    '?redirectTo=' +
    encodeURIComponent(window.location.href)
}

async function downloadRecords({ startDate, endDate }) {
  const res = await fetch('/graphql', {
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'searchEvents',
      variables: {
        advancedSearchParameters: {
          registrationStatuses: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
          dateOfRegistrationStart: startDate,
          dateOfRegistrationEnd: endDate
        },
        count: 10,
        skip: 0
      },
      query: `
        query searchEvents($advancedSearchParameters: AdvancedSearchParametersInput!, $sort: String, $count: Int, $skip: Int) {
          searchEvents(
            advancedSearchParameters: $advancedSearchParameters
            sort: $sort
            count: $count
            skip: $skip
          ) {
            totalItems
            results {
              id
              type
              registration {
                status
                contactNumber
                contactEmail
                trackingId
                registrationNumber
                registeredLocationId
                duplicates
                assignment {
                  firstName
                  lastName
                  officeName
                  avatarURL
                }
                createdAt
                modifiedAt
              }
              operationHistories {
                operationType
                operatedOn
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
        }
        `
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })

  return res.json()
}

/*
 * Initialise date inputs
 */
const $startDate = document.getElementById('start-date')
const $endDate = document.getElementById('end-date')
$startDate.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .split('T')[0]
$endDate.value = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
)
  .toISOString()
  .split('T')[0]

$startDate.addEventListener('change', update)
$endDate.addEventListener('change', update)

/*
 * Views
 */

function update() {
  downloadRecords({ startDate: $startDate.value, endDate: $endDate.value })
    .then((data) => renderTable(data.data.searchEvents.results))
    .catch((err) => console.error(err))
}

const $results = document.getElementById('results')

window.printAll = async function renderPrintout() {
  const data = await downloadRecords({
    startDate: $startDate.value,
    endDate: $endDate.value
  })
  const results = data.data.searchEvents.results
  const pages = results
    .filter((event) => event.__typename === 'BirthEventSearchSet')
    .map((event) => {
      /*
       * Replace this with what ever you want to render for each page
       */
      const formattedDate = 'hhhh' //translateDate(event.dateOfBirth) // Appel de la fonction translateDate

      const page = `
      <div class="page">
        <style>
          .container {
              display: flex;
          }
          .col1 {
              flex: 1;
              padding: 10px;
          }
          .col2 {
              flex: 3;
              padding: 10px;
          }
          .fahaterahana {
              margin-top: 0px;
              font-weight: bold;
          }
          .nom {
              
              word-break: break-word;
          }
          .nui {
              margin-top: 80px;
          }
          .align {
              text-align: justify;
          }
          .section {
              margin-top: 80px;
          }
        </style>
        <div class="container">
          <div class="col1">
            <p class="section">10 jolay 2024</p>
            <p>Faha: 101945</p>
            <p class="fahaterahana">FAHATERAHANA</p>
            <p class="nom">${event.childName[0].firstNames} ${event.childName[0].middleName} ${event.childName[0].familyName}</p>
            <p >NUI: 200323232323</p>
            <p>${event.dateOfBirth}</p>
          </div>
          <div class="col2">
            <p class="section align">Tamin'ny ${formattedDate}, taona efatra amby roapolo sy roa arivo, tamin'ny folo ora sy efatra ambin'ny folo monitra atoandro, no teraka tao amin'ny CHU GYNECO OBSTETRIQUE (MAternité Befelatanana), RAKOTO Henri, zazalahy, zanak'i RAVELOSON Charles, Mpamboly, teraka tao Anosy tamin'ny folo Aprily, taona roa arivo, monina ao Anosy ------</p>
            <p class="align">Nosoratana androany folo Jolay, taona efatra amby roapolo sy roa arivo tamin'ny enina ora sy fito amby roapolo minitra maraina, araka ny fanambarana nataon'ny reniny, izay miara-manao sonia aminay LANDRY Fitahiantsoa, mpiandraikitra ny sora-piankohonana ao amin'ny CEC CU TANA I, rehefa novakiana tamin'ity soratra ity---</p>
          </div>
        </div>
      </div>
    `

      return page
    })
    .join('')

  html2pdf()
    .set({
      pagebreak: { after: '.page' }
    })
    .from(pages)
    .save()
}
function renderTable(results) {
  const rows = results
    .filter((event) => event.__typename === 'BirthEventSearchSet')
    .map((event) => {
      const row = `
      <tr>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">${
          event.registration.trackingId
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.registration.registrationNumber
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          new Date(parseInt(event.registration.createdAt, 10))
            .toISOString()
            .split('T')[0]
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.dateOfBirth
        }</td>
        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${
          event.childName[0].firstNames
        } ${event.childName[0].middleName} ${event.childName[0].familyName}</td>
      </tr>
    `

      return row
    })
    .join('')

  $results.innerHTML = rows
}

/*
 * First render
 */
update()
