import rename from 'web-app-files/src/mixins/actions/rename'
import { mockDeep } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const currentFolder = {
  id: 1,
  path: '/folder'
}

const Component: any = {
  template: '<div></div>',
  mixins: [rename]
}

describe('rename', () => {
  describe('computed property "$_rename_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canRename: () => true }], expectedStatus: true },
        { resources: [{ canRename: () => false }], expectedStatus: false },
        { resources: [{ canRename: () => true }, { canRename: () => true }], expectedStatus: false }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_rename_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })

  describe('method "$_rename_trigger"', () => {
    it('should trigger the rename modal window', async () => {
      const { storeOptions, wrapper } = getWrapper()
      const resources = [currentFolder]
      await wrapper.vm.$_rename_trigger({ resources }, currentFolder.path)
      expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_rename_checkNewName"', () => {
    it('should not show an error if new name not taken', () => {
      const { storeOptions, wrapper } = getWrapper()
      storeOptions.modules.Files.getters.files.mockReturnValue([{ name: 'file1', path: '/file1' }])
      wrapper.vm.$_rename_checkNewName({ name: 'currentName', path: '/currentName' }, 'newName')
      expect(storeOptions.actions.setModalInputErrorMessage).toHaveBeenCalledWith(
        expect.anything(),
        null
      )
    })

    it('should not show an error if new name already exists but in different folder', () => {
      const { storeOptions, wrapper } = getWrapper()
      storeOptions.modules.Files.getters.files.mockReturnValue([{ name: 'file1', path: '/file1' }])
      wrapper.vm.$_rename_checkNewName(
        { name: 'currentName', path: '/favorites/currentName' },
        'file1'
      )
      expect(storeOptions.actions.setModalInputErrorMessage).toHaveBeenCalledWith(
        expect.anything(),
        null
      )
    })

    it.each([
      { currentName: 'currentName', newName: '', message: 'The name cannot be empty' },
      { currentName: 'currentName', newName: 'new/name', message: 'The name cannot contain "/"' },
      { currentName: 'currentName', newName: '.', message: 'The name cannot be equal to "."' },
      { currentName: 'currentName', newName: '..', message: 'The name cannot be equal to ".."' },
      {
        currentName: 'currentName',
        newName: 'newname ',
        message: 'The name cannot end with whitespace'
      },
      {
        currentName: 'currentName',
        newName: 'file1',
        message: 'The name "file1" is already taken'
      },
      {
        currentName: 'currentName',
        newName: 'newname',
        parentResources: [{ name: 'newname', path: '/newname' }],
        message: 'The name "newname" is already taken'
      }
    ])('should detect name errors and display error messages accordingly', (inputData) => {
      const { wrapper } = getWrapper()
      const errorModalSpy = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      wrapper.vm.$_rename_checkNewName(
        { name: inputData.currentName, path: `/${inputData.currentName}` },
        inputData.newName,
        inputData.parentResources
      )
      expect(errorModalSpy).toHaveBeenCalledWith(inputData.message)
    })
  })

  describe('method "$_rename_renameResource"', () => {
    it('should call the rename action on a resource in the file list', async () => {
      const { storeOptions, wrapper } = getWrapper()
      const resource = { id: 2, path: '/folder', webDavPath: '/files/admin/folder' }
      wrapper.vm.$_rename_renameResource(resource, 'new name')
      await wrapper.vm.$nextTick()

      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(0)
      expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
    })

    it('should call the rename action on the current folder', async () => {
      const { storeOptions, wrapper } = getWrapper()
      wrapper.vm.$_rename_renameResource(currentFolder, 'new name')
      await wrapper.vm.$nextTick()
      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(1)
      expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
    })

    it('should handle errors properly', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { mocks, storeOptions, wrapper } = getWrapper()
      mocks.$clientService.webdav.moveFiles.mockRejectedValueOnce(new Error())

      wrapper.vm.$_rename_renameResource(currentFolder, 'new name')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(0)
      expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>({
      webDavPath: 'irrelevant'
    })
  }

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: mount(Component, {
      global: { plugins: [...defaultPlugins(), store], mocks }
    })
  }
}
