import { getBackendVersion, getWebVersion } from '../../../src/container/versions'
import Vuex, { Store } from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

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
        string: undefined
      })
      expect(getBackendVersion({ store })).toBeUndefined()
    })
    it('falls back to "ownCloud" as a product when none is defined', () => {
      const store = versionStore({
        string: '10.8.0',
        edition: 'Community'
      })
      expect(getBackendVersion({ store })).toBe('ownCloud 10.8.0 Community')
    })
    it('provides the backend version as concatenation of product, version and edition', () => {
      const store = versionStore({
        product: 'oCIS',
        string: '1.16.0',
        edition: 'Reva'
      })
      expect(getBackendVersion({ store })).toBe('oCIS 1.16.0 Reva')
    })
  })
})

const versionStore = (version: any): Store<any> => {
  return new Vuex.Store({
    getters: {
      user: jest.fn(() => ({ version }))
    }
  })
}
