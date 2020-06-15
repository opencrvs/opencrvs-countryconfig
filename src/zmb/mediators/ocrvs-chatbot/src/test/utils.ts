export const body = {
  child: {
    firstName: 'Evans',
    lastName: 'Kangwa',
    gender: 'male'
  },
  mother: {
    firstName: 'Agnes',
    lastName: 'Kangwa'
  },
  eventLocation: {
    name: 'Chembe'
  }
}
export const mockLocationsResponse = {
  data: [
    {
      id: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
      name: 'Chembe District',
      alias: '',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/co909b89-57ec-4d8b-9h65-e8865579g497'
    }
  ]
}
export const mockSearchResponse = {
  body: {
    took: 22,
    timed_out: false,
    _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
    hits: {
      total: 1,
      max_score: null,
      hits: [
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: '79c5fdde-276f-4f91-b1ee-c76b33f7cc38',
          _score: null,
          _source: {
            event: 'Birth',
            createdAt: '1584615535064',
            operationHistories: [
              {
                operatedOn: '2020-03-19T10:58:54.903Z',
                operatorFirstNames: 'Kalusha',
                operatorFamilyNameLocale: '',
                operatorFamilyName: 'Bwalya',
                operatorFirstNamesLocale: '',
                operatorOfficeName: 'Lusaka DNRPC District Office',
                operatorOfficeAlias: ['Lusaka DNRPC District Office'],
                operationType: 'REGISTERED',
                operatorRole: 'FIELD_AGENT'
              },
              {
                operatedOn: '2020-03-19T10:59:18.343Z',
                operatorFirstNames: 'Kennedy',
                operatorFamilyNameLocale: '',
                operatorFamilyName: 'Mweene',
                operatorFirstNamesLocale: '',
                operatorOfficeName: 'Lusaka DNRPC District Office',
                operatorOfficeAlias: ['Lusaka DNRPC District Office'],
                operationType: 'REGISTERED',
                operatorRole: 'LOCAL_REGISTRAR'
              }
            ],
            childFirstNames: 'Evans',
            childFamilyName: 'Kangwa',
            childDoB: '1994-10-22',
            gender: 'male',
            eventLocationId: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
            motherFirstNames: 'Agnes',
            motherFamilyName: 'Kangwa',
            motherDoB: '1971-10-23',
            motherIdentifier: '123456789',
            fatherFirstNames: 'Agnes',
            fatherFamilyName: 'Aktar',
            fatherDoB: '1971-10-23',
            fatherIdentifier: '123456789',
            informantFirstNames: 'Agnes',
            informantFamilyName: 'Kangwa',
            contactNumber: '+260728130980',
            type: 'REGISTERED',
            dateOfApplication: '2020-03-19T10:58:54.903Z',
            trackingId: 'BD0MKGD',
            applicationLocationId: '67e1c701-3087-4905-8fd3-b54096c9ffd1',
            compositionType: 'birth-application',
            createdBy: 'e388ce7b-72bb-4d70-885c-895ed08789da',
            updatedBy: 'c9224259-f13b-4a33-b3c6-9570579e1a3d',
            modifiedAt: '1584615558466'
          },
          sort: [1584615534903]
        }
      ]
    }
  },
  statusCode: 200,
  headers: {
    'content-type': 'application/json; charset=UTF-8',
    'content-length': '1971'
  },
  warnings: null,
  meta: {
    context: null,
    request: {
      params: {
        method: 'POST',
        path: '/ocrvs/compositions/_search',
        body:
          '{"query":{"bool":{"must":[{"multi_match":{"query":"Evans","fields":["childFirstNames","childFirstNamesLocal"],"fuzziness":"AUTO"}},{"multi_match":{"query":"Kangwa","fields":["childFamilyName","childFamilyNameLocal"],"fuzziness":"AUTO"}},{"multi_match":{"query":"Agnes","fields":["motherFirstNames","motherFirstNamesLocal"],"fuzziness":"AUTO"}},{"multi_match":{"query":"Kangwa","fields":["motherFamilyName","motherFamilyNameLocal"],"fuzziness":"AUTO"}},{"term":{"gender.keyword":"male"}},{"term":{"eventLocationId.keyword":{"value":"394e6ec9-5db7-4ce7-aa5e-6686f7a74081","boost":2}}},{"term":{"event.keyword":"Birth"}},{"terms":{"compositionType.keyword":["birth-application"]}}],"should":[]}},"sort":[{"dateOfApplication":"asc"}]}',
        querystring: 'from=0&size=10',
        headers: {
          'User-Agent':
            'elasticsearch-js/6.8.5 (darwin 18.7.0-x64; Node.js v13.5.0)',
          'Content-Type': 'application/json',
          'Content-Length': '730'
        },
        timeout: 30000
      },
      options: { ignore: [404], warnings: null },
      id: 270
    },
    name: 'elasticsearch-js',
    connection: {
      url: 'http://localhost:9200/',
      id: 'http://localhost:9200/',
      headers: {},
      deadCount: 0,
      resurrectTimeout: 0,
      _openRequests: 0,
      status: 'alive',
      roles: { master: true, data: true, ingest: true, ml: false }
    },
    attempts: 0,
    aborted: false
  }
}
export const mockResponse = {
  results: [
    {
      _index: 'ocrvs',
      _type: 'compositions',
      _id: '79c5fdde-276f-4f91-b1ee-c76b33f7cc38',
      _score: null,
      _source: {
        event: 'Birth',
        createdAt: '1584615535064',
        operationHistories: [
          {
            operatedOn: '2020-03-19T10:58:54.903Z',
            operatorFirstNames: 'Kalusha',
            operatorFamilyNameLocale: '',
            operatorFamilyName: 'Bwalya',
            operatorFirstNamesLocale: '',
            operatorOfficeName: 'Lusaka DNRPC District Office',
            operatorOfficeAlias: ['Lusaka DNRPC District Office'],
            operationType: 'REGISTERED',
            operatorRole: 'FIELD_AGENT'
          },
          {
            operatedOn: '2020-03-19T10:59:18.343Z',
            operatorFirstNames: 'Kennedy',
            operatorFamilyNameLocale: '',
            operatorFamilyName: 'Mweene',
            operatorFirstNamesLocale: '',
            operatorOfficeName: 'Lusaka DNRPC District Office',
            operatorOfficeAlias: ['Lusaka DNRPC District Office'],
            operationType: 'REGISTERED',
            operatorRole: 'LOCAL_REGISTRAR'
          }
        ],
        childFirstNames: 'Evans',
        childFamilyName: 'Kangwa',
        childDoB: '1994-10-22',
        gender: 'male',
        eventLocationId: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
        motherFirstNames: 'Agnes',
        motherFamilyName: 'Kangwa',
        motherDoB: '1971-10-23',
        motherIdentifier: '123456789',
        fatherFirstNames: 'Agnes',
        fatherFamilyName: 'Aktar',
        fatherDoB: '1971-10-23',
        fatherIdentifier: '123456789',
        informantFirstNames: 'Agnes',
        informantFamilyName: 'Kangwa',
        contactNumber: '+260728130980',
        type: 'REGISTERED',
        dateOfApplication: '2020-03-19T10:58:54.903Z',
        trackingId: 'BD0MKGD',
        applicationLocationId: '67e1c701-3087-4905-8fd3-b54096c9ffd1',
        compositionType: 'birth-application',
        createdBy: 'e388ce7b-72bb-4d70-885c-895ed08789da',
        updatedBy: 'c9224259-f13b-4a33-b3c6-9570579e1a3d',
        modifiedAt: '1584615558466'
      },
      sort: [1584615534903]
    }
  ]
}
export const mockSearchCriteria = {
  gender: 'male',
  nameCombinations: [
    { name: 'Evans', fields: 'CHILD_FIRST' },
    { name: 'Kangwa', fields: 'CHILD_FAMILY' },
    { name: 'Agnes', fields: 'MOTHER_FIRST' },
    { name: 'Kangwa', fields: 'MOTHER_FAMILY' }
  ],
  eventLocationId: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
  event: 'Birth',
  type: ['birth-application']
}
