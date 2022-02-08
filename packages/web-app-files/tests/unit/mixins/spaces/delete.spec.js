import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Delete from '@files/src/mixins/spaces/actions/delete.js'
import { createLocationSpaces } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('delete', () => {
  const Component = {
    render() {},
    mixins: [Delete]
  }

  function getWrapper(deleteSpacePromise) {
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
            deleteDrive: jest.fn(() => {
              return deleteSpacePromise
            })
          }
        },
        $gettext: jest.fn()
      },
      store: createStore(Vuex.Store, {
        actions: {
          createModal: jest.fn(),
          hideModal: jest.fn(),
          showMessage: jest.fn()
        }
      })
    })
  }

  describe('method "$_delete_trigger"', () => {
    it('should trigger the delete modal window', async () => {
      const deletePromise = new Promise((resolve) => {
        return resolve()
      })
      const wrapper = getWrapper(deletePromise)
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({ spaces: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_delete_deleteSpace"', () => {
    it('should hide the modal on success', async () => {
      const deletePromise = new Promise((resolve) => {
        return resolve()
      })

      const wrapper = getWrapper(deletePromise)
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_delete_deleteSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      const deletePromise = new Promise((resolve, reject) => {
        return reject(new Error())
      })

      const wrapper = getWrapper(deletePromise)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpace(1)

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})
