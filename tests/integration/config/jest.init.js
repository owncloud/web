import Vue from 'vue'
import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import ODS from 'owncloud-design-system'
import SDK from 'owncloud-sdk'

Vue.use(ODS)

const sdkOptions = {
  baseUrl: 'http://web',
  auth: {
    bearer: 'token'
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}
Vue.prototype.$client = new SDK()
Vue.prototype.$client.init({ ...sdkOptions })

fetchMock.enableMocks()

try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {}

config.mocks = {
  $gettext: str => str,
  $gettextInterpolate: str => str
}

// Translate component mock
Vue.component("Translate", {
  props: {
    tag: { type: String, default: "span" },
  },
  render(createElement) {
    return createElement(this.tag, {}, this.$slots.default)
  },
})