import { mount, RouterLinkStub } from '@vue/test-utils'
import { getStore, localVue, createFile, stubs } from './views.setup.js'
import FileActions from '@files/src/mixins/fileActions.js'
import MixinMountSideBar from '@files/src/mixins/sidebar/mountSideBar.js'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import MixinFilesListPagination from '@files/src/mixins/filesListPagination'
import MixinAccessibleBreadcrumb from '@files/src/mixins/accessibleBreadcrumb'

const listLoaderStub = 'list-loader-stub'
const noContentStub = 'no-content-message-stub'
const filesTableStub = 'oc-table-files-stub'
const contextActionsStub = 'context-actions-stub'
const listInfoStub = 'list-info-stub'
const notFoundMessageStub = 'not-found-message-stub'
const selectors = {
  pagination: '.files-pagination'
}
const defaultRoute = { path: '/some-path', name: 'some-route-name', params: { page: 1 } }

localVue.prototype.$client.publicFiles = {
  list: async () => [
    {
      fileInfo: { '{http://owncloud.org/ns}fileid': 1234 },
      name: 'simple',
      getProperty: jest.fn()
    }
  ]
}

jest
  .spyOn(MixinFilesListPagination.methods, '$_filesListPagination_updateCurrentPage')
  .mockImplementation()

jest
  .spyOn(MixinAccessibleBreadcrumb.methods, 'accessibleBreadcrumb_focusAndAnnounceBreadcrumb')
  .mockImplementation()

const createFolder = ({ name = '1234', canCreate = false } = {}) => ({
  name: name,
  canCreate: () => canCreate
})

describe('PublicFiles', () => {
  describe('list loader component', () => {
    it('should be visible if loading is set as true', () => {
      const wrapper = getMountedWrapper({ loading: true })

      expect(wrapper.find(listLoaderStub).exists()).toBeTruthy()
    })

    it('should not be visible if loading is set as false', () => {
      const wrapper = getMountedWrapper({ loading: false })

      expect(wrapper.find(listLoaderStub).exists()).toBeTruthy()
    })
  })

  describe('not found message component', () => {
    stubs['not-found-message'] = true
    it('should be visible if current folder is null', async () => {
      const store = createStore({ currentFolder: null })
      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      expect(wrapper.find(notFoundMessageStub).exists()).toBeTruthy()
    })
    it('should not be visible if current folder is not null', async () => {
      const store = createStore({ currentFolder: createFolder() })
      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      expect(wrapper.find(notFoundMessageStub).exists()).toBeFalsy()
    })
  })

  describe('no content message component', () => {
    it('should be visible if active files length is less than one', async () => {
      stubs['no-content-message'] = false
      const store = createStore({ currentFolder: createFolder(), activeFiles: [] })
      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#files-public-list-empty').exists()).toBeTruthy()
      expect(wrapper.find('#files-public-list-empty')).toMatchSnapshot()
      stubs['no-content-message'] = true
    })
    it('should not be visible if active files length is greater than one', async () => {
      const store = createStore({
        currentFolder: createFolder(),
        activeFiles: [createFile({ id: '1234' })]
      })
      const wrapper = getMountedWrapper({ store, loading: false })

      await wrapper.vm.$nextTick()

      expect(wrapper.find(noContentStub).exists()).toBeFalsy()
    })

    describe('call to action', () => {
      it('should show call to action if current folder has truthy "canCreate" value', async () => {
        stubs['no-content-message'] = false

        const store = createStore({
          currentFolder: createFolder({ canCreate: true }),
          activeFiles: []
        })
        const wrapper = getMountedWrapper({ store, loading: false })
        await wrapper.vm.$nextTick()

        const callToActionSpan = wrapper.find('[data-testid="public-files-call-to-action"]')

        expect(callToActionSpan.exists()).toBeTruthy()
        expect(callToActionSpan).toMatchSnapshot()
      })
      it('should show call to action if current folder has falsy "canCreate" value', async () => {
        stubs['no-content-message'] = false

        const store = createStore({
          currentFolder: createFolder({ canCreate: false }),
          activeFiles: []
        })
        const wrapper = getMountedWrapper({ store, loading: false })
        await wrapper.vm.$nextTick()

        const callToActionSpan = wrapper.find('[data-testid="public-files-call-to-action"]')

        expect(callToActionSpan.exists()).toBeFalsy()
      })
    })
  })

  describe('when length of active files is greater than zero', () => {
    const activeFiles = [createFile({ id: '1234' }), createFile({ id: '5896' })]
    const store = createStore({ activeFiles: activeFiles, currentFolder: createFolder() })
    const wrapper = getMountedWrapper({ store, loading: false })

    it('should load files table with correct props', () => {
      const filesTable = wrapper.find(filesTableStub)

      expect(filesTable.exists()).toBeTruthy()
      expect(filesTable.props()).toMatchObject({
        resources: activeFiles,
        arePathsDisplayed: false,
        areThumbnailsDisplayed: !store.getters.configuration.options.disablePreviews,
        areResourcesClickable: true,
        isSelectable: true,
        disabled: null,
        dragDrop: false,
        selection: [],
        hasActions: true,
        targetRoute: { name: defaultRoute.name }
      })
    })

    it('should show context menu for each resource', async () => {
      stubs['oc-table-files'] = false
      stubs['context-actions'] = true

      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      const contextActions = wrapper.findAll(contextActionsStub)

      expect(contextActions.length).toBe(activeFiles.length)
      activeFiles.forEach((activeFile, index) => {
        expect(contextActions.at(index).props()).toMatchObject({
          item: activeFile
        })
      })
    })

    it('should show list info component for oc files table', async () => {
      stubs['oc-table-files'] = false
      stubs['list-info'] = true

      const store = createStore({
        currentFolder: createFolder(),
        activeFiles: activeFiles,
        totalFilesCount: {
          files: 22,
          folders: 56
        },
        totalFileSize: 12545
      })

      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()
      const listInfo = wrapper.find(listInfoStub)

      expect(listInfo.exists()).toBeTruthy()
      expect(listInfo.props()).toMatchObject({
        files: store.getters['Files/totalFilesCount'].files,
        folders: store.getters['Files/totalFilesCount'].folders,
        size: store.getters['Files/totalFilesSize']
      })
    })

    describe('pagination component in oc files table', () => {
      it('should be visible if pages is greater than one', async () => {
        stubs['oc-table-files'] = false
        stubs.pagination = false
        stubs.RouterLink = RouterLinkStub
        const store = getStore({
          currentFolder: createFolder(),
          activeFiles: activeFiles,
          pages: 2,
          currentPage: 1
        })
        const wrapper = getMountedWrapper({ store, loading: false })
        await wrapper.vm.$nextTick()

        const pagination = wrapper.find(selectors.pagination)

        expect(pagination.exists()).toBeTruthy()
        stubs['oc-table-files'] = true
      })

      it('should not be visible if pages is less than one', async () => {
        stubs['oc-table-files'] = false
        stubs.pagination = false
        stubs.RouterLink = RouterLinkStub
        const store = getStore({
          currentFolder: createFolder(),
          activeFiles: activeFiles,
          pages: 1,
          currentPage: 1
        })
        const wrapper = getMountedWrapper({ store, loading: false })
        await wrapper.vm.$nextTick()

        const pagination = wrapper.find(selectors.pagination)

        expect(pagination.exists()).toBeFalsy()
        stubs['oc-table-files'] = true
      })
    })

    it('should call "$_mountSideBar_showDefaultPanel" method if "showDetails" event is emitted from oc files table component', async () => {
      const spyMountSideBarShowDefaultPanel = jest.spyOn(
        MixinMountSideBar.methods,
        '$_mountSideBar_showDefaultPanel'
      )
      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      const filesTable = wrapper.find(filesTableStub)
      expect(spyMountSideBarShowDefaultPanel).toHaveBeenCalledTimes(0)

      filesTable.vm.$emit('showDetails')

      expect(spyMountSideBarShowDefaultPanel).toHaveBeenCalledTimes(1)
    })

    it('should call "$_fileActions_triggerDefaultAction" method if "fileClick" event is emitted from oc files table component', async () => {
      const spyFileActionsTriggerDefaultAction = jest
        .spyOn(FileActions.methods, '$_fileActions_triggerDefaultAction')
        .mockImplementation()

      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      const filesTable = wrapper.find(filesTableStub)
      expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(0)

      filesTable.vm.$emit('fileClick')

      expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(1)
    })

    it('should call "rowMounted" method if "rowMounted" event is emitted from oc files table component', async () => {
      const spyRowMounted = jest.spyOn(PublicFiles.methods, 'rowMounted').mockImplementation()

      const wrapper = getMountedWrapper({ store, loading: false })
      await wrapper.vm.$nextTick()

      const filesTable = wrapper.find(filesTableStub)
      expect(spyRowMounted).toHaveBeenCalledTimes(0)

      filesTable.vm.$emit('rowMounted')

      expect(spyRowMounted).toHaveBeenCalledTimes(1)
    })
  })

  function createStore({
    activeFiles = [],
    sidebarClosed = true,
    disablePreviews = false,
    totalFilesCount,
    currentFolder = null,
    totalFileSize = null
  } = {}) {
    return getStore({
      activeFiles,
      sidebarClosed,
      disablePreviews,
      totalFilesCount,
      currentFolder,
      totalFileSize
    })
  }

  function getMountOptions({ $route = defaultRoute, store = createStore(), loading = true }) {
    return {
      localVue,
      store,
      stubs,
      mocks: {
        $route
      },
      data: () => ({
        loading: loading
      })
    }
  }

  function getMountedWrapper({ store, loading } = {}) {
    const component = { ...PublicFiles, created: jest.fn(), mounted: jest.fn() }
    return mount(component, getMountOptions({ store, loading }))
  }
})
