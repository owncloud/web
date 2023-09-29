import GdprExport from 'web-runtime/src/components/Account/GdprExport.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client/src'

const selectors = {
  ocSpinnerStub: 'oc-spinner-stub',
  requestExportBtn: '[data-testid="request-export-btn"]',
  downloadExportBtn: '[data-testid="download-export-btn"]',
  exportInProgress: '[data-testid="export-in-process"]'
}

const downloadFile = jest.fn()
jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useDownloadFile: jest.fn(() => ({ downloadFile }))
}))

describe('GdprExport component', () => {
  it('shows the loading spinner initially', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.ocSpinnerStub).exists()).toBeTruthy()
  })
  it('shows a "in progress"-hint', async () => {
    const { wrapper } = getWrapper(mock<Resource>({ processing: true }))
    await wrapper.vm.loadExportTask.last
    expect(wrapper.find(selectors.exportInProgress).exists()).toBeTruthy()
  })
  describe('request button', () => {
    it('shows if no export is being processed', async () => {
      const { wrapper } = getWrapper(mock<Resource>({ processing: false }))
      await wrapper.vm.loadExportTask.last
      expect(wrapper.find(selectors.requestExportBtn).exists()).toBeTruthy()
    })
    it('does not show when an export is being processed', async () => {
      const { wrapper } = getWrapper(mock<Resource>({ processing: true }))
      await wrapper.vm.loadExportTask.last
      expect(wrapper.find(selectors.requestExportBtn).exists()).toBeFalsy()
    })
    it('triggers the export when being clicked', async () => {
      const { wrapper, mocks } = getWrapper(mock<Resource>({ processing: false }))
      await wrapper.vm.loadExportTask.last
      await wrapper.find(selectors.requestExportBtn).trigger('click')
      expect(mocks.$clientService.graphAuthenticated.users.exportPersonalData).toHaveBeenCalled()
    })
  })
  describe('download button', () => {
    it('shows if a gdpr export exists', async () => {
      const { wrapper } = getWrapper(mock<Resource>({ processing: false }))
      await wrapper.vm.loadExportTask.last
      expect(wrapper.find(selectors.downloadExportBtn).exists()).toBeTruthy()
    })
    it('does not show if no export exists', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadExportTask.last
      expect(wrapper.find(selectors.downloadExportBtn).exists()).toBeFalsy()
    })
    it('triggers the download when being clicked', async () => {
      const { wrapper } = getWrapper(mock<Resource>({ processing: false }))
      await wrapper.vm.loadExportTask.last
      await wrapper.find(selectors.downloadExportBtn).trigger('click')
      expect(downloadFile).toHaveBeenCalled()
    })
  })
})

function getWrapper(resource = undefined) {
  const clientService = mockDeep<ClientService>()
  if (resource) {
    clientService.webdav.getFileInfo.mockResolvedValue(resource)
  } else {
    clientService.webdav.getFileInfo.mockRejectedValue({ statusCode: 404 })
  }
  const mocks = defaultComponentMocks()
  mocks.$clientService = clientService
  const store = createStore(defaultStoreMockOptions)
  return {
    mocks,
    wrapper: shallowMount(GdprExport, {
      global: {
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
