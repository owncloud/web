import Vue from 'vue'
import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import ODS from 'owncloud-design-system'

// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '../../../__mocks__/sdk'
import { encodePath } from '@pkg/src/utils'

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}))

Vue.use(ODS)

fetchMock.enableMocks()

try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {
  console.error(error)
}

config.mocks = {
  $gettext: str => str,
  $gettextInterpolate: str => str,
  $ngettext: str => str,
  $pgettext: str => str,
  $client: sdkMock,
  $language: {
    current: 'en'
  },
  encodePath,
  isIE11: () => false
}

// Translate component mock
Vue.component('Translate', {
  props: {
    tag: { type: String, default: 'span' }
  },
  render(createElement) {
    return createElement(this.tag, {}, this.$slots.default)
  }
})
