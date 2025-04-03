import { ArchiverService } from '../../../src/services'
import { RuntimeError } from '../../../src/errors'
import { mock, mockDeep } from 'vitest-mock-extended'
import { ClientService } from '../../../src/services'
import { unref, ref, Ref } from 'vue'
import { AxiosResponse } from 'axios'
import { ArchiverCapability } from '@ownclouders/web-client/ocs'
import { createTestingPinia } from '@ownclouders/web-test-helpers'
import { useUserStore } from '../../../src/composables/piniaStores'

const serverUrl = 'https://demo.owncloud.com'
const getArchiverServiceInstance = (capabilities: Ref<ArchiverCapability[]>) => {
  createTestingPinia()
  const userStore = useUserStore()

  const clientServiceMock = mockDeep<ClientService>()
  clientServiceMock.httpUnAuthenticated.get.mockResolvedValue({
    data: new ArrayBuffer(8),
    headers: { 'content-disposition': 'filename="download.tar"' }
  } as unknown as AxiosResponse)
  clientServiceMock.ocsUserContext.signUrl.mockImplementation((url) => Promise.resolve(url))

  Object.defineProperty(window, 'open', {
    value: vi.fn(),
    writable: true
  })

  return new ArchiverService(clientServiceMock, userStore, serverUrl, capabilities)
}

describe('archiver', () => {
  describe('availability', () => {
    it('is unavailable if no version given via capabilities', () => {
      const capabilities = ref([mock<ArchiverCapability>({ version: undefined })])
      expect(unref(getArchiverServiceInstance(capabilities).available)).toBe(false)
    })
    it('is available if a version is given via capabilities', () => {
      const capabilities = ref([mock<ArchiverCapability>({ version: '1' })])
      expect(unref(getArchiverServiceInstance(capabilities).available)).toBe(true)
    })
  })
  it('does not trigger downloads when unavailable', async () => {
    const capabilities = ref([mock<ArchiverCapability>({ version: undefined })])
    const archiverService = getArchiverServiceInstance(capabilities)
    await expect(archiverService.triggerDownload({})).rejects.toThrow(
      new RuntimeError('no archiver available')
    )
  })
  describe('with one v2 archiver capability', () => {
    const archiverUrl = [serverUrl, 'archiver'].join('/')
    const capabilities = ref([
      {
        enabled: true,
        version: 'v2.3.5',
        archiver_url: archiverUrl,
        formats: [],
        max_num_files: '42',
        max_size: '1073741824'
      }
    ])

    it('is announcing itself as supporting fileIds', () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      expect(unref(archiverService.fileIdsSupported)).toBe(true)
    })
    it('fails to trigger a download if no files were given', async () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      await expect(archiverService.triggerDownload({})).rejects.toThrow(
        new RuntimeError('requested archive with empty list of resources')
      )
    })
    it('returns a download url for a valid archive download trigger', async () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      const fileId = 'asdf'
      const url = await archiverService.triggerDownload({ fileIds: [fileId] })
      expect(window.open).toHaveBeenCalled()
      expect(url.startsWith(archiverUrl)).toBeTruthy()
      expect(url.indexOf(`id=${fileId}`)).toBeGreaterThan(-1)
    })
  })
  describe('with one v1 archiver capability', () => {
    const archiverUrl = [serverUrl, 'archiver'].join('/')
    const capabilities = ref([
      {
        enabled: true,
        version: 'v1.2.3',
        archiver_url: archiverUrl,
        formats: [],
        max_num_files: '42',
        max_size: '1073741824'
      }
    ])
    it('is announcing itself as not supporting fileIds', () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      expect(unref(archiverService.fileIdsSupported)).toBe(false)
    })
    it('fails to trigger a download if no files were given', async () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      await expect(archiverService.triggerDownload({})).rejects.toThrow(
        new RuntimeError('requested archive with empty list of resources')
      )
    })
    it('returns a download url for a valid archive download trigger', async () => {
      const archiverService = getArchiverServiceInstance(capabilities)
      const dir = '/some/path'
      const fileName = 'qwer'
      const url = await archiverService.triggerDownload({ dir, files: [fileName] })

      expect(window.open).toHaveBeenCalled()
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
      archiver_url: archiverUrl + '/v1',
      formats: [],
      max_num_files: '42',
      max_size: '1073741824'
    } as ArchiverCapability
    const capabilityV2 = {
      enabled: true,
      version: 'v2.3.5',
      archiver_url: archiverUrl + '/v2',
      formats: [],
      max_num_files: '42',
      max_size: '1073741824'
    } as ArchiverCapability
    const capabilityV3 = {
      enabled: false,
      version: 'v3.2.5',
      archiver_url: archiverUrl + '/v3',
      formats: [],
      max_num_files: '42',
      max_size: '1073741824'
    } as ArchiverCapability

    it('uses the highest major version', async () => {
      const capabilities = ref([capabilityV1, capabilityV2, capabilityV3])
      const archiverService = getArchiverServiceInstance(capabilities)
      const downloadUrl = await archiverService.triggerDownload({ fileIds: ['any'] })
      expect(downloadUrl.startsWith(capabilityV2.archiver_url)).toBeTruthy()
    })
  })
})
