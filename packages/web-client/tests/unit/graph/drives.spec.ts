import axios, { InternalAxiosRequestConfig } from 'axios'
import { graph } from '../../../src/graph'

const getClient = () => {
  const requests: InternalAxiosRequestConfig[] = []
  const client = axios.create({
    adapter: async (config) => {
      requests.push(config)
      return { data: {}, status: 204, statusText: 'No Content', headers: {}, config }
    }
  })
  return { client, requests }
}

describe('drives', () => {
  describe('deleteDrive', () => {
    it('sends the Purge header', async () => {
      const { client, requests } = getClient()

      await graph('https://example.org', client).drives.deleteDrive('driveId', '*')

      expect(requests).toHaveLength(1)
      expect(requests[0].method).toBe('delete')
      expect(requests[0].headers.get('Purge')).toBe('T')
      expect(requests[0].headers.get('If-Match')).toBe('*')
    })
    it('keeps headers passed via request options', async () => {
      const { client, requests } = getClient()

      await graph('https://example.org', client).drives.deleteDrive('driveId', '*', {
        headers: { 'X-Request-ID': 'abc' }
      })

      expect(requests[0].headers.get('Purge')).toBe('T')
      expect(requests[0].headers.get('X-Request-ID')).toBe('abc')
    })
  })
  describe('disableDrive', () => {
    it('does not send the Purge header', async () => {
      const { client, requests } = getClient()

      await graph('https://example.org', client).drives.disableDrive('driveId', '*')

      expect(requests[0].method).toBe('delete')
      expect(requests[0].headers.has('Purge')).toBe(false)
    })
  })
})
