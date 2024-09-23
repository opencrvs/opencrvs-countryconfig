'use strict'
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i)
          ar[i] = from[i]
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from))
  }
Object.defineProperty(window, '__esModule', { value: true })
window.isFirstCertificate =
  window.mentions =
  window.getPlaceOfBirth =
  window.customizeDistrictNameLocation =
  window.customizeOfficeNameLocationHeader =
  window.customizeOfficeNameLocation =
  window.birthCertificateRelatedPerson =
  window.translateDateToMDGFormat =
  window.translateTime =
  window.customizeChildBirthRegistrationNumber =
  window.translateDateYear =
  window.translateDate =
  window.noop =
  window.mainContent =
  window.join =
  window.wrapGroup =
  window.wrap =
    void 0
function wordWrap(text, boundary) {
  return text
    .split('\n')
    .map(function (line) {
      var pos = 0
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
var LINE_HEIGHT = 14
function insertTspansIntoText(textLines, xi, yi) {
  var svgString = ''
  var y = yi
  for (var _i = 0, textLines_1 = textLines; _i < textLines_1.length; _i++) {
    var line = textLines_1[_i]
    svgString += '<tspan x="'
      .concat(xi, '" y="')
      .concat(y, '">')
      .concat(line, '</tspan>')
    y += LINE_HEIGHT
  }
  return svgString
}
function wrap() {
  return function (lineLength, x, y) {
    var values = []
    for (var _i = 3; _i < arguments.length; _i++) {
      values[_i - 3] = arguments[_i]
    }
    var lines = wordWrap(values.slice(0, -1).join(' '), lineLength)
    return insertTspansIntoText(lines, x, y)
  }
}
window.wrap = wrap
function wrapGroup() {
  return function (lineLength, initX, initY, options) {
    var content = ''
    var y = initY
    function insertTspansIntoText(textLines) {
      var svgString = ''
      for (var _i = 0, textLines_2 = textLines; _i < textLines_2.length; _i++) {
        var line = textLines_2[_i]
        svgString += '<tspan x="'
          .concat(initX, '" y="')
          .concat(y, '">')
          .concat(line, '</tspan>')
        y += LINE_HEIGHT
      }
      return svgString
    }
    function createTextElement(textType, lines) {
      return '\n        <text \n          fill="black" \n          xml:space="default" \n          font-family="Montserrat" \n          font-size="9"\n          font-weight="'
        .concat(textType, '" \n          letter-spacing="0em">\n            ')
        .concat(insertTspansIntoText(lines), '\n        </text>\n      ')
    }
    for (var key in options.hash) {
      var lines = wordWrap(options.hash[key], lineLength)
      var textType = key.startsWith('text') ? 'normal' : 'bold'
      content += createTextElement(textType, lines)
      if (textType === 'normal') {
        y += LINE_HEIGHT
      }
    }
    return content
  }
}
window.wrapGroup = wrapGroup
function joinValuesWith(values, separator) {
  if (separator === void 0) {
    separator = ' '
  }
  return values.filter(Boolean).join(separator)
}
function join() {
  return function () {
    var values = []
    for (var _i = 0; _i < arguments.length; _i++) {
      values[_i] = arguments[_i]
    }
    return joinValuesWith(values.slice(0, -1), '')
  }
}
window.join = join
function name(familyName, firstName) {
  return joinValuesWith([familyName, firstName], ' ')
}
function mainContent() {
  return function (placeOfBirthDistrict) {
    if (placeOfBirthDistrict === void 0) {
      placeOfBirthDistrict = ''
    }
    var paragraph1 = joinValuesWith(
      [
        "Nalaina tamin’ny bokim-piankohonan'ny Kaominina",
        placeOfBirthDistrict,
        ', Foibe misahana ny fiankohonana, taona',
        customizeDateYearInCertificateContent(this.registrar.date),
        ', izao sora-pahaterahana manaraka izao :'
      ],
      ' '
    )
    var paragraph2 = joinValuesWith(
      [
        "--Tamin'ny",
        customizeDateInCertificateContent(this.eventDate),
        ", tamin'ny",
        convertTimeToMdgCustomWords(this.birthChildBirthTime),
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
    var paragraph3 = joinValuesWith(
      [
        'Nosoratana androany',
        customizeDateInCertificateContent(this.registrationDate) + ',',
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
  }
}
window.mainContent = mainContent
function noop(props) {
  return function (value) {
    // eslint-disable-next-line no-console
    console.log(props)
    return value
  }
}
window.noop = noop
var THE_UNITS_MDG_WORDS = [
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
var FROM_10_TO_19_MDG_WORDS = [
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
var DOZENS_MDG_WORDS = [
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
var THE_HUNDREDS_MDG_WORDS = [
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
var MDG_IRAY_WORD = 'iray'
var THE_MONTH_MDG_WORDS = [
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
var THE_MONTH_EN_WORDS = [
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
var DEFAULT_MESSAGE = 'defaultMessage'
var MDG_FEMALE_WORD = 'zazavavy'
var MDG_MALE_WORD = 'zazalahy'
var ID = 'id'
var convertNumberToLetterForMalagasySpecificLanguage = function (num) {
  var digitLength = num.toString()
  console.log(digitLength)
  if (digitLength.length > 9) return 'mihoatra lavitra'
  var digits = ('000000000' + digitLength)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
  var unit = THE_UNITS_MDG_WORDS.concat(FROM_10_TO_19_MDG_WORDS)
  if (!digits) return
  var numberToLetter = ''
  numberToLetter +=
    digits[3] != '0'
      ? (parseInt(digits[3]) != 1
          ? ''.concat(
              unit[Number(digits[3])] ||
                DOZENS_MDG_WORDS[parseInt(digits[3][0])]
            )
          : '') + ' arivo '
      : ''
  console.log('1', numberToLetter)
  if (digits[3] != '0' && digits[4] != '0')
    numberToLetter = ' sy '.concat(numberToLetter)
  if (digits[3] != '0' && digits[4] == '0') numberToLetter = '' + numberToLetter
  numberToLetter =
    digits[4] != ''
      ? THE_HUNDREDS_MDG_WORDS[Number(digits[4])] +
        (parseInt(digits[3]) != 0 && parseInt(digits[4]) >= 0
          ? numberToLetter
          : '')
      : ''
  console.log('2', numberToLetter)
  numberToLetter =
    digits[5] != '00'
      ? (unit[Number(digits[5])] ||
          (unit[parseInt(digits[5][1])] != ''
            ? ''
                .concat(unit[parseInt(digits[5][1])], ' amby  ')
                .concat(DOZENS_MDG_WORDS[parseInt(digits[5][0])])
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
function convertTimeToMdgCustomWords(timeString) {
  var _a = timeString.split(':'),
    hour = _a[0],
    minute = _a[1]
  var newHour = parseInt(hour)
  var mdgHours = THE_UNITS_MDG_WORDS.concat(FROM_10_TO_19_MDG_WORDS.slice(0, 3))
  mdgHours[1] = MDG_IRAY_WORD
  var newMinute = parseInt(minute)
  var timePeriod = 'maraina'
  if (newHour <= 12 && newHour >= 10) timePeriod = 'antoandro'
  else if (newHour > 12) {
    if (newHour <= 16 && newHour >= 13) timePeriod = 'tolakandro'
    if (newHour <= 19 && newHour >= 17) timePeriod = 'hariva'
    if (newHour < 24 && newHour >= 20) timePeriod = 'alina'
    newHour = newHour - 12
  } else if (newHour === 0 && newMinute > 0) {
    return "roa ambin'ny folo ora sy ".concat(
      convertNumberToLetterForMalagasySpecificLanguage(newMinute),
      ' minitra alina'
    )
  } else if (newHour === 0 && newMinute === 0) {
    return "roa ambin'ny folo ora alina"
  }
  return ''
    .concat(mdgHours[newHour], 'ora sy ')
    .concat(
      convertNumberToLetterForMalagasySpecificLanguage(newMinute),
      ' minitra '
    )
    .concat(timePeriod)
}
function convertDateToMdgCustomWords(dateString) {
  var _a = dateString.split('-'),
    year = _a[0],
    month = _a[1],
    day = _a[2]
  var dateValue =
    parseInt(day) === 1
      ? "voalohan'ny volana"
      : ''.concat(
          convertNumberToLetterForMalagasySpecificLanguage(parseInt(day))
        )
  return ''
    .concat(dateValue, ' ')
    .concat(THE_MONTH_MDG_WORDS[parseInt(month)], ', taona ')
    .concat(convertNumberToLetterForMalagasySpecificLanguage(parseInt(year)))
}
function convertLocaleDateToMdgCustomWords(dateString) {
  var _a = dateString.split('/'),
    month = _a[0],
    day = _a[1],
    year = _a[2]
  return ''
    .concat(day, ' ')
    .concat(THE_MONTH_MDG_WORDS[parseInt(month)], ' ')
    .concat(year)
}
var ROMAN_NUMBERS_MDG_WORDS = {
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
var CITY_TRANSFORMER = {
  Tana: 'Antananarivo',
  Majunga: 'Mahajanga',
  Tulear: 'Toliary',
  Diego: 'Antsiranana',
  Tamatave: 'Toamasina'
}
var customizeMdgOfficeName = function (officeName) {
  return officeName
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
}
var getChildGenderMdgWords = function (childGender) {
  if (childGender[DEFAULT_MESSAGE] === 'Female') {
    childGender[DEFAULT_MESSAGE] = MDG_FEMALE_WORD
    childGender[ID] = MDG_FEMALE_WORD
  } else if (childGender[DEFAULT_MESSAGE] === 'Male') {
    childGender[DEFAULT_MESSAGE] = MDG_MALE_WORD
    childGender[ID] = MDG_MALE_WORD
  }
  return childGender
}
var customizeDateInCertificateContent = function (_date) {
  var dateWithoutOrdinal = removeOrdinalIndicator(_date)
  var date = new Date(dateWithoutOrdinal)
  var formattedDate = date.toISOString().split('T')[0]
  return convertDateToMdgCustomWords(formattedDate)
}
function translateDate() {
  return function (dateString) {
    return customizeDateInCertificateContent(dateString)
  }
}
window.translateDate = translateDate
function customizeDateYearInCertificateContent(dateString) {
  var year = Number(dateString.split('-')[0])
  return Number.isNaN(year)
    ? ''
    : convertNumberToLetterForMalagasySpecificLanguage(year)
}
function translateDateYear() {
  return function (dateString) {
    return customizeDateYearInCertificateContent(dateString)
  }
}
window.translateDateYear = translateDateYear
function customizeChildBirthRegistrationNumber() {
  return function (
    rawChildBirthRegistrationNumber,
    manualChildBirthRegistrationNumber
  ) {
    if (manualChildBirthRegistrationNumber === void 0) {
      manualChildBirthRegistrationNumber = ''
    }
    if (
      manualChildBirthRegistrationNumber &&
      !['', undefined, 'undefined', null, 'null'].includes(
        manualChildBirthRegistrationNumber.trim()
      )
    )
      return manualChildBirthRegistrationNumber.toString().padStart(6, '0')
    var currentRegisterNumber = ''
    if (
      rawChildBirthRegistrationNumber &&
      rawChildBirthRegistrationNumber.includes('_')
    ) {
      var rawRegisterNumber = rawChildBirthRegistrationNumber.split('_')
      currentRegisterNumber =
        rawRegisterNumber.length === 3
          ? rawRegisterNumber[2]
          : rawRegisterNumber[1]
    }
    return currentRegisterNumber.toString().padStart(6, '0')
  }
}
window.customizeChildBirthRegistrationNumber =
  customizeChildBirthRegistrationNumber
function removeOrdinalIndicator(dateString) {
  if (!dateString) return new Date() // TODO: Handle it later
  return (
    dateString &&
    (dateString === null || dateString === void 0
      ? void 0
      : dateString.replace(/\b(\d+)(th|st|nd|rd)\b/g, '$1'))
  )
}
function translateTime() {
  return function (timeString) {
    return convertTimeToMdgCustomWords(timeString)
  }
}
window.translateTime = translateTime
function translateDateToMDGFormat() {
  return function (eventDate) {
    var dateWithoutOrdinal = removeOrdinalIndicator(eventDate)
    var date = new Date(dateWithoutOrdinal)
    var formattedDate = date.toLocaleString().split(', ')[0]
    return convertLocaleDateToMdgCustomWords(formattedDate)
  }
}
window.translateDateToMDGFormat = translateDateToMDGFormat
function translateChildGenderToMDGWord(childGender) {
  return childGender &&
    ['male', 'homme', 'lehilahy', 'zazalahy'].includes(
      childGender.toLowerCase()
    )
    ? 'zazalahy'
    : 'zazavavy'
}
function handleFatherInformation() {
  var _a, _b
  var fatherDetail = ''
  if (
    (_a = this.fatherFamilyName) === null || _a === void 0 ? void 0 : _a.trim()
  ) {
    var fatherIsDeceased = this.birthFatherFatherIsDeceased ? 'efa maty,' : ''
    var parentHaveNotMaritalStatusLegal = this
      .birthFatherFatherHasFormallyRecognisedChild
      ? 'izay manambara fa manjanaka azy, sy'
      : ', sy'
    var fatherAdditionnalInfo =
      fatherIsDeceased === 'efa maty,'
        ? ''
        : ''
            .concat(this.fatherOccupation, ', teraka tao ')
            .concat(this.birthFatherBirthPlace, ' tamin\u2019ny ')
            .concat(
              this.birthFatherCustomizedExactDateOfBirthUnknown
                ? convertNumberToLetterForMalagasySpecificLanguage(
                    parseInt(this.birthFatherYearOfBirth)
                  )
                : customizeDateInCertificateContent(this.fatherBirthDate),
              ', monina ao '
            )
            .concat(
              (_b = this.birthFatherFokontanyCustomAddress) !== null &&
                _b !== void 0
                ? _b
                : this.birthMotherFokontanyCustomAddress,
              ', '
            )
            .concat(parentHaveNotMaritalStatusLegal)
    fatherDetail = ''
      .concat(this.fatherFamilyName, ' ')
      .concat(this.fatherFirstName, ', ')
      .concat(fatherAdditionnalInfo)
  }
  return fatherDetail
}
function handleMotherDeceasedInformation() {
  return this.birthMotherMotherIsDeceased ? ' ,efa maty,' : ''
}
function handleInformantInfo() {
  var _a, _b
  var informantInfo = "araka ny fanambarana nataon'"
  if (
    (_a = this.informantFamilyName) === null || _a === void 0
      ? void 0
      : _a.trim()
  ) {
    informantInfo +=
      this.motherFamilyName === this.informantFamilyName &&
      this.motherFirstName === this.informantFirstName
        ? 'ny reniny,'
        : this.fatherFamilyName === this.informantFamilyName &&
          this.fatherFirstName === this.informantFirstName
        ? 'ny rainy,'
        : 'i '
            .concat(this.informantFamilyName, ' ')
            .concat(this.informantFirstName, ", teraka tamin'ny ")
            .concat(
              this.birthInformantCustomizedExactDateOfBirthUnknown
                ? convertNumberToLetterForMalagasySpecificLanguage(
                    parseInt(this.birthInformantYearOfBirth)
                  )
                : customizeDateInCertificateContent(this.informantBirthDate),
              ', monina ao '
            )
            .concat(
              (_b = this.informantCustomAddress) !== null && _b !== void 0
                ? _b
                : this.birthInformantFokontanyCustomAddress,
              ', nanatrika ny fahaterahana,'
            )
  }
  return informantInfo
}
function birthCertificateRelatedPerson() {
  return function (informantFamilyName) {
    if (informantFamilyName === void 0) {
      informantFamilyName = ''
    }
    var informantInfo = ''
    if (
      informantFamilyName === null || informantFamilyName === void 0
        ? void 0
        : informantFamilyName.trim()
    ) {
      informantInfo +=
        this.motherFamilyName === informantFamilyName &&
        this.motherFirstName === this.informantFirstName
          ? 'ny reniny'
          : this.fatherFamilyName === informantFamilyName &&
            this.fatherFirstName === this.informantFirstName
          ? 'ny rainy'
          : 'i '
              .concat(informantFamilyName, ' ')
              .concat(this.informantFirstName)
    }
    return informantInfo
  }
}
window.birthCertificateRelatedPerson = birthCertificateRelatedPerson
function customizeOfficeName(registrationLocation) {
  if (registrationLocation === void 0) {
    registrationLocation = ''
  }
  var locationMappings = {
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
  var lowerCaseRegistrationLocation = registrationLocation.toLowerCase()
  for (var key in locationMappings) {
    if (lowerCaseRegistrationLocation.includes(key)) {
      return locationMappings[key]
    }
  }
  return ''
}
function customizeOfficeNameLocation() {
  return function (registrationLocation) {
    if (registrationLocation === void 0) {
      registrationLocation = ''
    }
    return customizeOfficeName(registrationLocation)
  }
}
window.customizeOfficeNameLocation = customizeOfficeNameLocation
function customizeOfficeNameLocationHeader() {
  return function (registrationLocation) {
    if (registrationLocation === void 0) {
      registrationLocation = ''
    }
    return customizeOfficeName(registrationLocation)
      .replace(',', '')
      .replace(' - ', '\n')
  }
}
window.customizeOfficeNameLocationHeader = customizeOfficeNameLocationHeader
function customizeDistrictNameLocation() {
  return function (placeOfBirthDistrict) {
    if (placeOfBirthDistrict === void 0) {
      placeOfBirthDistrict = ''
    }
    return placeOfBirthDistrict
  }
}
window.customizeDistrictNameLocation = customizeDistrictNameLocation
function getPlaceOfBirth(placeOfBirthFacility, fokontanyCustomAddress) {
  if (placeOfBirthFacility === void 0) {
    placeOfBirthFacility = ''
  }
  if (fokontanyCustomAddress === void 0) {
    fokontanyCustomAddress = ''
  }
  return !['', ' ', null, 'null', 'undefined', undefined].includes(
    fokontanyCustomAddress
  )
    ? fokontanyCustomAddress
    : placeOfBirthFacility
}
window.getPlaceOfBirth = getPlaceOfBirth
function getRecognitionMentionValues(i) {
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
function getJudicialAdoptionMentionValues(i) {
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
function getSimpleAdoptionMentionValues(i) {
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
function getMarriageMentionValues(i) {
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
function getDivorceMentionValues(i) {
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
function getNameChangeMentionValues(i) {
  return [
    this['birthMentionNameChangeActNumber__' + i],
    this['birthMentionNameChangeDate__' + i],
    this['birthMentionNameChangeJudgementDecisionNumber__' + i],
    this['birthMentionNameChangeJudgementDecisionDate__' + i],
    this['birthMentionNameChangeTribunalOfFirstInstanceAct__' + i],
    this['birthMentionModification__' + i]
  ]
}
function getDeathMentionValues(i) {
  return [
    this['birthMentionDeathActNumber__' + i],
    this['birthMentionDeathDate__' + i],
    this['birthMentionDeathPlace__' + i],
    this['birthMentionDeathdateOfDeath__' + i],
    this['birthMentionDeathDeathPlace__' + i]
  ]
}
function mentions() {
  return function () {
    var output = ''
    for (var i = 0; i < 10; i++) {
      if (!this['birthMentionDetailsMentionExist__' + i]) {
        break
      }
      output += __spreadArray(
        __spreadArray(
          __spreadArray(
            __spreadArray(
              __spreadArray(
                __spreadArray(
                  __spreadArray(
                    [this['birthMentionTypeOfMention__' + i]],
                    getRecognitionMentionValues.apply(this, [i]),
                    true
                  ),
                  getJudicialAdoptionMentionValues.apply(this, [i]),
                  true
                ),
                getSimpleAdoptionMentionValues.apply(this, [i]),
                true
              ),
              getMarriageMentionValues.apply(this, [i]),
              true
            ),
            getDivorceMentionValues.apply(this, [i]),
            true
          ),
          getNameChangeMentionValues.apply(this, [i]),
          true
        ),
        getDeathMentionValues.apply(this, [i]),
        true
      )
        .filter(Boolean)
        .join(', ')
      output += '\n'
    }
    return output
  }
}
window.mentions = mentions
function isFirstCertificate() {
  return function () {
    return !this.certifier
  }
}
window.isFirstCertificate = isFirstCertificate
