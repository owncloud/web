import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import FileUpload from '../../src/components/FileUpload.vue'
import DesignSystem from 'owncloud-design-system'
import stubs from '../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(DesignSystem)

const Translate = jest.fn()

describe('File Upload Component', () => {
  const mountOptions = {
    propsData: {
      path: ''
    },
    localVue,
    directives: { Translate }
  }

  it('should render component', () => {
    const wrapper = mount(FileUpload, mountOptions)

    expect(wrapper.exists()).toBeTruthy()
  })

  describe('when upload file button is clicked', () => {
    it('should call "triggerUpload"', async () => {
      const wrapper = mount(FileUpload, {
        ...mountOptions,
        stubs: {
          ...stubs,
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

      it('should call "$_ocUpload_addFileToQue"', async () => {
        const wrapper = shallowMount(FileUpload, mountOptions)
        wrapper.vm.$_ocUpload_addFileToQue = jest.fn()
        await wrapper.vm.$forceUpdate()

        const fileUploadInput = wrapper.find('#fileUploadInput')
        await fileUploadInput.trigger('change')

        expect(wrapper.vm.$_ocUpload_addFileToQue).toHaveBeenCalledTimes(1)
        expect(wrapper.vm.$_ocUpload_addFileToQue).toHaveBeenCalledWith(event)
      })
    })
  })
})
