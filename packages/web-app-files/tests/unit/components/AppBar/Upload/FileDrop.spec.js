import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import vue2DropZone from 'vue2-dropzone'
import FileDrop from '../../../../../src/components/AppBar/Upload/FileDrop.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vue2DropZone)

describe('FileDrop component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when dropzone is disabled', () => {
    it('should not render component', () => {
      const store = createStore({
        dropzone: jest.fn(() => false)
      })
      const wrapper = createWrapper({ store })
      const dropZone = wrapper.findComponent(vue2DropZone)

      expect(dropZone.exists()).toBeFalsy()
    })
  })

  describe('when dropzone is enabled', () => {
    const spyOcUploadAddDropToQueue = jest
      .spyOn(FileDrop.mixins[0].methods, '$_ocUpload_addDropToQueue')
      .mockImplementation()
    const spyOcDropzoneDragEnd = jest
      .spyOn(FileDrop.methods, '$_ocDropzone_dragEnd')
      .mockImplementation()
    const spyOcDropzoneRemoveFiles = jest
      .spyOn(FileDrop.methods, '$_ocDropzone_removeFiles')
      .mockImplementation()

    const store = createStore({
      dropzone: jest.fn(() => true)
    })
    const wrapper = createWrapper({ store })
    const dropZone = wrapper.findComponent(vue2DropZone)

    it('should render component', () => {
      wrapper.setData({
        ocDropzone_options: {
          url: '#',
          clickable: false,
          autoQueue: false
        }
      })
      expect(dropZone.exists()).toBeTruthy()
      expect(dropZone.props().options.url).toEqual('#')
      expect(dropZone.props().options.clickable).toEqual(false)
      expect(dropZone.props().options.autoQueue).toEqual(false)
      expect(dropZone.text()).toEqual('Drag and drop to upload content into current folder')
    })
    it('should call "$_ocUpload_addDropToQueue" if file-drop event is triggered', () => {
      dropZone.vm.$emit('vdropzone-drop')

      expect(spyOcUploadAddDropToQueue).toHaveBeenCalledTimes(1)
    })
    it('should call "$_ocDropzone_dragEnd" if files-added event is triggered', () => {
      dropZone.vm.$emit('vdropzone-files-added')

      expect(spyOcDropzoneDragEnd).toHaveBeenCalledTimes(1)
    })
    it('should call "$_ocDropzone_dragEnd" if drag-leave event is triggered', () => {
      dropZone.vm.$emit('vdropzone-drag-leave')

      expect(spyOcDropzoneDragEnd).toHaveBeenCalledTimes(1)
    })
    it('should call "$_ocDropzone_removeFiles" if file remove event is triggered', () => {
      dropZone.vm.$emit('vdropzone-file-added')

      expect(spyOcDropzoneRemoveFiles).toHaveBeenCalledTimes(1)
    })
  })
})

function createWrapper(options = {}) {
  return shallowMount(FileDrop, {
    localVue,
    stubs: { translate: true, 'oc-dropzone': true },
    propsData: {
      rootPath: '/',
      path: '/'
    },
    computed: {
      hasSidebarNavItems: jest.fn(() => true)
    },
    ...options
  })
}

function createStore(getters) {
  return new Vuex.Store({
    state: {
      navigation: {
        closed: false
      }
    },
    modules: {
      Files: {
        namespaced: true,
        getters
      }
    }
  })
}
