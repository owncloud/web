import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()
try {
  jest.setMock('cross-fetch', fetchMock)
  jest.setMock('sync-fetch', fetchMock)
} catch (error) {}

config.mocks = {
  $gettext: str => str
}
