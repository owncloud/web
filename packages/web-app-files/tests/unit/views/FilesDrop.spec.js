import FilesDrop from '@files/src/views/FilesDrop.vue'
import { shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import vue2DropZone from 'vue2-dropzone'
import { getStore, localVue } from './views.setup.js'

localVue.use(vue2DropZone)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

localVue.prototype.$client.publicFiles = {
  PUBLIC_LINK_SHARE_OWNER: 'admin',
  // function is mocked because it should return a promise with a list of resources
  list: () => [{ getProperty: jest.fn((val) => val) }],
  // function takes token as an argument and is mocked because it should return some public link url
  getFileUrl: (token) => `http://some-url/${token}`,
  putFileContents: jest.fn()
}

const $route = {
  meta: {
    title: 'page route title'
  },
  params: {
    token: 'abc123def456'
  }
}

const selectors = {
  filesEmpty: '.files-empty',
  loadingHeader: '.oc-login-card-title'
}

const ocSpinnerStubSelector = 'oc-spinner-stub'
const ocTableSimpleStubSelector = 'oc-table-simple-stub'
const ocTableRowStubSelector = 'oc-tr-stub'

describe('FilesDrop', () => {
  it('should call "resolvePublicLink" method on wrapper mount', () => {
    const spyResolvePublicLink = jest.spyOn(FilesDrop.methods, 'resolvePublicLink')
    getShallowWrapper()

    expect(spyResolvePublicLink).toHaveBeenCalledTimes(1)
  })

  it('should show page title and configuration theme general slogan', () => {
    const wrapper = getShallowWrapper()

    expect(wrapper).toMatchSnapshot()
  })

  it('should show spinner with loading text if wrapper is loading', () => {
    const wrapper = getShallowWrapper({ loading: true })

    expect(wrapper.find(selectors.loadingHeader).exists()).toBeTruthy()
    expect(wrapper.find(ocSpinnerStubSelector).exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  describe('when "loading" is set to false', () => {
    const spyDropZoneFileAdded = jest.spyOn(FilesDrop.methods, 'dropZoneFileAdded')

    const wrapper = getShallowWrapper()

    it('should not show spinner and loading header', () => {
      expect(wrapper.find(selectors.loadingHeader).exists()).toBeFalsy()
      expect(wrapper.find(ocSpinnerStubSelector).exists()).toBeFalsy()
    })

    it('should show share information title', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should show vue drop zone with given options', () => {
      const dropZone = wrapper.findComponent(vue2DropZone)

      expect(dropZone.exists()).toBeTruthy()
      expect(dropZone.props()).toMatchObject({
        id: 'oc-dropzone',
        options: {
          // from the mocked function
          url: 'http://some-url/abc123def456/',
          clickable: true,
          createImageThumbnails: false,
          autoQueue: false,
          previewsContainer: '#previews'
        },
        includeStyling: false,
        awss3: null,
        destroyDropzone: true,
        duplicateCheck: false,
        useCustomSlot: true
      })
    })

    it('should show error message if only it has truthy value', () => {
      const wrapper = getShallowWrapper({
        loading: false,
        errorMessage: 'This is a test error message'
      })

      expect(wrapper).toMatchSnapshot()
    })

    it('should not show files table if uploaded files list is empty', () => {
      expect(wrapper.find(selectors.filesEmpty).exists()).toBeTruthy()
      expect(wrapper.find(selectors.filesEmpty)).toMatchSnapshot()
      expect(wrapper.find(ocTableSimpleStubSelector).exists()).toBeFalsy()
    })

    it('should show files list of uploaded files', async () => {
      const uploadedFiles = new Map()
      const files = [
        { name: 'file1', size: 300, status: 'error' },
        { name: 'file2', size: 600, status: 'done' },
        { name: 'file3', size: 900, status: 'init' },
        { name: 'file4', size: 1200, status: 'uploading' }
      ]
      uploadedFiles.set(1, files[0])
      uploadedFiles.set(2, files[1])
      uploadedFiles.set(3, files[2])
      uploadedFiles.set(4, files[3])

      const wrapper = shallowMount(FilesDrop, {
        localVue,
        store: createStore(),
        mocks: {
          $route
        },
        data() {
          return {
            uploadedFiles: uploadedFiles,
            uploadedFilesChangeTracker: 1
          }
        }
      })

      // table is visible only after two next-ticks
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const tableElement = wrapper.find(ocTableSimpleStubSelector)
      const rows = tableElement.findAll(ocTableRowStubSelector)

      expect(rows.length).toBe(4)

      expect(wrapper).toMatchSnapshot()
    })

    it('should call "dropZoneFileAdded" method if "vdropzone-file-added" event is emitted', async () => {
      const event = {
        upload: {
          uuid: 'abc123'
        },
        name: 'file1.txt',
        size: '300'
      }
      const expectedMap = new Map()
      const expectedDoneMap = expectedMap.set(event.upload.uuid, {
        name: event.name,
        size: event.size,
        status: 'done'
      })

      const dropZone = wrapper.findComponent(vue2DropZone)

      expect(spyDropZoneFileAdded).not.toHaveBeenCalled()

      // drag and drop cannot be performed in unit tests
      // only checking how wrapper responds when dropzone emits the event specified below
      await dropZone.vm.$emit('vdropzone-file-added', event)

      expect(spyDropZoneFileAdded).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.uploadedFilesChangeTracker).toBe(1)

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.uploadedFilesChangeTracker).toBe(2)
      expect(wrapper.vm.uploadedFiles).toMatchObject(expectedDoneMap)

      await wrapper.vm.$nextTick()

      const tableElement = wrapper.find(ocTableSimpleStubSelector)
      const rows = tableElement.findAll(ocTableRowStubSelector)

      expect(rows.length).toBe(1)

      expect(wrapper).toMatchSnapshot()
    })
  })
})

function createStore(slogan = 'some slogan', davProperties = []) {
  return getStore({ slogan, davProperties })
}

function getShallowWrapper({ store = createStore(), loading = false, errorMessage = null } = {}) {
  return shallowMount(FilesDrop, {
    localVue,
    store,
    mocks: {
      $route
    },
    data() {
      return {
        loading: loading,
        errorMessage: errorMessage,
        share: {
          getProperty: (val) => val
        }
      }
    }
  })
}
