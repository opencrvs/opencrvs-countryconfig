/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { SelectOption } from '@opencrvs/toolkit/events'

const messages = {
  AFG: {
    id: 'countries.AFG',
    defaultMessage: 'Afghanistan',
    description: 'ISO Country: AFG'
  },
  ALA: {
    id: 'countries.ALA',
    defaultMessage: 'Åland Islands',
    description: 'ISO Country: ALA'
  },
  ALB: {
    id: 'countries.ALB',
    defaultMessage: 'Albania',
    description: 'ISO Country: ALB'
  },
  DZA: {
    id: 'countries.DZA',
    defaultMessage: 'Algeria',
    description: 'ISO Country: DZA'
  },
  ASM: {
    id: 'countries.ASM',
    defaultMessage: 'American Samoa',
    description: 'ISO Country: ASM'
  },
  AND: {
    id: 'countries.AND',
    defaultMessage: 'Andorra',
    description: 'ISO Country: AND'
  },
  AGO: {
    id: 'countries.AGO',
    defaultMessage: 'Angola',
    description: 'ISO Country: AGO'
  },
  AIA: {
    id: 'countries.AIA',
    defaultMessage: 'Anguilla',
    description: 'ISO Country: AIA'
  },
  ATA: {
    id: 'countries.ATA',
    defaultMessage: 'Antarctica',
    description: 'ISO Country: ATA'
  },
  ATG: {
    id: 'countries.ATG',
    defaultMessage: 'Antigua and Barbuda',
    description: 'ISO Country: ATG'
  },
  ARG: {
    id: 'countries.ARG',
    defaultMessage: 'Argentina',
    description: 'ISO Country: ARG'
  },
  ARM: {
    id: 'countries.ARM',
    defaultMessage: 'Armenia',
    description: 'ISO Country: ARM'
  },
  ABW: {
    id: 'countries.ABW',
    defaultMessage: 'Aruba',
    description: 'ISO Country: ABW'
  },
  AUS: {
    id: 'countries.AUS',
    defaultMessage: 'Australia',
    description: 'ISO Country: AUS'
  },
  AUT: {
    id: 'countries.AUT',
    defaultMessage: 'Austria',
    description: 'ISO Country: AUT'
  },
  AZE: {
    id: 'countries.AZE',
    defaultMessage: 'Azerbaijan',
    description: 'ISO Country: AZE'
  },
  BHS: {
    id: 'countries.BHS',
    defaultMessage: 'Bahamas',
    description: 'ISO Country: BHS'
  },
  BHR: {
    id: 'countries.BHR',
    defaultMessage: 'Bahrain',
    description: 'ISO Country: BHR'
  },
  BGD: {
    id: 'countries.BGD',
    defaultMessage: 'Bangladesh',
    description: 'ISO Country: BGD'
  },
  BRB: {
    id: 'countries.BRB',
    defaultMessage: 'Barbados',
    description: 'ISO Country: BRB'
  },
  BLR: {
    id: 'countries.BLR',
    defaultMessage: 'Belarus',
    description: 'ISO Country: BLR'
  },
  BEL: {
    id: 'countries.BEL',
    defaultMessage: 'Belgium',
    description: 'ISO Country: BEL'
  },
  BLZ: {
    id: 'countries.BLZ',
    defaultMessage: 'Belize',
    description: 'ISO Country: BLZ'
  },
  BEN: {
    id: 'countries.BEN',
    defaultMessage: 'Benin',
    description: 'ISO Country: BEN'
  },
  BMU: {
    id: 'countries.BMU',
    defaultMessage: 'Bermuda',
    description: 'ISO Country: BMU'
  },
  BTN: {
    id: 'countries.BTN',
    defaultMessage: 'Bhutan',
    description: 'ISO Country: BTN'
  },
  BOL: {
    id: 'countries.BOL',
    defaultMessage: 'Bolivia (Plurinational State of)',
    description: 'ISO Country: BOL'
  },
  BES: {
    id: 'countries.BES',
    defaultMessage: 'Bonaire, Sint Eustatius and Saba',
    description: 'ISO Country: BES'
  },
  BIH: {
    id: 'countries.BIH',
    defaultMessage: 'Bosnia and Herzegovina',
    description: 'ISO Country: BIH'
  },
  BWA: {
    id: 'countries.BWA',
    defaultMessage: 'Botswana',
    description: 'ISO Country: BWA'
  },
  BVT: {
    id: 'countries.BVT',
    defaultMessage: 'Bouvet Island',
    description: 'ISO Country: BVT'
  },
  BRA: {
    id: 'countries.BRA',
    defaultMessage: 'Brazil',
    description: 'ISO Country: BRA'
  },
  IOT: {
    id: 'countries.IOT',
    defaultMessage: 'British Indian Ocean Territory',
    description: 'ISO Country: IOT'
  },
  VGB: {
    id: 'countries.VGB',
    defaultMessage: 'British Virgin Islands',
    description: 'ISO Country: VGB'
  },
  BRN: {
    id: 'countries.BRN',
    defaultMessage: 'Brunei Darussalam',
    description: 'ISO Country: BRN'
  },
  BGR: {
    id: 'countries.BGR',
    defaultMessage: 'Bulgaria',
    description: 'ISO Country: BGR'
  },
  BFA: {
    id: 'countries.BFA',
    defaultMessage: 'Burkina Faso',
    description: 'ISO Country: BFA'
  },
  BDI: {
    id: 'countries.BDI',
    defaultMessage: 'Burundi',
    description: 'ISO Country: BDI'
  },
  CPV: {
    id: 'countries.CPV',
    defaultMessage: 'Cabo Verde',
    description: 'ISO Country: CPV'
  },
  KHM: {
    id: 'countries.KHM',
    defaultMessage: 'Cambodia',
    description: 'ISO Country: KHM'
  },
  CMR: {
    id: 'countries.CMR',
    defaultMessage: 'Cameroon',
    description: 'ISO Country: CMR'
  },
  CAN: {
    id: 'countries.CAN',
    defaultMessage: 'Canada',
    description: 'ISO Country: CAN'
  },
  CYM: {
    id: 'countries.CYM',
    defaultMessage: 'Cayman Islands',
    description: 'ISO Country: CYM'
  },
  CAF: {
    id: 'countries.CAF',
    defaultMessage: 'Central African Republic',
    description: 'ISO Country: CAF'
  },
  TCD: {
    id: 'countries.TCD',
    defaultMessage: 'Chad',
    description: 'ISO Country: TCD'
  },
  CHL: {
    id: 'countries.CHL',
    defaultMessage: 'Chile',
    description: 'ISO Country: CHL'
  },
  CHN: {
    id: 'countries.CHN',
    defaultMessage: 'China',
    description: 'ISO Country: CHN'
  },
  HKG: {
    id: 'countries.HKG',
    defaultMessage: '"China, Hong Kong Special Administrative Region"',
    description: 'ISO Country: HKG'
  },
  MAC: {
    id: 'countries.MAC',
    defaultMessage: '"China, Macao Special Administrative Region"',
    description: 'ISO Country: MAC'
  },
  CXR: {
    id: 'countries.CXR',
    defaultMessage: 'Christmas Island',
    description: 'ISO Country: CXR'
  },
  CCK: {
    id: 'countries.CCK',
    defaultMessage: 'Cocos (Keeling) Islands',
    description: 'ISO Country: CCK'
  },
  COL: {
    id: 'countries.COL',
    defaultMessage: 'Colombia',
    description: 'ISO Country: COL'
  },
  COM: {
    id: 'countries.COM',
    defaultMessage: 'Comoros',
    description: 'ISO Country: COM'
  },
  COG: {
    id: 'countries.COG',
    defaultMessage: 'Congo',
    description: 'ISO Country: COG'
  },
  COK: {
    id: 'countries.COK',
    defaultMessage: 'Cook Islands',
    description: 'ISO Country: COK'
  },
  CRI: {
    id: 'countries.CRI',
    defaultMessage: 'Costa Rica',
    description: 'ISO Country: CRI'
  },
  CIV: {
    id: 'countries.CIV',
    defaultMessage: "Côte d'Ivoire",
    description: 'ISO Country: CIV'
  },
  HRV: {
    id: 'countries.HRV',
    defaultMessage: 'Croatia',
    description: 'ISO Country: HRV'
  },
  CUB: {
    id: 'countries.CUB',
    defaultMessage: 'Cuba',
    description: 'ISO Country: CUB'
  },
  CUW: {
    id: 'countries.CUW',
    defaultMessage: 'Curaçao',
    description: 'ISO Country: CUW'
  },
  CYP: {
    id: 'countries.CYP',
    defaultMessage: 'Cyprus',
    description: 'ISO Country: CYP'
  },
  CZE: {
    id: 'countries.CZE',
    defaultMessage: 'Czechia',
    description: 'ISO Country: CZE'
  },
  PRK: {
    id: 'countries.PRK',
    defaultMessage: "Democratic People's Republic of Korea",
    description: 'PRK'
  },
  COD: {
    id: 'countries.COD',
    defaultMessage: 'Democratic Republic of the Congo',
    description: 'ISO Country: COD'
  },
  DNK: {
    id: 'countries.DNK',
    defaultMessage: 'Denmark',
    description: 'ISO Country: DNK'
  },
  DJI: {
    id: 'countries.DJI',
    defaultMessage: 'Djibouti',
    description: 'ISO Country: DJI'
  },
  DMA: {
    id: 'countries.DMA',
    defaultMessage: 'Dominica',
    description: 'ISO Country: DMA'
  },
  DOM: {
    id: 'countries.DOM',
    defaultMessage: 'Dominican Republic',
    description: 'ISO Country: DOM'
  },
  ECU: {
    id: 'countries.ECU',
    defaultMessage: 'Ecuador',
    description: 'ISO Country: ECU'
  },
  EGY: {
    id: 'countries.EGY',
    defaultMessage: 'Egypt',
    description: 'ISO Country: EGY'
  },
  SLV: {
    id: 'countries.SLV',
    defaultMessage: 'El Salvador',
    description: 'ISO Country: SLV'
  },
  GNQ: {
    id: 'countries.GNQ',
    defaultMessage: 'Equatorial Guinea',
    description: 'ISO Country: GNQ'
  },
  ERI: {
    id: 'countries.ERI',
    defaultMessage: 'Eritrea',
    description: 'ISO Country: ERI'
  },
  EST: {
    id: 'countries.EST',
    defaultMessage: 'Estonia',
    description: 'ISO Country: EST'
  },
  SWZ: {
    id: 'countries.SWZ',
    defaultMessage: 'Eswatini',
    description: 'ISO Country: SWZ'
  },
  ETH: {
    id: 'countries.ETH',
    defaultMessage: 'Ethiopia',
    description: 'ISO Country: ETH'
  },
  FLK: {
    id: 'countries.FLK',
    defaultMessage: 'Falkland Islands (Malvinas)',
    description: 'ISO Country: FLK'
  },
  FAR: {
    id: 'countries.FAR',
    defaultMessage: 'Farajaland',
    description: 'Fictional country for OpenCRSV demo'
  },
  FRO: {
    id: 'countries.FRO',
    defaultMessage: 'Faroe Islands',
    description: 'ISO Country: FRO'
  },
  FJI: {
    id: 'countries.FJI',
    defaultMessage: 'Fiji',
    description: 'ISO Country: FJI'
  },
  FIN: {
    id: 'countries.FIN',
    defaultMessage: 'Finland',
    description: 'ISO Country: FIN'
  },
  FRA: {
    id: 'countries.FRA',
    defaultMessage: 'France',
    description: 'ISO Country: FRA'
  },
  GUF: {
    id: 'countries.GUF',
    defaultMessage: 'French Guiana',
    description: 'ISO Country: GUF'
  },
  PYF: {
    id: 'countries.PYF',
    defaultMessage: 'French Polynesia',
    description: 'ISO Country: PYF'
  },
  ATF: {
    id: 'countries.ATF',
    defaultMessage: 'French Southern Territories',
    description: 'ISO Country: ATF'
  },
  GAB: {
    id: 'countries.GAB',
    defaultMessage: 'Gabon',
    description: 'ISO Country: GAB'
  },
  GMB: {
    id: 'countries.GMB',
    defaultMessage: 'Gambia',
    description: 'ISO Country: GMB'
  },
  GEO: {
    id: 'countries.GEO',
    defaultMessage: 'Georgia',
    description: 'ISO Country: GEO'
  },
  DEU: {
    id: 'countries.DEU',
    defaultMessage: 'Germany',
    description: 'ISO Country: DEU'
  },
  GHA: {
    id: 'countries.GHA',
    defaultMessage: 'Ghana',
    description: 'ISO Country: GHA'
  },
  GIB: {
    id: 'countries.GIB',
    defaultMessage: 'Gibraltar',
    description: 'ISO Country: GIB'
  },
  GRC: {
    id: 'countries.GRC',
    defaultMessage: 'Greece',
    description: 'ISO Country: GRC'
  },
  GRL: {
    id: 'countries.GRL',
    defaultMessage: 'Greenland',
    description: 'ISO Country: GRL'
  },
  GRD: {
    id: 'countries.GRD',
    defaultMessage: 'Grenada',
    description: 'ISO Country: GRD'
  },
  GLP: {
    id: 'countries.GLP',
    defaultMessage: 'Guadeloupe',
    description: 'ISO Country: GLP'
  },
  GUM: {
    id: 'countries.GUM',
    defaultMessage: 'Guam',
    description: 'ISO Country: GUM'
  },
  GTM: {
    id: 'countries.GTM',
    defaultMessage: 'Guatemala',
    description: 'ISO Country: GTM'
  },
  GGY: {
    id: 'countries.GGY',
    defaultMessage: 'Guernsey',
    description: 'ISO Country: GGY'
  },
  GIN: {
    id: 'countries.GIN',
    defaultMessage: 'Guinea',
    description: 'ISO Country: GIN'
  },
  GNB: {
    id: 'countries.GNB',
    defaultMessage: 'Guinea-Bissau',
    description: 'ISO Country: GNB'
  },
  GUY: {
    id: 'countries.GUY',
    defaultMessage: 'Guyana',
    description: 'ISO Country: GUY'
  },
  HTI: {
    id: 'countries.HTI',
    defaultMessage: 'Haiti',
    description: 'ISO Country: HTI'
  },
  HMD: {
    id: 'countries.HMD',
    defaultMessage: 'Heard Island and McDonald Islands',
    description: 'ISO Country: HMD'
  },
  VAT: {
    id: 'countries.VAT',
    defaultMessage: 'Holy See',
    description: 'ISO Country: VAT'
  },
  HND: {
    id: 'countries.HND',
    defaultMessage: 'Honduras',
    description: 'ISO Country: HND'
  },
  HUN: {
    id: 'countries.HUN',
    defaultMessage: 'Hungary',
    description: 'ISO Country: HUN'
  },
  ISL: {
    id: 'countries.ISL',
    defaultMessage: 'Iceland',
    description: 'ISO Country: ISL'
  },
  IND: {
    id: 'countries.IND',
    defaultMessage: 'India',
    description: 'ISO Country: IND'
  },
  IDN: {
    id: 'countries.IDN',
    defaultMessage: 'Indonesia',
    description: 'ISO Country: IDN'
  },
  IRN: {
    id: 'countries.IRN',
    defaultMessage: 'Iran (Islamic Republic of)',
    description: 'ISO Country: IRN'
  },
  IRQ: {
    id: 'countries.IRQ',
    defaultMessage: 'Iraq',
    description: 'ISO Country: IRQ'
  },
  IRL: {
    id: 'countries.IRL',
    defaultMessage: 'Ireland',
    description: 'ISO Country: IRL'
  },
  IMN: {
    id: 'countries.IMN',
    defaultMessage: 'Isle of Man',
    description: 'ISO Country: IMN'
  },
  ISR: {
    id: 'countries.ISR',
    defaultMessage: 'Israel',
    description: 'ISO Country: ISR'
  },
  ITA: {
    id: 'countries.ITA',
    defaultMessage: 'Italy',
    description: 'ISO Country: ITA'
  },
  JAM: {
    id: 'countries.JAM',
    defaultMessage: 'Jamaica',
    description: 'ISO Country: JAM'
  },
  JPN: {
    id: 'countries.JPN',
    defaultMessage: 'Japan',
    description: 'ISO Country: JPN'
  },
  JEY: {
    id: 'countries.JEY',
    defaultMessage: 'Jersey',
    description: 'ISO Country: JEY'
  },
  JOR: {
    id: 'countries.JOR',
    defaultMessage: 'Jordan',
    description: 'ISO Country: JOR'
  },
  KAZ: {
    id: 'countries.KAZ',
    defaultMessage: 'Kazakhstan',
    description: 'ISO Country: KAZ'
  },
  KEN: {
    id: 'countries.KEN',
    defaultMessage: 'Kenya',
    description: 'ISO Country: KEN'
  },
  KIR: {
    id: 'countries.KIR',
    defaultMessage: 'Kiribati',
    description: 'ISO Country: KIR'
  },
  KWT: {
    id: 'countries.KWT',
    defaultMessage: 'Kuwait',
    description: 'ISO Country: KWT'
  },
  KGZ: {
    id: 'countries.KGZ',
    defaultMessage: 'Kyrgyzstan',
    description: 'ISO Country: KGZ'
  },
  LAO: {
    id: 'countries.KGZ',
    defaultMessage: "Lao People's Democratic Republic Republic",
    description: 'ISO Country: LAO'
  },
  LVA: {
    id: 'countries.LVA',
    defaultMessage: 'Latvia',
    description: 'ISO Country: LVA'
  },
  LBN: {
    id: 'countries.LBN',
    defaultMessage: 'Lebanon',
    description: 'ISO Country: LBN'
  },
  LSO: {
    id: 'countries.LSO',
    defaultMessage: 'Lesotho',
    description: 'ISO Country: LSO'
  },
  LBR: {
    id: 'countries.LBR',
    defaultMessage: 'Liberia',
    description: 'ISO Country: LBR'
  },
  LBY: {
    id: 'countries.LBY',
    defaultMessage: 'Libya',
    description: 'ISO Country: LBY'
  },
  LIE: {
    id: 'countries.LIE',
    defaultMessage: 'Liechtenstein',
    description: 'ISO Country: LIE'
  },
  LTU: {
    id: 'countries.LTU',
    defaultMessage: 'Lithuania',
    description: 'ISO Country: LTU'
  },
  LUX: {
    id: 'countries.LUX',
    defaultMessage: 'Luxembourg',
    description: 'ISO Country: LUX'
  },
  MDG: {
    id: 'countries.MDG',
    defaultMessage: 'Madagascar',
    description: 'ISO Country: MDG'
  },
  MWI: {
    id: 'countries.MWI',
    defaultMessage: 'Malawi',
    description: 'ISO Country: MWI'
  },
  MYS: {
    id: 'countries.MYS',
    defaultMessage: 'Malaysia',
    description: 'ISO Country: MYS'
  },
  MDV: {
    id: 'countries.MDV',
    defaultMessage: 'Maldives',
    description: 'ISO Country: MDV'
  },
  MLI: {
    id: 'countries.MLI',
    defaultMessage: 'Mali',
    description: 'ISO Country: MLI'
  },
  MLT: {
    id: 'countries.MLT',
    defaultMessage: 'Malta',
    description: 'ISO Country: MLT'
  },
  MHL: {
    id: 'countries.MHL',
    defaultMessage: 'Marshall Islands',
    description: 'ISO Country: MHL'
  },
  MTQ: {
    id: 'countries.MTQ',
    defaultMessage: 'Martinique',
    description: 'ISO Country: MTQ'
  },
  MRT: {
    id: 'countries.MRT',
    defaultMessage: 'Mauritania',
    description: 'ISO Country: MRT'
  },
  MUS: {
    id: 'countries.MUS',
    defaultMessage: 'Mauritius',
    description: 'ISO Country: MUS'
  },
  MYT: {
    id: 'countries.MYT',
    defaultMessage: 'Mayotte',
    description: 'ISO Country: MYT'
  },
  MEX: {
    id: 'countries.MEX',
    defaultMessage: 'Mexico',
    description: 'ISO Country: MEX'
  },
  FSM: {
    id: 'countries.FSM',
    defaultMessage: 'Micronesia (Federated States of)',
    description: 'ISO Country: FSM'
  },

  MCO: {
    id: 'countries.MCO',
    defaultMessage: 'Monaco',
    description: 'ISO Country: MCO'
  },
  MNG: {
    id: 'countries.MNG',
    defaultMessage: 'Mongolia',
    description: 'ISO Country: MNG'
  },
  MNE: {
    id: 'countries.MNE',
    defaultMessage: 'Montenegro',
    description: 'ISO Country: MNE'
  },
  MSR: {
    id: 'countries.MSR',
    defaultMessage: 'Montserrat',
    description: 'ISO Country: MSR'
  },
  MAR: {
    id: 'countries.MAR',
    defaultMessage: 'Morocco',
    description: 'ISO Country: MAR'
  },
  MOZ: {
    id: 'countries.MOZ',
    defaultMessage: 'Mozambique',
    description: 'ISO Country: MOZ'
  },
  MMR: {
    id: 'countries.MMR',
    defaultMessage: 'Myanmar',
    description: 'ISO Country: MMR'
  },
  NAM: {
    id: 'countries.NAM',
    defaultMessage: 'Namibia',
    description: 'ISO Country: NAM'
  },
  NRU: {
    id: 'countries.NRU',
    defaultMessage: 'Nauru',
    description: 'ISO Country: NRU'
  },
  NPL: {
    id: 'countries.NPL',
    defaultMessage: 'Nepal',
    description: 'ISO Country: NPL'
  },
  NLD: {
    id: 'countries.NLD',
    defaultMessage: 'Netherlands',
    description: 'ISO Country: NLD'
  },
  NCL: {
    id: 'countries.NCL',
    defaultMessage: 'New Caledonia',
    description: 'ISO Country: NCL'
  },
  NZL: {
    id: 'countries.NZL',
    defaultMessage: 'New Zealand',
    description: 'ISO Country: NZL'
  },
  NIC: {
    id: 'countries.NIC',
    defaultMessage: 'Nicaragua',
    description: 'ISO Country: NIC'
  },
  NER: {
    id: 'countries.NER',
    defaultMessage: 'Niger',
    description: 'ISO Country: NER'
  },
  NGA: {
    id: 'countries.NGA',
    defaultMessage: 'Nigeria',
    description: 'ISO Country: NGA'
  },
  NIU: {
    id: 'countries.NIU',
    defaultMessage: 'Niue',
    description: 'ISO Country: NIU'
  },
  NFK: {
    id: 'countries.NFK',
    defaultMessage: 'Norfolk Island',
    description: 'ISO Country: NFK'
  },
  MNP: {
    id: 'countries.MNP',
    defaultMessage: 'Northern Mariana Islands',
    description: 'ISO Country: MNP'
  },
  NOR: {
    id: 'countries.NOR',
    defaultMessage: 'Norway',
    description: 'ISO Country: NOR'
  },
  OMN: {
    id: 'countries.OMN',
    defaultMessage: 'Oman',
    description: 'ISO Country: OMN'
  },
  PAK: {
    id: 'countries.PAK',
    defaultMessage: 'Pakistan',
    description: 'ISO Country: PAK'
  },
  PLW: {
    id: 'countries.PLW',
    defaultMessage: 'Palau',
    description: 'ISO Country: PLW'
  },
  PAN: {
    id: 'countries.PAN',
    defaultMessage: 'Panama',
    description: 'ISO Country: PAN'
  },
  PNG: {
    id: 'countries.PNG',
    defaultMessage: 'Papua New Guinea',
    description: 'ISO Country: PNG'
  },
  PRY: {
    id: 'countries.PRY',
    defaultMessage: 'Paraguay',
    description: 'ISO Country: PRY'
  },
  PER: {
    id: 'countries.PER',
    defaultMessage: 'Peru',
    description: 'ISO Country: PER'
  },
  PHL: {
    id: 'countries.PHL',
    defaultMessage: 'Philippines',
    description: 'ISO Country: PHL'
  },
  PCN: {
    id: 'countries.PCN',
    defaultMessage: 'Pitcairn',
    description: 'ISO Country: PCN'
  },
  POL: {
    id: 'countries.POL',
    defaultMessage: 'Poland',
    description: 'ISO Country: POL'
  },
  PRT: {
    id: 'countries.PRT',
    defaultMessage: 'Portugal',
    description: 'ISO Country: PRT'
  },
  PRI: {
    id: 'countries.PRI',
    defaultMessage: 'Puerto Rico',
    description: 'ISO Country: PRI'
  },
  QAT: {
    id: 'countries.QAT',
    defaultMessage: 'Qatar',
    description: 'ISO Country: QAT'
  },
  KOR: {
    id: 'countries.KOR',
    defaultMessage: 'Republic of Korea',
    description: 'ISO Country: KOR'
  },
  MDA: {
    id: 'countries.MDA',
    defaultMessage: 'Republic of Moldova',
    description: 'ISO Country: MDA'
  },
  REU: {
    id: 'countries.REU',
    defaultMessage: 'Réunion',
    description: 'ISO Country: REU'
  },
  ROU: {
    id: 'countries.ROU',
    defaultMessage: 'Romania',
    description: 'ISO Country: ROU'
  },
  RUS: {
    id: 'countries.RUS',
    defaultMessage: 'Russian Federation',
    description: 'ISO Country: RUS'
  },
  RWA: {
    id: 'countries.RWA',
    defaultMessage: 'Rwanda',
    description: 'ISO Country: RWA'
  },
  BLM: {
    id: 'countries.BLM',
    defaultMessage: 'Saint Barthélemy',
    description: 'ISO Country: BLM'
  },
  SHN: {
    id: 'countries.SHN',
    defaultMessage: 'Saint Helena',
    description: 'ISO Country: SHN'
  },
  KNA: {
    id: 'countries.KNA',
    defaultMessage: 'Saint Kitts and Nevis',
    description: 'ISO Country: KNA'
  },
  LCA: {
    id: 'countries.LCA',
    defaultMessage: 'Saint Lucia',
    description: 'ISO Country: LCA'
  },
  MAF: {
    id: 'countries.MAF',
    defaultMessage: 'Saint Martin (French Part)',
    description: 'ISO Country: MAF'
  },
  SPM: {
    id: 'countries.SPM',
    defaultMessage: 'Saint Pierre and Miquelon',
    description: 'ISO Country: SPM'
  },
  VCT: {
    id: 'countries.VCT',
    defaultMessage: 'Saint Vincent and the Grenadines',
    description: 'ISO Country: VCT'
  },
  WSM: {
    id: 'countries.WSM',
    defaultMessage: 'Samoa',
    description: 'ISO Country: WSM'
  },
  SMR: {
    id: 'countries.SMR',
    defaultMessage: 'San Marino',
    description: 'ISO Country: SMR'
  },
  STP: {
    id: 'countries.STP',
    defaultMessage: 'Sao Tome and Principe',
    description: 'ISO Country: STP'
  },
  SAU: {
    id: 'countries.SAU',
    defaultMessage: 'Saudi Arabia',
    description: 'ISO Country: SAU'
  },
  SEN: {
    id: 'countries.SEN',
    defaultMessage: 'Senegal',
    description: 'ISO Country: SEN'
  },
  SRB: {
    id: 'countries.SRB',
    defaultMessage: 'Serbia',
    description: 'ISO Country: SRB'
  },
  SYC: {
    id: 'countries.SYC',
    defaultMessage: 'Seychelles',
    description: 'ISO Country: SYC'
  },
  SLE: {
    id: 'countries.SLE',
    defaultMessage: 'Sierra Leone',
    description: 'ISO Country: SLE'
  },
  SGP: {
    id: 'countries.SGP',
    defaultMessage: 'Singapore',
    description: 'ISO Country: SGP'
  },
  SXM: {
    id: 'countries.SXM',
    defaultMessage: 'Sint Maarten (Dutch part)',
    description: 'ISO Country: SXM'
  },
  SVK: {
    id: 'countries.SVK',
    defaultMessage: 'Slovakia',
    description: 'ISO Country: SVK'
  },
  SVN: {
    id: 'countries.SVN',
    defaultMessage: 'Slovenia',
    description: 'ISO Country: SVN'
  },
  SLB: {
    id: 'countries.SLB',
    defaultMessage: 'Solomon Islands',
    description: 'ISO Country: SLB'
  },
  SOM: {
    id: 'countries.SOM',
    defaultMessage: 'Somalia',
    description: 'ISO Country: SOM'
  },
  ZAF: {
    id: 'countries.ZAF',
    defaultMessage: 'South Africa',
    description: 'ISO Country: ZAF'
  },
  SGS: {
    id: 'countries.SGS',
    defaultMessage: 'South Georgia and the South Sandwich Islands',
    description: 'ISO Country: SGS'
  },
  SSD: {
    id: 'countries.SSD',
    defaultMessage: 'South Sudan',
    description: 'ISO Country: SSD'
  },
  ESP: {
    id: 'countries.ESP',
    defaultMessage: 'Spain',
    description: 'ISO Country: ESP'
  },
  LKA: {
    id: 'countries.LKA',
    defaultMessage: 'Sri Lanka',
    description: 'ISO Country: LKA'
  },
  PSE: {
    id: 'countries.PSE',
    defaultMessage: 'State of Palestine',
    description: 'ISO Country: PSE'
  },
  SDN: {
    id: 'countries.SDN',
    defaultMessage: 'Sudan',
    description: 'ISO Country: SDN'
  },
  SUR: {
    id: 'countries.SUR',
    defaultMessage: 'Suriname',
    description: 'ISO Country: SUR'
  },
  SJM: {
    id: 'countries.SJM',
    defaultMessage: 'Svalbard and Jan Mayen Islands',
    description: 'ISO Country: SJM'
  },
  SWE: {
    id: 'countries.SWE',
    defaultMessage: 'Sweden',
    description: 'ISO Country: SWE'
  },
  CHE: {
    id: 'countries.CHE',
    defaultMessage: 'Switzerland',
    description: 'ISO Country: CHE'
  },
  SYR: {
    id: 'countries.SYR',
    defaultMessage: 'Syrian Arab Republic',
    description: 'ISO Country: SYR'
  },
  TJK: {
    id: 'countries.TJK',
    defaultMessage: 'Tajikistan',
    description: 'ISO Country: TJK'
  },
  THA: {
    id: 'countries.THA',
    defaultMessage: 'Thailand',
    description: 'ISO Country: THA'
  },
  MKD: {
    id: 'countries.MKD',
    defaultMessage: 'The former Yugoslav Republic of Macedonia',
    description: 'ISO Country: MKD'
  },
  TLS: {
    id: 'countries.TLS',
    defaultMessage: 'Timor-Leste',
    description: 'ISO Country: TLS'
  },
  TGO: {
    id: 'countries.TGO',
    defaultMessage: 'Togo',
    description: 'ISO Country: TGO'
  },
  TKL: {
    id: 'countries.TKL',
    defaultMessage: 'Tokelau',
    description: 'ISO Country: TKL'
  },
  TON: {
    id: 'countries.TON',
    defaultMessage: 'Tonga',
    description: 'ISO Country: TON'
  },
  TTO: {
    id: 'countries.TTO',
    defaultMessage: 'Trinidad and Tobago',
    description: 'ISO Country: TTO'
  },
  TUN: {
    id: 'countries.TUN',
    defaultMessage: 'Tunisia',
    description: 'ISO Country: TUN'
  },
  TUR: {
    id: 'countries.TUR',
    defaultMessage: 'Turkey',
    description: 'ISO Country: TUR'
  },
  TKM: {
    id: 'countries.TKM',
    defaultMessage: 'Turkmenistan',
    description: 'ISO Country: TKM'
  },
  TCA: {
    id: 'countries.TCA',
    defaultMessage: 'Turks and Caicos Islands',
    description: 'ISO Country: TCA'
  },
  TUV: {
    id: 'countries.TUV',
    defaultMessage: 'Tuvalu',
    description: 'ISO Country: TUV'
  },
  UGA: {
    id: 'countries.UGA',
    defaultMessage: 'Uganda',
    description: 'ISO Country: UGA'
  },
  UKR: {
    id: 'countries.UKR',
    defaultMessage: 'Ukraine',
    description: 'ISO Country: UKR'
  },
  ARE: {
    id: 'countries.ARE',
    defaultMessage: 'United Arab Emirates',
    description: 'ISO Country: ARE'
  },
  GBR: {
    id: 'countries.GBR',
    defaultMessage: 'United Kingdom of Great Britain and Northern Ireland',
    description: 'ISO Country: GBR'
  },
  TZA: {
    id: 'countries.TZA',
    defaultMessage: 'United Republic of Tanzania',
    description: 'ISO Country: TZA'
  },
  UMI: {
    id: 'countries.UMI',
    defaultMessage: 'United States Minor Outlying Islands',
    description: 'ISO Country: UMI'
  },
  USA: {
    id: 'countries.USA',
    defaultMessage: 'United States of America',
    description: 'ISO Country: USA'
  },
  VIR: {
    id: 'countries.VIR',
    defaultMessage: 'United States Virgin Islands',
    description: 'ISO Country: VIR'
  },
  URY: {
    id: 'countries.URY',
    defaultMessage: 'Uruguay',
    description: 'ISO Country: URY'
  },
  UZB: {
    id: 'countries.UZB',
    defaultMessage: 'Uzbekistan',
    description: 'ISO Country: UZB'
  },
  VUT: {
    id: 'countries.VUT',
    defaultMessage: 'Vanuatu',
    description: 'ISO Country: VUT'
  },
  VEN: {
    id: 'countries.VEN',
    defaultMessage: 'Venezuela (Bolivarian Republic of)',
    description: 'ISO Country: VEN'
  },
  VNM: {
    id: 'countries.VNM',
    defaultMessage: 'Viet Nam',
    description: 'ISO Country: VNM'
  },
  WLF: {
    id: 'countries.WLF',
    defaultMessage: 'Wallis and Futuna Islands',
    description: 'ISO Country: WLF'
  },
  ESH: {
    id: 'countries.ESH',
    defaultMessage: 'Western Sahara',
    description: 'ISO Country: ESH'
  },
  YEM: {
    id: 'countries.YEM',
    defaultMessage: 'Yemen',
    description: 'ISO Country: YEM'
  },
  ZMB: {
    id: 'countries.ZMB',
    defaultMessage: 'Zambia',
    description: 'ISO Country: ZMB'
  },
  ZWE: {
    id: 'countries.ZWE',
    defaultMessage: 'Zimbabwe',
    description: 'ISO Country ZWE'
  }
}

export const countries = [
  { value: 'AFG', label: messages.AFG },
  { value: 'ALA', label: messages.ALA },
  { value: 'ALB', label: messages.ALB },
  { value: 'DZA', label: messages.DZA },
  { value: 'ASM', label: messages.ASM },
  { value: 'AND', label: messages.AND },
  { value: 'AGO', label: messages.AGO },
  { value: 'AIA', label: messages.AIA },
  { value: 'ATA', label: messages.ATA },
  { value: 'ATG', label: messages.ATG },
  { value: 'ARG', label: messages.ARG },
  { value: 'ARM', label: messages.ARM },
  { value: 'ABW', label: messages.ABW },
  { value: 'AUS', label: messages.AUS },
  { value: 'AUT', label: messages.AUT },
  { value: 'AZE', label: messages.AZE },
  { value: 'BHS', label: messages.BHS },
  { value: 'BHR', label: messages.BHR },
  { value: 'BGD', label: messages.BGD },
  { value: 'BRB', label: messages.BRB },
  { value: 'BLR', label: messages.BLR },
  { value: 'BEL', label: messages.BEL },
  { value: 'BLZ', label: messages.BLZ },
  { value: 'BEN', label: messages.BEN },
  { value: 'BMU', label: messages.BMU },
  { value: 'BTN', label: messages.BTN },
  { value: 'BOL', label: messages.BOL },
  { value: 'BES', label: messages.BES },
  { value: 'BIH', label: messages.BIH },
  { value: 'BWA', label: messages.BWA },
  { value: 'BVT', label: messages.BVT },
  { value: 'BRA', label: messages.BRA },
  { value: 'IOT', label: messages.IOT },
  { value: 'VGB', label: messages.VGB },
  { value: 'BRN', label: messages.BRN },
  { value: 'BGR', label: messages.BGR },
  { value: 'BFA', label: messages.BFA },
  { value: 'BDI', label: messages.BDI },
  { value: 'CPV', label: messages.CPV },
  { value: 'KHM', label: messages.KHM },
  { value: 'CMR', label: messages.CMR },
  { value: 'CAN', label: messages.CAN },
  { value: 'CYM', label: messages.CYM },
  { value: 'CAF', label: messages.CAF },
  { value: 'TCD', label: messages.TCD },
  { value: 'CHL', label: messages.CHL },
  { value: 'CHN', label: messages.CHN },
  { value: 'HKG', label: messages.HKG },
  { value: 'MAC', label: messages.MAC },
  { value: 'CXR', label: messages.CXR },
  { value: 'CCK', label: messages.CCK },
  { value: 'COL', label: messages.COL },
  { value: 'COM', label: messages.COM },
  { value: 'COG', label: messages.COG },
  { value: 'COK', label: messages.COK },
  { value: 'CRI', label: messages.CRI },
  { value: 'CIV', label: messages.CIV },
  { value: 'HRV', label: messages.HRV },
  { value: 'CUB', label: messages.CUB },
  { value: 'CUW', label: messages.CUW },
  { value: 'CYP', label: messages.CYP },
  { value: 'CZE', label: messages.CZE },
  { value: 'PRK', label: messages.PRK },
  { value: 'COD', label: messages.COD },
  { value: 'DNK', label: messages.DNK },
  { value: 'DJI', label: messages.DJI },
  { value: 'DMA', label: messages.DMA },
  { value: 'DOM', label: messages.DOM },
  { value: 'ECU', label: messages.ECU },
  { value: 'EGY', label: messages.EGY },
  { value: 'SLV', label: messages.SLV },
  { value: 'GNQ', label: messages.GNQ },
  { value: 'ERI', label: messages.ERI },
  { value: 'EST', label: messages.EST },
  { value: 'SWZ', label: messages.SWZ },
  { value: 'ETH', label: messages.ETH },
  { value: 'FAR', label: messages.FAR },
  { value: 'FLK', label: messages.FLK },
  { value: 'FRO', label: messages.FRO },
  { value: 'FJI', label: messages.FJI },
  { value: 'FIN', label: messages.FIN },
  { value: 'FRA', label: messages.FRA },
  { value: 'GUF', label: messages.GUF },
  { value: 'PYF', label: messages.PYF },
  { value: 'ATF', label: messages.ATF },
  { value: 'GAB', label: messages.GAB },
  { value: 'GMB', label: messages.GMB },
  { value: 'GEO', label: messages.GEO },
  { value: 'DEU', label: messages.DEU },
  { value: 'GHA', label: messages.GHA },
  { value: 'GIB', label: messages.GIB },
  { value: 'GRC', label: messages.GRC },
  { value: 'GRL', label: messages.GRL },
  { value: 'GRD', label: messages.GRD },
  { value: 'GLP', label: messages.GLP },
  { value: 'GUM', label: messages.GUM },
  { value: 'GTM', label: messages.GTM },
  { value: 'GGY', label: messages.GGY },
  { value: 'GIN', label: messages.GIN },
  { value: 'GNB', label: messages.GNB },
  { value: 'GUY', label: messages.GUY },
  { value: 'HTI', label: messages.HTI },
  { value: 'HMD', label: messages.HMD },
  { value: 'VAT', label: messages.VAT },
  { value: 'HND', label: messages.HND },
  { value: 'HUN', label: messages.HUN },
  { value: 'ISL', label: messages.ISL },
  { value: 'IND', label: messages.IND },
  { value: 'IDN', label: messages.IDN },
  { value: 'IRN', label: messages.IRN },
  { value: 'IRQ', label: messages.IRQ },
  { value: 'IRL', label: messages.IRL },
  { value: 'IMN', label: messages.IMN },
  { value: 'ISR', label: messages.ISR },
  { value: 'ITA', label: messages.ITA },
  { value: 'JAM', label: messages.JAM },
  { value: 'JPN', label: messages.JPN },
  { value: 'JEY', label: messages.JEY },
  { value: 'JOR', label: messages.JOR },
  { value: 'KAZ', label: messages.KAZ },
  { value: 'KEN', label: messages.KEN },
  { value: 'KIR', label: messages.KIR },
  { value: 'KWT', label: messages.KWT },
  { value: 'KGZ', label: messages.KGZ },
  { value: 'LAO', label: messages.LAO },
  { value: 'LVA', label: messages.LVA },
  { value: 'LBN', label: messages.LBN },
  { value: 'LSO', label: messages.LSO },
  { value: 'LBR', label: messages.LBR },
  { value: 'LBY', label: messages.LBY },
  { value: 'LIE', label: messages.LIE },
  { value: 'LTU', label: messages.LTU },
  { value: 'LUX', label: messages.LUX },
  { value: 'MDG', label: messages.MDG },
  { value: 'MWI', label: messages.MWI },
  { value: 'MYS', label: messages.MYS },
  { value: 'MDV', label: messages.MDV },
  { value: 'MLI', label: messages.MLI },
  { value: 'MLT', label: messages.MLT },
  { value: 'MHL', label: messages.MHL },
  { value: 'MTQ', label: messages.MTQ },
  { value: 'MRT', label: messages.MRT },
  { value: 'MUS', label: messages.MUS },
  { value: 'MYT', label: messages.MYT },
  { value: 'MEX', label: messages.MEX },
  { value: 'FSM', label: messages.FSM },
  { value: 'MCO', label: messages.MCO },
  { value: 'MNG', label: messages.MNG },
  { value: 'MNE', label: messages.MNE },
  { value: 'MSR', label: messages.MSR },
  { value: 'MAR', label: messages.MAR },
  { value: 'MOZ', label: messages.MOZ },
  { value: 'MMR', label: messages.MMR },
  { value: 'NAM', label: messages.NAM },
  { value: 'NRU', label: messages.NRU },
  { value: 'NPL', label: messages.NPL },
  { value: 'NLD', label: messages.NLD },
  { value: 'NCL', label: messages.NCL },
  { value: 'NZL', label: messages.NZL },
  { value: 'NIC', label: messages.NIC },
  { value: 'NER', label: messages.NER },
  { value: 'NGA', label: messages.NGA },
  { value: 'NIU', label: messages.NIU },
  { value: 'NFK', label: messages.NFK },
  { value: 'MNP', label: messages.MNP },
  { value: 'NOR', label: messages.NOR },
  { value: 'OMN', label: messages.OMN },
  { value: 'PAK', label: messages.PAK },
  { value: 'PLW', label: messages.PLW },
  { value: 'PAN', label: messages.PAN },
  { value: 'PNG', label: messages.PNG },
  { value: 'PRY', label: messages.PRY },
  { value: 'PER', label: messages.PER },
  { value: 'PHL', label: messages.PHL },
  { value: 'PCN', label: messages.PCN },
  { value: 'POL', label: messages.POL },
  { value: 'PRT', label: messages.PRT },
  { value: 'PRI', label: messages.PRI },
  { value: 'QAT', label: messages.QAT },
  { value: 'KOR', label: messages.KOR },
  { value: 'MDA', label: messages.MDA },
  { value: 'REU', label: messages.REU },
  { value: 'ROU', label: messages.ROU },
  { value: 'RUS', label: messages.RUS },
  { value: 'RWA', label: messages.RWA },
  { value: 'BLM', label: messages.BLM },
  { value: 'SHN', label: messages.SHN },
  { value: 'KNA', label: messages.KNA },
  { value: 'LCA', label: messages.LCA },
  { value: 'MAF', label: messages.MAF },
  { value: 'SPM', label: messages.SPM },
  { value: 'VCT', label: messages.VCT },
  { value: 'WSM', label: messages.WSM },
  { value: 'SMR', label: messages.SMR },
  { value: 'STP', label: messages.STP },
  { value: 'SAU', label: messages.SAU },
  { value: 'SEN', label: messages.SEN },
  { value: 'SRB', label: messages.SRB },
  { value: 'SYC', label: messages.SYC },
  { value: 'SLE', label: messages.SLE },
  { value: 'SGP', label: messages.SGP },
  { value: 'SXM', label: messages.SXM },
  { value: 'SVK', label: messages.SVK },
  { value: 'SVN', label: messages.SVN },
  { value: 'SLB', label: messages.SLB },
  { value: 'SOM', label: messages.SOM },
  { value: 'ZAF', label: messages.ZAF },
  { value: 'SGS', label: messages.SGS },
  { value: 'SSD', label: messages.SSD },
  { value: 'ESP', label: messages.ESP },
  { value: 'LKA', label: messages.LKA },
  { value: 'PSE', label: messages.PSE },
  { value: 'SDN', label: messages.SDN },
  { value: 'SUR', label: messages.SUR },
  { value: 'SJM', label: messages.SJM },
  { value: 'SWE', label: messages.SWE },
  { value: 'CHE', label: messages.CHE },
  { value: 'SYR', label: messages.SYR },
  { value: 'TJK', label: messages.TJK },
  { value: 'THA', label: messages.THA },
  { value: 'MKD', label: messages.MKD },
  { value: 'TLS', label: messages.TLS },
  { value: 'TGO', label: messages.TGO },
  { value: 'TKL', label: messages.TKL },
  { value: 'TON', label: messages.TON },
  { value: 'TTO', label: messages.TTO },
  { value: 'TUN', label: messages.TUN },
  { value: 'TUR', label: messages.TUR },
  { value: 'TKM', label: messages.TKM },
  { value: 'TCA', label: messages.TCA },
  { value: 'TUV', label: messages.TUV },
  { value: 'UGA', label: messages.UGA },
  { value: 'UKR', label: messages.UKR },
  { value: 'ARE', label: messages.ARE },
  { value: 'GBR', label: messages.GBR },
  { value: 'TZA', label: messages.TZA },
  { value: 'UMI', label: messages.UMI },
  { value: 'USA', label: messages.USA },
  { value: 'VIR', label: messages.VIR },
  { value: 'URY', label: messages.URY },
  { value: 'UZB', label: messages.UZB },
  { value: 'VUT', label: messages.VUT },
  { value: 'VEN', label: messages.VEN },
  { value: 'VNM', label: messages.VNM },
  { value: 'WLF', label: messages.WLF },
  { value: 'ESH', label: messages.ESH },
  { value: 'YEM', label: messages.YEM },
  { value: 'ZMB', label: messages.ZMB },
  { value: 'ZWE', label: messages.ZWE }
  // Remove potentially null country values (Farajaland)
].filter((country): country is SelectOption => Boolean(country))
