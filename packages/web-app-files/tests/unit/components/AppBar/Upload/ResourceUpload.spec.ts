import ResourceUpload from '../../../../../src/components/AppBar/Upload/ResourceUpload.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount
} from 'web-test-helpers'

const Translate = jest.fn()

describe('Resource Upload Component', () => {
  describe('file upload', () => {
    it('should render component', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('folder upload', () => {
    it('should render component', () => {
      const { wrapper } = getWrapper({ isFolder: true })
      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('when upload file button is clicked', () => {
    it('should call "triggerUpload"', async () => {
      const { wrapper } = getWrapper()

      const spyTriggerUpload = jest.spyOn(wrapper.vm, 'triggerUpload')
      const uploadButton = wrapper.find('button')
      const fileUploadInput = wrapper.find('#files-file-upload-input')

      ;(fileUploadInput.element as HTMLElement).click = jest.fn()
      await wrapper.vm.$forceUpdate()

      await uploadButton.trigger('click')

      expect(spyTriggerUpload).toHaveBeenCalledTimes(1)
      expect((fileUploadInput.element as HTMLElement).click).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(props = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: mount(ResourceUpload, {
      props,
      global: {
        mocks,
        stubs: defaultStubs,
        plugins: [...defaultPlugins(), store],
        directives: { Translate }
      }
    })
  }
}
