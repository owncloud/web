import CreateShortcutModal from '../../../src/components/CreateShortcutModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mockAxiosReject,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'
import { SpaceResource } from '@ownclouders/web-client'
import { mock, mockDeep } from 'jest-mock-extended'
import { FileResource } from '@ownclouders/web-client/src/helpers'
import { SearchResource } from '@ownclouders/web-client/src/webdav/search'
import { ConfigurationManager } from '../../../src'
import { useMessages } from '../../../src/composables/piniaStores'

jest.mock('../../../src/composables/configuration/useConfigurationManager', () => ({
  useConfigurationManager: () =>
    mockDeep<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: false
        }
      }
    })
}))

describe('CreateShortcutModal', () => {
  describe('method "onConfirm"', () => {
    it('should show message on success', async () => {
      const { wrapper, storeOptions } = getWrapper()
      await wrapper.vm.onConfirm('https://owncloud.com', 'owncloud.url')
      expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).toHaveBeenCalled()
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('should show error message on fail', async () => {
      console.error = jest.fn()
      const { wrapper, storeOptions } = getWrapper({ rejectPutFileContents: true })
      await wrapper.vm.onConfirm('https://owncloud.com', 'owncloud.url')
      expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).not.toHaveBeenCalled()
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })
  describe('method "searchTask"', () => {
    it('should set "searchResult" correctly', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.searchTask.perform('new file')
      expect(wrapper.vm.searchResult.values.length).toBe(3)
    })
    it('should reset "searchResult" on error', async () => {
      console.error = jest.fn()
      const { wrapper } = getWrapper({ rejectSearch: true })
      await wrapper.vm.searchTask.perform('new folder')
      expect(wrapper.vm.searchResult).toBe(null)
    })
  })
})

function getWrapper({ rejectPutFileContents = false, rejectSearch = false } = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }

  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => mock<FileResource>())

  const store = createStore(storeOptions)

  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    })
  }

  if (rejectPutFileContents) {
    mocks.$clientService.webdav.putFileContents.mockRejectedValue(() => mockAxiosReject())
  } else {
    mocks.$clientService.webdav.putFileContents.mockResolvedValue(mock<FileResource>())
  }

  if (rejectSearch) {
    mocks.$clientService.webdav.search.mockRejectedValue(() => mockAxiosReject())
  } else {
    mocks.$clientService.webdav.search.mockResolvedValue({
      resources: [
        mock<SearchResource>({ name: 'New File' }),
        mock<SearchResource>({ name: 'New File (1)' }),
        mock<SearchResource>({ name: 'New Folder' })
      ],
      totalResults: 3
    })
  }

  return {
    mocks,
    storeOptions,
    wrapper: shallowMount(CreateShortcutModal, {
      props: {
        space: mock<SpaceResource>()
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
