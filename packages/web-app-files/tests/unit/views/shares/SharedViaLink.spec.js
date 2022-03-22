import { shallowMount, mount } from '@vue/test-utils'
import { getStore, localVue, createFile } from '../views.setup.js'
import VueRouter from 'vue-router'
import { createLocationSpaces } from '../../../../src/router'
import FileActions from '@files/src/mixins/fileActions'
import SharedViaLink from '@files/src/views/shares/SharedViaLink.vue'
localVue.use(VueRouter)

const component = { ...SharedViaLink, mounted: jest.fn() }

const resources = [
  createFile({ id: 2147491323, type: 'file' }),
  createFile({ id: 2147491324, type: 'file' })
]

const stubs = {
  'resource-table': false,
  'context-actions': true,
  pagination: true,
  'list-info': true
}

const listLoaderStub = 'app-loading-spinner-stub'
const listInfoStub = 'list-info-stub'
const contextActionsStub = 'context-actions-stub'

const selectors = {
  noContentMessage: '#files-shared-via-link-empty',
  ocTableFiles: '#files-shared-via-link-table'
}

describe('SharedViaLink view', () => {
  const spyTriggerDefaultAction = jest
    .spyOn(FileActions.methods, '$_fileActions_triggerDefaultAction')
    .mockImplementation()
  const spyRowMounted = jest.spyOn(SharedViaLink.methods, 'rowMounted')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the view is still loading', () => {
    it('should show app-loading-spinner component', () => {
      const wrapper = getShallowWrapper({ loading: true })
      const listLoader = wrapper.find(listLoaderStub)

      expect(listLoader.exists()).toBeTruthy()
    })
  })

  describe('when the view is not loading anymore', () => {
    it('should not app-loading-spinner component', () => {
      const wrapper = getShallowWrapper()
      expect(wrapper.find(listLoaderStub).exists()).toBeFalsy()
    })

    describe('when there are no files to be displayed', () => {
      let wrapper
      beforeEach(() => {
        wrapper = getMountedWrapper({ stubs })
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
      beforeEach(() => {
        const store = createStore({
          totalFilesCount: { files: resources.length, folders: 0 }
        })
        wrapper = getMountedWrapper({
          store,
          setup: {
            paginatedResources: resources
          }
        })
      })

      it('should not show no-content-message component', () => {
        expect(wrapper.find(selectors.noContentMessage).exists()).toBeFalsy()
      })
      it('should show oc-table-files component with props', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(ocTableFiles.exists()).toBeTruthy()
        expect(ocTableFiles.props().resources).toMatchObject(resources)
        expect(ocTableFiles.props().areThumbnailsDisplayed).toBe(false)
        expect(ocTableFiles.props().headerPosition).toBe(0)
        expect(ocTableFiles.props().targetRoute).toMatchObject(
          createLocationSpaces('files-spaces-personal-home')
        )
      })
      it('should set props on list-info component', () => {
        const listInfo = wrapper.find(listInfoStub)

        expect(listInfo.props().files).toEqual(resources.length)
        expect(listInfo.props().folders).toEqual(0)
      })
      it('should trigger the default action when a "fileClick" event gets emitted', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

        ocTableFiles.vm.$emit('fileClick')

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
      })
      it('should lazily load previews when a "rowMounted" event gets emitted', () => {
        expect(spyRowMounted).toHaveBeenCalledTimes(resources.length)
      })
      it('should not show context actions', () => {
        const contextActions = wrapper.find(contextActionsStub)

        expect(contextActions.exists()).toBeFalsy()
      })

      describe('when a file is highlighted', () => {
        it('should set props on context-actions component', () => {
          const selectedFiles = [resources[0]]
          const store = createStore({
            totalFilesCount: { files: resources.length, folders: 0 },
            selectedFiles: selectedFiles
          })
          const wrapper = getMountedWrapper({
            store: store,
            setup: {
              paginatedResources: resources
            }
          })
          const contextActions = wrapper.find(contextActionsStub)

          expect(contextActions.exists()).toBeTruthy()
          expect(contextActions.props().items).toMatchObject(selectedFiles)
        })
      })
    })
  })
})

function mountOptions(store, loading, setup = {}) {
  const routes = [
    {
      name: 'files-spaces-personal-home',
      path: '/'
    }
  ]
  return {
    localVue,
    store: store,
    stubs,
    router: new VueRouter({ routes }),
    setup: () => ({
      loadResourcesTask: {
        isRunning: loading,
        perform: jest.fn()
      },
      ...setup
    })
  }
}

function getMountedWrapper({ store = createStore(), loading = false, setup } = {}) {
  return mount(component, mountOptions(store, loading, setup))
}

function getShallowWrapper({ store = createStore(), loading = false, setup } = {}) {
  return shallowMount(component, mountOptions(store, loading, setup))
}

function createStore({ totalFilesCount, highlightedFile, selectedFiles } = {}) {
  return getStore({
    highlightedFile,
    totalFilesCount,
    selectedFiles
  })
}
