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

// required for @cornerstonejs/dicom-image-loader
// issue: https://github.com/cornerstonejs/cornerstoneWADOImageLoader/issues/441
const script = global.document.createElement('script')
script.setAttribute('src', '/')
Object.defineProperty(global.document, 'currentScript', {
  value: script
})
