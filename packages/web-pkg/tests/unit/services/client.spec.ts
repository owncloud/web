import { clientService } from '../../../src/services'
import { HttpClient } from '../../../src/http'
import mockAxios from 'jest-mock-axios'

beforeEach(jest.resetAllMocks)

describe('client', () => {
  describe('clientService', () => {
    test('httpAuthenticated', () => {
      const client = clientService.httpAuthenticated('token')
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: 'Bearer token', 'X-Requested-With': 'XMLHttpRequest' }
        })
      )
      expect(mockAxios.create).toBeCalledTimes(1)
      clientService.httpAuthenticated('token')
      expect(mockAxios.create).toBeCalledTimes(1)
      clientService.httpAuthenticated('new')
      expect(mockAxios.create).toBeCalledTimes(2)
    })

    test('httpUnAuthenticated', () => {
      let client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
      )
      expect(mockAxios.create).toBeCalledTimes(1)
      client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toBeCalledTimes(1)
      client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toBeCalledTimes(1)
    })
  })
})
