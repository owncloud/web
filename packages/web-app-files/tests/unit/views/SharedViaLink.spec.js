import { shallowMount, mount } from '@vue/test-utils'
import { useTask } from 'vue-concurrency'
import { getStore, localVue, createFile } from './views.setup.js'
import FileActions from '@files/src/mixins/fileActions'
import SharedViaLink from '@files/src/views/SharedViaLink.vue'

const $router = {
  afterEach: jest.fn(),
  currentRoute: {
    query: {
      name: null
    }
  }
}

const $route = {
  params: {
    fileId: '2147491323'
  },
  meta: {
    title: 'Resolving private link'
  }
}

const activeFilesCurrentPage = [createFile({ id: 2147491323, type: 'file' })]
localVue.use(useTask)
localVue.prototype.$client.requests = {
  ocs: jest.fn(() => ({
    status: 200,
    json: jest.fn(() =>
      Promise.resolve({
        ocs: {
          data: activeFilesCurrentPage
        }
      })
    )
  }))
}

const stubs = {
  'router-link': true,
  'no-content-message': true,
  pagination: true,
  'oc-table-files': false,
  'context-actions': true,
  'list-info': true
}

const selectors = {
  listLoader: '#files-list-progress',
  noContentMessage: '#files-shared-via-link-empty',
  ocTableFiles: '#files-shared-via-link-table',
  contextActions: 'context-actions-stub',
  listInfo: 'list-info-stub'
}

describe('SharedViaLink view', () => {
  const spyTriggerDefaultAction = jest
    .spyOn(FileActions.methods, '$_fileActions_triggerDefaultAction')
    .mockImplementation()
  const spyRowMounted = jest.spyOn(SharedViaLink.methods, 'rowMounted')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.only('when the view is still loading', () => {
    it('should show list-loader component', () => {
      const store = createStore()
      const wrapper = getWrapper(store)
      const listLoader = wrapper.find(selectors.listLoader)

      expect(listLoader.exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('when the view is not loading anymore', () => {
    it.only('should not show list-loader component', async () => {
      const store = createStore()
      const wrapper = getWrapper(store)
      // these are required to wait for all async tasks to resolve
      // and loadResourcesTask.isRunning to be false
      // or we can use fulsh-promises
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.listLoader).exists()).toBeFalsy()
    })

    describe('when there are no files to be displayed', () => {
      let wrapper
      beforeEach(async () => {
        stubs['no-content-message'] = false
        const store = createStore()
        wrapper = getWrapper(store)
      })

      it('should show no-content-message component', () => {
        const noContentMessage = wrapper.find(selectors.noContentMessage)

        expect(noContentMessage.exists()).toBeTruthy()
        expect(wrapper).toMatchSnapshot()
      })
      it('should not show oc-table-files component', () => {
        expect(wrapper.find(selectors.ocTableFiles).exists()).toBeFalsy()
      })
    })

    describe('when there are one or more files to be displayed', () => {
      let wrapper
      beforeEach(async () => {
        const store = createStore(activeFilesCurrentPage)
        wrapper = getWrapper(store)
      })

      it('should not show no-content-message component', () => {
        expect(wrapper.find(selectors.noContentMessage).exists()).toBeFalsy()
      })
      it('should show oc-table-files component with props', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(ocTableFiles.exists()).toBeTruthy()
        expect(ocTableFiles.props().resources).toMatchObject(activeFilesCurrentPage)
        expect(ocTableFiles.props().areThumbnailsDisplayed).toBe(false)
        expect(ocTableFiles.props().headerPosition).toBe(0)
        expect(ocTableFiles.props().targetRoute).toMatchObject({ name: 'files-personal' })
      })
      it('should set props on list-info component', () => {
        const listInfo = wrapper.find(selectors.listInfo)

        expect(listInfo.props().files).toEqual(activeFilesCurrentPage.length)
        expect(listInfo.props().folders).toEqual(0)
      })
      it('should trigger the default action when a "fileClick" event gets emitted', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

        ocTableFiles.vm.$emit('fileClick')

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
      })
      it('should lazily load previews when a "rowMounted" event gets emitted', () => {
        expect(spyRowMounted).toHaveBeenCalledTimes(activeFilesCurrentPage.length)
      })
      it('should not show context actions', () => {
        const contextActions = wrapper.find(selectors.contextActions)

        expect(contextActions.exists()).toBeFalsy()
      })

      describe('when a file is highlighted', () => {
        it('should set props on context-actions component', async () => {
          const store = createStore(activeFilesCurrentPage, activeFilesCurrentPage[0])
          const wrapper = getWrapper(store)

          const contextActions = wrapper.find(selectors.contextActions)

          expect(contextActions.exists()).toBeTruthy()
          expect(contextActions.props().item).toMatchObject(activeFilesCurrentPage[0])
        })
      })
    })
  })
})

function getWrapper(store) {
  return mount(SharedViaLink, {
    localVue,
    store,
    stubs,
    mocks: {
      $route,
      $router
    }
  })
}

function getShallowWrapper(store) {
  return shallowMount(SharedViaLink, {
    localVue,
    store,
    mocks: {
      $route,
      $router
    }
  })
}

function createStore(activeFilesCurrentPage = [], highlightedFile = null) {
  return getStore({
    highlightedFile: highlightedFile,
    activeFilesCurrentPage,
    totalFilesCount: { files: activeFilesCurrentPage.length, folders: 0 }
  })
}
