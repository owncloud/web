import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import 'regenerator-runtime/runtime'

window.define = jest.fn()

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
fetchMock.enableMocks()
try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {}

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

jest.mock('web-app-files/src/composables', () => ({
  ...jest.requireActual('web-app-files/src/composables'),
  usePagination: jest.fn(({ page, items, sortDir, sortBy }) => {
    return {
      items,
      total: 1,
      perPage: 10
    }
  })
}))
