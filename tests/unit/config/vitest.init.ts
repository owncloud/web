;(window as any).define = vi.fn()
;(window as any).IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn()
}))
;(window as any).ResizeObserver =
  (window as any).ResizeObserver ||
  vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn()
  }))
global.fetchMock = global.fetch = vi.fn()
