import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
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

    describe('when file is selected for upload', () => {
      const event = new Event('change')

      it('should call "$_ocUpload_addFileToQueue"', async () => {
        const wrapper = shallowMount(FileUpload, {
          ...getOptions(),
          stubs: {
            'oc-button': true,
            'oc-icon': true
          }
        })
        wrapper.vm.$_ocUpload_addFileToQueue = jest.fn()
        await wrapper.vm.$forceUpdate()

        const fileUploadInput = wrapper.find('#fileUploadInput')
        await fileUploadInput.trigger('change')

        expect(wrapper.vm.$_ocUpload_addFileToQueue).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.$_ocUpload_addFileToQueue).toHaveBeenCalledWith(event)
      })
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
    directives: { Translate }
  }
}
