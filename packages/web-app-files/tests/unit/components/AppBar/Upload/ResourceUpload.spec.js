import { mount, createLocalVue } from '@vue/test-utils'
import ResourceUpload from '../../../../../src/components/AppBar/Upload/ResourceUpload.vue'
import DesignSystem from '@ownclouders/design-system'

const Translate = jest.fn()

describe('Resource Upload Component', () => {
  describe('file upload', () => {
    it('should render component', () => {
      const wrapper = mount(ResourceUpload, getOptions())
      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('folder upload', () => {
    it('should render component', () => {
      const wrapper = mount(ResourceUpload, getOptions({ isFolder: true }))
      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('when upload file button is clicked', () => {
    it('should call "triggerUpload"', async () => {
      const wrapper = mount(ResourceUpload, {
        ...getOptions(),
        stubs: {
          'oc-icon': true,
          'oc-button': false
        }
      })

      const spyTriggerUpload = jest.spyOn(wrapper.vm, 'triggerUpload')
      const uploadButton = wrapper.find('button')
      const fileUploadInput = wrapper.find('#files-file-upload-input')
      fileUploadInput.element.click = jest.fn()
      await wrapper.vm.$forceUpdate()

      await uploadButton.trigger('click')

      expect(spyTriggerUpload).toHaveBeenCalledTimes(1)
      expect(fileUploadInput.element.click).toHaveBeenCalledTimes(1)
    })
  })
})

function getOptions(propsData = {}) {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)
  return {
    propsData,
    localVue,
    directives: { Translate },
    mocks: {
      $uppyService: {
        registerUploadInput: jest.fn(),
        removeUploadInput: jest.fn()
      }
    }
  }
}
