import { getBackendVersion, getWebVersion } from '../../../src/container/versions'
import { getStoreInstance } from 'web-test-helpers'

describe('collect version information', () => {
  describe('web version', () => {
    beforeEach(() => {
      process.env.PACKAGE_VERSION = '4.7.0'
    })
    it('provides the web version with a static string without exceptions', () => {
      expect(getWebVersion()).toBe('ownCloud Web UI 4.7.0')
    })
  })
  describe('backend version', () => {
    it('returns undefined when the backend version object is not available', () => {
      const store = versionStore(undefined)
      expect(getBackendVersion({ store })).toBeUndefined()
    })
    it('returns undefined when the backend version object has no "string" field', () => {
      const store = versionStore({
        product: 'ownCloud',
        versionstring: undefined
      })
      expect(getBackendVersion({ store })).toBeUndefined()
    })
    it('falls back to "ownCloud" as a product when none is defined', () => {
      const store = versionStore({
        versionstring: '10.8.0',
        edition: 'Community'
      })
      expect(getBackendVersion({ store })).toBe('ownCloud 10.8.0 Community')
    })
    it('provides the backend version as concatenation of product, version and edition', () => {
      const store = versionStore({
        product: 'oCIS',
        versionstring: '1.16.0',
        edition: 'Reva'
      })
      expect(getBackendVersion({ store })).toBe('oCIS 1.16.0 Reva')
    })
    it('prefers the productversion over versionstring field if both are provided', () => {
      const store = versionStore({
        product: 'oCIS',
        versionstring: '10.8.0',
        productversion: '2.0.0',
        edition: 'Community'
      })
      expect(getBackendVersion({ store })).toBe('oCIS 2.0.0 Community')
    })
  })
})

const versionStore = (version: any) => {
  return getStoreInstance({
    getters: {
      capabilities: jest.fn(() => ({
        core: {
          status: {
            ...version
          }
        }
      }))
    }
  })
}
