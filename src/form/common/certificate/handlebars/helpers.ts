import { getRecognitionMentionFields } from '@countryconfig/form/birth/custom-fields'
import * as Handlebars from 'handlebars'
import { type IntlShape } from 'react-intl'

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
  const [hour, minute, seconde] = timeString.split(':')
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

export function translateEventDate(): Handlebars.HelperDelegate {
  return function (this: any, eventDate: string) {
    return customizeDateInCertificateContent(eventDate)
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

export function translateEventTime(): Handlebars.HelperDelegate {
  return function (this: any, eventTime: string) {
    const rawEventTime = eventTime?.toLowerCase().includes('h')
      ? eventTime.replace('h', ':')
      : eventTime

    return rawEventTime ? convertTimeToMdgCustomWords(rawEventTime) : ''
  }
}

export function translateEventDateToMDGFormat(): Handlebars.HelperDelegate {
  return function (this: any, eventDate: string) {
    const dateWithoutOrdinal = removeOrdinalIndicator(eventDate)
    const date = new Date(dateWithoutOrdinal)
    const formattedDate = date.toLocaleString().split(', ')[0]

    return convertLocaleDateToMdgCustomWords(formattedDate)
  }
}

export function translateChildGenderToMDGWord(): Handlebars.HelperDelegate {
  return function (this: any, childGender: string) {
    return childGender &&
      ['male', 'homme', 'lehilahy', 'zazalahy'].includes(
        childGender.toLowerCase()
      )
      ? 'zazalahy'
      : 'zazavavy'
  }
}

export function handleFatherInformation(): Handlebars.HelperDelegate {
  return function (this: any, fatherFamilyName: string = '') {
    let fatherDetail = ''
    if (
      fatherFamilyName &&
      fatherFamilyName != '' &&
      fatherFamilyName !== ' ' &&
      ![null, 'null', null, undefined, 'undefined'].includes(fatherFamilyName)
    ) {
      const legalMaritalStatus = ['marié(e)', 'married', 'manambady']
      const fatherHasMaritalStatusWidowed = [
        'veuf(ve)',
        'widowed',
        'maty vady'
      ].includes(this.motherMaritalStatus.toLowerCase())
        ? 'efa maty,'
        : ''
      const parentHaveNotMaritalStatusLegal =
        !legalMaritalStatus.includes(this.motherMaritalStatus.toLowerCase()) &&
        !legalMaritalStatus.includes(this.fatherMaritalStatus.toLowerCase())
          ? 'izay manambara fa manjanaka azy, sy'
          : ', sy'
      const fatherAdditionnalInfo =
        fatherHasMaritalStatusWidowed === 'efa maty,'
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
      fatherDetail = `${fatherFamilyName} ${this.fatherFirstName}, ${fatherAdditionnalInfo}`
    }
    return fatherDetail
  }
}

export function handleMotherMaritalStatusWidowedInformation(): Handlebars.HelperDelegate {
  return function (this: any, fatherFamilyName: string = '') {
    let motherMaritalStatusWidowedInformation = ''
    if (
      fatherFamilyName &&
      fatherFamilyName != '' &&
      fatherFamilyName !== ' ' &&
      ![null, 'null', null, undefined, 'undefined'].includes(
        fatherFamilyName
      ) &&
      !['', null, 'null', null, undefined, 'undefined'].includes(
        this.fatherMaritalStatus
      )
    ) {
      motherMaritalStatusWidowedInformation = [
        'veuf(ve)',
        'widowed',
        'maty vady'
      ].includes(this.fatherMaritalStatus.toLowerCase())
        ? ' ,efa maty,'
        : ''
    }
    return motherMaritalStatusWidowedInformation
  }
}

export function handleInformantInfo(): Handlebars.HelperDelegate {
  return function (this: any, informantFamilyName: string = '') {
    let informantInfo = "araka ny fanambarana nataon'"
    if (
      informantFamilyName &&
      informantFamilyName != '' &&
      informantFamilyName !== ' ' &&
      ![null, 'null', null, undefined, 'undefined'].includes(
        informantFamilyName
      )
    ) {
      informantInfo +=
        this.motherFamilyName === informantFamilyName &&
        this.motherFirstName === this.informantFirstName
          ? 'ny reniny,'
          : this.fatherFamilyName === informantFamilyName &&
            this.fatherFirstName === this.informantFirstName
          ? 'ny rainy,'
          : `i ${informantFamilyName} ${
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
}

export function birthCertificateRelatedPerson(): Handlebars.HelperDelegate {
  return function (this: any, informantFamilyName: string = '') {
    let informantInfo = ''
    if (
      informantFamilyName &&
      informantFamilyName != '' &&
      informantFamilyName !== ' ' &&
      ![null, 'null', null, undefined, 'undefined'].includes(
        informantFamilyName
      )
    ) {
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

export function getPlaceOfBirth(): Handlebars.HelperDelegate {
  return function (
    this: any,
    placeOfBirthFacility: string = '',
    fokontanyCustomAddress: string = ''
  ) {
    return !['', ' ', null, 'null', 'undefined', undefined].includes(
      fokontanyCustomAddress
    )
      ? fokontanyCustomAddress
      : placeOfBirthFacility
  }
}

export function mentions(): Handlebars.HelperDelegate {
  return function (this: any) {
    let output = ''
    for (let i = 0; i < 10; i++) {
      if (!this['birthMentionDetailsMentionExist__' + i]) {
        break
      }
      if (this['birthMentionTypeOfMention__' + i] === 'Recognition') {
        output += [
          this['birthMentionTypeOfMention__' + i],
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
          .filter(Boolean)
          .join(', ')
      } else if (
        this['birthMentionTypeOfMention__' + i] === 'Judicial adoption'
      ) {
        output += [
          this['birthMentionTypeOfMention__' + i],
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
          this['mentionJudicialAdoptionParent1NID__' + i],
          [
            this['birthMentionJudicialAdoptionParent2FamilyName__' + i],
            this['birthMentionJudicialAdoptionParent2FirstName__' + i]
          ]
            .filter(Boolean)
            .join(' ')
            .trim(),
          this['mentionJudicialAdoptionParent2NID__' + i]
        ]
          .filter(Boolean)
          .join(', ')
      }
      output += '\n'
    }
    return output
  }
}
