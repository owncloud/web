import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import EmbedActions from 'web-app-files/src/components/EmbedActions/EmbedActions.vue'
import { FileAction, useEmbedMode, useFileActionsCreateLink } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'
import { ref } from 'vue'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useFileActionsCreateLink: jest.fn(),
  useEmbedMode: jest.fn()
}))

const selectors = Object.freeze({
  btnSelect: '[data-testid="button-select"]',
  btnCancel: '[data-testid="button-cancel"]',
  btnShare: '[data-testid="button-share"]'
})

describe('EmbedActions', () => {
  describe('select action', () => {
    it('should disable select action when no resources are selected', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.find(selectors.btnSelect).attributes()).toHaveProperty('disabled')
    })

    it('should enable select action when at least one resource is selected', () => {
      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event when the select action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:select', [{ id: 1 }])
    })

    it('should enable select action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({ isLocationPicker: true })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event with currentFolder as selected resource when select action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({
        currentFolder: { id: 1 },
        isLocationPicker: true
      })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:select', [{ id: 1 }])
    })
  })

  describe('cancel action', () => {
    it('should emit cancel event when the cancel action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnCancel).trigger('click')

      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:cancel', null)
    })
  })

  describe('share action', () => {
    it('should disable share action when no resources are selected', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.find(selectors.btnShare).attributes()).toHaveProperty('disabled')
    })

    it('should disable share action when the "Create Link"-action is disabled', () => {
      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        createLinksActionEnabled: false
      })
      expect(wrapper.find(selectors.btnShare).attributes()).toHaveProperty('disabled')
    })

    it('should enable share action when at least one resource is selected and link creation is enabled', () => {
      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })
      expect(wrapper.find(selectors.btnShare).attributes()).not.toHaveProperty('disabled')
    })

    it('should hide share action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({ isLocationPicker: true })

      expect(wrapper.find(selectors.btnShare).exists()).toBe(false)
    })

    it('should call the handler of the "Create Link"-action', async () => {
      const { wrapper, mocks } = getWrapper({ selectedFiles: [{ id: 1 }] })
      await wrapper.find(selectors.btnShare).trigger('click')
      expect(mocks.createLinkHandlerMock).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(
  {
    selectedFiles = [],
    capabilities = jest.fn().mockReturnValue({}),
    currentFolder = {},
    createLinksActionEnabled = true,
    isLocationPicker = false
  } = {
    selectedFiles: [],
    capabilities: jest.fn().mockReturnValue({})
  }
) {
  const postMessageMock = jest.fn()
  jest.mocked(useEmbedMode).mockReturnValue(
    mock<ReturnType<typeof useEmbedMode>>({
      isLocationPicker: ref(isLocationPicker),
      postMessage: postMessageMock
    })
  )

  const createLinkHandlerMock = jest.fn()
  jest.mocked(useFileActionsCreateLink).mockReturnValue(
    mock<ReturnType<typeof useFileActionsCreateLink>>({
      actions: ref([
        mock<FileAction>({
          isEnabled: () => createLinksActionEnabled,
          handler: createLinkHandlerMock
        })
      ])
    })
  )

  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      capabilities
    },
    modules: {
      ...defaultStoreMockOptions.modules,
      Files: {
        ...defaultStoreMockOptions.modules.Files,
        getters: {
          ...defaultStoreMockOptions.modules.Files.getters,
          selectedFiles: jest.fn().mockReturnValue(selectedFiles),
          currentFolder: jest.fn().mockReturnValue(currentFolder)
        }
      }
    }
  }

  return {
    mocks: { createLinkHandlerMock, postMessageMock },
    wrapper: shallowMount(EmbedActions, {
      global: {
        stubs: { OcButton: false },
        plugins: [...defaultPlugins(), createStore(storeOptions)]
      }
    })
  }
}
