import { archiverService, ArchiverService } from '../../../src/services'
import { RuntimeError } from 'web-runtime/src/container/error'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'

const getClientServiceMock = () => {
  const clientServiceMock = mockDeep<ClientService>()
  clientServiceMock.httpUnAuthenticated.get.mockResolvedValue({
    data: new ArrayBuffer(8),
    headers: { 'content-disposition': 'filename="download.tar"' }
  })
  clientServiceMock.owncloudSdk.signUrl.mockImplementation((url) => url)
  return clientServiceMock
}

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
        await expect(
          archiverService.triggerDownload({ clientService: getClientServiceMock() })
        ).rejects.toThrow(new RuntimeError('no archiver available'))
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
        it('does not trigger downloads', async () => {
          await expect(
            service.triggerDownload({ clientService: getClientServiceMock() })
          ).rejects.toThrow(new RuntimeError('no archiver available'))
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
          window.URL.createObjectURL = jest.fn()

          const fileId = 'asdf'
          const clientService = getClientServiceMock()
          const url = await service.triggerDownload({ fileIds: [fileId], clientService })
          expect(window.URL.createObjectURL).toHaveBeenCalled()
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
          window.URL.createObjectURL = jest.fn()
          const dir = '/some/path'
          const fileName = 'qwer'
          const clientService = getClientServiceMock()
          const url = await service.triggerDownload({ dir, files: [fileName], clientService })

          expect(window.URL.createObjectURL).toHaveBeenCalled()
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
          const clientService = getClientServiceMock()
          const downloadUrl = await service.triggerDownload({ fileIds: ['any'], clientService })
          expect(downloadUrl.startsWith(capabilityV2.archiver_url)).toBeTruthy()
        })
      })
    })
  })
})
