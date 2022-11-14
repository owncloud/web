import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import 'regenerator-runtime/runtime'

window.define = jest.fn()

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
fetchMock.enableMocks()

config.mocks = {
  $gettext: (str) => str,
  $pgettext: (context, msgid) => msgid,
  $ngettext: (msgid, plural, n) => {
    if (n > 1 || n === 0 || n < 0 || !Number.isInteger(n)) {
      return plural
    } else {
      return msgid
    }
  },
  $language: {
    current: 'en'
  }
}
