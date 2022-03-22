import { mount } from '@vue/test-utils'
import { getStore, localVue } from '../views.setup.js'
import FileActions from '@files/src/mixins/fileActions.js'
import SharedWithOthers from '@files/src/views/shares/SharedWithOthers.vue'
import SharedData from '@/__fixtures__/sharedFiles.js'

const resourcesList = SharedData.json().ocs.data

const stubs = {
  'app-loading-spinner': true,
  'no-content-message': true,
  'resource-table': true,
  'context-actions': true,
  pagination: true,
  'list-info': true,
  'oc-resource': true,
  'oc-checkbox': true,
  'oc-avatars': true,
  'oc-resource-size': true,
  'oc-button': true,
  'oc-drop': true
}

const appLoadingSpinnerStub = 'app-loading-spinner-stub'
const noContentStub = 'no-content-message-stub'
const filesTableStub = 'resource-table-stub'
const filesTableSelector = '#files-shared-with-others-table'
const contextActionsStub = 'context-actions-stub'
const listInfoStub = 'list-info-stub'
const paginationStub = 'pagination-stub'

describe('SharedWithOthers', () => {
  it('should show the app-loading-spinner component when the wrapper is still loading', () => {
    const wrapper = getMountedWrapper({ loading: true })

    expect(wrapper.find(appLoadingSpinnerStub).exists()).toBeTruthy()
    expect(wrapper.find(noContentStub).exists()).toBeFalsy()
    expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
  })
  describe('when the wrapper is not loading anymore', () => {
    it('should show the no content message component if the paginated resources is empty', () => {
      const wrapper = getMountedWrapper()

      expect(wrapper.find(appLoadingSpinnerStub).exists()).toBeFalsy()
      expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
      expect(wrapper.find(noContentStub).exists()).toBeTruthy()
    })
    describe('when length of paginated resources is greater than zero', () => {
      const wrapper = getMountedWrapper({ paginatedResources: resourcesList })

      it('should not show the no content message component', () => {
        expect(wrapper.find(noContentStub).exists()).toBeFalsy()
      })

      it('should load the resource table with correct props', () => {
        stubs['resource-table'] = false
        const wrapper = getMountedWrapper({ paginatedResources: resourcesList })
        const filesTable = wrapper.find(filesTableSelector)

        expect(filesTable.exists()).toBeTruthy()
        expect(filesTable).toMatchSnapshot()

        stubs['resource-table'] = true
      })

      describe('context menu', () => {
        let wrapper
        const selectedResources = [resourcesList[0], resourcesList[1]]
        const notSelectedResources = [resourcesList[2]]
        beforeEach(() => {
          stubs['resource-table'] = false

          wrapper = getMountedWrapper({
            selectedFiles: selectedResources,
            paginatedResources: resourcesList,
            paginationPage: 1,
            paginationPages: 2
          })
        })
        afterEach(() => {
          stubs['resource-table'] = true
        })
        it('should show the context actions for every selected resource', () => {
          selectedResources.forEach((selectedResource) => {
            const fileRow = wrapper.find(`[data-item-id="${selectedResource.id}"]`)
            const contextMenu = fileRow.find(contextActionsStub)
            expect(contextMenu.exists()).toBeTruthy()
            expect(contextMenu.props().items).toMatchObject(selectedResources)
          })
        })
        it('should not show the context actions for a resource that is not selected', () => {
          notSelectedResources.forEach((notSelectedResource) => {
            const fileRow = wrapper.find(`[data-item-id="${notSelectedResource.id}"]`)
            const contextMenu = fileRow.find(contextActionsStub)
            expect(contextMenu.exists()).toBeFalsy()
          })
        })
      })

      it('should show the list info component for the resource table', () => {
        stubs['resource-table'] = false

        const wrapper = getMountedWrapper({
          paginationPage: 1,
          paginationPages: 1,
          paginatedResources: resourcesList
        })
        const listInfo = wrapper.find(listInfoStub)

        expect(listInfo.exists()).toBeTruthy()
        expect(listInfo.props()).toMatchObject({
          files: resourcesList.length,
          folders: 0,
          size: null
        })
        stubs['resource-table'] = true
      })

      describe('pagination component', () => {
        it('should be visible if the "paginationPages" is greater than one', () => {
          stubs['resource-table'] = false
          const wrapper = getMountedWrapper({
            paginationPage: 1,
            paginationPages: 2,
            paginatedResources: resourcesList
          })

          const pagination = wrapper.find(paginationStub)

          expect(pagination.exists()).toBeTruthy()
          expect(pagination.props()).toMatchObject({
            pages: 2,
            currentPage: 1
          })
          stubs['resource-table'] = true
        })
      })

      it('should call "$_fileActions_triggerDefaultAction" method if "fileClick" event is emitted from the resource table component', () => {
        const spyFileActionsTriggerDefaultAction = jest
          .spyOn(FileActions.methods, '$_fileActions_triggerDefaultAction')
          .mockImplementation()
        const wrapper = getMountedWrapper({
          paginatedResources: resourcesList,
          paginationPage: 1,
          paginationPages: 2
        })
        const filesTable = wrapper.find(filesTableStub)
        expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(0)

        filesTable.vm.$emit('fileClick')

        expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(1)
      })

      it('should call "rowMounted" method if "rowMounted" event is emitted from the resource table component', () => {
        const spyRowMounted = jest
          .spyOn(SharedWithOthers.methods, 'rowMounted')
          .mockImplementation()
        const wrapper = getMountedWrapper({
          paginatedResources: resourcesList,
          paginationPage: 1,
          paginationPages: 2
        })
        const filesTable = wrapper.find(filesTableStub)
        expect(spyRowMounted).toHaveBeenCalledTimes(0)

        filesTable.vm.$emit('rowMounted')

        expect(spyRowMounted).toHaveBeenCalledTimes(1)
      })
    })
  })

  function getMountedWrapper({
    selectedFiles = [],
    loading = false,
    paginatedResources = [],
    paginationPages = 12,
    paginationPage = 21
  } = {}) {
    const store = getStore({
      selectedFiles,
      totalFilesCount: { files: paginatedResources.length, folders: 0 }
    })
    const component = {
      ...SharedWithOthers,
      created: jest.fn(),
      mounted: jest.fn(),
      setup: () => ({
        loadResourcesTask: {
          isRunning: loading,
          perform: jest.fn()
        },
        paginatedResources: paginatedResources,
        paginationPages: paginationPages,
        paginationPage: paginationPage,
        handleSort: jest.fn()
      })
    }
    return mount(component, {
      localVue,
      store: store,
      stubs,
      mocks: {
        $route: {
          name: 'some-route'
        }
      }
    })
  }
})
