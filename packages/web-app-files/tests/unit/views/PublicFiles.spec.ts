import { mount, RouterLinkStub } from '@vue/test-utils'
import { accentuatesTableRowTest } from './views.shared'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import { localVue, getStore, createFile } from './views.setup'

const createFolder = ({ name = '1234', canCreate = false } = {}) => ({
  name: name,
  canCreate: () => canCreate
})

const stubs = {
  'app-loading-spinner': true,
  'not-found-message': true,
  'no-content-message': true,
  'resource-table': true,
  'context-actions': true,
  pagination: true,
  'list-info': true,
  'router-link': RouterLinkStub
}

const $route = {
  name: 'files-public-list',
  params: { page: 1 }
}

const $router = {
  afterEach: jest.fn(),
  currentRoute: {
    query: {}
  }
}

const resourceList = [createFile({ id: 1234 }), createFile({ id: 1235 }), createFile({ id: 1236 })]

const stubSelectors = {
  appLoadingSpinner: 'app-loading-spinner-stub',
  notFoundMessage: 'not-found-message-stub',
  noContentMessage: 'no-content-message-stub',
  resourceTable: 'resource-table-stub',
  contextActions: 'context-actions-stub',
  pagination: 'pagination-stub',
  listInfo: 'list-info-stub'
}

describe('PublicFiles view', () => {
  describe('accentuate new files and folders', () => {
    // eslint-disable-next-line jest/expect-expect
    it('accentuates table row for new files, folders and versions [Files/UPSERT_RESOURCE]', async () => {
      await accentuatesTableRowTest(PublicFiles)
    })
  })
  it('should show the app-loading-spinner component when the view is still loading', () => {
    const wrapper = getMountedWrapper({ loading: true })

    expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeTruthy()
    expect(wrapper.find(stubSelectors.noContentMessage).exists()).toBeFalsy()
    expect(wrapper.find(stubSelectors.resourceTable).exists()).toBeFalsy()
  })
  describe('when the view is not loading anymore', () => {
    it('should not show the app-loading-spinner component', () => {
      const wrapper = getMountedWrapper({ loading: false })

      expect(wrapper.find(stubSelectors.appLoadingSpinner).exists()).toBeFalsy()
    })

    describe('not found message component', () => {
      it('should be visible if "folderNotFound" is set as "true"', () => {
        const wrapper = getMountedWrapper({ loading: false })
        expect(wrapper.find(stubSelectors.notFoundMessage).exists()).toBeTruthy()
      })
      it('should not be visible if "folderNotFound" is set as "false"', () => {
        const wrapper = getMountedWrapper({
          loading: false,
          currentFolder: createFolder()
        })
        expect(wrapper.find(stubSelectors.notFoundMessage).exists()).toBeFalsy()
      })
    })

    describe('no content message component', () => {
      it('should be visible if the length of the paginated resources is zero', () => {
        const wrapper = getMountedWrapper({
          paginatedResources: [],
          currentFolder: {
            canCreate: jest.fn()
          }
        })
        expect(wrapper.find(stubSelectors.noContentMessage).exists()).toBeTruthy()
      })
      it.each([
        {
          canCreate: true,
          expectedToExist: true
        },
        {
          canCreate: false,
          expectedToExist: false
        }
      ])(
        'should show/hide the "call to action" information according to the currentFolder "canCreate" permission',
        (cases) => {
          stubs['no-content-message'] = false
          const wrapper = getMountedWrapper({
            paginatedResources: [],
            currentFolder: createFolder({ canCreate: cases.canCreate })
          })

          const noContentMessage = wrapper.find('#files-public-list-empty')
          const callToAction = noContentMessage.find('[data-testid="public-files-call-to-action"]')
          expect(callToAction.exists()).toBe(cases.expectedToExist)
          stubs['no-content-message'] = true
        }
      )
    })
    describe('when length of the paginated resources is greater than zero', () => {
      const selectedResourceList = [resourceList[0], resourceList[1]]
      const notSelectedResourceList = [resourceList[2]]

      it('should load the resource table with the correct props', () => {
        const wrapper = getMountedWrapper({
          paginatedResources: resourceList,
          currentFolder: createFolder()
        })
        const resourceTable = wrapper.find(stubSelectors.resourceTable)
        expect(resourceTable).toMatchSnapshot()
      })
      describe('context menu', () => {
        let wrapper
        beforeEach(() => {
          stubs['resource-table'] = false
          wrapper = getMountedWrapper({
            paginatedResources: resourceList,
            selectedFiles: selectedResourceList,
            currentFolder: createFolder()
          })
        })
        afterEach(() => {
          stubs['resource-table'] = true
        })
        it('should show the context actions for every selected resource', () => {
          selectedResourceList.forEach((selectedResource) => {
            const resourceRow = wrapper.find(`[data-item-id="${selectedResource.id}"]`)
            const contextActions = resourceRow.find(stubSelectors.contextActions)
            expect(contextActions.exists()).toBeTruthy()
            expect(contextActions.props()).toMatchObject({
              items: selectedResourceList
            })
          })
        })
        it('should not show the context actions for the resources that are not selected', () => {
          notSelectedResourceList.forEach((notSelectedResource) => {
            const resourceRow = wrapper.find(`[data-item-id="${notSelectedResource.id}"]`)
            const contextActions = resourceRow.find(stubSelectors.contextActions)
            expect(contextActions.exists()).toBeFalsy()
          })
        })
      })
      describe('pagination component inside the resource table', () => {
        it('should be visible if pagination pages is greater than zero', () => {
          stubs['resource-table'] = false
          const wrapper = getMountedWrapper({
            paginatedResources: resourceList,
            paginationPages: 22,
            paginationPage: 2,
            currentFolder: createFolder()
          })

          const paginationItem = wrapper.find(stubSelectors.pagination)

          expect(paginationItem.exists()).toBeTruthy()
          expect(paginationItem.props()).toMatchObject({
            pages: 22,
            currentPage: 2
          })
          stubs['resource-table'] = true
        })
      })
      describe('list info component inside the resource table', () => {
        it('should be visible if paginated resources list is empty', () => {
          stubs['resource-table'] = false
          const wrapper = getMountedWrapper({
            paginatedResources: resourceList,
            totalFilesCount: { files: 2, folders: 3 },
            currentFolder: createFolder()
          })

          const listInfoItem = wrapper.find(stubSelectors.listInfo)

          expect(listInfoItem.exists()).toBeTruthy()
          expect(listInfoItem.props()).toMatchObject({
            files: 2,
            folders: 3,
            size: null
          })
          stubs['resource-table'] = true
        })
      })
    })
  })

  function mountOptions({ store, loading, paginatedResources, paginationPages, paginationPage }) {
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
    currentFolder = null,
    selectedFiles = [],
    loading = false,
    paginatedResources = [],
    paginationPages = 1,
    paginationPage = 1,
    totalFilesCount = { files: 12, folders: 21 }
  } = {}) {
    const component = { ...PublicFiles, created: jest.fn() }
    const store = getStore({
      totalFilesCount: totalFilesCount,
      selectedFiles,
      currentFolder
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
})
