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
window.__esModule = true
window.getRegionName =
  window.getChildNID =
  window.isFirstCertificate =
  window.mentions =
  window.getPlaceOfBirth =
  window.customizeDistrictNameLocation =
  window.customizeOfficeNameLocationHeader =
  window.replaceByUppercaseLocation =
  window.definitionDistrictInTheAct =
  window.definitionCommuneInTheAct =
  window.customizeOfficeNameLocation =
  window.birthCertificateRelatedPerson =
  window.translateDateToMDGFormat =
  window.getBirthRegistrationDateMDGFormat =
  window.translateTime =
  window.customizeChildBirthRegistrationNumber =
  window.translateDateYear =
  window.translateDate =
  window.signatureDescription =
  window.registrationStatement =
  window.eventStatement =
  window.introduction =
  window.numberOfTimesCertificatePrinted =
  window.linebreak =
  window.foreignObject =
  window.text =
  window.join =
  window.wrapGroup =
  window.wrap =
    void 0
var LINE_HEIGHT = 15
var DEFAULT_FONTSIZE = 11
var DOUBLE_LINE_BREAk_SEPARATION = ' _DLBS_ '
function generateDoubleLineBreak() {
  return '\n' + DOUBLE_LINE_BREAk_SEPARATION + '\n'
}
function wordWrap(text, boundary, fontSize, fontWeight) {
  var letterSizeFactor =
    (fontSize != null ? (fontSize + 1.13) / DEFAULT_FONTSIZE : 1) +
    (fontWeight && fontWeight == 'bold' ? 0.1 : 0)
  return text
    .split('\n')
    .map(function (line) {
      var pos = 0
      return line
        .trim()
        .split(/\b/)
        .map(function (word) {
          var isPonctuation = /[.,;:!']$/.test(word.trim())
          pos += word.length * letterSizeFactor
          if (!isPonctuation && pos > boundary) {
            pos = word.length
            return '\n' + word.trimLeft()
          }
          return word
        })
        .join('')
    })
    .join('\n')
    .split('\n')
}
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
    this.x = initX
    this.y = initY
    this.lineLength = lineLength
    var content = options.fn(this)
    delete this.x
    delete this.y
    delete this.lineLength
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
function text() {
  return function (options) {
    function insertTspansIntoText(textLines) {
      var svgString = ''
      for (var _i = 0, textLines_2 = textLines; _i < textLines_2.length; _i++) {
        var line = textLines_2[_i]
        var lineTrimed = line.trim()
        if (lineTrimed !== '') {
          svgString += '<tspan x="'
            .concat(this.x, '" y="')
            .concat(this.y, '">')
            .concat(
              lineTrimed == DOUBLE_LINE_BREAk_SEPARATION.trim()
                ? ''
                : lineTrimed,
              '</tspan>'
            )
          this.y += LINE_HEIGHT
        }
      }
      return svgString
    }
    var fontWeight = options.hash.fontWeight || 'normal'
    var align = options.hash.align || 'start'
    var fontSize = options.hash.fontSize || DEFAULT_FONTSIZE
    var content = options.fn(this)
    var lines = wordWrap(content, this.lineLength, fontSize, fontWeight)
    var element =
      '<text \n          fill="black" \n          xml:space="default" \n          font-family="Plus Jakarta Sans" \n          font-size="'
        .concat(fontSize, '"\n          font-weight="')
        .concat(fontWeight, '"\n          letter-spacing="0em"\n           ')
        .concat(
          align === 'middle'
            ? '\n                  x="50%"\n                  dx="'.concat(
                this.x,
                '"\n                  dominant-baseline="middle"\n                  text-anchor="middle"\n               '
              )
            : '',
          '\n          >\n            '
        )
        .concat(insertTspansIntoText.call(this, lines), '\n        </text>')
    return element
  }
}
window.text = text
function foreignObject() {
  return function (width, height, options) {
    var content = options.fn(this)
    var res = '<foreignObject x="'
      .concat(this.x, '" y="')
      .concat(this.y - 10, '" width="')
      .concat(width, '" height="')
      .concat(height, '">')
      .concat(content, '</foreignObject>')
    this.y += height
    return res
  }
}
window.foreignObject = foreignObject
function linebreak() {
  return function () {
    if (this.y) {
      this.y += LINE_HEIGHT
    }
  }
}
window.linebreak = linebreak
function isValidDate(value) {
  // Check if value is null, undefined, or an empty string
  if (!value || typeof value !== 'string') {
    return false
  }
  // Parse the string into a Date object
  var date = new Date(value)
  // Check if the resulting Date object is valid
  return !isNaN(date.getTime())
}
function numberOfTimesCertificatePrinted() {
  return function () {
    // if (!this.certifier) {
    //   return 'KOPIA VOALOHANY'
    // } else {
    //   return 'SORATRA AN-TSISINY :'
    // }
    return !this.certifier ? 'KOPIA VOALOHANY' + generateDoubleLineBreak() : ''
  }
}
window.numberOfTimesCertificatePrinted = numberOfTimesCertificatePrinted
function introduction() {
  return function (placeOfBirthCommune) {
    return joinValuesWith(
      [
        "Nalaina tamin’ny bokim-piankohonan'ny Kaominina",
        definitionOffice(replaceByUppercase(placeOfBirthCommune)),
        'Foibe misahana ny fiankohonana, taona',
        customizeDateYearInCertificateContent(this.registrar.date) + ',',
        'izao sora-pahaterahana manaraka izao :'
      ]
      // ' '
    )
  }
}
window.introduction = introduction
function eventStatement() {
  return function (
    placeOfBirthState,
    placeOfBirthDistrict,
    fatherPrimaryDistrict,
    motherPrimaryDistrict
  ) {
    return joinValuesWith(
      __spreadArray(
        __spreadArray(
          [
            "--Tamin’ny",
            customizeDateInCertificateContent(this.eventDate) + ',',
            'tamin’ny',
            convertTimeToMdgCustomWords(this.birthChildBirthTime)
          ],
          this.countryPlaceofbirth == 'Madagascar' || this.placeOfBirthFacility
            ? [
                'no teraka tao amin’ny',
                this.placeOfBirthFacility
                  ? replaceAbbreviations(this.placeOfBirthFacility) + ','
                  : '',
                this.birthChildFokontanyCustomAddress
                  ? 'fokontany ' + this.birthChildFokontanyCustomAddress + ','
                  : '',

                      'kaominina',
                      (definitionOffice(
                        replaceByUppercase(placeOfBirthDistrict)
                      ) || '-') +
                      ',' +
                      'district ' +
                      definitionDistrict(placeOfBirthState) || '-'
              ]
            : [
                'no teraka tao',
                [
                  this.countryPlaceofbirth,
                  this.internationalStatePlaceofbirth,
                  this.internationalDistrictPlaceofbirth,
                  this.internationalCityPlaceofbirth,
                  this.internationalAddressLine1Placeofbirth,
                  this.internationalAddressLine2Placeofbirth,
                  this.internationalAddressLine3Placeofbirth,
                  this.internationalPostalCodePlaceofbirth
                ]
                  .filter(Boolean)
                  .join(' ') || ' - '
              ],
          true
        ),
        [
          joinValuesWith(
            [':', this.childFamilyName, this.childFirstName],
            ' '
          ) + ',',
          //getChildGeneratedOrManualNID.call(this) + ',',
          translateChildGenderToMDGWord(this.childGender) + ',',
          'zanak’i',
          fatherDetails.call(this, fatherPrimaryDistrict),
          motherDetails.call(this, motherPrimaryDistrict),
          ' --'
        ],
        false
      )
    )
  }
}
window.eventStatement = eventStatement

function eventStatementSimplified(
  eventStatementContext,
  fatherDetailsContext,
  motherDetailsContext
) {
  const {
    eventDate,
    birthChildBirthTime,
    countryPlaceofbirth,
    placeOfBirthFacility,
    birthChildFokontanyCustomAddress,
    otherPlaceOfBirthAddress,
    placeOfBirthDistrict,
    placeOfBirthState,
    childFamilyName,
    childFirstName,
    childGender,
    internationalStatePlaceofbirth,
    internationalDistrictPlaceofbirth,
    internationalCityPlaceofbirth,
    internationalAddressLine1Placeofbirth,
    internationalAddressLine2Placeofbirth,
    internationalAddressLine3Placeofbirth,
    internationalPostalCodePlaceofbirth
  } = eventStatementContext

  return joinValuesWith(
    __spreadArray(
      __spreadArray(
        [
          "--Tamin’ny",
          customizeDateInCertificateContent(eventDate) + ',',
          'tamin’ny',
          convertTimeToMdgCustomWords(birthChildBirthTime)
        ],
        countryPlaceofbirth == 'Madagascar' || placeOfBirthFacility
          ? [
              'no teraka tao amin’ny',
              placeOfBirthFacility
                ? replaceAbbreviations(placeOfBirthFacility) + ','
                : '',
              otherPlaceOfBirthAddress ? otherPlaceOfBirthAddress + ',' : '',
              birthChildFokontanyCustomAddress
                ? 'fokontany ' + birthChildFokontanyCustomAddress + ','
                : '',
              'kaominina',
              (definitionOffice(replaceByUppercase(placeOfBirthDistrict)) ||
                '-') + ',',
              'district',
              definitionDistrict(placeOfBirthState) || '-'
            ]
          : [
              'no teraka tao',
              [
                countryPlaceofbirth,
                internationalStatePlaceofbirth,
                internationalDistrictPlaceofbirth,
                internationalCityPlaceofbirth,
                internationalAddressLine1Placeofbirth,
                internationalAddressLine2Placeofbirth,
                internationalAddressLine3Placeofbirth,
                internationalPostalCodePlaceofbirth
              ]
                .filter(Boolean)
                .join(' ') || ' - '
            ],
        true
      ),
      [
        joinValuesWith([':', childFamilyName, childFirstName], ' ') + ',',
        translateChildGenderToMDGWord(childGender) + ',',
        'zanak’i',
        fatherDetailsSimplified(fatherDetailsContext),
        motherDetailsSimplified(motherDetailsContext),
        ' --'
      ],
      false
    )
  )
}
window.eventStatementSimplified = eventStatementSimplified
function fatherDetails(fatherPrimaryDistrict) {
  if ('fatherReasonNotApplying' in this && !('fatherFamilyName' in this)) {
    return ''
  }
  return joinValuesWith(
    [
      joinValuesWith(
        __spreadArray(
          __spreadArray(
            [
              joinValuesWith([this.fatherFamilyName, this.fatherFirstName]) +
                ',',
              // 'rainy,',
              'teraka tamin’ny',
              this.birthFatherCustomizedExactDateOfBirthUnknown
                ? 'taona ' +
                  convertNumberToLetterForMalagasySpecificLanguage(
                    parseInt(this.birthFatherYearOfBirth)
                  )
                : customizeDateInCertificateContent(this.fatherBirthDate),
              'tao',
              (this.birthFatherBirthPlace || '-') + ',',
              this.birthFatherFatherIsDeceased ? 'nonina tao' : 'monina ao'
            ],
            this.countryPrimaryFather == 'Madagascar'
              ? [
                  'amin’ny fokontany',
                  (this.birthFatherFokontanyCustomAddress ||
                    this.birthMotherFokontanyCustomAddress ||
                    '-') + ',',
                    'kaominina' +
                      ' ' +
                      (definitionOffice(
                        replaceByUppercase(fatherPrimaryDistrict)
                      ) || '- ') +
                      ','
                ]
              : [
                  ([
                    this.countryPrimaryFather,
                    this.internationalStatePrimaryFather,
                    this.internationalDistrictPrimaryFather,
                    this.internationalCityPrimaryFather,
                    this.internationalAddressLine1PrimaryFather,
                    this.internationalAddressLine2PrimaryFather,
                    this.internationalAddressLine3PrimaryFather,
                    this.internationalPostalCodePrimaryFather
                  ]
                    .filter(Boolean)
                    .join(' ') || ' - ') + ','
                ],
            true
          ),
          [this.fatherOccupation],
          false
        )
      ),
      this.birthFatherFatherHasFormallyRecognisedChild
        ? 'izay manambara fa manjanaka azy'
        : '',
      'motherReasonNotApplying' in this ? '' : 'sy'
    ].filter(Boolean),
    ', '
  )
}

function canShowFatherDetails(
  motherMaritalStatus,
  fatherReasonNotApplying,
  fatherFamilyName,
  birthFatherFatherIsDeceased,
  birthFatherFatherHasFormallyRecognisedChild
) {
  if (isTranslatedMarriedMaritalStatus(motherMaritalStatus)) {
    return !(fatherReasonNotApplying && !fatherFamilyName)
  }
  if (birthFatherFatherIsDeceased) {
    return true
  }
  return birthFatherFatherHasFormallyRecognisedChild == 'true'
}

function fatherDetailsSimplified(fatherDetailsContext) {
  const {
    motherMaritalStatus,
    fatherReasonNotApplying,
    fatherFamilyName,
    fatherFirstName,
    birthFatherCustomizedExactDateOfBirthUnknown,
    birthFatherYearOfBirth,
    fatherBirthDate,
    birthFatherBirthPlace,
    birthFatherFatherIsDeceased,
    countryPrimaryFather,
    birthFatherFokontanyCustomAddress,
    birthMotherFokontanyCustomAddress,
    fatherPrimaryDistrict,
    fatherOccupation,
    birthFatherFatherHasFormallyRecognisedChild,
    motherReasonNotApplying,
    internationalStatePrimaryFather,
    internationalDistrictPrimaryFather,
    internationalCityPrimaryFather,
    internationalAddressLine1PrimaryFather,
    internationalAddressLine2PrimaryFather,
    internationalAddressLine3PrimaryFather,
    internationalPostalCodePrimaryFather
  } = fatherDetailsContext
  if (
    !canShowFatherDetails(
      motherMaritalStatus,
      fatherReasonNotApplying,
      fatherFamilyName,
      birthFatherFatherIsDeceased,
      birthFatherFatherHasFormallyRecognisedChild
    )
  ) {
    return ''
  }
  return joinValuesWith(
    [
      joinValuesWith(
        __spreadArray(
          __spreadArray(
            [
              joinValuesWith([fatherFamilyName, fatherFirstName]) + ',',
              // 'rainy,',
              'teraka tamin’ny',
              birthFatherCustomizedExactDateOfBirthUnknown
                ? 'taona ' +
                  convertNumberToLetterForMalagasySpecificLanguage(
                    parseInt(birthFatherYearOfBirth)
                  )
                : customizeDateInCertificateContent(fatherBirthDate),
              'tao',
              (birthFatherBirthPlace || '-') + ',',
              birthFatherFatherIsDeceased ? 'nonina tao' : 'monina ao'
            ],
            countryPrimaryFather == 'Madagascar'
              ? [
                  'amin’ny fokontany',
                  (birthFatherFokontanyCustomAddress ||
                    birthMotherFokontanyCustomAddress ||
                    '-') + ',',
                  'kaominina',
                  (definitionOffice(
                    replaceByUppercase(fatherPrimaryDistrict)
                  ) || '- ') + ','
                ]
              : [
                  ([
                    countryPrimaryFather,
                    internationalStatePrimaryFather,
                    internationalDistrictPrimaryFather,
                    internationalCityPrimaryFather,
                    internationalAddressLine1PrimaryFather,
                    internationalAddressLine2PrimaryFather,
                    internationalAddressLine3PrimaryFather,
                    internationalPostalCodePrimaryFather
                  ]
                    .filter(Boolean)
                    .join(' ') || ' - ') + ','
                ],
            true
          ),
          [fatherOccupation],
          false
        )
      ),
      getIsWithAdpotion(
        motherMaritalStatus,
        fatherReasonNotApplying,
        fatherFamilyName,
        birthFatherFatherHasFormallyRecognisedChild
      )
        ? 'izay manambara fa manjanaka azy'
        : '',
      motherReasonNotApplying ? '' : 'sy'
    ].filter(Boolean),
    ', '
  )
}
window.fatherDetailsSimplified = fatherDetailsSimplified

function motherDetailsSimplified(motherDetailsContext) {
  const {
    motherReasonNotApplying,
    motherFamilyName,
    motherFirstName,
    birthMotherCustomizedExactDateOfBirthUnknown,
    birthMotherYearOfBirth,
    motherBirthDate,
    birthMotherBirthPlace,
    birthMotherMotherIsDeceased,
    countryPrimaryMother,
    birthMotherFokontanyCustomAddress,
    motherPrimaryDistrict,
    motherOccupation,
    internationalStatePrimaryMother,
    internationalDistrictPrimaryMother,
    internationalCityPrimaryMother,
    internationalAddressLine1PrimaryMother,
    internationalAddressLine2PrimaryMother,
    internationalAddressLine3PrimaryMother,
    internationalPostalCodePrimaryMother
  } = motherDetailsContext

  if (motherReasonNotApplying) {
    return ''
  }
  return joinValuesWith(
    __spreadArray(
      __spreadArray(
        [
          joinValuesWith([motherFamilyName, motherFirstName]) + ',',
          "teraka tamin’ny",
          birthMotherCustomizedExactDateOfBirthUnknown
            ? 'taona ' +
              convertNumberToLetterForMalagasySpecificLanguage(
                parseInt(birthMotherYearOfBirth)
              )
            : customizeDateInCertificateContent(motherBirthDate),
          'tao',
          (birthMotherBirthPlace || '-') + ',',
          birthMotherMotherIsDeceased ? 'nonina tao' : 'monina ao'
        ],
        countryPrimaryMother == 'Madagascar'
          ? [
              'amin’ny fokontany',
              (birthMotherFokontanyCustomAddress || '-') + ',',
              'kaominina',
              (definitionOffice(replaceByUppercase(motherPrimaryDistrict)) ||
                '-') + ','
            ]
          : [
              ([
                countryPrimaryMother,
                internationalStatePrimaryMother,
                internationalDistrictPrimaryMother,
                internationalCityPrimaryMother,
                internationalAddressLine1PrimaryMother,
                internationalAddressLine2PrimaryMother,
                internationalAddressLine3PrimaryMother,
                internationalPostalCodePrimaryMother
              ]
                .filter(Boolean)
                .join(' ') || ' - ') + ','
            ],
        true
      ),
      [motherOccupation],
      false
    )
  )
}
window.motherDetailsSimplified = motherDetailsSimplified

function motherDetails(motherPrimaryDistrict) {
  if ('motherReasonNotApplying' in this) {
    return ''
  }
  return joinValuesWith(
    __spreadArray(
      __spreadArray(
        [
          joinValuesWith([this.motherFamilyName, this.motherFirstName]) + ',',
          // 'reniny,',
          "teraka tamin’ny",
          this.birthMotherCustomizedExactDateOfBirthUnknown
            ? 'taona ' +
              convertNumberToLetterForMalagasySpecificLanguage(
                parseInt(this.birthMotherYearOfBirth)
              )
            : customizeDateInCertificateContent(this.motherBirthDate),
          'tao',
          (this.birthMotherBirthPlace || '-') + ',',
          this.birthMotherMotherIsDeceased ? 'nonina tao' : 'monina ao'
        ],
        this.countryPrimaryMother == 'Madagascar'
          ? [
              'amin’ny fokontany',
              (this.birthMotherFokontanyCustomAddress || '-') + ',',
              'kaominina' +
                ' ' +
                (definitionOffice(
                  replaceByUppercase(motherPrimaryDistrict)
                ) || '-') +
                ','
            ]
          : [
              ([
                this.countryPrimaryMother,
                this.internationalStatePrimaryMother,
                this.internationalDistrictPrimaryMother,
                this.internationalCityPrimaryMother,
                this.internationalAddressLine1PrimaryMother,
                this.internationalAddressLine2PrimaryMother,
                this.internationalAddressLine3PrimaryMother,
                this.internationalPostalCodePrimaryMother
              ]
                .filter(Boolean)
                .join(' ') || ' - ') + ','
            ],
        true
      ),
      [this.motherOccupation],
      false
    )
  )
}
var relationMap = {
  mother: 'reniny',
  father: 'rainy',
  brother: 'zokiny lahy',
  sister: 'zokiny vavy',
  uncle: 'dadatoany',
  aunt: 'nenitoany',
  grandfather: 'raibeny',
  grandmother: 'renibeny'
}
function convertToTimeZoneIso(dateUtc, timeZone) {
  var _a, _b, _c, _d, _e, _f
  // Crée une instance Date à partir de la chaîne UTC
  var date = new Date(dateUtc)
  // Options pour extraire les composants de la date dans le fuseau horaire souhaité
  var options = {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  // Utiliser Intl.DateTimeFormat pour obtenir les parties de la date
  var formatter = new Intl.DateTimeFormat('en-CA', options)
  var parts = formatter.formatToParts(date)
  // Extraire les différentes parties
  var year =
    (_a = parts.find(function (p) {
      return p.type === 'year'
    })) === null || _a === void 0
      ? void 0
      : _a.value
  var month =
    (_b = parts.find(function (p) {
      return p.type === 'month'
    })) === null || _b === void 0
      ? void 0
      : _b.value
  var day =
    (_c = parts.find(function (p) {
      return p.type === 'day'
    })) === null || _c === void 0
      ? void 0
      : _c.value
  var hour =
    (_d = parts.find(function (p) {
      return p.type === 'hour'
    })) === null || _d === void 0
      ? void 0
      : _d.value
  var minute =
    (_e = parts.find(function (p) {
      return p.type === 'minute'
    })) === null || _e === void 0
      ? void 0
      : _e.value
  var second =
    (_f = parts.find(function (p) {
      return p.type === 'second'
    })) === null || _f === void 0
      ? void 0
      : _f.value
  // Récupérer les millisecondes
  var milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0')
  // Recomposer au format ISO
  return ''
    .concat(year, '-')
    .concat(month, '-')
    .concat(day, 'T')
    .concat(hour == '24' ? '00' : hour, ':')
    .concat(minute, ':')
    .concat(second, '.')
    .concat(milliseconds, '+03:00')
}

function registrationStatementSimplified(registrationStatementContext) {
  const {
    motherMaritalStatus,
    birthFatherFatherHasFormallyRecognisedChild,
    birthChildLegacyBirthRegistrationDate,
    birthChildLegacyBirthRegistrationTime,
    registrarDate,
    timezone = 'Africa/Nairobi',
    informantType,
    informantFamilyName,
    informantFirstName,
    birthInformantCustomizedExactDateOfBirthUnknown,
    birthInformantYearOfBirth,
    informantBirthDate,
    birthInformantBirthPlace,
    countryPrimaryInformant,
    birthInformantFokontanyCustomAddress,
    informantPrimaryDistrict,
    informantOccupation,
    registrarName,
    registrationDistrict,
    internationalStatePrimaryInformant,
    internationalDistrictPrimaryInformant,
    internationalCityPrimaryInformant,
    internationalAddressLine1PrimaryInformant,
    internationalAddressLine2PrimaryInformant,
    internationalAddressLine3PrimaryInformant,
    internationalPostalCodePrimaryInformant
  } = registrationStatementContext

  var _a

  var birthRegistrationDate = getBirthRegistrationDate({
    birthChildLegacyBirthRegistrationDate,
    birthChildLegacyBirthRegistrationTime
  })

  var registrarDateUTC = convertToTimeZoneIso(
    isValidDate(birthRegistrationDate) ? birthRegistrationDate : registrarDate,
    timezone
  )
  var informantTypeMapped =
    relationMap[
      (_a = informantType) === null || _a === void 0 ? void 0 : _a.toLowerCase()
    ]
  const isNotInformantLegalFather = !isInformantLegalFather(
    informantType,
    motherMaritalStatus,
    birthFatherFatherHasFormallyRecognisedChild
  )
  return joinValuesWith(
    __spreadArray(
      __spreadArray(
        [
          '---Nosoratana androany',
          customizeDateInCertificateContent(registrarDateUTC.split('T')[0]) +
            ',',
          'tamin’ny',
          convertTimeToMdgCustomWords(registrarDateUTC.split('T')[1]),
          isInformantMotherOrFather(
            informantType,
            motherMaritalStatus,
            birthFatherFatherHasFormallyRecognisedChild
          )
            ? 'araka ny fanambarana nataon’ny'
            : joinValuesWith([
                "araka ny fanambarana nataon'i",
                informantFamilyName,
                informantFirstName
              ]) + ',',
          (informantType === 'FATHER' &&
            isNotInformantLegalFather ? ''
            : (informantTypeMapped ? informantTypeMapped + ',' : ''))
        ],
        isInformantMotherOrFather(
          informantType,
          motherMaritalStatus,
          birthFatherFatherHasFormallyRecognisedChild
        )
          ? []
          : __spreadArray(
              __spreadArray(
                [
                  "teraka tamin’ny",
                  birthInformantCustomizedExactDateOfBirthUnknown
                    ? 'taona ' +
                      convertNumberToLetterForMalagasySpecificLanguage(
                        parseInt(birthInformantYearOfBirth)
                      )
                    : customizeDateInCertificateContent(informantBirthDate),
                  birthInformantBirthPlace
                    ? 'tao '.concat(birthInformantBirthPlace, ',')
                    : '',
                  'monina ao'
                ],
                countryPrimaryInformant == 'Madagascar'
                  ? [
                      "amin’ny",
                      birthInformantFokontanyCustomAddress
                        ? 'fokontany '.concat(
                            birthInformantFokontanyCustomAddress,
                            ','
                          )
                        : '',
                      'kaominina',
                      (definitionOffice(
                        replaceByUppercase(informantPrimaryDistrict)
                      ) || '-') + ','
                    ]
                  : [
                      ([
                        countryPrimaryInformant,
                        internationalStatePrimaryInformant,
                        internationalDistrictPrimaryInformant,
                        internationalCityPrimaryInformant,
                        internationalAddressLine1PrimaryInformant,
                        internationalAddressLine2PrimaryInformant,
                        internationalAddressLine3PrimaryInformant,
                        internationalPostalCodePrimaryInformant
                      ]
                        .filter(Boolean)
                        .join(' ') || '- ') + ','
                    ],
                true
              ),
              [informantOccupation ? informantOccupation + ',' : ''],
              false
            ),
        true
      ),
      [
        'izay miara-manao sonia aminay,',
        registrarName + ',',
        'Mpiandraikitra ny fiankohonana eto amin’ny Kaominina',
        definitionOffice(registrationDistrict) + ',',
        'rehefa novakiana taminy ity soratra ity.---'
      ],
      false
    )
  )
}
window.registrationStatementSimplified = registrationStatementSimplified

function registrationStatement() {
  return function (informantPrimaryDistrict, registrationDistrict) {
    var _a
    const nameParts = this.registrar.name.trim().split(' ')
    const registrarFamilyName = nameParts.pop() || ''
    const rawFirstName = nameParts.join(' ')
    const registrarFirstName =
      rawFirstName.trim().toLowerCase() === 'xyz261' ? '' : ` ${rawFirstName}`
    var birthRegistrationDate = getBirthRegistrationDate(this)
    var registrarDateUTC = convertToTimeZoneIso(
      isValidDate(birthRegistrationDate)
        ? birthRegistrationDate
        : this.registrar.date,
      'Africa/Nairobi'
    )
    const informantRelationMapped = relationMap[
      (_a = this.informantType) === null || _a === void 0
        ? void 0
        : _a.toLowerCase()
    ]
    return joinValuesWith(
      __spreadArray(
        __spreadArray(
          [
            '---Nosoratana androany',
            customizeDateInCertificateContent(registrarDateUTC.split('T')[0]) +
              ',',
            'tamin’ny',
            convertTimeToMdgCustomWords(registrarDateUTC.split('T')[1]),
            isInformantMotherOrFather(this.informantType)
              ? 'araka ny fanambarana nataon’ny'
              : joinValuesWith([
                  "araka ny fanambarana nataon'i",
                  this.informantFamilyName,
                  this.informantFirstName
                ]) + ',',
            (informantRelationMapped ? informantRelationMapped + ',' : '')
          ],
          isInformantMotherOrFather(this.informantType)
            ? []
            : __spreadArray(
                __spreadArray(
                  [
                    "teraka tamin’ny",
                    this.birthInformantCustomizedExactDateOfBirthUnknown
                      ? 'taona ' +
                        convertNumberToLetterForMalagasySpecificLanguage(
                          parseInt(this.birthInformantYearOfBirth)
                        )
                      : customizeDateInCertificateContent(
                          this.informantBirthDate
                        ),
                    this.birthInformantBirthPlace
                      ? 'tao '.concat(this.birthInformantBirthPlace, ',')
                      : '',
                    'monina ao'
                  ],
                  this.countryPrimaryInformant == 'Madagascar'
                    ? [
                        "amin’ny",
                        this.birthInformantFokontanyCustomAddress
                          ? 'fokontany '.concat(
                              this.birthInformantFokontanyCustomAddress,
                              ','
                            )
                          : '',
                        'kaominina',
                        (definitionOffice(
                          replaceByUppercase(informantPrimaryDistrict)
                        ) || '-') + ','
                      ]
                    : [
                        ([
                          this.countryPrimaryInformant,
                          this.internationalStatePrimaryInformant,
                          this.internationalDistrictPrimaryInformant,
                          this.internationalCityPrimaryInformant,
                          this.internationalAddressLine1PrimaryInformant,
                          this.internationalAddressLine2PrimaryInformant,
                          this.internationalAddressLine3PrimaryInformant,
                          this.internationalPostalCodePrimaryInformant
                        ]
                          .filter(Boolean)
                          .join(' ') || '- ') + ','
                      ],
                  true
                ),
                [
                  this.informantOccupation ? this.informantOccupation + ',' : ''
                ],
                false
              ),
          true
        ),
        [
          'izay miara-manao sonia aminay,',
          registrarFamilyName + registrarFirstName + ',',
          'Mpiandraikitra ny fiankohonana eto amin’ny Kaominina',
          definitionOffice(registrationDistrict) + ',',
          'rehefa novakiana taminy ity soratra ity.---'
        ],
        false
      )
    )
  }
}
window.registrationStatement = registrationStatement
function signatureDescription() {
  return function () {
    return joinValuesWith(
      [
        'Kopia manontolo nadika mitovy amin’ny bokim-piankohonana, androany',
        customizeDateInCertificateContent(
          new Date().toISOString().split('T')[0]
        ) + ", ary nomena an'i ",
        joinValuesWith(
          [this.informantFamilyName, this.informantFirstName],
          ' '
        ) + '--'
      ],
      ' '
    )
  }
}
window.signatureDescription = signatureDescription

function isInformantLegalFather(
  informantType,
  motherMaritalStatus,
  birthFatherFatherHasFormallyRecognisedChild
) {
  return (
    informantType === 'FATHER' &&
    (isTranslatedMarriedMaritalStatus(motherMaritalStatus) ||
      birthFatherFatherHasFormallyRecognisedChild)
  )
}

function isInformantMotherOrFather(
  informantType,
  motherMaritalStatus,
  birthFatherFatherHasFormallyRecognisedChild
) {
  return (
    informantType === 'MOTHER' ||
    isInformantLegalFather(
      informantType,
      motherMaritalStatus,
      birthFatherFatherHasFormallyRecognisedChild
    )
  )
}

window.isInformantMotherOrFather = isInformantMotherOrFather
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
  'dimampolo ',
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
var convertNumberToLetterForMalagasySpecificLanguage = function (num) {
  var digitLength = num.toString()
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
  return numberToLetter.trim()
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
  var res = ''
    .concat(mdgHours[newHour])
    .concat(
      newMinute > 0
        ? ' ora sy '.concat(
            convertNumberToLetterForMalagasySpecificLanguage(newMinute),
            ' '
          )
        : ' ora'
    )
    .concat(newMinute > 0 ? 'minitra ' : '', ' ')
    .concat(timePeriod)
  return res
}
function setLocaleDateCustomString(dateString) {
  const [year, month, day] = dateString.split('-')
  return `${day} ${THE_MONTH_MDG_WORDS[parseInt(month)]} ${year}` // return `${day}/${month}/${year}`
}
window.setLocaleDateCustomString = setLocaleDateCustomString
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
  var dateStringStr = dateString.split(' ')
  var _a = dateStringStr[0].split('/'),
    day = _a[0],
    month = _a[1],
    year = _a[2]
  return ''
    .concat(day, ' ')
    .concat(THE_MONTH_MDG_WORDS[parseInt(month)], ' ')
    .concat(year)
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
  var _a
  if (!dateString) return new Date() // TODO: Handle it later
  return (
    dateString &&
    ((_a =
      dateString === null || dateString === void 0
        ? void 0
        : dateString.replace) === null || _a === void 0
      ? void 0
      : _a.call(dateString, /\b(\d+)(th|st|nd|rd)\b/g, '$1'))
  )
}
function translateTime() {
  return function (timeString) {
    return convertTimeToMdgCustomWords(timeString)
  }
}
window.translateTime = translateTime
function handleTranslateDateToMDGFormat(eventDate) {
  var dateWithoutOrdinal = removeOrdinalIndicator(eventDate)
  var date = new Date(dateWithoutOrdinal)
  var formattedDate = date.toLocaleString('fr-FR').split(', ')[0]
  return convertLocaleDateToMdgCustomWords(formattedDate)
}
function getBirthRegistrationDate(data) {
  return data.birthChildLegacyBirthRegistrationDate &&
    data.birthChildLegacyBirthRegistrationTime
    ? data.birthChildLegacyBirthRegistrationDate +
        'T' +
        data.birthChildLegacyBirthRegistrationTime +
        ':00.000+03:00'
    : undefined
}
function getBirthRegistrationDateMDGFormat() {
  return function () {
    var birthRegistrationDate = getBirthRegistrationDate(this)

    if (isValidDate(birthRegistrationDate)) {
      return handleTranslateDateToMDGFormat(
        this.birthChildLegacyBirthRegistrationDate
      )
    }
    return handleTranslateDateToMDGFormat(this.registrar.date)
  }
}
window.getBirthRegistrationDateMDGFormat = getBirthRegistrationDateMDGFormat
function translateDateToMDGFormat() {
  return function (eventDate) {
    return handleTranslateDateToMDGFormat(eventDate)
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
    // nouveau
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
function definitionOffice(officeName) {
  if (officeName === void 0) {
    officeName = ''
  }
  var locationMappings = {
    'cu tana i': "ambonivohitr'Antananarivo - Boriboritany Voalohany",
    'cu tana ii': "ambonivohitr'Antananarivo - Boriboritany Faharoa",
    'cu tana iii': "ambonivohitr'Antananarivo - Boriboritany Fahatelo",
    'cu tana iv': "ambonivohitr'Antananarivo - Boriboritany Fahaefatra",
    'cu tana v': "ambonivohitr'Antananarivo - Boriboritany Fahadimy",
    'cu tana vi': "ambonivohitr'Antananarivo - Boriboritany Fahaenina",
    'cu toamasina arr. ambodimanga': 'ambonivohitra Toamasina',
    'cu toamasina arr. anjoma': 'ambonivohitra Toamasina',
    'cu toamasina arr. ankirihiry': 'ambonivohitra Toamasina',
    'cu toamasina arr. morarano': 'ambonivohitra Toamasina',
    'cu toamasina arr. tanambao v': 'ambonivohitra Toamasina'
    // nouveau
  }
  var lowerCaseRegistrationLocation = officeName.toLowerCase()
  for (var key in locationMappings) {
    var regex = new RegExp('\\b'.concat(key, '\\b')) // Correspondance stricte avec limites de mots
    if (regex.test(lowerCaseRegistrationLocation)) {
      return locationMappings[key]
    }
  }
  return officeName
}
function defineCommune(officeName) {
  if (officeName === void 0) {
    officeName = ''
  }
  var locationMappings = {
    'cu tana i': 'Antananarivo, Boriboritany Voalohany',
    'cu tana ii': 'Antananarivo, Boriboritany Faharoa',
    'cu tana iii': 'Antananarivo, Boriboritany Fahatelo',
    'cu tana iv': 'Antananarivo, Boriboritany Fahaefatra',
    'cu tana v': 'Antananarivo, Boriboritany Fahadimy',
    'cu tana vi': 'Antananarivo, Boriboritany Fahaenina',
    'cu toamasina arr. ambodimanga':
      'Ambonivohitra Toamasina,boriboritany Ambodimanga',
    'cu toamasina arr. anjoma': 'Ambonivohitra Toamasina, boriboritany Anjoma',
    'cu toamasina arr. ankirihiry':
      'Ambonivohitra Toamasina, boriboritany Ankirihiry',
    'cu toamasina arr. morarano':
      'Ambonivohitra Toamasina, boriboritany Morarano',
    'cu toamasina arr. tanambao v':
      'Ambonivohitra Toamasina, boriboritany Tanambao v'
    // nouveau
  }
  var lowerCaseRegistrationLocation = officeName.toLowerCase()
  for (var key in locationMappings) {
    var regex = new RegExp('\\b'.concat(key, '\\b')) // Correspondance stricte avec limites de mots
    if (regex.test(lowerCaseRegistrationLocation)) {
      return locationMappings[key]
    }
  }
  return officeName
}
function definitionCommuneInTheAct() {
  return function (name) {
    return defineCommune(name)
  }
}
window.definitionCommuneInTheAct = definitionCommuneInTheAct
window.defineCommune = defineCommune
window.definitionOffice = definitionOffice

function isTanaIV() {
  return function (name) {
    return name.toLowerCase() === 'cu tana iv'
  }
}
function isToamasina() {
  return function (name) {
    return name.toLowerCase().includes('cu toamasina')
  }
}

function isToamasinaSubUrbaine() {
  return function (name) {
    return name.toLowerCase().includes('toamasina suburbaine')
  }
}

/**
 * @TODO To optimize
 * !! THIS marital status translation list is HARDCODED here because :
 * - martial status value is the translated one not the key
 * - no way to get the translation list here from API
 * !! Should change this if there are changes on form.field.label.maritalStatusMarried in client.csv translations
 */
var MARTIAL_STATUS_TRANSLATION_LIST = [
  'married',
  'marié(e)',
  'manambady',
  'marié',
  'mariée'
  // new translations here
]
function isTranslatedMarriedMaritalStatus(maritalStatus) {
  return (
    maritalStatus &&
    MARTIAL_STATUS_TRANSLATION_LIST.includes(maritalStatus.toLocaleLowerCase())
  )
}
function getIsWithAdpotion(
  motherMaritalStatus,
  fatherReasonNotApplying,
  fatherFamilyName,
  birthFatherFatherHasFormallyRecognisedChild
) {
  if (
    isTranslatedMarriedMaritalStatus(motherMaritalStatus) ||
    (fatherReasonNotApplying && !fatherFamilyName)
  ) {
    return false
  } else {
    return birthFatherFatherHasFormallyRecognisedChild == 'true'
  }
}
window.getIsWithAdpotion = getIsWithAdpotion
function isWithAdpotion() {
  return function () {
    return getIsWithAdpotion(this)
  }
}

function definitionDistrict(officeName) {
  if (officeName === void 0) {
    officeName = ''
  }
  var locationMappings = {
    'tana i': 'Antananarivo Renivohitra',
    'tana ii': 'Antananarivo Renivohitra',
    'tana iii': 'Antananarivo Renivohitra',
    'tana iv': 'Antananarivo Renivohitra',
    'tana v': 'Antananarivo Renivohitra',
    'tana vi': 'Antananarivo Renivohitra',
    'toamasina i': 'Toamasina voalohany',
    'toamasina ii': 'Toamasina faharoa',
    'antsirabe i': 'Antsirabe voalohany',
    'antsirabe ii': 'Antsirabe faharoa',
    'antsiranana i': 'Antsiranana voalohany',
    'antsiranana ii': 'Antsiranana faharoa',
    'mahajanga i': 'Mahajanga voalohany',
    'mahajanga ii': 'Mahajanga faharoa',
    'toliara i': 'Toliara voalohany',
    'toliara ii': 'Toliara faharoa'
    // nouveau
  }
  var lowerCaseRegistrationLocation = officeName.toLowerCase()
  for (var key in locationMappings) {
    var regex = new RegExp('\\b'.concat(key, '\\b')) // Correspondance stricte avec limites de mots
    if (regex.test(lowerCaseRegistrationLocation)) {
      return locationMappings[key]
    }
  }
  return officeName
}
function definitionDistrictInTheAct() {
  return function (name) {
    return definitionDistrict(name)
  }
}
window.definitionDistrictInTheAct = definitionDistrictInTheAct
window.definitionDistrict = definitionDistrict
function replaceByUppercase(inputText) {
  // Utilisation d'une expression régulière pour remplacer "Cu" exactement (sensible à la casse)
  return inputText?.replace?.(/\bCu\b/g, 'CU')
}

function replaceAbbreviations(inputText) {
  const abbreviationMap = {
    CSB2: 'Centre de Santé de Base Niveau 2',
    CHU: 'Centre Hospitalier Universitaire',
    CSB1: 'Centre de Santé de Base Niveau 1',
    CHRD2: 'Centre Hospitalier de Référence District Niveau 2',
    CHRR: '',
    CHRD1: 'Centre Hospitalier de Référence District Niveau 1'
  }

  // Extract text before "(district" or "(commune)"
  const extractedText = inputText.split(/\s+\(district|\(commune/i)[0].trim()

  // Replace abbreviations with their full forms
  return extractedText.replace(
    /\b(CSB2|CHU|CSB1|CHRD2|CHRR|CHRD1)\b/g,
    (abbr) => abbreviationMap[abbr] || abbr
  )
}

function replaceByUppercaseLocation() {
  return function (name) {
    return replaceByUppercase(name)
  }
}
window.replaceByUppercaseLocation = replaceByUppercaseLocation
window.replaceByUppercase = replaceByUppercase
window.replaceAbbreviations = replaceAbbreviations
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
function addMentionTitle(elements, title) {
  var truthyElements = elements.filter(Boolean)
  if (truthyElements.length > 0) {
    elements.unshift(title)
  }
  return elements
}
function getRecognitionMentionValues(i) {
  var _a, _b, _c, _d, _e, _f
  if (
    !((_c =
      (_b =
        (_a = this['birthMentionTypeOfMention__' + i]) === null || _a === void 0
          ? void 0
          : _a.toString()) === null || _b === void 0
        ? void 0
        : _b.toLowerCase()) === null || _c === void 0
      ? void 0
      : _c.includes('recognition'))
  ) {
    return []
  }
  return [
    "Nozanahan'i "
      .concat(this['birthMentionChildFamilyName__' + i] || '-', ' ')
      .concat(this['birthMentionChildFirstName__' + i] || '-', " tamin’ny ")
      .concat(
        ((_f =
          (_e =
            (_d = this['birthMentionRecognitionDate__' + i]) === null ||
            _d === void 0
              ? void 0
              : _d.split('-')) === null || _e === void 0
            ? void 0
            : _e.reverse()) === null || _f === void 0
          ? void 0
          : _f.join('/')) || '-',
        " tao amin’ny kaominina "
      )
      .concat(
        this['birthMentionRecognitionPlace__' + i] || '-',
        ' soratra faha '
      )
      .concat(this['birthMentionRecognitionActNumber__' + i] || '-', '.')
  ]
  // return addMentionTitle(
  //   [
  //     this['birthMentionRecognitionActNumber__' + i],
  //     this['birthMentionRecognitionDate__' + i],
  //     this['birthMentionRecognitionPlace__' + i],
  //     [
  //       this['birthMentionChildFamilyName__' + i],
  //       this['birthMentionChildFirstName__' + i]
  //     ]
  //       .filter(Boolean)
  //       .join(' ')
  //       .trim(),
  //     this['birthMentionMentionChildNID__' + i]
  //   ],
  //   'Fanjanahana'
  // )
}
function getJudicialAdoptionMentionValues(i) {
  return addMentionTitle(
    [
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
    ],
    'Fanjanahana araka ny lalàna'
  )
}
function getSimpleAdoptionMentionValues(i) {
  return addMentionTitle(
    [
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
    ],
    'Fanjanahana tsotra'
  )
}
function getMarriageMentionValues(i) {
  return addMentionTitle(
    [
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
    ],
    'Fanambadiana'
  )
}
function getDivorceMentionValues(i) {
  return addMentionTitle(
    [
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
    ],
    'Fisarahana'
  )
}
function getNameChangeMentionValues(i) {
  return addMentionTitle(
    [
      this['birthMentionNameChangeActNumber__' + i],
      this['birthMentionNameChangeDate__' + i],
      this['birthMentionNameChangeJudgementDecisionNumber__' + i],
      this['birthMentionNameChangeJudgementDecisionDate__' + i],
      this['birthMentionNameChangeTribunalOfFirstInstanceAct__' + i],
      this['birthMentionModification__' + i]
    ],
    'Fanovana anarana'
  )
}
function getDeathMentionValues(i) {
  return addMentionTitle(
    [
      this['birthMentionDeathActNumber__' + i],
      this['birthMentionDeathDate__' + i],
      this['birthMentionDeathPlace__' + i],
      this['birthMentionDeathdateOfDeath__' + i],
      this['birthMentionDeathDeathPlace__' + i]
    ],
    'Fahafatesana'
  )
}
function mentions() {
  return function () {
    var output = ''
    for (var i = 0; i < 10; i++) {
      if (!this['birthMentionDetailsMentionExist__' + i]) {
        break
      }
      var temp = __spreadArray(
        __spreadArray([], getRecognitionMentionValues.apply(this, [i]), true),
        [
          // ...getJudicialAdoptionMentionValues.apply(this, [i]),
          // ...getSimpleAdoptionMentionValues.apply(this, [i]),
          // ...getMarriageMentionValues.apply(this, [i]),
          // ...getDivorceMentionValues.apply(this, [i]),
          // ...getNameChangeMentionValues.apply(this, [i]),
          // ...getDeathMentionValues.apply(this, [i])
          this['birthMentionNotes__' + i]
        ],
        false
      )
        .filter(Boolean)
        .join('\n')
      output += temp
      /** Check if have anything to show before adding line break */
      // output += temp.length ? generateDoubleLineBreak() : ''
      output += '\n\n'
    }
    return {
      text: output.replace(/'/g, '’'),
      hasMention: Boolean(output)
    }
  }
}
window.mentions = mentions
function isFirstCertificate() {
  return function () {
    return !this.certifier
  }
}
window.isFirstCertificate = isFirstCertificate
function getChildGeneratedOrManualNID() {
  return this.childNIDManual ? this.childNIDManual : this.childNID
}
function getChildNID() {
  return function () {
    return getChildGeneratedOrManualNID.call(this)
  }
}
window.getChildNID = getChildNID
var districts = [
  {
    id: 5101,
    name: 'AMBATONDRAZAKA',
    region_id: 51,
    region_name: 'ALAOTRA-MANGORO'
  },
  {
    id: 5102,
    name: 'AMPARAFARAVOLA',
    region_id: 51,
    region_name: 'ALAOTRA-MANGORO'
  },
  {
    id: 5103,
    name: 'ANDILAMENA',
    region_id: 51,
    region_name: 'ALAOTRA-MANGORO'
  },
  {
    id: 5104,
    name: 'ANOSIBE AN ALA',
    region_id: 51,
    region_name: 'ALAOTRA-MANGORO'
  },
  {
    id: 5105,
    name: 'MORAMANGA',
    region_id: 51,
    region_name: 'ALAOTRA-MANGORO'
  },
  {
    id: 3101,
    name: 'AMBATOFINANDRAHANA',
    region_id: 31,
    region_name: "AMORON'I MANIA"
  },
  {
    id: 3102,
    name: 'AMBOSITRA',
    region_id: 31,
    region_name: "AMORON'I MANIA"
  },
  {
    id: 3103,
    name: 'FANDRIANA',
    region_id: 31,
    region_name: "AMORON'I MANIA"
  },
  {
    id: 3104,
    name: 'MANANDRIANA',
    region_id: 31,
    region_name: "AMORON'I MANIA"
  },
  {
    id: 1101,
    name: 'AMBOHIDRATRIMO',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1102,
    name: 'ANDRAMASINA',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1103,
    name: 'ANJOZOROBE',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1104,
    name: 'ANKAZOBE',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1105,
    name: 'ANTANANARIVO ATSIMONDRANO',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1106,
    name: 'ANTANANARIVO AVARADRANO',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1107,
    name: 'MANJAKANDRIANA',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1108,
    name: 'TANA I',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1109,
    name: 'TANA II',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1110,
    name: 'TANA III',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1111,
    name: 'TANA IV',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1112,
    name: 'TANA V',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 1113,
    name: 'TANA VI',
    region_id: 11,
    region_name: 'ANALAMANGA'
  },
  {
    id: 5201,
    name: 'FENERIVE EST',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 5202,
    name: 'MANANARA-NORD',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 5203,
    name: 'MAROANTSETRA',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 5204,
    name: 'SAINTE MARIE',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 5205,
    name: 'SOANIERANA IVONGO',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 5206,
    name: 'VAVATENINA',
    region_id: 52,
    region_name: 'ANALANJIROFO'
  },
  {
    id: 6101,
    name: 'AMBOVOMBE ANDROY',
    region_id: 61,
    region_name: 'ANDROY'
  },
  {
    id: 6102,
    name: 'BEKILY',
    region_id: 61,
    region_name: 'ANDROY'
  },
  {
    id: 6103,
    name: 'BELOHA ANDROY',
    region_id: 61,
    region_name: 'ANDROY'
  },
  {
    id: 6104,
    name: 'TSIHOMBE',
    region_id: 61,
    region_name: 'ANDROY'
  },
  {
    id: 6201,
    name: 'AMBOASARY SUD',
    region_id: 62,
    region_name: 'ANOSY'
  },
  {
    id: 6202,
    name: 'BETROKA',
    region_id: 62,
    region_name: 'ANOSY'
  },
  {
    id: 6203,
    name: 'TAOLANARO',
    region_id: 62,
    region_name: 'ANOSY'
  },
  {
    id: 6301,
    name: 'AMPANIHY OUEST',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6302,
    name: 'ANKAZOABO SUD',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6303,
    name: 'BENENITRA',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6304,
    name: 'BEROROHA',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6305,
    name: 'BETIOKY SUD',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6306,
    name: 'MOROMBE',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6307,
    name: 'SAKARAHA',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6308,
    name: 'TOLIARA I',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 6309,
    name: 'TOLIARA II',
    region_id: 63,
    region_name: 'ATSIMO-ANDREFANA'
  },
  {
    id: 3201,
    name: 'BEFOTAKA ATSIMO',
    region_id: 32,
    region_name: 'ATSIMO-ATSINANANA'
  },
  {
    id: 3202,
    name: 'FARAFANGANA',
    region_id: 32,
    region_name: 'ATSIMO-ATSINANANA'
  },
  {
    id: 3203,
    name: 'MIDONGY SUD',
    region_id: 32,
    region_name: 'ATSIMO-ATSINANANA'
  },
  {
    id: 3204,
    name: 'VANGAINDRANO',
    region_id: 32,
    region_name: 'ATSIMO-ATSINANANA'
  },
  {
    id: 3205,
    name: 'VONDROZO',
    region_id: 32,
    region_name: 'ATSIMO-ATSINANANA'
  },
  {
    id: 5301,
    name: 'ANTANAMBAO MANAMPONTSY',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5302,
    name: 'BRICKAVILLE',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5303,
    name: 'MAHANORO',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5304,
    name: 'MAROLAMBO',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5305,
    name: 'TOAMASINA I',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5306,
    name: 'TOAMASINA II',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 5307,
    name: 'VATOMANDRY',
    region_id: 53,
    region_name: 'ATSINANANA'
  },
  {
    id: 4101,
    name: 'KANDREHO',
    region_id: 41,
    region_name: 'BETSIBOKA'
  },
  {
    id: 4102,
    name: 'MAEVATANANA',
    region_id: 41,
    region_name: 'BETSIBOKA'
  },
  {
    id: 4103,
    name: 'TSARATANANA',
    region_id: 41,
    region_name: 'BETSIBOKA'
  },
  {
    id: 4201,
    name: 'AMBATO BOENI',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 4202,
    name: 'MAHAJANGA I',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 4203,
    name: 'MAHAJANGA II',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 4204,
    name: 'MAROVOAY',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 4205,
    name: 'MITSINJO',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 4206,
    name: 'SOALALA',
    region_id: 42,
    region_name: 'BOENY'
  },
  {
    id: 1201,
    name: 'FENOARIVOBE',
    region_id: 12,
    region_name: 'BONGOLAVA'
  },
  {
    id: 1202,
    name: 'TSIROANOMANDIDY',
    region_id: 12,
    region_name: 'BONGOLAVA'
  },
  {
    id: 2101,
    name: 'AMBANJA',
    region_id: 21,
    region_name: 'DIANA'
  },
  {
    id: 2102,
    name: 'AMBILOBE',
    region_id: 21,
    region_name: 'DIANA'
  },
  {
    id: 2103,
    name: 'ANTSIRANANA I',
    region_id: 21,
    region_name: 'DIANA'
  },
  {
    id: 2104,
    name: 'ANTSIRANANA II',
    region_id: 21,
    region_name: 'DIANA'
  },
  {
    id: 2105,
    name: 'NOSY-BE',
    region_id: 21,
    region_name: 'DIANA'
  },
  {
    id: 3301,
    name: 'IKONGO',
    region_id: 33,
    region_name: 'FITOVINANY'
  },
  {
    id: 3302,
    name: 'MANAKARA',
    region_id: 33,
    region_name: 'FITOVINANY'
  },
  {
    id: 3303,
    name: 'VOHIPENO',
    region_id: 33,
    region_name: 'FITOVINANY'
  },
  {
    id: 3401,
    name: 'AMBALAVAO',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3402,
    name: 'AMBOHIMAHASOA',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3403,
    name: 'FIANARANTSOA',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3404,
    name: 'IKALAMAVONY',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3405,
    name: 'ISANDRA',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3406,
    name: 'LALANGINA',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3407,
    name: 'VOHIBATO',
    region_id: 34,
    region_name: 'HAUTE MATSIATRA'
  },
  {
    id: 3501,
    name: 'IAKORA',
    region_id: 35,
    region_name: 'IHOROMBE'
  },
  {
    id: 3502,
    name: 'IHOSY',
    region_id: 35,
    region_name: 'IHOROMBE'
  },
  {
    id: 3503,
    name: 'IVOHIBE',
    region_id: 35,
    region_name: 'IHOROMBE'
  },
  {
    id: 1301,
    name: 'ARIVONIMAMO',
    region_id: 13,
    region_name: 'ITASY'
  },
  {
    id: 1302,
    name: 'MIARINARIVO',
    region_id: 13,
    region_name: 'ITASY'
  },
  {
    id: 1303,
    name: 'SOAVINANDRIANA',
    region_id: 13,
    region_name: 'ITASY'
  },
  {
    id: 4301,
    name: 'AMBATOMAINTY',
    region_id: 43,
    region_name: 'MELAKY'
  },
  {
    id: 4302,
    name: 'ANTSALOVA',
    region_id: 43,
    region_name: 'MELAKY'
  },
  {
    id: 4303,
    name: 'BESALAMPY',
    region_id: 43,
    region_name: 'MELAKY'
  },
  {
    id: 4304,
    name: 'MAINTIRANO',
    region_id: 43,
    region_name: 'MELAKY'
  },
  {
    id: 4305,
    name: 'MORAFENOBE',
    region_id: 43,
    region_name: 'MELAKY'
  },
  {
    id: 6401,
    name: 'BELO SUR TSIRIBIHINA',
    region_id: 64,
    region_name: 'MENABE'
  },
  {
    id: 6402,
    name: 'MAHABO',
    region_id: 64,
    region_name: 'MENABE'
  },
  {
    id: 6403,
    name: 'MANJA',
    region_id: 64,
    region_name: 'MENABE'
  },
  {
    id: 6404,
    name: 'MIANDRIVAZO',
    region_id: 64,
    region_name: 'MENABE'
  },
  {
    id: 6405,
    name: 'MORONDAVA',
    region_id: 64,
    region_name: 'MENABE'
  },
  {
    id: 2201,
    name: 'ANDAPA',
    region_id: 22,
    region_name: 'SAVA'
  },
  {
    id: 2202,
    name: 'ANTALAHA',
    region_id: 22,
    region_name: 'SAVA'
  },
  {
    id: 2203,
    name: 'SAMBAVA',
    region_id: 22,
    region_name: 'SAVA'
  },
  {
    id: 2204,
    name: 'VOHEMAR',
    region_id: 22,
    region_name: 'SAVA'
  },
  {
    id: 4401,
    name: 'ANALALAVA',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4402,
    name: 'ANTSOHIHY',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4403,
    name: 'BEALANANA',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4404,
    name: 'BEFANDRIANA NORD',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4405,
    name: 'MAMPIKONY',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4406,
    name: 'MANDRITSARA',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 4407,
    name: 'PORT-BERGE',
    region_id: 44,
    region_name: 'SOFIA'
  },
  {
    id: 1401,
    name: 'AMBATOLAMPY',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1402,
    name: 'ANTANIFOTSY',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1403,
    name: 'ANTSIRABE I',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1404,
    name: 'ANTSIRABE II',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1405,
    name: 'BETAFO',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1406,
    name: 'FARATSIHO',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 1407,
    name: 'MANDOTO',
    region_id: 14,
    region_name: 'VAKINANKARATRA'
  },
  {
    id: 3601,
    name: 'IFANADIANA',
    region_id: 36,
    region_name: 'VATOVAVY'
  },
  {
    id: 3602,
    name: 'MANANJARY',
    region_id: 36,
    region_name: 'VATOVAVY'
  },
  {
    id: 3603,
    name: 'NOSY VARIKA',
    region_id: 36,
    region_name: 'VATOVAVY'
  }
]
function getRegionName() {
  return function (districtName) {
    var _a
    return (_a = districts.find(function (d) {
      return d.name === districtName.toUpperCase()
    })) === null || _a === void 0
      ? void 0
      : _a.region_name
  }
}
window.getRegionName = getRegionName

const countryCodes = {
  KEN: '+254',
  USA: '+1',
  GBR: '+44',
  ZM: '+260',
  MDG: '+261'
  // TODO: Complete this for other country as well
}

/**
 * Convert a local phone number to its international MSISDN format.
 * @param {string} phone - The phone number to convert.
 * @param {string} alpha3CountryCode - The 3-letter country code (ISO Alpha-3).
 * @returns {string} The formatted MSISDN (E.164 format) or original phone number if conversion fails.
 */
function convertToMSISDN(phone, alpha3CountryCode = 'MDG') {
  phone = phone.replace(/[^0-9]/g, '')
  let countryCode = countryCodes[alpha3CountryCode] || ''
  if (phone.startsWith('0')) phone = phone.substring(1)
  if (phone.startsWith(countryCode?.substring(1))) return phone

  return countryCode ? countryCode + phone : phone
}

window.convertToMSISDN = convertToMSISDN
