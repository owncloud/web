import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import rename from '@files/src/mixins/actions/rename.js'
import { createLocationSpaces } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

const currentFolder = {
  id: 1,
  path: '/folder',
  webDavPath: '/files/admin/folder'
}

const Component = {
  render() {},
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
        const wrapper = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_rename_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })

  describe('method "$_rename_trigger"', () => {
    it('should trigger the rename modal window', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      const resources = [currentFolder]
      await wrapper.vm.$_rename_trigger({ resources })
      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_rename_checkNewName"', () => {
    it('should not show an error with a valid name', () => {
      const wrapper = getWrapper()
      const spyErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      wrapper.vm.$_rename_checkNewName('currentName', 'newName')
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
        parentResources: [{ name: 'newname' }],
        message: 'The name "%{name}" is already taken'
      }
    ])('should detect name errors and display error messages accordingly', (inputData) => {
      const wrapper = getWrapper()
      const spyGetTextStub = jest.spyOn(wrapper.vm, '$gettext')
      wrapper.vm.$_rename_checkNewName(
        inputData.currentName,
        inputData.newName,
        inputData.parentResources
      )
      expect(spyGetTextStub).toHaveBeenCalledWith(inputData.message)
    })
  })

  describe('method "$_rename_renameResource"', () => {
    it('should call the rename action on a resource in the file list', async () => {
      const promise = new Promise((resolve) => {
        resolve()
      })

      const wrapper = getWrapper(promise)
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const resource = { id: 2, path: '/folder', webDavPath: '/files/admin/folder' }
      wrapper.vm.$_rename_renameResource(resource, 'new name')
      await wrapper.vm.$nextTick()

      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(0)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should call the rename action on the current folder', async () => {
      const promise = new Promise((resolve) => {
        resolve()
      })

      const wrapper = getWrapper(promise)
      const spyHideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      wrapper.vm.$_rename_renameResource(currentFolder, 'new name')
      await wrapper.vm.$nextTick()
      // fixme: why wrapper.vm.$router.length?
      // expect(wrapper.vm.$router.length).toBeGreaterThanOrEqual(1)
      expect(spyHideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should handle errors properly', async () => {
      const promise = new Promise((resolve, reject) => {
        reject(new Error())
      })

      const wrapper = getWrapper(promise)
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

function getWrapper(renameFilePromise) {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: createLocationSpaces('files-spaces-personal-home'),
        resolve: (r) => {
          return { href: r.name }
        }
      },
      $client: { files: { find: jest.fn(() => [{ name: 'file1' }]), list: jest.fn(() => []) } },
      $gettextInterpolate: jest.fn(),
      $gettext: jest.fn(),
      publicPage: () => false,
      flatFileList: false
    },
    store: createStore(Vuex.Store, {
      modules: {
        Files: {
          namespaced: true,
          getters: {
            currentFolder: () => currentFolder,
            files: () => [{ name: 'file1' }]
          },
          actions: {
            renameFile: jest.fn(() => {
              return renameFilePromise
            })
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
