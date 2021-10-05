import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from 'tests/unit/stubs'
import BatchActions from '../../../../../src/components/AppBar/SelectedResources/BatchActions.vue'
import { canBeMoved } from '../../../../../src/helpers/permissions'
const permissionsHelper = '../../../../../src/helpers/permissions'

jest.mock(permissionsHelper, () => ({
  ...jest.requireActual(permissionsHelper),
  canBeMoved: jest.fn(() => false)
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

const files = [
  {
    path: '/Folder'
  },
  {
    path: '/lorem.txt'
  }
]
const shareStatus = {
  accepted: 0,
  pending: 1,
  declined: 2
}
const selectedFiles = [
  {
    path: '/lorem.txt',
    canBeDeleted: jest.fn(() => true),
    canDownload: jest.fn(() => true)
  }
]
const componentStubs = { ...stubs, translate: true }
const elSelector = {
  copyButton: '#copy-selected-btn',
  moveButton: '#move-selected-btn',
  downloadButton: '#download-selected-btn',
  deleteButton: '#delete-selected-btn',
  restoreButton: '#restore-selected-btn',
  ocButton: '.oc-button',
  ocButtonStub: 'oc-button-stub',
  acceptButton: '#accept-selected-shares-btn',
  declineButton: '#decline-selected-shares-btn'
}

describe('Batch Actions component', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe.each(['files-personal', 'files-favorites', 'files-public-list', 'files-shared-with-me'])(
    '%s page',
    page => {
      const $route = {
        name: page
      }

      it('should not display action buttons if no items are selected', () => {
        const store = createStore({ selected: [] })
        const wrapper = createShallowMountWrapper({
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
        const actionButtons = wrapper.findAll(elSelector.ocButtonStub)

        expect(actionButtons.length).toEqual(0)
      })

      describe('when items are selected for batch action', () => {
        const options = {
          mocks: {
            $route: {
              ...$route,
              meta: {
                hasBulkActions: true
              }
            }
          }
        }

        if (page === 'files-shared-with-me') {
          let wrapper
          let actionButtons
          let acceptButton
          let declineButton

          const spyTriggerShareActions = jest
            .spyOn(BatchActions.methods, 'triggerShareActions')
            .mockImplementation()
          const spyAcceptShares = jest.spyOn(BatchActions.methods, 'acceptShares')
          const spyDeclineShares = jest.spyOn(BatchActions.methods, 'declineShares')

          it('should display accept and decline buttons if share status is pending', () => {
            const store = createStore({
              selected: addPropToSelectedFiles(selectedFiles, { status: shareStatus.pending })
            })
            wrapper = createShallowMountWrapper({ ...options, store })
            actionButtons = wrapper.findAll(elSelector.ocButtonStub)
            acceptButton = wrapper.find(elSelector.acceptButton)
            declineButton = wrapper.find(elSelector.declineButton)

            expect(acceptButton.exists()).toBeTruthy()
            expect(acceptButton.text()).toContain('Accept')
            expect(declineButton.exists()).toBeTruthy()
            expect(declineButton.text()).toContain('Decline')
          })
          describe('when share status is declined', () => {
            beforeEach(() => {
              const store = createStore({
                selected: addPropToSelectedFiles(selectedFiles, { status: shareStatus.declined })
              })
              wrapper = createMountWrapper({ ...options, store })
              actionButtons = wrapper.findAll(elSelector.ocButton)
              acceptButton = wrapper.find(elSelector.acceptButton)
              declineButton = wrapper.find(elSelector.declineButton)
            })
            it('should display accept button', () => {
              expect(actionButtons.length).toEqual(1)
              expect(acceptButton.exists()).toBeTruthy()
              expect(acceptButton.text()).toContain('Accept')
              expect(declineButton.exists()).toBeFalsy()
            })
            it('should call "acceptShares" when accept button is clicked', async () => {
              await acceptButton.trigger('click')

              expect(spyAcceptShares).toHaveBeenCalledTimes(1)
              expect(spyTriggerShareActions).toHaveBeenCalledWith(shareStatus.accepted)
            })
          })
          describe('when share status is accepted', () => {
            beforeEach(() => {
              const store = createStore({
                selected: addPropToSelectedFiles(selectedFiles, { status: shareStatus.accepted })
              })
              wrapper = createMountWrapper({ ...options, store })
              actionButtons = wrapper.findAll(elSelector.ocButton)
              acceptButton = wrapper.find(elSelector.acceptButton)
              declineButton = wrapper.find(elSelector.declineButton)
            })
            it('should display decline button', () => {
              expect(actionButtons.length).toEqual(1)
              expect(declineButton.exists()).toBeTruthy()
              expect(declineButton.text()).toContain('Decline')
              expect(acceptButton.exists()).toBeFalsy()
            })
            it('should call "declineShares" when decline button is clicked', async () => {
              await declineButton.trigger('click')

              expect(spyDeclineShares).toHaveBeenCalledTimes(1)
              expect(spyTriggerShareActions).toHaveBeenCalledWith(shareStatus.declined)
            })
          })
        } else {
          const currentFolder = {
            path: '',
            canCreate: jest.fn(() => true),
            canBeDeleted: jest.fn(() => true)
          }

          const store = createStore({ currentFolder, selected: selectedFiles })

          let wrapper
          let downloadButton
          let copyButton
          let moveButton
          let deleteButton

          const spyTriggerLocationPicker = jest
            .spyOn(BatchActions.methods, 'triggerLocationPicker')
            .mockImplementation()
          const spyDeleteResourcesDisplayDialog = jest
            .spyOn(BatchActions.mixins[1].methods, '$_deleteResources_displayDialog')
            .mockImplementation()

          beforeEach(() => {
            canBeMoved.mockReturnValue(true)
            wrapper = createMountWrapper({ ...options, store })

            downloadButton = wrapper.find(elSelector.downloadButton)
            copyButton = wrapper.find(elSelector.copyButton)
            moveButton = wrapper.find(elSelector.moveButton)
            deleteButton = wrapper.find(elSelector.deleteButton)
          })

          it('should display the action buttons', () => {
            expect(downloadButton.exists()).toBeTruthy()
            expect(downloadButton.text()).toEqual('Download')
            expect(copyButton.exists()).toBeTruthy()
            expect(copyButton.text()).toEqual('Copy')
            expect(moveButton.exists()).toBeTruthy()
            expect(moveButton.text()).toEqual('Move')
            expect(deleteButton.exists()).toBeTruthy()
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
        }
      })

      if (page === 'files-public-list') {
        describe('public-files page with read-only permission', () => {
          const currentFolder = {
            path: '',
            canCreate: jest.fn(() => false),
            canBeDeleted: jest.fn(() => false)
          }
          beforeEach(() => {
            canBeMoved.mockReturnValue(false)
          })

          it('should only display the read-only compliant action buttons when items are selected', () => {
            const store = createStore({ currentFolder, selected: selectedFiles })
            const wrapper = createShallowMountWrapper({
              store,
              mocks: {
                $route: {
                  ...$route,
                  meta: {
                    hasBulkActions: true
                  }
                }
              }
            })
            const actionButtons = wrapper.findAll(elSelector.ocButtonStub)

            const downloadButton = wrapper.find(elSelector.downloadButton)
            expect(downloadButton.exists()).toBeTruthy()
            expect(actionButtons.length).toEqual(1)
          })
        })
      }
    }
  )

  describe('trashbin page', () => {
    const $route = {
      name: 'files-trashbin'
    }

    const options = {
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

    const spyEmptyTrashbin = jest.spyOn(BatchActions.methods, 'emptyTrashbin').mockImplementation()
    const spyRestoreFiles = jest.spyOn(BatchActions.methods, 'restoreFiles').mockImplementation()
    const spyDeleteResourcesDisplayDialog = jest
      .spyOn(BatchActions.mixins[1].methods, '$_deleteResources_displayDialog')
      .mockImplementation()

    describe('when no items are selected for batch action', () => {
      const store = createStore({ selected: [] })

      beforeEach(() => {
        wrapper = createMountWrapper({ ...options, store })

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
        await emptyTrashButton.trigger('click')

        expect(spyEmptyTrashbin).toHaveBeenCalledTimes(1)
      })
    })

    describe('when items are selected for batch action', () => {
      const store = createStore({ selected: selectedFiles })

      beforeEach(() => {
        wrapper = createMountWrapper({ ...options, store })

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

function addPropToSelectedFiles(selectedFiles, prop) {
  const files = selectedFiles.map(file => ({ ...file, ...prop }))
  return files
}

function createMountWrapper(options = {}) {
  return mount(BatchActions, {
    localVue,
    stubs: { ...componentStubs, 'oc-button': false },
    ...options
  })
}

function createShallowMountWrapper(options = {}) {
  return shallowMount(BatchActions, {
    localVue,
    stubs: componentStubs,
    ...options
  })
}

function createStore(state = { selected: [], currentFolder: {} }) {
  return new Vuex.Store({
    modules: {
      Files: {
        state: {
          currentFolder: { path: '' },
          ...state
        },
        namespaced: true,
        getters: {
          selectedFiles: () => state.selected,
          currentFolder: () => state.currentFolder,
          activeFilesCurrentPage: () => files
        }
      }
    }
  })
}
