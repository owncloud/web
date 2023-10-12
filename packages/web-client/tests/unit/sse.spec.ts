import { fetchEventSource } from '@microsoft/fetch-event-source'
jest.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource
}))

import { SSEAdapter, sse, MESSAGE_TYPE, RetriableError } from '../../src/sse' // Replace 'your-module' with the actual module path

describe('SSEAdapter', () => {
  let mockFetch
  let fetchEventSource

  beforeEach(() => {
    mockFetch = jest.fn()

    // Mock fetchEventSource and window.fetch

    global.window.fetch = mockFetch
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should initialize the SSEAdapter', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }

    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(sseAdapter.url).toBe(url)
    expect(sseAdapter.fetchOptions).toBe(fetchOptions)
    expect(sseAdapter.readyState).toBe(sseAdapter.CONNECTING)
  })

  test('it should call connect and set up event listeners', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(fetchEventSource).toHaveBeenCalledWith(url, expect.any(Object))
    expect(fetchEventSource.mock.calls[0][1].onopen).toEqual(expect.any(Function))

    // Simulate onopen
    fetchEventSource.mock.calls[0][1].onopen()

    expect(sseAdapter.readyState).toBe(sseAdapter.OPEN)
  })

  test('it should handle onmessage events', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)
    const message = { data: 'Message data', event: MESSAGE_TYPE.NOTIFICATION }

    const messageListener = jest.fn()
    sseAdapter.addEventListener(MESSAGE_TYPE.NOTIFICATION, messageListener)

    // Simulate onmessage
    fetchEventSource.mock.calls[0][1].onmessage(message)

    expect(messageListener).toHaveBeenCalledWith(expect.any(Object))
  })

  test('it should handle onerror events', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)
    const error = new Error('Test error message')

    const errorListener = jest.fn()
    sseAdapter.addEventListener('error', errorListener)

    // Simulate onerror
    fetchEventSource.mock.calls[0][1].onerror(error)

    expect(errorListener).toHaveBeenCalledWith(expect.any(Object))
    expect(console.error).toHaveBeenCalledWith(error)
  })

  test('it should handle onclose events and throw RetriableError', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(() => {
      // Simulate onclose
      fetchEventSource.mock.calls[0][1].onclose()
    }).toThrow(RetriableError)
  })

  test('it should call fetchProvider with fetch options', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    const resource = 'https://example.com/resource'
    const customFetchOptions = { method: 'POST' }

    sseAdapter.fetchProvider(resource, customFetchOptions)

    expect(mockFetch).toHaveBeenCalledWith(resource, { ...fetchOptions, ...customFetchOptions })
  })

  test('it should update the access token in fetch options', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    const token = 'your-token'
    sseAdapter.updateAccessToken(token)

    expect(sseAdapter.fetchOptions.headers.Authorization).toBe(`Bearer ${token}`)
  })

  test('it should close the SSEAdapter', () => {
    const url = 'https://example.com/sse'
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    sseAdapter.close()

    expect(sseAdapter.readyState).toBe(sseAdapter.CLOSED)
  })
})

describe('sse', () => {
  let originalFetchEventSource
  let originalFetch

  beforeAll(() => {
    originalFetchEventSource = global.fetchEventSource
    originalFetch = global.window.fetch

    // Mock fetchEventSource and window.fetch
    global.fetchEventSource = jest.fn()
    global.window.fetch = jest.fn()
  })

  afterAll(() => {
    global.fetchEventSource = originalFetchEventSource
    global.window.fetch = originalFetch
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should create and return an SSEAdapter instance', () => {
    const baseURI = 'https://example.com'
    const fetchOptions = { method: 'GET' }
    const eventSource = sse(baseURI, fetchOptions)

    expect(eventSource).toBeInstanceOf(SSEAdapter)
    expect(eventSource.url).toBe(
      new URL('ocs/v2.php/apps/notifications/api/v1/notifications/sse', baseURI).href
    )
  })

  test('it should reuse the existing SSEAdapter instance', () => {
    const baseURI = 'https://example.com'
    const fetchOptions = { method: 'GET' }

    const eventSource1 = sse(baseURI, fetchOptions)
    const eventSource2 = sse(baseURI, fetchOptions)

    expect(eventSource1).toBe(eventSource2)
  })
})
