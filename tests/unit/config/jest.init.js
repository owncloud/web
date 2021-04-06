import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

config.mocks = {
  $gettext: str => str
}
