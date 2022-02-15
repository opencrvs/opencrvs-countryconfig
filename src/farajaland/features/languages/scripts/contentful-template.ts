/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  IContentfulImport,
  ContentType,
  EditorInterface,
  Entry,
  Locale
} from '@countryconfig/farajaland/features/languages/scripts/contentfulImport'

export const contentTypeTemplate: ContentType = {
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: ''
      }
    },
    id: '',
    type: 'ContentType',
    createdAt: '',
    updatedAt: '',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    publishedVersion: 0,
    publishedAt: '',
    firstPublishedAt: '',
    createdBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    updatedBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    publishedCounter: 0,
    version: 0,
    publishedBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    }
  },
  displayField: '',
  name: '',
  description: '',
  fields: []
}

export const EditorInterfaceTemplate: EditorInterface = {
  sys: {
    id: 'default',
    type: 'EditorInterface',
    space: {
      sys: {
        id: '',
        type: 'Link',
        linkType: 'Space'
      }
    },
    version: 0,
    createdAt: '',
    createdBy: {
      sys: {
        id: '',
        type: 'Link',
        linkType: 'User'
      }
    },
    updatedAt: '',
    updatedBy: {
      sys: {
        id: '',
        type: 'Link',
        linkType: 'User'
      }
    },
    contentType: {
      sys: {
        id: '',
        type: 'Link',
        linkType: 'ContentType'
      }
    },
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    }
  },
  controls: []
}

export const entryTemplate: Entry = {
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: ''
      }
    },
    id: '',
    type: 'Entry',
    createdAt: '',
    updatedAt: '',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    publishedVersion: 0,
    publishedAt: '',
    firstPublishedAt: '',
    createdBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    updatedBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    publishedCounter: 2,
    version: 5,
    publishedBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: ''
      }
    }
  },
  fields: {}
}

export const localeTemplate: Locale = {
  name: '',
  code: '',
  fallbackCode: '',
  default: false,
  contentManagementApi: true,
  contentDeliveryApi: true,
  optional: false,
  sys: {
    type: 'Locale',
    id: '',
    version: 1,
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: ''
      }
    },
    environment: {
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: 'master'
      }
    },
    createdBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    createdAt: '',
    updatedBy: {
      sys: {
        type: 'Link',
        linkType: 'User',
        id: ''
      }
    },
    updatedAt: ''
  }
}

export const contentfulTemplate: IContentfulImport = {
  contentTypes: [],
  tags: [],
  editorInterfaces: [],
  entries: [],
  assets: [],
  locales: []
}
