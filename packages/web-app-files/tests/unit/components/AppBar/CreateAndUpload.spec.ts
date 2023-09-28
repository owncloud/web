import CreateAndUpload from 'web-app-files/src/components/AppBar/CreateAndUpload.vue'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { Drive } from 'web-client/src/generated'
import { useRequest } from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'
import { RouteLocation } from 'vue-router'
import { useExtensionRegistry } from '@ownclouders/web-pkg'
import { useExtensionRegistryMock } from 'web-test-helpers/src/mocks/useExtensionRegistryMock'

jest.mock('@ownclouders/web-pkg')

const elSelector = {
  component: '#create-and-upload-actions',
  newFileButton: '#new-file-menu-btn',
  uploadBtn: '#upload-menu-btn',
  resourceUpload: 'resource-upload-stub',
  newFolderBtn: '#new-folder-btn',
  clipboardBtns: '#clipboard-btns',
  pasteFilesBtn: '.paste-files-btn',
  clearClipboardBtn: '.clear-clipboard-btn'
}

const fileHandlerMocks = [
  {
    ext: 'txt',
    action: {
      app: 'text-editor',
      extension: 'txt'
    },
    menuTitle: () => 'Plain text file'
  },
  {
    ext: 'md',
    action: {
      app: 'text-editor',
      extension: 'md'
    },
    menuTitle: () => 'Mark-down file'
  },
  {
    ext: 'drawio',
    action: {
      app: 'draw-io',
      routeName: 'draw-io-edit',
      extension: 'drawio'
    },
    menuTitle: () => 'Draw.io document'
  }
]

describe('CreateAndUpload component', () => {
  describe('action buttons', () => {
    it('should show and be enabled if file creation is possible', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findComponent<any>(elSelector.uploadBtn).props().disabled).toBeFalsy()
      expect(wrapper.findComponent<any>(elSelector.newFolderBtn).props().disabled).toBeFalsy()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('should be disabled if file creation is not possible', () => {
      const currentFolder = mock<Resource>({ canUpload: () => false })
      const { wrapper } = getWrapper({ currentFolder })
      expect(wrapper.findComponent<any>(elSelector.uploadBtn).props().disabled).toBeTruthy()
      expect(wrapper.findComponent<any>(elSelector.newFolderBtn).props().disabled).toBeTruthy()
    })
    it('should not be visible if file creation is not possible on a public page', () => {
      const currentFolder = mock<Resource>({ canUpload: () => false })
      const { wrapper } = getWrapper({ currentFolder, currentRouteName: 'files-public-link' })
      expect(wrapper.find(elSelector.component).exists()).toBeFalsy()
    })
  })
  describe('file handlers', () => {
    it('should always show for uploading files and folders', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll(elSelector.resourceUpload).length).toBe(2)
    })
    it('should show additional handlers', () => {
      const { wrapper } = getWrapper({ newFileHandlers: fileHandlerMocks })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('clipboard buttons', () => {
    it('should show if clipboard is empty', () => {
      const { wrapper } = getWrapper()
      expect(
        wrapper.findComponent<any>(`${elSelector.clipboardBtns} oc-button-stub`).exists()
      ).toBeFalsy()
    })
    it('should show if clipboard is not empty', () => {
      const { wrapper } = getWrapper({ clipboardResources: [mock<Resource>()] })
      expect(wrapper.findAll(`${elSelector.clipboardBtns} .oc-button`).length).toBe(2)
    })
    it('call the "paste files"-action', async () => {
      const { wrapper, storeOptions } = getWrapper({
        clipboardResources: [
          mock<Resource>({
            shareRoot: undefined
          })
        ]
      })
      await wrapper.find(elSelector.pasteFilesBtn).trigger('click')
      expect(storeOptions.modules.Files.actions.pasteSelectedFiles).toHaveBeenCalled()
    })
    it('call "clear clipboard"-action', async () => {
      const { wrapper, storeOptions } = getWrapper({ clipboardResources: [mock<Resource>()] })
      await wrapper.find(elSelector.clearClipboardBtn).trigger('click')
      expect(storeOptions.modules.Files.actions.clearClipboardFiles).toHaveBeenCalled()
    })
  })
  describe('method "onUploadComplete"', () => {
    it.each([
      { driveType: 'personal', updated: 1 },
      { driveType: 'project', updated: 1 },
      { driveType: 'share', updated: 0 },
      { driveType: 'public', updated: 0 }
    ])('updates the space quota for supported drive types: %s', async ({ driveType, updated }) => {
      const file = mock<UppyResource>({ meta: { driveType, spaceId: '1' } })
      const spaces = [
        mock<SpaceResource>({ id: file.meta.spaceId, isOwner: () => driveType === 'personal' })
      ]
      const { wrapper, mocks, storeOptions } = getWrapper({ spaces })
      const graphMock = mocks.$clientService.graphAuthenticated
      graphMock.drives.getDrive.mockResolvedValue(mock<Drive>() as any)
      await wrapper.vm.onUploadComplete({ successful: [file] })
      expect(
        storeOptions.modules.runtime.modules.spaces.mutations.UPDATE_SPACE_FIELD
      ).toHaveBeenCalledTimes(updated)
    })
    it('reloads the file list if files were uploaded to the current path', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      const itemId = 'itemId'
      const space = mock<SpaceResource>({ id: '1' })
      const { wrapper, mocks } = getWrapper({ itemId, space })
      const file = mock<UppyResource>({
        meta: { driveType: 'project', spaceId: space.id, currentFolderId: itemId }
      })
      const graphMock = mocks.$clientService.graphAuthenticated
      graphMock.drives.getDrive.mockResolvedValue(mock<Drive>() as any)
      await wrapper.vm.onUploadComplete({ successful: [file] })
      expect(eventSpy).toHaveBeenCalled()
    })
  })
  describe('drop target', () => {
    it('is being initialized when user can upload', () => {
      const { mocks } = getWrapper()
      expect(mocks.$uppyService.useDropTarget).toHaveBeenCalled()
    })
    it('is not being initialized when user can not upload', () => {
      const currentFolder = mock<Resource>({ canUpload: () => false })
      const { mocks } = getWrapper({ currentFolder })
      expect(mocks.$uppyService.useDropTarget).not.toHaveBeenCalled()
    })
  })
})

function getWrapper({
  newFileHandlers = [],
  clipboardResources = [],
  files = [],
  currentFolder = mock<Resource>({ canUpload: () => true }),
  currentRouteName = 'files-spaces-generic',
  space = mock<SpaceResource>(),
  spaces = [],
  item = undefined,
  itemId = undefined,
  newFileAction = false
} = {}) {
  jest.mocked(useRequest).mockImplementation(() => ({
    makeRequest: jest.fn().mockResolvedValue({ status: 200 })
  }))
  jest.mocked(useExtensionRegistry).mockImplementation(() => useExtensionRegistryMock())

  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      newFileHandlers: () => newFileHandlers,
      user: () => ({ id: '1' }),
      capabilities: () => ({
        spaces: { enabled: true },
        files: { app_providers: [{ new_url: '/' }] }
      })
    }
  }
  storeOptions.getters.apps.mockImplementation(() => ({
    fileEditors: []
  }))
  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => currentFolder)
  storeOptions.modules.Files.getters.clipboardResources.mockImplementation(() => clipboardResources)
  storeOptions.modules.runtime.modules.spaces.getters.spaces.mockReturnValue(spaces)
  storeOptions.modules.Files.getters.files.mockImplementation(() => files)
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: currentRouteName }) })
  }
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(CreateAndUpload as any, {
      data: () => ({ newFileAction }),
      props: { space: space as any, item, itemId },
      global: {
        stubs: { OcButton: false },
        renderStubDefaultSlot: true,
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
