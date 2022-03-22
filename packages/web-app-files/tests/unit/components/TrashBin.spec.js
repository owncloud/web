import { mount } from '@vue/test-utils'
import TrashBin from '@files/src/components/TrashBin.vue'
import { getStore, localVue, createFile } from '@files/tests/unit/components/components.setup.js'

const stubs = {
  'app-loading-spinner': true,
  'no-content-message': true,
  'resource-table': true,
  'context-actions': true,
  pagination: true,
  'list-info': true,
  'router-link': true
}

const appLoadingSpinnerStub = 'app-loading-spinner-stub'
const noContentStub = 'no-content-message-stub'
const filesTableStub = 'resource-table-stub'
const filesTableSelector = '#files-trashbin-table'
const contextActionsStub = 'context-actions-stub'
const listInfoStub = 'list-info-stub'
const paginationStub = 'pagination-stub'

describe('Trashbin component', () => {
  it('should show the app-loading-spinner component when the view is still loading', () => {
    const wrapper = getMountedWrapper({ loading: true })

    expect(wrapper.find(appLoadingSpinnerStub).exists()).toBeTruthy()
    expect(wrapper.find(noContentStub).exists()).toBeFalsy()
    expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
  })

  describe('when the view is not loading anymore', () => {
    it('should show the no content message component if the paginated resources is empty', () => {
      const wrapper = getMountedWrapper()

      expect(wrapper.find(appLoadingSpinnerStub).exists()).toBeFalsy()
      expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
      expect(wrapper.find(noContentStub).exists()).toBeTruthy()
    })

    describe('when length of the paginated resources is greater than zero', () => {
      const resourceList = [
        createFile({ id: '1234' }),
        createFile({ id: '5896' }),
        createFile({ id: '9856' })
      ]
      const wrapper = getMountedWrapper({
        paginatedResources: resourceList
      })

      it('should not show the no content message component', () => {
        expect(wrapper.find(noContentStub).exists()).toBeFalsy()
      })

      it('should load the resource table with correct props', () => {
        stubs['resource-table'] = false
        const wrapper = getMountedWrapper({
          paginatedResources: resourceList
        })
        const filesTable = wrapper.find(filesTableSelector)

        expect(filesTable.exists()).toBeTruthy()
        expect(filesTable).toMatchSnapshot()

        stubs['resource-table'] = true
      })

      describe('context menu', () => {
        let wrapper
        const selectedResources = [resourceList[0], resourceList[1]]
        const notSelectedResources = [resourceList[2]]
        beforeEach(() => {
          stubs['resource-table'] = false

          wrapper = getMountedWrapper({
            selectedFiles: selectedResources,
            paginatedResources: resourceList,
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

      describe('pagination', () => {
        it('should be visible if the paginated pages is greater than zero', () => {
          stubs['resource-table'] = false
          const wrapper = getMountedWrapper({
            paginatedResources: resourceList,
            paginationPages: 2,
            paginationPage: 1
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

      describe('list info', () => {
        it('should be present if the paginated resources list is not empty', () => {
          stubs['resource-table'] = false

          const wrapper = getMountedWrapper({
            paginatedResources: resourceList,
            paginationPage: 1,
            paginationPages: 2
          })

          const listInfo = wrapper.find(listInfoStub)
          expect(listInfo.exists()).toBeTruthy()
          expect(listInfo.props()).toMatchObject({
            files: 3,
            folders: 0
          })
          stubs['resource-table'] = true
        })
      })
    })
  })

  function mountOptions({ store, loading, paginatedResources, paginationPages, paginationPage }) {
    const $route = { params: { page: 1 } }
    const $router = {
      afterEach: jest.fn(),
      currentRoute: {
        query: {}
      }
    }
    return {
      localVue,
      store: store,
      stubs,
      mocks: {
        $route,
        $router
      },
      setup: () => ({
        loadResourcesTask: {
          isRunning: loading,
          perform: jest.fn()
        },
        paginatedResources: paginatedResources,
        paginationPages: paginationPages,
        paginationPage: paginationPage
      })
    }
  }

  function getMountedWrapper({
    selectedFiles = [],
    loading = false,
    paginatedResources = [],
    paginationPages = 12,
    paginationPage = 21
  } = {}) {
    const component = { ...TrashBin, created: jest.fn() }
    const store = createStore({
      totalFilesCount: { files: paginatedResources.length, folders: 0 },
      selectedFiles
    })
    return mount(
      component,
      mountOptions({
        store,
        loading,
        paginatedResources,
        paginationPages,
        paginationPage
      })
    )
  }

  function createStore({ totalFilesCount, highlightedFile, selectedFiles } = {}) {
    return getStore({
      highlightedFile,
      totalFilesCount,
      selectedFiles
    })
  }
})
