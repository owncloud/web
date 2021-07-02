import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import stubs from 'tests/unit/stubs'
import BatchActions from '../../../src/components/AppBar/SelectedResources/BatchActions.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const selectedFiles = ['lorem.txt', 'owncloud.png']
const componentStubs = { ...stubs, translate: true }
const elSelector = {
  copyButton: '#copy-selected-btn',
  moveButton: '#move-selected-btn',
  deleteButton: '#delete-selected-btn',
  restoreButton: '#restore-selected-btn',
  ocButton: 'oc-button-stub'
}

describe('Batch Actions component', () => {
  const mountOptions = {
    localVue,
    stubs: componentStubs
  }

  const state = {
    currentFolder: { path: '' }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('files page', () => {
    const $route = {
      name: 'files-personal'
    }

    it('should not display action buttons if no items are selected', () => {
      const store = createStore({ ...state, selected: [] })
      const wrapper = shallowMount(BatchActions, {
        ...mountOptions,
        store,
        mocks: {
          $route: {
            ...$route,
            meta: {
              hasBulkActions: false
            }
          }
        }
      })
      const actionButtons = wrapper.findAll('oc-grid-stub oc-button-stub')

      expect(actionButtons.length).toEqual(0)
      expect(wrapper.exists()).toBeTruthy()
    })

    describe('when items are selected for batch action', () => {
      const store = createStore({ ...state, selected: selectedFiles })

      const options = {
        ...mountOptions,
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
        wrapper = shallowMount(BatchActions, options)

        copyButton = wrapper.find(elSelector.copyButton)
        moveButton = wrapper.find(elSelector.moveButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      it('should display the action buttons', () => {
        const actionButtons = wrapper.findAll(elSelector.ocButton)

        expect(actionButtons.length).toEqual(3)
        expect(copyButton.text()).toEqual('Copy')
        expect(moveButton.text()).toEqual('Move')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('should call "triggerLocationPicker" when copy button is clicked', async () => {
        await copyButton.vm.$emit('click')

        expect(spyTriggerLocationPicker).toHaveBeenCalledWith('copy')
      })

      it('should call "triggerLocationPicker" when move button is clicked', async () => {
        await moveButton.vm.$emit('click')

        expect(spyTriggerLocationPicker).toHaveBeenCalledWith('move')
      })

      it('should call "$_deleteResources_displayDialog" when delete button is clicked', async () => {
        await deleteButton.vm.$emit('click')

        expect(spyDeleteResourcesDisplayDialog).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('trashbin page', () => {
    const $route = {
      name: 'files-trashbin'
    }

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
      const store = createStore({ ...state, selected: [] })

      beforeEach(() => {
        wrapper = shallowMount(BatchActions, {
          ...options,
          store
        })

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

      it('should call "emptyTrashbin" when empty trashbin button is clicked', async () => {
        await emptyTrashButton.vm.$emit('click')

        expect(spyEmptyTrashbin).toHaveBeenCalledTimes(1)
      })
    })

    describe('when items are selected for batch action', () => {
      const store = createStore({ ...state, selected: selectedFiles })

      beforeEach(() => {
        wrapper = shallowMount(BatchActions, {
          ...options,
          store
        })

        restoreButton = wrapper.find(elSelector.restoreButton)
        deleteButton = wrapper.find(elSelector.deleteButton)
      })

      it('should display the batch action buttons', () => {
        const actionButtons = wrapper.findAll(elSelector.ocButton)

        expect(actionButtons.length).toEqual(2)
        expect(restoreButton.exists()).toBeTruthy()
        expect(deleteButton.exists()).toBeTruthy()
        expect(restoreButton.text()).toEqual('Restore')
        expect(deleteButton.text()).toEqual('Delete')
      })

      it('should call "restoreFiles" when restore button is clicked', async () => {
        await restoreButton.vm.$emit('click')

        expect(spyRestoreFiles).toHaveBeenCalledTimes(1)
      })

      it('should call "$_deleteResources_displayDialog" when delete button is clicked', async () => {
        await deleteButton.vm.$emit('click')

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
        getters: {
          selectedFiles: () => state.selected,
          currentFolder: () => state.currentFolder,
          activeFiles: jest.fn()
        }
      }
    }
  })
}
