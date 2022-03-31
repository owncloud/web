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
      it('does not trigger downloads', async () => {
        await expect(archiverService.triggerDownload({})).rejects.toThrow(
          new RuntimeError('no archiver available')
        )
      })
    })
    describe('when initialized', () => {
      const serverUrl = 'https://demo.owncloud.com'
      const clientServiceMock = {
        owncloudSdk: {
          signUrl: (url) => url
        }
      }
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
        it('does not trigger downloads', async () => {
          await expect(service.triggerDownload({})).rejects.toThrow(
            new RuntimeError('no archiver available')
          )
        })
      })
      describe('with one v2 archiver capability', () => {
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
        it('is announcing itself as supporting fileIds', () => {
          expect(service.fileIdsSupported).toBe(true)
        })
        it('fails to trigger a download if no files were given', async () => {
          await expect(service.triggerDownload({})).rejects.toThrow(
            new RuntimeError('requested archive with empty list of resources')
          )
        })
        it('returns a download url for a valid archive download trigger', async () => {
          const fileId = 'asdf'
          const url = await service.triggerDownload({
            fileIds: [fileId],
            clientService: clientServiceMock
          })
          expect(url.startsWith(archiverUrl)).toBeTruthy()
          expect(url.indexOf(`id=${fileId}`)).toBeGreaterThan(-1)
        })
      })
      describe('with one v1 archiver capability', () => {
        const archiverUrl = [serverUrl, 'archiver'].join('/')
        const capability = {
          enabled: true,
          version: 'v1.2.3',
          archiver_url: archiverUrl
        }
        beforeEach(() => {
          service.initialize(serverUrl, [capability])
        })
        it('is announcing itself as available', () => {
          expect(service.available).toBe(true)
        })
        it('is announcing itself as not supporting fileIds', () => {
          expect(service.fileIdsSupported).toBe(false)
        })
        it('fails to trigger a download if no files were given', async () => {
          await expect(service.triggerDownload({})).rejects.toThrow(
            new RuntimeError('requested archive with empty list of resources')
          )
        })
        it('returns a download url for a valid archive download trigger', async () => {
          const dir = '/some/path'
          const fileName = 'qwer'
          const url = await service.triggerDownload({
            dir,
            files: [fileName],
            clientService: clientServiceMock
          })
          expect(url.startsWith(archiverUrl)).toBeTruthy()
          expect(url.indexOf(`files[]=${fileName}`)).toBeGreaterThan(-1)
          expect(url.indexOf(`dir=${encodeURIComponent(dir)}`)).toBeGreaterThan(-1)
          expect(url.indexOf('downloadStartSecret=')).toBeGreaterThan(-1)
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
        it('uses the highest major version', async () => {
          const downloadUrl = await service.triggerDownload({
            fileIds: ['any'],
            clientService: clientServiceMock
          })
          expect(downloadUrl.startsWith(capabilityV2.archiver_url)).toBeTruthy()
        })
      })
    })
  })
})
