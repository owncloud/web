import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import Vuex from 'vuex'
import getters from '../../src/store/getters'
import stubs from '../../../../tests/unit/stubs'
import BatchActions from '../../src/components/BatchActions.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)

const selectedFiles = ['lorem.txt', 'owncloud.png']
const componentStubs = { ...stubs, translate: true }
const elSelector = {
  copyButton: '#copy-selected-btn',
  moveButton: '#move-selected-btn',
  deleteButton: '#delete-selected-btn',
  restoreButton: 'button.oc-button-primary'
}

describe('Batch Actions component', () => {
  const mountOptions = {
    localVue
  }

  describe('files page', () => {
    const $route = {
      name: 'files-personal'
    }

    describe('when no items are selected for batch action', () => {
      const options = {
        ...mountOptions,
        mocks: {
          $route: {
            ...$route,
            meta: {
              hasBulkActions: false
            }
          }
        }
      }

      it('should not display action buttons', () => {
        const wrapper = shallowMount(BatchActions, options)
        const actionButtons = wrapper.findAll('oc-grid-stub oc-button-stub')

        expect(actionButtons.length).toEqual(0)
        expect(wrapper.exists()).toBeTruthy()
      })
    })

    describe('when items are selected for batch action', () => {
      const store = createStore({ selected: selectedFiles })

      const options = {
        ...mountOptions,
        stubs: { ...componentStubs, 'oc-button': false },
        store,
        mocks: {
          $route: {
            ...$route,
            meta: {
              hasBulkActions: true
            }
          }
        }
      }

      let wrapper
      let copyButton
      let moveButton
      let deleteButton
      beforeEach(async () => {
        BatchActions.computed.canMove = jest.fn(() => true)
        wrapper = mount(BatchActions, options)
        wrapper.vm.triggerLocationPicker = jest.fn()
        wrapper.vm.$_deleteResources_displayDialog = jest.fn()
        await wrapper.vm.$forceUpdate()

        copyButton = wrapper.find(elSelector.copyButton)
        moveButton = wrapper.find(elSelector.moveButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      it('should display the action buttons', () => {
        const actionButtons = wrapper.findAll('oc-grid-stub button')

        expect(actionButtons.length).toEqual(3)
        expect(copyButton.text()).toEqual('Copy')
        expect(moveButton.text()).toEqual('Move')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('does copy action on copy button click', async () => {
        await copyButton.trigger('click')

        expect(wrapper.vm.triggerLocationPicker).toHaveBeenCalledWith('copy')
      })

      it('does move action on move button click', async () => {
        await moveButton.trigger('click')

        expect(wrapper.vm.triggerLocationPicker).toHaveBeenCalledWith('move')
      })

      it('does delete action on delete button click', async () => {
        await deleteButton.trigger('click')

        expect(wrapper.vm.$_deleteResources_displayDialog).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('trashbin page', () => {
    const $route = {
      name: 'files-trashbin'
    }

    let wrapper
    let restoreButton
    let emptyTrashButton
    let deleteButton

    describe('when no items are selected for batch action', () => {
      const store = createStore({ selected: [] })
      const options = {
        ...mountOptions,
        stubs: { ...componentStubs, 'oc-button': false },
        store,
        mocks: {
          $route: {
            ...$route,
            meta: {
              hasBulkActions: false
            }
          }
        }
      }

      beforeEach(async () => {
        BatchActions.computed.isEmpty = jest.fn(() => false)
        wrapper = mount(BatchActions, options)
        wrapper.vm.emptyTrashbin = jest.fn()
        await wrapper.vm.$forceUpdate()

        restoreButton = wrapper.find(elSelector.restoreButton)
        emptyTrashButton = wrapper.find(elSelector.deleteButton)
      })

      it('should not display restore button', () => {
        expect(restoreButton.exists()).toBeFalsy()
      })

      it('should display empty trashbin button', () => {
        expect(emptyTrashButton.exists()).toBeTruthy()
        expect(emptyTrashButton.text()).toEqual('Empty trash bin')
      })

      it('does empty trashbin on emptyTrashbin button click', async () => {
        await emptyTrashButton.trigger('click')

        expect(wrapper.vm.emptyTrashbin).toHaveBeenCalledTimes(1)
      })
    })

    describe('when items are selected for batch action', () => {
      const store = createStore({ selected: selectedFiles })

      const options = {
        ...mountOptions,
        stubs: { ...componentStubs, 'oc-button': false },
        store,
        mocks: {
          $route: {
            ...$route,
            meta: {
              hasBulkActions: false
            }
          }
        }
      }

      beforeEach(async () => {
        BatchActions.computed.isEmpty = jest.fn(() => false)
        wrapper = mount(BatchActions, options)
        wrapper.vm.restoreFiles = jest.fn()
        wrapper.vm.emptyTrashbin = jest.fn()
        wrapper.vm.$_deleteResources_displayDialog = jest.fn()
        await wrapper.vm.$forceUpdate()

        restoreButton = wrapper.find(elSelector.restoreButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      it('should display the batch action buttons', () => {
        const actionButtons = wrapper.findAll('button')

        expect(actionButtons.length).toEqual(2)
        expect(restoreButton.text()).toEqual('Restore')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('does restore action on restore button click', async () => {
        await restoreButton.trigger('click')

        expect(wrapper.vm.restoreFiles).toHaveBeenCalledTimes(1)
      })

      it('does delete action on delete button click', async () => {
        await deleteButton.trigger('click')

        expect(wrapper.vm.$_deleteResources_displayDialog).toHaveBeenCalledTimes(1)
      })
    })
  })
})

function createStore(state) {
  return new Vuex.Store({
    modules: {
      Files: {
        state: {
          ...state,
          currentFolder: { path: '' }
        },
        namespaced: true,
        getters
      }
    }
  })
}
