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
import { mock } from 'jest-mock-extended'
import { FileResource } from '@ownclouders/web-client/src/helpers'

describe('CreateShortcutModal', () => {
  describe('method "createShortcut"', () => {
    it('should show message on success', async () => {
      const { wrapper, storeOptions } = getWrapper()
      await wrapper.vm.createShortcut('https://owncloud.com', 'owncloud.url')
      expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).toHaveBeenCalled()
      expect(storeOptions.actions.showMessage).toHaveBeenCalled()
    })
    it('should show error message on fail', async () => {
      console.error = jest.fn()
      const { wrapper, storeOptions } = getWrapper({ rejectPutFileContents: true })
      await wrapper.vm.createShortcut('https://owncloud.com', 'owncloud.url')
      expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).not.toHaveBeenCalled()
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
    })
  })
})

function getWrapper({ rejectPutFileContents = false } = {}) {
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

  return {
    mocks,
    storeOptions,
    wrapper: shallowMount(CreateShortcutModal, {
      props: {
        cancel: jest.fn(),
        space: mock<SpaceResource>(),
        title: 'Personal quota'
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
