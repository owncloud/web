const fetchEventSourceMock = jest.fn()
jest.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: fetchEventSourceMock
}))

import { SSEAdapter, sse, MESSAGE_TYPE, RetriableError } from '../../src/sse'

const url = 'https://owncloud.test/'
describe('SSEAdapter', () => {
  let mockFetch

  beforeEach(() => {
    mockFetch = jest.fn()

    // Mock fetchEventSource and window.fetch

    global.window.fetch = mockFetch
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should initialize the SSEAdapter', () => {
    const fetchOptions = { method: 'GET' }

    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(sseAdapter.url).toBe(url)
    expect(sseAdapter.fetchOptions).toBe(fetchOptions)
    expect(sseAdapter.readyState).toBe(sseAdapter.CONNECTING)
  })

  test('it should call connect and set up event listeners', () => {
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(fetchEventSourceMock).toHaveBeenCalledWith(url, expect.any(Object))
    expect(fetchEventSourceMock.mock.calls[0][1].onopen).toEqual(expect.any(Function))

    fetchEventSourceMock.mock.calls[0][1].onopen()

    expect(sseAdapter.readyState).toBe(sseAdapter.OPEN)
  })

  test('it should handle onmessage events', () => {
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)
    const message = { data: 'Message data', event: MESSAGE_TYPE.NOTIFICATION }

    const messageListener = jest.fn()
    sseAdapter.addEventListener(MESSAGE_TYPE.NOTIFICATION, messageListener)

    fetchEventSourceMock.mock.calls[0][1].onmessage(message)

    expect(messageListener).toHaveBeenCalledWith(expect.any(Object))
  })

  test('it should handle onclose events and throw RetriableError', () => {
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    expect(() => {
      // Simulate onclose
      fetchEventSourceMock.mock.calls[0][1].onclose()
    }).toThrow(RetriableError)
  })

  test('it should call fetchProvider with fetch options', () => {
    const fetchOptions = { headers: { Authorization: 'Bearer xy' } }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    sseAdapter.fetchProvider(url, fetchOptions)

    expect(mockFetch).toHaveBeenCalledWith(url, { ...fetchOptions })
  })

  test('it should update the access token in fetch options', () => {
    const fetchOptions = { headers: { Authorization: 'Bearer xy' } }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    const token = 'new-token'
    sseAdapter.updateAccessToken(token)

    expect(sseAdapter.fetchOptions.headers.Authorization).toBe(`Bearer ${token}`)
  })

  test('it should close the SSEAdapter', () => {
    const fetchOptions = { method: 'GET' }
    const sseAdapter = new SSEAdapter(url, fetchOptions)

    sseAdapter.close()

    expect(sseAdapter.readyState).toBe(sseAdapter.CLOSED)
  })
})

describe('sse', () => {
  test('it should create and return an SSEAdapter instance', () => {
    const fetchOptions = { method: 'GET' }
    const eventSource = sse(url, fetchOptions)

    expect(eventSource).toBeInstanceOf(SSEAdapter)
    expect(eventSource.url).toBe(`${url}ocs/v2.php/apps/notifications/api/v1/notifications/sse`)
  })
})
