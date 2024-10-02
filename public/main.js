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
async function getPerson(id) {
  const res = await fetch('/graphql', {
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'fetchBirthRegistrationForCertificate',
      variables: {
        id: id
      },
      query: `query fetchBirthRegistrationForCertificate($id: ID!) {
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
          district
          state
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
          district
          state
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
          district
          state
          city
          postalCode
          country
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactPhoneNumber
        contactEmail
        informantsSignature
        informantsSignatureURI
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
        address {
          line
          district
          state
          city
          postalCode
          country
        }
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
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })
  return res.json()
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
    .then((data) => {
      // get Person
      console.log('===> data', data.data.searchEvents.results)
      renderTable(data.data.searchEvents.results)
      // getPerson(data.data.searchEvents.results[0].id)
      //   .then((data) => {
      //     console.log('===> data', data)
      //   })
      //   .catch((err) => console.error(err))
    })
    .catch((err) => console.error(err))
}

const $results = document.getElementById('results')

window.printAll = async function renderPrintout() {
  const data = await downloadRecords({
    startDate: $startDate.value,
    endDate: $endDate.value
  })
  const results = data.data.searchEvents.results
  console.log('===> time', results)
  const pages = results
    .filter((event) => event.__typename === 'BirthEventSearchSet')
    .map((event) => {
      /*
       * Replace this with what ever you want to render for each page
       */
      const dateFormatter = window.translateDate()

      const formattedDate = dateFormatter(event.dateOfBirth) // Appel de la fonction translateDate
      const formatHour = dateFormatter(event.createdAt)
      const brithLocation = ''
      const childName = `${event.childName[0].familyName} ${event.childName[0].middleName}  ${event.childName[0].firstNames} `
      const textSection1 = `Tamin'ny ${formattedDate} tamin'ny ${formatHour} no teraka tao amin'ny ${childName} zazalahy, zanak'i RAVELOSON Charles, Mpamboly, teraka tao Anosy tamin'ny folo Aprily, taona roa arivo, monina ao Anosy ------`
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
              margin-top: 15px;
              font-weight: bold;
              margin-bottom: 15px;
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
            <p class="section align">${textSection1}</p>
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
window.handlePrint = async function handlePrint(result) {
  try {
    const data = await getPerson(result.id) // Récupérer les détails de la personne
    const event = data.data.fetchBirthRegistration // Supposons que data contient déjà l'objet de l'événement
    console.log(event)
    const dateFormatter = window.translateDate()
    const timeFormatter = window.translateTime()
    const officeNameFormatter = window.customizeOfficeNameLocation()

    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000 // Décalage horaire en millisecondes
    const createdDate = new Date(now - offset).toISOString().slice(0, -1) // Retirer le 'Z' à la fin

    // child info
    const childLastName = `${event.child.name[0].familyName}  ${event.child.name[0].middleName}`
    const childFirstName = `${event.child.name[0].firstNames}`
    const childGender =
      event.child.gender.toLowerCase() === 'female' ? 'zazavavy' : 'zazalahy'
    const childDob = dateFormatter(event.child.birthDate)
    const childBirthTime = (
      event?.questionnaire?.find(
        (q) => q.fieldId === 'birth.child.child-view-group.birthTime'
      ) || { value: '' }
    ).value
    const childHourOfBirth = childBirthTime ? timeFormatter(childBirthTime) : ''
    const childBirthLocation =
      'CHU GYNECO  OBSTETRIQUE (Maternité Befelatanana)'
    const childNUI = (
      event?.child?.identifier?.find((q) => q.type === 'NATIONAL_ID') || {
        id: ''
      }
    ).id

    // father info
    const fatherFullName =
      Array.isArray(event.father.name) && event.father.name.length > 0
        ? `${event.father.name[0].familyName} ${event.father.name[0].middleName} ${event.father.name[0].firstNames}`
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
    const fatherOccupation = event?.father?.occupation + ' sy ' ?? ''
    const fatherResidencyLocation = 'Anosy'

    const fatherInfo =
      Array.isArray(event.father.name) && event.father.name.length > 0
        ? `${fatherFullName}, teraka tamin'ny ${fatherDateOfBirth} tao amin'ny ${fatherPlaceOfBirth}, 
                monina ao amin'ny fokontany fkt, kaominina cm, distrikta dstr,  ${fatherOccupation}, sy `
        : ''

    // mother info
    const motherFullName =
      Array.isArray(event.mother.name) && event.mother.name.length > 0
        ? `${event.mother.name[0].familyName} ${event.mother.name[0].middleName} ${event.mother.name[0].firstNames}`
        : ''
    const motherDateOfBirth =
      Array.isArray(event.mother.name) && event.mother.name.length > 0
        ? `${dateFormatter(event.mother.birthDate)}`
        : ''
    const motherOccupation = `${event?.mother?.occupation ?? ''}`
    const motherResidencyLocation = 'Anosy'
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

    const motherInfo = `${motherFullName}, teraka tamin'ny ${motherDateOfBirth}, tao amin'ny ${motherPlaceOfBirth} monina ao amin'ny fokontany ${motherFkt}, kaominina cm, distrikta drtr, ${motherOccupation}`

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
    const birthInformantLastName = `${event?.informant?.name[0]?.familyName}`
    const birthInformanFirstNames = `${event?.informant?.name[0]?.firstNames}`
    const birthInformantFullName = `${birthInformantLastName} ${birthInformanFirstNames}`
    const birthInformantType =
      relationMap[event.informant?.relationship?.toLowerCase()] || ''

    const birthInformantDob = `${dateFormatter(event.informant.birthDate)}`
    const birthInformantoRelationship = `${event?.informant?.relationship}`
    const birthInformantInfo =
      birthInformantoRelationship.toLowerCase() === 'mother' ||
      birthInformantoRelationship.toLowerCase() === 'father'
        ? `${birthInformantType} `
        : `${birthInformantFullName}, ${birthInformantType}`
    const birthInformantResidency = 'Anosy'
    const informantOccupation = `${event?.informant?.occupation ?? ''}${
      event?.informant?.occupation ? ', ' : ''
    }`

    // registration info
    const birthRegistrationDate = dateFormatter(createdDate.split('T')[0])
    const birthRegistrationTime = timeFormatter(createdDate.split('T')[1])

    const registrarName = `${result.registration.assinment.lastName} ${result.registration.assinment.firstName}`
    const civilRegistrationCenterNname = officeNameFormatter(
      event?.registration?.status?.find(
        (item) => item.office && item.office.name
      )?.office.name || ''
    )
    const birthRegistrationNumber = (
      event?.questionnaire?.find(
        (q) =>
          q.fieldId ===
          'birth.child.child-view-group.legacyBirthRegistrationNumber'
      ) || { value: '' }
    ).value

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
            .birth {
                margin-top: 0px;
                font-weight: bold;
            }
            .lastname {
                word-break: break-word;
            }
            .firstname {
                word-break: break-word;
            }
            .nui {
                margin-top: 80px;
            }
            .align {
                text-align: justify;
            }
            .head {
              margin-top: 30px;
            }
            .section {
                margin-top: 10px;
            }
          </style>
          <div class="container">
            <div class="col1">
              <p class="head">Soratra n°: ${birthRegistrationNumber}</p>
              <p>Natao ny: ${window.setLocaleDateCustomString(
                createdDate.split('T')[0]
              )}</p>
              <p class="section align"/>
              <p class="birth">FAHATERAHANA</p>
              <p class="section align"/>
              <p class="lastname">${childLastName}</p>
              <p class="firstname">${childFirstName}</p>
              <p class="section align"/>
              <p>NUI: ${childNUI}</p>
              <p>${event.child.birthDate}</p>
              <p class="section align">
            </div>
            <div class="col2">
              <p class="head align">
              ${`
                ---Tamin'ny ${childDob}, tamin'ny ${childHourOfBirth}, no teraka tao amin'ny ${childBirthLocation}, ${childLastName} ${childFirstName}, ${childGender}
                , zanak'i ${fatherInfo} ${motherInfo} ---
              `}
              </p>
              <p class="align"></p>
              <p class="section align">
              ${`
                ---
                Nosoratana androany ${birthRegistrationDate} tamin'ny ${birthRegistrationTime}, araka ny fanambarana nataon'
                i ${birthInformantInfo}, teraka tamin'ny ${birthInformantDob} tao amin'ny toerana, kaominina com,
                monina ao amin'ny fkt, kaominina com, distrikta dskt, ${informantOccupation} izay miara-manao sonia aminay ${registrarName}, 
                mpiandraikitra ny sora-piankohonana ao amin'ny ${civilRegistrationCenterNname}, rehefa novakiana taminy ity soratra ity...
              ---
              `}
              </p>
               <p class="align"></p>
            </div>
          </div>
        </div>
      `

    // Utiliser html2pdf pour imprimer
    html2pdf()
      .set({
        pagebreak: { after: '.page' }
      })
      .from(page)
      .save()
  } catch (error) {
    console.error("Erreur lors de l'impression de l'élément:", error)
  }
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
         <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          <button onclick="window.handlePrint('${event}')" class="btn-print bg-blue-500 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded">Imprimer</button>
        </td>
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
