import fetchMock from 'jest-fetch-mock'
;(window as any).define = jest.fn()
;(window as any).IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
fetchMock.enableMocks()
