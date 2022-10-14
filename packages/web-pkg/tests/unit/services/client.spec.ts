import { clientService } from '../../../src/services'
import { HttpClient } from '../../../src/http'
import mockAxios from 'jest-mock-axios'

beforeEach(jest.resetAllMocks)

const v4uuid = '00000000-0000-0000-0000-000000000000'
jest.mock('uuid', () => ({ v4: () => v4uuid }))

describe('client', () => {
  describe('clientService', () => {
    test('httpAuthenticated', () => {
      const client = clientService.httpAuthenticated('token')
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Request-ID': v4uuid
          }
        })
      )
      expect(mockAxios.create).toHaveBeenCalledTimes(1)
      clientService.httpAuthenticated('token')
      expect(mockAxios.create).toHaveBeenCalledTimes(1)
      clientService.httpAuthenticated('new')
      expect(mockAxios.create).toHaveBeenCalledTimes(2)
    })

    test('httpUnAuthenticated', () => {
      let client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
      )
      expect(mockAxios.create).toHaveBeenCalledTimes(1)
      client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledTimes(1)
      client = clientService.httpUnAuthenticated
      expect(client).toBeInstanceOf(HttpClient)
      expect(mockAxios.create).toHaveBeenCalledTimes(1)
    })
  })
})
