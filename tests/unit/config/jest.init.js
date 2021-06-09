import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'
import 'regenerator-runtime/runtime'

fetchMock.enableMocks()
try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {}

config.mocks = {
  $gettext: str => str,
  $route: {
    params: {},
    query: {},
    name: '',
    path: ''
  }
}
