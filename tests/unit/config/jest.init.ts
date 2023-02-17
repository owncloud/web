import fetchMock from 'jest-fetch-mock'
;(window as any).define = jest.fn()
;(window as any).IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
;(window as any).ResizeObserver =
  (window as any).ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))
fetchMock.enableMocks()
