import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import rename from '@files/src/mixins/spaces/actions/rename.js'
import { createLocationSpaces } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('rename', () => {
  const Component = {
    render() {},
    mixins: [rename]
  }

  function getWrapper(renameSpacePromise) {
    return mount(Component, {
      localVue,
      mocks: {
        $router: {
          currentRoute: createLocationSpaces('files-spaces-projects'),
          resolve: (r) => {
            return { href: r.name }
          }
        },
        graph: {
          drives: {
            updateDrive: jest.fn(() => {
              return renameSpacePromise
            })
          }
        },
        $gettext: jest.fn()
      },
      store: createStore(Vuex.Store, {
        actions: {
          createModal: jest.fn(),
          hideModal: jest.fn(),
          showMessage: jest.fn(),
          setModalInputErrorMessage: jest.fn()
        }
      })
    })
  }

  describe('method "$_rename_trigger"', () => {
    it('should trigger the rename modal window', async () => {
      const renamePromise = new Promise((resolve) => {
        return resolve()
      })
      const wrapper = getWrapper(renamePromise)
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_rename_trigger({ spaces: [{ id: 1, name: 'renamed space' }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_rename_checkName"', () => {
    it('should throw an error with an empty space name', async () => {
      const renamePromise = new Promise((resolve) => {
        return resolve()
      })
      const wrapper = getWrapper(renamePromise)
      const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      await wrapper.vm.$_rename_checkName('')

      expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_rename_renameSpace"', () => {
    it('should hide the modal on success', async () => {
      const renamePromise = new Promise((resolve) => {
        return resolve()
      })

      const wrapper = getWrapper(renamePromise)
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_rename_renameSpace(1, 'renamed space')

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      const renamePromise = new Promise((resolve, reject) => {
        return reject(new Error())
      })

      const wrapper = getWrapper(renamePromise)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_rename_renameSpace(1, 'renamed space')

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
