import { configureCompat } from 'vue'
import fetchMock from 'jest-fetch-mock'

import { compatConfig } from '../../../packages/web-runtime/src/compatConfig'

configureCompat(compatConfig)
;(window as any).define = jest.fn()
;(window as any).IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
fetchMock.enableMocks()
