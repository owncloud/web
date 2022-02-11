import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import 'regenerator-runtime/runtime'

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
  isIE11: () => false,
  $language: {
    current: 'en'
  }
}

jest.mock('@files/src/composables', () => ({
  ...jest.requireActual('@files/src/composables'),
  usePagination: jest.fn(({ page, items, sortDir, sortBy }) => {
    return {
      items,
      total: 1,
      perPage: 10
    }
  })
}))
