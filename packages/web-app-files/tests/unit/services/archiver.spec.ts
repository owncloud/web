import { archiverService, ArchiverService } from '../../../src/services'
import { RuntimeError } from 'web-runtime/src/container/error'

describe('archiver', () => {
  describe('archiverService', () => {
    it('creates an ArchiverService instance exported as `archiverService`', () => {
      expect(archiverService).toBeInstanceOf(ArchiverService)
    })
    describe('when not being initialized', () => {
      it('is announcing itself as unavailable', () => {
        expect(archiverService.available).toBe(false)
      })
      it('does not return a url', () => {
        expect(() => archiverService.url).toThrow(new RuntimeError('no archiver available'))
      })
    })
    describe('when initialized', () => {
      const serverUrl = 'https://demo.owncloud.com'
      let service
      beforeEach(() => {
        service = new ArchiverService()
      })
      describe('without archiver capability', () => {
        beforeEach(() => {
          service.initialize(serverUrl, [])
        })
        it('is announcing itself as unavailable', () => {
          expect(service.available).toBe(false)
        })
        it('does not return a url', () => {
          expect(() => service.url).toThrow(new RuntimeError('no archiver available'))
        })
      })
      describe('with one archiver capability', () => {
        const archiverUrl = [serverUrl, 'archiver'].join('/')
        const capability = {
          enabled: true,
          version: 'v2.3.5',
          archiver_url: archiverUrl
        }
        beforeEach(() => {
          service.initialize(serverUrl, [capability])
        })
        it('is announcing itself as available', () => {
          expect(service.available).toBe(true)
        })
        it('returns the archiver_url as url', () => {
          expect(service.url).toBe(archiverUrl)
        })
        it.each([
          {
            server: serverUrl,
            archiver: archiverUrl
          },
          {
            server: serverUrl,
            archiver: '/archiver'
          },
          {
            server: serverUrl,
            archiver: 'archiver'
          },
          {
            server: serverUrl + '/',
            archiver: '/archiver'
          },
          {
            server: serverUrl + '/',
            archiver: 'archiver'
          }
        ])('returns an absolute, cleaned url', ({ server, archiver }) => {
          service.initialize(server, [
            {
              ...capability,
              archiver_url: archiver
            }
          ])
          expect(service.url).toBe(archiverUrl)
        })
      })
      describe('with multiple archiver capabilities of different versions', () => {
        const archiverUrl = [serverUrl, 'archiver'].join('/')
        const capabilityV1 = {
          enabled: true,
          version: 'v1.2.3',
          archiver_url: archiverUrl + '/v1'
        }
        const capabilityV2 = {
          enabled: true,
          version: 'v2.3.5',
          archiver_url: archiverUrl + '/v2'
        }
        const capabilityV3 = {
          enabled: false,
          version: 'v3.2.5',
          archiver_url: archiverUrl + '/v3'
        }
        beforeEach(() => {
          service.initialize(serverUrl, [capabilityV1, capabilityV3, capabilityV2])
        })
        it('is announcing itself as available', () => {
          expect(service.available).toBe(true)
        })
        it('uses the highest major version', () => {
          expect(service.url).toBe(capabilityV2.archiver_url)
        })
      })
    })
  })
})
