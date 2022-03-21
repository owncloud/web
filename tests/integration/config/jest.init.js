import Vue from 'vue'
import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import ODS from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'
import VueCompositionAPI from '@vue/composition-api'

// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '../../../__mocks__/sdk'
import { encodePath } from '@pkg/src/utils'

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}))

Vue.use(ODS)
Vue.use(VueCompositionAPI)

Vue.use(GetTextPlugin, {
  availableLanguages: ['en'],
  defaultLanguage: 'en',
  translations: {}
})

fetchMock.enableMocks()

try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {
  console.error(error)
}

// since silent doesn't seem to work in test env for gettext plugin
// we're manually silencing all warn messages
console.warn = jest.fn()

config.mocks = {
  $client: sdkMock,
  $clientService: {
    owncloudSdk: sdkMock
  },
  encodePath
}
