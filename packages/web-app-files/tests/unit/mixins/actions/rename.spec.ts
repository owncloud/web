import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import rename from 'files/src/mixins/actions/rename'
import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import { SpaceResource } from 'web-client/src/helpers'
import Router, { RawLocation, Route } from 'vue-router'

const localVue = createLocalVue()
localVue.use(Vuex)

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
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      const resources = [currentFolder]
      await wrapper.vm.$_rename_trigger({ resources }, currentFolder.path)
      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_rename_checkNewName"', () => {
    it('should not show an error with a valid name', () => {
      const { wrapper } = getWrapper()
      const spyErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      wrapper.vm.$_rename_checkNewName({ name: 'currentName', path: '/currentName' }, 'newName')
      expect(spyErrorMessageStub).toHaveBeenCalledWith(null)
    })

    it('should not show an error if resource name already exists but in different folder', () => {
      const { wrapper } = getWrapper()
      const spyErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      wrapper.vm.$_rename_checkNewName(
        { name: 'currentName', path: '/favorites/currentName' },
        'file1'
      )
      expect(spyErrorMessageStub).toHaveBeenCalledWith(null)
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
        message: 'The name "%{name}" is already taken'
      },
      {
        currentName: 'currentName',
        newName: 'newname',
        parentResources: [{ name: 'newname', path: '/newname' }],
        message: 'The name "%{name}" is already taken'
      }
    ])('should detect name errors and display error messages accordingly', (inputData) => {
      const { wrapper } = getWrapper()
      const spyGetTextStub = jest.spyOn(wrapper.vm, '$gettext')
      wrapper.vm.$_rename_checkNewName(
        { name: inputData.currentName, path: `/${inputData.currentName}` },
        inputData.newName,
        inputData.parentResources
      )
      expect(spyGetTextStub).toHaveBeenCalledWith(inputData.message)
    })
  })

  describe('method "$_rename_renameResource"', () => {
    it('should call the rename action on a resource in the file list', async () => {
      const { wrapper } = getWrapper()
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const resource = { id: 2, path: '/folder', webDavPath: '/files/admin/folder' }
      wrapper.vm.$_rename_renameResource(resource, 'new name')
      await wrapper.vm.$nextTick()

      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(0)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should call the rename action on the current folder', async () => {
      const { wrapper } = getWrapper()
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      wrapper.vm.$_rename_renameResource(currentFolder, 'new name')
      await wrapper.vm.$nextTick()
      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(1)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should handle errors properly', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { mocks, wrapper } = getWrapper()
      mocks.$clientService.webdav.moveFiles.mockRejectedValueOnce(new Error())

      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const spyShowMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      wrapper.vm.$_rename_renameResource(currentFolder, 'new name')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(spyHideModalStub).toHaveBeenCalledTimes(0)
      expect(spyShowMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const mocks = {
    $router: mockDeep<Router>(),
    $route: mock<Route>(),
    $clientService: mockDeep<ClientService>(),
    space: mockDeep<SpaceResource>(),
    $gettextInterpolate: jest.fn(),
    $gettext: jest.fn()
  }

  mocks.$router.resolve.mockImplementation((to: RawLocation) => ({ href: (to as any).name } as any))

  return {
    mocks,
    wrapper: mount(Component, {
      localVue,
      mocks,
      store: createStore(Vuex.Store, {
        getters: {
          capabilities: () => {
            return {}
          }
        },
        modules: {
          Files: {
            namespaced: true,
            getters: {
              currentFolder: () => currentFolder,
              files: () => [{ name: 'file1', path: '/file1' }]
            },
            mutations: {
              RENAME_FILE: jest.fn()
            }
          }
        },
        actions: {
          createModal: jest.fn(),
          hideModal: jest.fn(),
          toggleModalConfirmButton: jest.fn(),
          showMessage: jest.fn(),
          setModalInputErrorMessage: jest.fn()
        }
      })
    })
  }
}
