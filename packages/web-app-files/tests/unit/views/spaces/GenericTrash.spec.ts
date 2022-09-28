describe('GenericTrash view', () => {
  it.todo('write new unit tests for GenericTrash view...')
})

// import Vuex from 'vuex'
// import { mount, createLocalVue } from '@vue/test-utils'
// import Trashbin from '@files/src/views/spaces/Trashbin.vue'
// import { createStore } from 'vuex-extensions'
// import { createLocationTrash } from '../../../../src/router'
// import waitFor from 'wait-for-expect'
//
// const localVue = createLocalVue()
// localVue.use(Vuex)
//
// afterEach(() => jest.clearAllMocks())
//
// describe('Trashbin view', () => {
//   describe('method "mounted"', () => {
//     it('should change document title', async () => {
//       const wrapper = getWrapper()
//       expect(wrapper.vm.loadResourcesTask.perform).toBeCalled()
//       await waitFor(() => expect(document.title).toBe('Deleted files - Space - ownCloud'))
//     })
//   })
// })
//
// function getWrapper() {
//   return mount(Trashbin, {
//     localVue,
//     mocks: {
//       $router: {
//         currentRoute: {
//           ...createLocationTrash('files-trash-generic'),
//           meta: {
//             title: 'Deleted files'
//           }
//         },
//         resolve: (r) => {
//           return { href: r.name }
//         }
//       },
//       loadResourcesTask: {
//         isRunning: false,
//         perform: jest.fn()
//       },
//       space: {
//         name: 'Space'
//       },
//       $gettext: jest.fn(),
//       document: {
//         title: ''
//       }
//     },
//     computed: {
//       breadcrumbs: () => []
//     },
//     store: createStore(Vuex.Store, {
//       actions: {
//         showMessage: jest.fn()
//       },
//       getters: {
//         configuration: () => ({
//           server: 'https://example.com',
//           currentTheme: {
//             general: {
//               name: 'ownCloud'
//             }
//           }
//         })
//       }
//     }),
//     stubs: {
//       'app-bar': true,
//       'side-bar': true,
//       'trash-bin': true
//     }
//   })
// }

/* Old TrashBin.spec.js

import { mount } from '@vue/test-utils'
import TrashBin from '@files/src/components/TrashBin.vue'
import { getStore, localVue, createFile } from '@files/tests/unit/components/components.setup.js'

const stubs = {
  'app-bar': true,
  'app-loading-spinner': true,
  'no-content-message': true,
  'resource-table': true,
  'context-actions': true,
  pagination: true,
  'list-info': true,
  'router-link': true,
  'side-bar': true
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
        name: 'some-route-name',
        query: {}
      },
      resolve: (r) => {
        return { href: r.name }
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
        areResourcesLoading: loading,
        loadResourcesTask: {
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
}) */
