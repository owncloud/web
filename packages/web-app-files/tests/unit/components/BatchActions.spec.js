import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import Vuex from 'vuex'
import getters from '../../../src/store/getters'
import stubs from '../../../../../tests/unit/stubs'
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
  restoreButton: '#restore-selected-btn'
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

      BatchActions.computed.canMove = jest.fn(() => true)
      const spyTriggerLocationPicker = jest
        .spyOn(BatchActions.methods, 'triggerLocationPicker')
        .mockImplementation()
      const spyDeleteResourcesDisplayDialog = jest
        .spyOn(BatchActions.mixins[1].methods, '$_deleteResources_displayDialog')
        .mockImplementation()

      beforeEach(() => {
        wrapper = mount(BatchActions, options)

        copyButton = wrapper.find(elSelector.copyButton)
        moveButton = wrapper.find(elSelector.moveButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should display the action buttons', () => {
        const actionButtons = wrapper.findAll('oc-grid-stub button')

        expect(actionButtons.length).toEqual(3)
        expect(copyButton.text()).toEqual('Copy')
        expect(moveButton.text()).toEqual('Move')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('should call "triggerLocationPicker" when copy button is clicked', async () => {
        await copyButton.trigger('click')

        expect(spyTriggerLocationPicker).toHaveBeenCalledWith('copy')
      })

      it('should call "triggerLocationPicker" when move button is clicked', async () => {
        await moveButton.trigger('click')

        expect(spyTriggerLocationPicker).toHaveBeenCalledWith('move')
      })

      it('should call "$_deleteResources_displayDialog" when delete button is clicked', async () => {
        await deleteButton.trigger('click')

        expect(spyDeleteResourcesDisplayDialog).toHaveBeenCalledTimes(1)
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

    BatchActions.computed.isEmpty = jest.fn(() => false)
    const spyEmptyTrashbin = jest.spyOn(BatchActions.methods, 'emptyTrashbin').mockImplementation()
    const spyRestoreFiles = jest.spyOn(BatchActions.methods, 'restoreFiles').mockImplementation()
    const spyDeleteResourcesDisplayDialog = jest
      .spyOn(BatchActions.mixins[1].methods, '$_deleteResources_displayDialog')
      .mockImplementation()

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

      beforeEach(() => {
        wrapper = mount(BatchActions, options)

        restoreButton = wrapper.find(elSelector.restoreButton)
        emptyTrashButton = wrapper.find(elSelector.deleteButton)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should not display restore button', () => {
        expect(restoreButton.exists()).toBeFalsy()
      })

      it('should display empty trashbin button', () => {
        expect(emptyTrashButton.exists()).toBeTruthy()
        expect(emptyTrashButton.text()).toEqual('Empty trash bin')
      })

      it('should call "emptyTrashbin" when empty trashbin button is clicked', async () => {
        await emptyTrashButton.trigger('click')

        expect(spyEmptyTrashbin).toHaveBeenCalledTimes(1)
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

      beforeEach(() => {
        wrapper = mount(BatchActions, options)

        restoreButton = wrapper.find(elSelector.restoreButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should display the batch action buttons', () => {
        const actionButtons = wrapper.findAll('button')

        expect(actionButtons.length).toEqual(2)
        expect(restoreButton.exists()).toBeTruthy()
        expect(deleteButton.exists()).toBeTruthy()
        expect(restoreButton.text()).toEqual('Restore')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('should call "restoreFiles" when restore button is clicked', async () => {
        await restoreButton.trigger('click')

        expect(spyRestoreFiles).toHaveBeenCalledTimes(1)
      })

      it('should call "$_deleteResources_displayDialog" when delete button is clicked', async () => {
        await deleteButton.trigger('click')

        expect(spyDeleteResourcesDisplayDialog).toHaveBeenCalledTimes(1)
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
