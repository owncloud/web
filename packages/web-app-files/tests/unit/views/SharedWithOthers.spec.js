import { mount, RouterLinkStub } from '@vue/test-utils'
import { getStore, localVue, createFile, stubs } from './views.setup.js'
import FileActions from '@files/src/mixins/fileActions.js'
import SharedWithOthers from '@files/src/views/SharedWithOthers.vue'
import MixinMountSideBar from '@files/src/mixins/sidebar/mountSideBar.js'

const listLoaderStub = 'list-loader-stub'
const noContentStub = 'no-content-message-stub'
const filesTableStub = 'oc-table-files-stub'
const contextActionsStub = 'context-actions-stub'
const listInfoStub = 'list-info-stub'

const selectors = {
  pagination: '.files-pagination'
}

describe('SharedWithOthers', () => {
  it('should show list loader when loading is set as true', () => {
    const wrapper = getMountedWrapper({ loading: true })

    expect(wrapper.find(listLoaderStub).exists()).toBeTruthy()
    expect(wrapper.find(noContentStub).exists()).toBeFalsy()
    expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
  })
  describe('when loading is set as false', () => {
    it('should show the no content message component if active files length is less than one', () => {
      const store = createStore({ activeFiles: [] })
      const wrapper = getMountedWrapper({ store, loading: false })

      expect(wrapper.find(listLoaderStub).exists()).toBeFalsy()
      expect(wrapper.find(filesTableStub).exists()).toBeFalsy()
      expect(wrapper.find(noContentStub).exists()).toBeTruthy()
      expect(wrapper.find(noContentStub)).toMatchSnapshot()
    })
    describe('when length of active files is greater than zero', () => {
      const activeFiles = [createFile({ id: '1234' }), createFile({ id: '5896' })]
      const store = createStore({ activeFiles: activeFiles })
      const wrapper = getMountedWrapper({ store, loading: false })

      it('should not show the no content message component', () => {
        expect(wrapper.find(noContentStub).exists()).toBeFalsy()
      })

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
          targetRoute: { name: 'files-personal' }
        })
      })

      it('should show context menu for each resource', () => {
        stubs['oc-table-files'] = false
        stubs['context-actions'] = true
        const wrapper = getMountedWrapper({ store, loading: false })
        const contextActions = wrapper.findAll(contextActionsStub)

        expect(contextActions.length).toBe(activeFiles.length)
        activeFiles.forEach((activeFile, index) => {
          expect(contextActions.at(index).props()).toMatchObject({
            item: activeFile
          })
        })
      })

      it('should show list info component for oc files table', () => {
        stubs['oc-table-files'] = false
        stubs['list-info'] = true

        const store = createStore({
          activeFiles: activeFiles,
          totalFilesCount: {
            files: 22,
            folders: 56
          }
        })

        const wrapper = getMountedWrapper({ store, loading: false })
        const listInfo = wrapper.find(listInfoStub)

        expect(listInfo.exists()).toBeTruthy()
        expect(listInfo.props()).toMatchObject({
          files: store.getters['Files/totalFilesCount'].files,
          folders: store.getters['Files/totalFilesCount'].folders,
          size: null
        })
      })

      describe('pagination component in oc files table', () => {
        it('should be visible if pages is greater than one', () => {
          stubs['oc-table-files'] = false
          stubs.pagination = false
          stubs.RouterLink = RouterLinkStub
          const store = getStore({ activeFiles: activeFiles, pages: 2, currentPage: 1 })
          const wrapper = getMountedWrapper({ store, loading: false })

          const pagination = wrapper.find(selectors.pagination)

          expect(pagination.exists()).toBeTruthy()
          stubs['oc-table-files'] = true
        })

        it('should not be visible if pages is less than one', () => {
          stubs['oc-table-files'] = false
          stubs.pagination = false
          stubs.RouterLink = RouterLinkStub
          const store = getStore({ activeFiles: activeFiles, pages: 1, currentPage: 1 })
          const wrapper = getMountedWrapper({ store, loading: false })

          const pagination = wrapper.find(selectors.pagination)

          expect(pagination.exists()).toBeFalsy()
          stubs['oc-table-files'] = true
        })
      })

      it('should call "$_mountSideBar_showDefaultPanel" method if "showDetails" event is emitted from oc files table component', () => {
        const spyMountSideBarShowDefaultPanel = jest.spyOn(
          MixinMountSideBar.methods,
          '$_mountSideBar_showDefaultPanel'
        )
        const wrapper = getMountedWrapper({ store, loading: false })
        console.log(wrapper.html())
        const filesTable = wrapper.find(filesTableStub)
        expect(spyMountSideBarShowDefaultPanel).toHaveBeenCalledTimes(0)

        filesTable.vm.$emit('showDetails')

        expect(spyMountSideBarShowDefaultPanel).toHaveBeenCalledTimes(1)
      })

      it('should call "$_fileActions_triggerDefaultAction" method if "fileClick" event is emitted from oc files table component', () => {
        const spyFileActionsTriggerDefaultAction = jest
          .spyOn(FileActions.methods, '$_fileActions_triggerDefaultAction')
          .mockImplementation()
        const wrapper = getMountedWrapper({ store, loading: false })
        const filesTable = wrapper.find(filesTableStub)
        expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(0)

        filesTable.vm.$emit('fileClick')

        expect(spyFileActionsTriggerDefaultAction).toHaveBeenCalledTimes(1)
      })

      it('should call "rowMounted" method if "rowMounted" event is emitted from oc files table component', () => {
        const spyRowMounted = jest
          .spyOn(SharedWithOthers.methods, 'rowMounted')
          .mockImplementation()
        const wrapper = getMountedWrapper({ store, loading: false })
        const filesTable = wrapper.find(filesTableStub)
        expect(spyRowMounted).toHaveBeenCalledTimes(0)

        filesTable.vm.$emit('rowMounted')

        expect(spyRowMounted).toHaveBeenCalledTimes(1)
      })
    })
  })

  function createStore({
    activeFiles = [],
    sidebarClosed = true,
    disablePreviews = false,
    totalFilesCount
  } = {}) {
    return getStore({ activeFiles, sidebarClosed, disablePreviews, totalFilesCount })
  }

  function getMountOptions({
    $route = { params: { page: 1 } },
    store = createStore(),
    loading = true
  }) {
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
    const component = { ...SharedWithOthers, created: jest.fn(), mounted: jest.fn() }
    return mount(component, getMountOptions({ store, loading }))
  }
})
