const IntersectionObserverMock = vi.fn(function () {
  return {
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn()
  }
})

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

const ResizeObserverMock = vi.fn(function () {
  return { observe: vi.fn(), unobserve: vi.fn() }
})

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

vi.stubGlobal('define', vi.fn())

// This is needed for KaTeX to work in the tests
Object.defineProperty(document, 'compatMode', {
  value: 'CSS1Compat'
})
