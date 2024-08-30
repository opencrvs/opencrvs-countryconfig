import * as Handlebars from 'handlebars'
import { type IntlShape, type MessageDescriptor } from 'react-intl'

function wordWrap(text: string, boundary: number) {
  return text
    .split('\n')
    .map(function (line) {
      let pos = 0
      return line
        .split(/\b/)
        .map(function (word) {
          pos += word.length
          if (pos > boundary) {
            pos = 0
            return '\n' + word.trimLeft()
          }
          return word
        })
        .join('')
    })
    .join('\n')
    .split('\n')
}
const LINE_HEIGHT = 14

function insertTspansIntoText(textLines: string[], xi: number, yi: number) {
  let svgString = ''
  let y = yi
  for (const line of textLines) {
    svgString += `<tspan x="${xi}" y="${y}">${line}</tspan>`
    y += LINE_HEIGHT
  }
  return svgString
}

export function wrap(): Handlebars.HelperDelegate {
  return function (
    this: any,
    lineLength: number,
    x: number,
    y: number,
    ...values: [...string[], Handlebars.HelperOptions]
  ) {
    const lines = wordWrap(values.slice(0, -1).join(' '), lineLength)
    return insertTspansIntoText(lines, x, y)
  } as unknown as Handlebars.HelperDelegate
}

export function wrapGroup(): Handlebars.HelperDelegate {
  return function (
    this: any,
    lineLength: number,
    initX: number,
    initY: number,
    options: Handlebars.HelperOptions
  ) {
    let content = ''
    let y = initY
    function insertTspansIntoText(textLines: string[]) {
      let svgString = ''
      for (const line of textLines) {
        svgString += `<tspan x="${initX}" y="${y}">${line}</tspan>`
        y += LINE_HEIGHT
      }
      return svgString
    }

    function createTextElement(textType: 'normal' | 'bold', lines: string[]) {
      return `
        <text 
          fill="black" 
          xml:space="default" 
          font-family="Montserrat" 
          font-size="9"
          font-weight="${textType}" 
          letter-spacing="0em">
            ${insertTspansIntoText(lines)}
        </text>
      `
    }

    for (const key in options.hash) {
      const lines = wordWrap(options.hash[key], lineLength)
      const textType = key.startsWith('text') ? 'normal' : 'bold'
      content += createTextElement(textType, lines)
      if (textType === 'normal') {
        y += LINE_HEIGHT
      }
    }

    return content
  } as unknown as Handlebars.HelperDelegate
}

function joinValuesWith(
  values: (string | null | undefined)[],
  separator = ' '
) {
  return values.filter(Boolean).join(separator)
}

export function join(): Handlebars.HelperDelegate {
  return function (
    this: any,
    ...values: [...string[], Handlebars.HelperOptions]
  ) {
    return joinValuesWith(values.slice(0, -1) as string[], '')
  } as unknown as Handlebars.HelperDelegate
}

function name(familyName: string, firstName: string) {
  return joinValuesWith([familyName, firstName], ' ')
}
export function mainContent(): Handlebars.HelperDelegate {
  return function (this: any, placeOfBirthDistrict: string = '') {
    const paragraph1 = joinValuesWith(
      [
        "Nalaina tamin’ny bokim-piankohonan'ny Kaominina",
        placeOfBirthDistrict,
        ', Foibe misahana ny fiankohonana, taona',
        customizeDateYearInCertificateContent(this.registrar.date),
        ', izao sora-pahaterahana manaraka izao :'
      ],
      ' '
    )

    const paragraph2 = joinValuesWith(
      [
        "--Tamin'ny",
        customizeDateInCertificateContent(this.eventDate),
        ", tamin'ny",
        customizeTimeInCertificateContent(this.birthChildBirthTime),
        "no teraka tao amin'ny",
        getPlaceOfBirth(
          this.birthLocation,
          this.birthChildFokontanyCustomAddress
        ),
        ', Kaominina',
        placeOfBirthDistrict,
        ':',
        name(this.childFamilyName, this.childFirstName) + ',',

        translateChildGenderToMDGWord(this.childGender),
        ', zanak’i',
        handleFatherInformation.apply(this),

        name(this.motherFamilyName, this.motherFirstName),
        handleMotherDeceasedInformation.apply(this),
        this.motherOccupation,
        ', teraka tao',
        this.birthMotherBirthPlace,
        'tamin’ny',
        customizeDateInCertificateContent(this.motherBirthDate),
        ', monina ao',
        this.birthMotherFokontanyCustomAddress,
        '--'
      ],
      ' '
    )
    const paragraph3 = joinValuesWith(
      [
        'Nosoratana androany',
        customizeDateInCertificateContent(this.registrationDate),
        'tamin’ny',
        customizeTimeInCertificateContent(
          new Date().toISOString().split('T')[0]
        ) + ',',
        handleInformantInfo.apply(this),
        ', izay miara-manao sonia aminay',
        this.registrar.name,
        ", mpiandraikitra ny sora-piankohonana eto amin'ny",
        customizeOfficeName(this.registrationLocation),
        ', rehefa novakiana taminy ity soratra ity.'
      ],
      ' '
    )

    return paragraph1 + '\n\n' + paragraph2 + '\n\n' + paragraph3
  } as unknown as Handlebars.HelperDelegate
}

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

const THE_UNITS_MDG_WORDS: string[] = [
  '',
  'iraika ',
  'roa ',
  'telo ',
  'efatra ',
  'dimy ',
  'enina ',
  'fito ',
  'valo ',
  'sivy '
]

const FROM_10_TO_19_MDG_WORDS: string[] = [
  'folo ',
  "iraika ambin'ny folo ",
  "roa ambin'ny folo ",
  "telo ambin'ny folo ",
  "efatra ambin'ny folo ",
  "dimy ambin'ny folo ",
  "enina ambin'ny folo ",
  "fito ambin'ny folo ",
  "valo ambin'ny folo ",
  "sivy ambin'ny folo "
]

const DOZENS_MDG_WORDS: string[] = [
  '',
  '',
  'roapolo ',
  'telopolo ',
  'efapolo ',
  'dimapolo ',
  'enipolo ',
  'fitopolo ',
  'valopolo ',
  'sivifolo '
]

const THE_HUNDREDS_MDG_WORDS: string[] = [
  '',
  'zato ',
  'roanjato ',
  'telonjato ',
  'efa-jato ',
  'dimanjato ',
  'eninjato ',
  'fitonjato ',
  'valonjato ',
  'sivinjato '
]

const MDG_IRAY_WORD = 'iray'

const THE_MONTH_MDG_WORDS: string[] = [
  '',
  'Janoary',
  'Febroary',
  'Martsa',
  'Aprily',
  'Mey',
  'Jona',
  'Jolay',
  'Aogositra',
  'Septambra',
  'Oktobra',
  'Novambra',
  'Desambra'
]

const THE_MONTH_EN_WORDS: string[] = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const DEFAULT_MESSAGE = 'defaultMessage'
const MDG_FEMALE_WORD = 'zazavavy'
const MDG_MALE_WORD = 'zazalahy'
const ID = 'id'

const convertNumberToLetterForMalagasySpecificLanguage = (num: number) => {
  const digitLength = num.toString()
  if (digitLength.length > 9) return 'mihoatra lavitra'
  const digits = ('000000000' + digitLength)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
  const unit = THE_UNITS_MDG_WORDS.concat(FROM_10_TO_19_MDG_WORDS)

  if (!digits) return
  let numberToLetter = ''
  numberToLetter +=
    digits[3] != '0'
      ? (parseInt(digits[3]) != 1
          ? `${
              unit[Number(digits[3])] ||
              DOZENS_MDG_WORDS[parseInt(digits[3][0])]
            } ${unit[parseInt(digits[3][1])]}`
          : '') + ' arivo '
      : ''
  if (digits[3] != '0' && digits[4] != '0')
    numberToLetter = ` sy ${numberToLetter}`
  if (digits[3] != '0' && digits[4] == '0') numberToLetter = '' + numberToLetter
  numberToLetter =
    digits[4] != ''
      ? THE_HUNDREDS_MDG_WORDS[Number(digits[4])] +
        (parseInt(digits[3]) != 0 && parseInt(digits[4]) >= 0
          ? numberToLetter
          : '')
      : ''
  numberToLetter =
    digits[5] != '00'
      ? (unit[Number(digits[5])] ||
          (unit[parseInt(digits[5][1])] != ''
            ? `${unit[parseInt(digits[5][1])]} amby  ${
                DOZENS_MDG_WORDS[parseInt(digits[5][0])]
              }`
            : ' ' + DOZENS_MDG_WORDS[parseInt(digits[5][0])])) +
        (numberToLetter != ''
          ? numberToLetter != 'zato '
            ? ' sy '
            : ' amby '
          : '') +
        numberToLetter
      : numberToLetter != ''
      ? numberToLetter
      : ' aotra'

  return numberToLetter
}

function convertTimeToMdgCustomWords(timeString: string) {
  const [hour, minute] = timeString.split(':')
  let newHour = parseInt(hour)
  const mdgHours = THE_UNITS_MDG_WORDS.concat(
    FROM_10_TO_19_MDG_WORDS.slice(0, 3)
  )
  mdgHours[1] = MDG_IRAY_WORD
  const newMinute = parseInt(minute)
  let timePeriod = 'maraina'
  if (newHour <= 12 && newHour >= 10) timePeriod = 'antoandro'
  else if (newHour > 12) {
    if (newHour <= 16 && newHour >= 13) timePeriod = 'tolakandro'
    if (newHour <= 19 && newHour >= 17) timePeriod = 'hariva'
    if (newHour < 24 && newHour >= 20) timePeriod = 'alina'
    newHour = newHour - 12
  } else if (newHour === 0 && newMinute > 0) {
    return `roa ambin'ny folo ora sy ${convertNumberToLetterForMalagasySpecificLanguage(
      newMinute
    )} minitra alina`
  } else if (newHour === 0 && newMinute === 0) {
    return `roa ambin'ny folo ora alina`
  }

  return `${
    mdgHours[newHour]
  }ora sy ${convertNumberToLetterForMalagasySpecificLanguage(
    newMinute
  )} minitra ${timePeriod}`
}

function convertDateToMdgCustomWords(dateString: string) {
  const [year, month, day] = dateString.split('-')
  const dateValue =
    parseInt(day) === 1
      ? "voalohan'ny volana"
      : `${convertNumberToLetterForMalagasySpecificLanguage(parseInt(day))}`

  return `${dateValue} ${
    THE_MONTH_MDG_WORDS[parseInt(month)]
  }, taona ${convertNumberToLetterForMalagasySpecificLanguage(parseInt(year))}`
}

function convertLocaleDateToMdgCustomWords(dateString: string) {
  const [month, day, year] = dateString.split('/')
  return `${day} ${THE_MONTH_MDG_WORDS[parseInt(month)]} ${year}`
}

const ROMAN_NUMBERS_MDG_WORDS = {
  I: 'Voalohany',
  II: 'Faharoa',
  III: 'Fahatelo',
  IV: 'Fahaefatra',
  V: 'Fahadimy',
  VI: 'Fahaenina',
  VII: 'Fahafito',
  VIII: 'Fahavalo',
  IX: 'Fahasivy',
  X: 'Fahafolo'
}

const CITY_TRANSFORMER = {
  Tana: 'Antananarivo',
  Majunga: 'Mahajanga',
  Tulear: 'Toliary',
  Diego: 'Antsiranana',
  Tamatave: 'Toamasina'
}

const customizeMdgOfficeName = (officeName: string) =>
  officeName
    .replace('Cu', '')
    .replace('CU', '')
    .replace('cu', '')
    .replace('Tana', CITY_TRANSFORMER.Tana)
    .replace('TANA', CITY_TRANSFORMER.Tana)
    .replace('Majunga', CITY_TRANSFORMER.Majunga)
    .replace('MAJUNGA', CITY_TRANSFORMER.Majunga)
    .replace('Diego', CITY_TRANSFORMER.Diego)
    .replace('DIEGO', CITY_TRANSFORMER.Diego)
    .replace('Tamatave', CITY_TRANSFORMER.Tamatave)
    .replace('TAMATAVE', CITY_TRANSFORMER.Tamatave)
    .replace('Tulear', CITY_TRANSFORMER.Tulear)
    .replace('TULAER', CITY_TRANSFORMER.Tulear)
    .replace('VIII', ROMAN_NUMBERS_MDG_WORDS.VIII)
    .replace('VII', ROMAN_NUMBERS_MDG_WORDS.VII)
    .replace('VI', ROMAN_NUMBERS_MDG_WORDS.VI)
    .replace('IV', ROMAN_NUMBERS_MDG_WORDS.IV)
    .replace('V', ROMAN_NUMBERS_MDG_WORDS.V)
    .replace('III', ROMAN_NUMBERS_MDG_WORDS.III)
    .replace('II', ROMAN_NUMBERS_MDG_WORDS.II)
    .replace('IX', ROMAN_NUMBERS_MDG_WORDS.IX)
    .replace('X', ROMAN_NUMBERS_MDG_WORDS.X)
    .replace('I', ROMAN_NUMBERS_MDG_WORDS.I)

const getChildGenderMdgWords = (childGender: any) => {
  if (childGender[DEFAULT_MESSAGE] === 'Female') {
    childGender[DEFAULT_MESSAGE] = MDG_FEMALE_WORD
    childGender[ID] = MDG_FEMALE_WORD
  } else if (childGender[DEFAULT_MESSAGE] === 'Male') {
    childGender[DEFAULT_MESSAGE] = MDG_MALE_WORD
    childGender[ID] = MDG_MALE_WORD
  }

  return childGender
}

const customizeDateInCertificateContent = (_date: string) => {
  const dateWithoutOrdinal = removeOrdinalIndicator(_date)
  const date = new Date(dateWithoutOrdinal)
  const formattedDate = date.toISOString().split('T')[0]

  return convertDateToMdgCustomWords(formattedDate)
}

export function translateDate(): Handlebars.HelperDelegate {
  return function (this: any, dateString: string) {
    return customizeDateInCertificateContent(dateString)
  }
}

function customizeDateYearInCertificateContent(dateString: string) {
  const year = Number(dateString.split('-')[0])
  return Number.isNaN(year)
    ? ''
    : convertNumberToLetterForMalagasySpecificLanguage(year)
}

export function translateDateYear(): Handlebars.HelperDelegate {
  return function (this: any, dateString: string) {
    return customizeDateYearInCertificateContent(dateString)
  }
}

export function customizeChildBirthRegistrationNumber(): Handlebars.HelperDelegate {
  return function (
    this: any,
    rawChildBirthRegistrationNumber: string,
    manualChildBirthRegistrationNumber: string = ''
  ) {
    if (
      manualChildBirthRegistrationNumber &&
      !['', undefined, 'undefined', null, 'null'].includes(
        manualChildBirthRegistrationNumber.trim()
      )
    )
      return manualChildBirthRegistrationNumber.toString().padStart(6, '0')

    let currentRegisterNumber = ''

    if (
      rawChildBirthRegistrationNumber &&
      rawChildBirthRegistrationNumber.includes('_')
    ) {
      const rawRegisterNumber = rawChildBirthRegistrationNumber.split('_')
      currentRegisterNumber =
        rawRegisterNumber.length === 3
          ? rawRegisterNumber[2]
          : rawRegisterNumber[1]
    }

    return currentRegisterNumber.toString().padStart(6, '0')
  }
}

function removeOrdinalIndicator(dateString: string) {
  if (!dateString) return new Date() // TODO: Handle it later
  return dateString && dateString?.replace(/\b(\d+)(th|st|nd|rd)\b/g, '$1')
}

function customizeTimeInCertificateContent(timeString: string) {
  const rawEventTime = timeString?.toLowerCase().includes('h')
    ? timeString.replace('h', ':')
    : timeString

  return rawEventTime ? convertTimeToMdgCustomWords(rawEventTime) : ''
}

export function translateTime(): Handlebars.HelperDelegate {
  return function (this: any, timeString: string) {
    return customizeTimeInCertificateContent(timeString)
  }
}

export function translateDateToMDGFormat(): Handlebars.HelperDelegate {
  return function (this: any, eventDate: string) {
    const dateWithoutOrdinal = removeOrdinalIndicator(eventDate)
    const date = new Date(dateWithoutOrdinal)
    const formattedDate = date.toLocaleString().split(', ')[0]

    return convertLocaleDateToMdgCustomWords(formattedDate)
  }
}

function translateChildGenderToMDGWord(childGender: string) {
  return childGender &&
    ['male', 'homme', 'lehilahy', 'zazalahy'].includes(
      childGender.toLowerCase()
    )
    ? 'zazalahy'
    : 'zazavavy'
}

function handleFatherInformation(this: Record<string, any>) {
  let fatherDetail = ''
  if (this.fatherFamilyName?.trim()) {
    const fatherIsDeceased = this.birthFatherFatherIsDeceased ? 'efa maty,' : ''
    const parentHaveNotMaritalStatusLegal = this
      .birthFatherFatherHasFormallyRecognisedChild
      ? 'izay manambara fa manjanaka azy, sy'
      : ', sy'
    const fatherAdditionnalInfo =
      fatherIsDeceased === 'efa maty,'
        ? ''
        : `${this.fatherOccupation}, teraka tao ${
            this.birthFatherBirthPlace
          } tamin’ny ${
            this.birthFatherCustomizedExactDateOfBirthUnknown
              ? convertNumberToLetterForMalagasySpecificLanguage(
                  parseInt(this.birthFatherYearOfBirth)
                )
              : customizeDateInCertificateContent(this.fatherBirthDate)
          }, monina ao ${
            this.birthFatherFokontanyCustomAddress ??
            this.birthMotherFokontanyCustomAddress
          }, ${parentHaveNotMaritalStatusLegal}`
    fatherDetail = `${this.fatherFamilyName} ${this.fatherFirstName}, ${fatherAdditionnalInfo}`
  }
  return fatherDetail
}

function handleMotherDeceasedInformation(this: Record<string, any>) {
  return this.birthMotherMotherIsDeceased ? ' ,efa maty,' : ''
}

function handleInformantInfo(this: Record<string, any>) {
  let informantInfo = "araka ny fanambarana nataon'"
  if (this.informantFamilyName?.trim()) {
    informantInfo +=
      this.motherFamilyName === this.informantFamilyName &&
      this.motherFirstName === this.informantFirstName
        ? 'ny reniny,'
        : this.fatherFamilyName === this.informantFamilyName &&
          this.fatherFirstName === this.informantFirstName
        ? 'ny rainy,'
        : `i ${this.informantFamilyName} ${
            this.informantFirstName
          }, teraka tamin'ny ${
            this.birthInformantCustomizedExactDateOfBirthUnknown
              ? convertNumberToLetterForMalagasySpecificLanguage(
                  parseInt(this.birthInformantYearOfBirth)
                )
              : customizeDateInCertificateContent(this.informantBirthDate)
          }, monina ao ${
            this.informantCustomAddress ??
            this.birthInformantFokontanyCustomAddress
          }, nanatrika ny fahaterahana,`
  }
  return informantInfo
}

export function birthCertificateRelatedPerson(): Handlebars.HelperDelegate {
  return function (this: any, informantFamilyName: string = '') {
    let informantInfo = ''
    if (informantFamilyName?.trim()) {
      informantInfo +=
        this.motherFamilyName === informantFamilyName &&
        this.motherFirstName === this.informantFirstName
          ? 'ny reniny'
          : this.fatherFamilyName === informantFamilyName &&
            this.fatherFirstName === this.informantFirstName
          ? 'ny rainy'
          : `i ${informantFamilyName} ${this.informantFirstName}`
    }
    return informantInfo
  }
}

function customizeOfficeName(registrationLocation: string = '') {
  const locationMappings: { [key: string]: string } = {
    'tana iv': "Commune Urbaine d'Antananarivo - Boriboritany Fahaefatra",
    'tana i': "Commune Urbaine d'Antananarivo - Boriboritany Voalohany",
    'toamasina suburbaine': 'Kaominina, Suburbaine Toamasina',
    'cec foulpointe': 'Kaominina, Rurale Mahavelona',
    'cec fanandrana': 'Kaominina, Rurale Fanandrana',
    toamasina: 'Kaominina, Toamasina Ambonivohitra',
    'cec talatamaty': 'Kaominina, Talatamaty',
    'cec mahitsy': 'Kaominina, Mahitsy',
    'cec ivato': 'Kaominina, Ivato',
    'cec ambohidratrimo': 'Kaominina, Ambohidratrimo',
    'cec ambohitrimanjaka': 'Kaominina, Ambohitrimanjaka',
    'cec anosiala': 'Kaominina, Anosiala'
  }

  const lowerCaseRegistrationLocation = registrationLocation.toLowerCase()

  for (const key in locationMappings) {
    if (lowerCaseRegistrationLocation.includes(key)) {
      return locationMappings[key]
    }
  }

  return ''
}

export function customizeOfficeNameLocation(): Handlebars.HelperDelegate {
  return function (this: any, registrationLocation: string = '') {
    return customizeOfficeName(registrationLocation)
  }
}

export function customizeOfficeNameLocationHeader(): Handlebars.HelperDelegate {
  return function (this: any, registrationLocation: string = '') {
    return customizeOfficeName(registrationLocation)
      .replace(',', '')
      .replace(' - ', '\n')
  }
}

export function customizeDistrictNameLocation(): Handlebars.HelperDelegate {
  return function (this: any, placeOfBirthDistrict: string = '') {
    return placeOfBirthDistrict
  }
}

export function getPlaceOfBirth(
  placeOfBirthFacility: string = '',
  fokontanyCustomAddress: string = ''
) {
  return !['', ' ', null, 'null', 'undefined', undefined].includes(
    fokontanyCustomAddress
  )
    ? fokontanyCustomAddress
    : placeOfBirthFacility
}

function getRecognitionMentionValues(this: Record<string, string>, i: number) {
  return [
    this['birthMentionRecognitionActNumber__' + i],
    this['birthMentionRecognitionDate__' + i],
    this['birthMentionRecognitionPlace__' + i],
    [
      this['birthMentionChildFamilyName__' + i],
      this['birthMentionChildFirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionMentionChildNID__' + i]
  ]
}

function getJudicialAdoptionMentionValues(
  this: Record<string, string>,
  i: number
) {
  return [
    this['birthMentionJudicialAdoptionActNumber__' + i],
    this['birthMentionJudicialAdoptionDate__' + i],
    this['birthMentionJudicialAdoptionJudgementDecisionNumber__' + i],
    this['birthMentionJudicialAdoptionJudgementDecisionDate__' + i],
    [
      this['birthMentionJudicialAdoptionParent1FamilyName__' + i],
      this['birthMentionJudicialAdoptionParent1FirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionJudicialAdoptionParent1NID__' + i],
    [
      this['birthMentionJudicialAdoptionParent2FamilyName__' + i],
      this['birthMentionJudicialAdoptionParent2FirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionJudicialAdoptionParent2NID__' + i]
  ]
}

function getSimpleAdoptionMentionValues(
  this: Record<string, string>,
  i: number
) {
  return [
    this['birthMentionSimpleAdoptionActNumber__' + i],
    this['birthMentionSimpleAdoptionDate__' + i],
    this['birthMentionSimpleAdoptionJudgementDecisionNumber__' + i],
    this['birthMentionSimpleAdoptionJudgementDecisionDate__' + i],
    [
      this['birthMentionSimpleAdoptionParent1FamilyName__' + i],
      this['birthMentionSimpleAdoptionParent1FirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionSimpleAdoptionParent1NID__' + i],
    [
      this['birthMentionSimpleAdoptionParent2FamilyName__' + i],
      this['birthMentionSimpleAdoptionParent2FirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionSimpleAdoptionParent2NID__' + i]
  ]
}

function getMarriageMentionValues(this: Record<string, string>, i: number) {
  return [
    this['birthMentionMarriageActNumber__' + i],
    this['birthMentionMarriageDate__' + i],
    this['birthMentionMarriageJudgementDecisionNumber__' + i],
    this['birthMentionMarriageJudgementDecisionDate__' + i],
    this['birthMentionMarriageTribunalOfFirstInstanceAct__' + i],
    [
      this['birthMentionBrideOrGroomFamilyName__' + i],
      this['birthMentionBrideOrGroomFirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionBrideOrGroomNID__' + i]
  ]
}

function getDivorceMentionValues(this: Record<string, string>, i: number) {
  return [
    this['birthMentionDivorceActNumber__' + i],
    this['birthMentionDivorceDate__' + i],
    this['birthMentionDivorcePlace__' + i],
    [
      this['birthMentionWifeOrHusbandFamilyName__' + i],
      this['birthMentionWifeOrHusbandFirstName__' + i]
    ]
      .filter(Boolean)
      .join(' ')
      .trim(),
    this['birthMentionWifeOrHusbandNID__' + i]
  ]
}

function getNameChangeMentionValues(this: Record<string, string>, i: number) {
  return [
    this['birthMentionNameChangeActNumber__' + i],
    this['birthMentionNameChangeDate__' + i],
    this['birthMentionNameChangeJudgementDecisionNumber__' + i],
    this['birthMentionNameChangeJudgementDecisionDate__' + i],
    this['birthMentionNameChangeTribunalOfFirstInstanceAct__' + i],
    this['birthMentionModification__' + i]
  ]
}

function getDeathMentionValues(this: Record<string, string>, i: number) {
  return [
    this['birthMentionDeathActNumber__' + i],
    this['birthMentionDeathDate__' + i],
    this['birthMentionDeathPlace__' + i],
    this['birthMentionDeathdateOfDeath__' + i],
    this['birthMentionDeathDeathPlace__' + i]
  ]
}
export function mentions(): Handlebars.HelperDelegate {
  return function (this: any) {
    let output = ''
    for (let i = 0; i < 10; i++) {
      if (!this['birthMentionDetailsMentionExist__' + i]) {
        break
      }
      output += [
        this['birthMentionTypeOfMention__' + i],
        ...getRecognitionMentionValues.apply(this, [i]),
        ...getJudicialAdoptionMentionValues.apply(this, [i]),
        ...getSimpleAdoptionMentionValues.apply(this, [i]),
        ...getMarriageMentionValues.apply(this, [i]),
        ...getDivorceMentionValues.apply(this, [i]),
        ...getNameChangeMentionValues.apply(this, [i]),
        ...getDeathMentionValues.apply(this, [i])
      ]
        .filter(Boolean)
        .join(', ')
      output += '\n'
    }
    return output
  }
}

export function isFirstCertificate(): Handlebars.HelperDelegate {
  return function (this: Record<string, string>) {
    return !this.certifier
  }
}

export function currentDate(): Handlebars.HelperDelegate {
  return function (this: Record<string, string>) {
    const current = new Date()
    return (
      current.getFullYear() +
      '-' +
      (current.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      current.getDay().toString().padStart(2, '0')
    )
  }
}
