import { defaultPlugins, shallowMount } from 'web-test-helpers'
import EmbedActions from '../../../../src/components/EmbedActions/EmbedActions.vue'
import { FileAction, useEmbedMode, useFileActionsCreateLink } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'
import { ref } from 'vue'
import { Resource } from '@ownclouders/web-client'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useFileActionsCreateLink: vi.fn(),
  useEmbedMode: vi.fn()
}))

const selectors = Object.freeze({
  btnSelect: '[data-testid="button-select"]',
  btnCancel: '[data-testid="button-cancel"]',
  btnShare: '[data-testid="button-share"]'
})

describe('EmbedActions', () => {
  describe('select action', () => {
    it('should hide select action when embedTarget is set to file', () => {
      const { wrapper } = getWrapper({ isFilePicker: true })

      expect(wrapper.find(selectors.btnSelect).exists()).toBe(false)
    })
    it('should disable select action when no resources are selected', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.find(selectors.btnSelect).attributes()).toHaveProperty('disabled')
    })

    it('should enable select action when at least one resource is selected', () => {
      const { wrapper } = getWrapper({ selectedIds: ['1'] })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event when the select action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({ selectedIds: ['1'] })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:select', [{ id: '1' }])
    })

    it('should enable select action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({ isLocationPicker: true })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event with currentFolder as selected resource when select action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({
        currentFolder: { id: '1' } as Resource,
        isLocationPicker: true
      })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:select', [{ id: '1' }])
    })
  })

  describe('cancel action', () => {
    it('should emit cancel event when the cancel action is triggered', async () => {
      const { wrapper, mocks } = getWrapper({ selectedIds: ['1'] })

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
        selectedIds: ['1'],
        createLinksActionEnabled: false
      })
      expect(wrapper.find(selectors.btnShare).attributes()).toHaveProperty('disabled')
    })

    it('should enable share action when at least one resource is selected and link creation is enabled', () => {
      const { wrapper } = getWrapper({ selectedIds: ['1'] })
      expect(wrapper.find(selectors.btnShare).attributes()).not.toHaveProperty('disabled')
    })

    it('should hide share action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({ isLocationPicker: true })

      expect(wrapper.find(selectors.btnShare).exists()).toBe(false)
    })

    it('should hide share action when embedTarget is set to file', () => {
      const { wrapper } = getWrapper({ isFilePicker: true })

      expect(wrapper.find(selectors.btnShare).exists()).toBe(false)
    })

    it('should call the handler of the "Create Link"-action', async () => {
      const { wrapper, mocks } = getWrapper({ selectedIds: ['1'] })
      await wrapper.find(selectors.btnShare).trigger('click')
      expect(mocks.createLinkHandlerMock).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(
  {
    selectedIds = [],
    currentFolder = undefined,
    createLinksActionEnabled = true,
    isLocationPicker = false,
    isFilePicker = false
  }: {
    selectedIds?: string[]
    currentFolder?: Resource
    createLinksActionEnabled?: boolean
    isLocationPicker?: boolean
    isFilePicker?: boolean
  } = {
    selectedIds: []
  }
) {
  const postMessageMock = vi.fn()
  vi.mocked(useEmbedMode).mockReturnValue(
    mock<ReturnType<typeof useEmbedMode>>({
      isLocationPicker: ref(isLocationPicker),
      isFilePicker: ref(isFilePicker),
      postMessage: postMessageMock
    })
  )

  const createLinkHandlerMock = vi.fn()
  vi.mocked(useFileActionsCreateLink).mockReturnValue(
    mock<ReturnType<typeof useFileActionsCreateLink>>({
      actions: ref([
        mock<FileAction>({
          isVisible: () => createLinksActionEnabled,
          handler: createLinkHandlerMock
        })
      ])
    })
  )

  const resources = selectedIds.map((id) => ({ id })) as Resource[]

  return {
    mocks: { createLinkHandlerMock, postMessageMock },
    wrapper: shallowMount(EmbedActions, {
      global: {
        stubs: { OcButton: false },
        plugins: [
          ...defaultPlugins({
            piniaOptions: { resourcesStore: { currentFolder, selectedIds, resources } }
          })
        ]
      }
    })
  }
}
