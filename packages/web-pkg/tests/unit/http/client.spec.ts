import { HttpClient } from '../../../src/http'
import mockAxios from 'jest-mock-axios'

beforeEach(mockAxios.reset)

describe('HttpClient', () => {
  test.each(['delete', 'get', 'head', 'options', 'patch', 'post', 'put'])('%s', m => {
    const client = new HttpClient()
    client[m]('url')
    mockAxios.mockResponse({ data: undefined })
    expect(mockAxios[m]).toBeCalledTimes(1)
  })

  test('request', () => {
    const client = new HttpClient()
    client.request({ method: 'get' })
    mockAxios.mockResponse({ data: undefined })
    expect(mockAxios.request).toBeCalledTimes(1)
  })

  // eslint-disable-next-line jest/no-done-callback
  test('cancel', done => {
    const client = new HttpClient()
    const thenFn = jest.fn()
    const catchFn = jest.fn()
    const promise = client
      .get('/foo')
      .then(thenFn)
      .catch(catchFn)
    client.cancel('foo')

    setTimeout(async () => {
      mockAxios.mockResponse({ data: 'data' }, undefined, true)
      await promise
      expect(thenFn).not.toHaveBeenCalled()
      expect(catchFn).toHaveBeenCalledWith(expect.any(mockAxios.Cancel))
      done()
    })
  })
})
