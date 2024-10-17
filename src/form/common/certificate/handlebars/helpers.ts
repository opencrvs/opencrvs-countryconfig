import * as Handlebars from 'handlebars'

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
          font-family="Plus Jakarta Sans" 
          font-size="11"
          font-weight="${textType}"
          letter-spacing="0em"
           ${
             textType === 'bold'
               ? `transform="translate(${initX * 0.5},0)"`
               : ''
           }
          >
            ${insertTspansIntoText(lines)}
        </text>
      `
    }

    for (const key in options.hash) {
      const lines = wordWrap(options.hash[key], lineLength)
      const textType = key.startsWith('text') ? 'normal' : 'bold'
      content += createTextElement(textType, lines)
      y += LINE_HEIGHT
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

export function introduction(): Handlebars.HelperDelegate {
  return function (this: any, placeOfBirthCommune: string) {
    return joinValuesWith(
      [
        "Nalaina tamin’ny bokim-piankohonan'ny Kaominina",
        placeOfBirthCommune,
        'Foibe misahana ny fiankohonana, taona',
        `${customizeDateYearInCertificateContent(this.registrar.date)},`,
        'izao sora-pahaterahana manaraka izao :'
      ],
      ' '
    )
  }
}

export function eventStatement(): Handlebars.HelperDelegate {
  return function (
    this: any,
    fatherPrimaryDistrict: string,
    motherPrimaryDistrict: string
  ) {
    return joinValuesWith(
      [
        "--Tamin'ny",
        `${customizeDateInCertificateContent(this.eventDate)},`,
        'tamin’ny',
        convertTimeToMdgCustomWords(this.birthChildBirthTime),
        'no teraka tao amin’ny',
        this.placeOfBirthFacility ? `${this.placeOfBirthFacility},` : '',
        'fokontany',
        this.birthChildFokontanyCustomAddress
          ? `${this.birthChildFokontanyCustomAddress},`
          : '',
        'kaominina',
        `${this.placeOfBirthDistrict},`,
        'district',
        this.placeOfBirthState,
        ':',
        `${joinValuesWith([this.childFamilyName, this.childFirstName], ' ')},`,
        `${getChildGeneratedOrManualNID.call(this)},`,
        `${translateChildGenderToMDGWord(this.childGender)},`,
        'zanak’i',
        fatherDetails.call(this, fatherPrimaryDistrict),
        motherDetails.call(this, motherPrimaryDistrict)
      ],
      ' '
    )
  }
}

function fatherDetails(
  this: Record<string, string>,
  fatherPrimaryDistrict: string
) {
  if ('fatherReasonNotApplying' in this) {
    return ''
  }
  return joinValuesWith(
    [
      `${joinValuesWith([this.fatherFamilyName, this.fatherFirstName], ' ')},`,
      'teraka tamin’ny',
      this.birthFatherCustomizedExactDateOfBirthUnknown
        ? convertNumberToLetterForMalagasySpecificLanguage(
            parseInt(this.birthFatherYearOfBirth)
          )
        : customizeDateInCertificateContent(this.fatherBirthDate),
      'tao amin’ny',
      `${this.birthFatherBirthPlace},`,
      'kaominina',
      fatherPrimaryDistrict,
      this.birthFatherFatherIsDeceased ? 'nonina tao' : 'monina ao',
      'amin’ny',
      `${
        this.birthFatherFokontanyCustomAddress ||
        this.birthMotherFokontanyCustomAddress
      },`,
      `${this.fatherOccupation},`,
      this.birthFatherFatherHasFormallyRecognisedChild
        ? 'izay manambara fa manjanaka azy'
        : '',
      ', sy'
    ],
    ' '
  )
}

function motherDetails(
  this: Record<string, string>,
  motherPrimaryDistrict: string
) {
  if ('motherReasonNotApplying' in this) {
    return ''
  }
  return joinValuesWith(
    [
      `${joinValuesWith([this.motherFamilyName, this.motherFirstName], ' ')},`,
      "teraka tamin'ny",
      this.birthMotherCustomizedExactDateOfBirthUnknown
        ? convertNumberToLetterForMalagasySpecificLanguage(
            parseInt(this.birthMotherYearOfBirth)
          )
        : customizeDateInCertificateContent(this.motherBirthDate),
      `${this.birthMotherBirthPlace},`,
      'kaominina',
      motherPrimaryDistrict,
      this.birthMotherMotherIsDeceased ? 'nonina tao' : 'monina ao',
      'amin’ny',
      `${this.birthMotherFokontanyCustomAddress},`,
      `${this.motherOccupation}--`
    ],
    ' '
  )
}

export function registrationStatement(): Handlebars.HelperDelegate {
  return function (
    this: Record<string, any>,
    informantPrimaryDistrict: string,
    registrationDistrict: string
  ) {
    return joinValuesWith(
      [
        '---Nosoratana androany',
        `${customizeDateInCertificateContent(
          this.registrar.date.split('T')[0]
        )},`,
        'tamin’ny',
        convertTimeToMdgCustomWords(this.registrar.date.split('T')[1]),
        isInformantMotherOrFather(this.informantType)
          ? 'nataon’ny'
          : joinValuesWith(
              ["nataon'i", this.informantFamilyName, this.informantFirstName],
              ' '
            ),
        `${this.informantType},`,
        "teraka tamin'ny",
        this.birthInformantCustomizedExactDateOfBirthUnknown
          ? convertNumberToLetterForMalagasySpecificLanguage(
              parseInt(this.birthInformantYearOfBirth)
            )
          : customizeDateInCertificateContent(this.informantBirthDate),
        'tao',
        this.birthInformantBirthPlace
          ? `${this.birthInformantBirthPlace},`
          : '',
        'kaominina',
        `${informantPrimaryDistrict},`,
        'monina ao',
        `${this.birthInformantFokontanyCustomAddress},`,
        `${this.informantOccupation},`,
        'izay miara-manao sonia aminay,',
        `${this.registrar.name},`,
        'Mpiandraikitra ny fiankohonana eto amin’ny Kaominina',
        `${registrationDistrict},`,
        'rehefa novakiana taminy ity soratra ity.---'
      ],
      ' '
    )
  }
}

export function signatureDescription(): Handlebars.HelperDelegate {
  return function (this: Record<string, any>) {
    return joinValuesWith(
      [
        'Kopia manontolo nadika mitovy amin’ny bokim-piankohonana, androany',
        `${customizeDateInCertificateContent(
          new Date().toISOString().split('T')[0]
        )},`,
        `${joinValuesWith(
          [this.informantFamilyName, this.informantFirstName],
          ' '
        )}--`
      ],
      ' '
    )
  }
}
function isInformantMotherOrFather(informantType: string) {
  return informantType === 'MOTHER' || informantType === 'FATHER'
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
            }`
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

  return `${mdgHours[newHour]}${
    newMinute > 0
      ? `ora sy ${convertNumberToLetterForMalagasySpecificLanguage(newMinute)} `
      : ''
  }minitra ${timePeriod}`
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

export function translateTime(): Handlebars.HelperDelegate {
  return function (this: any, timeString: string) {
    return convertTimeToMdgCustomWords(timeString)
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

function getChildGeneratedOrManualNID(this: any) {
  return this.childNIDManual ? this.childNIDManual : this.childNID
}

export function getChildNID(): Handlebars.HelperDelegate {
  return function (this: Record<string, string>) {
    return getChildGeneratedOrManualNID.call(this)
  }
}
