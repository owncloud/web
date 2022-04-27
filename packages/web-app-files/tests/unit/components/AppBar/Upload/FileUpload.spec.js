import { mount, createLocalVue } from '@vue/test-utils'
import FileUpload from '../../../../../src/components/AppBar/Upload/FileUpload.vue'
import DesignSystem from 'owncloud-design-system'

const Translate = jest.fn()

describe('File Upload Component', () => {
  it('should render component', () => {
    const wrapper = mount(FileUpload, getOptions())

    expect(wrapper.exists()).toBeTruthy()
  })

  describe('when upload file button is clicked', () => {
    it('should call "triggerUpload"', async () => {
      const wrapper = mount(FileUpload, {
        ...getOptions(),
        stubs: {
          'oc-icon': true,
          'oc-button': false
        }
      })

      const spyTriggerUpload = jest.spyOn(wrapper.vm, 'triggerUpload')
      const uploadButton = wrapper.find('button')
      const fileUploadInput = wrapper.find('#fileUploadInput')
      fileUploadInput.element.click = jest.fn()
      await wrapper.vm.$forceUpdate()

      await uploadButton.trigger('click')

      expect(spyTriggerUpload).toHaveBeenCalledTimes(1)
      expect(fileUploadInput.element.click).toHaveBeenCalledTimes(1)
    })
  })
})

function getOptions() {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)
  return {
    propsData: {
      path: ''
    },
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
