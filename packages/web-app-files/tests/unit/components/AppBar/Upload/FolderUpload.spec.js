import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import FolderUpload from '@files/src/components/AppBar/Upload/FolderUpload.vue'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(DesignSystem)

const selector = {
  uploadInput: '#folderUploadInput',
  uploadButton: 'button'
}

describe('FolderUpload Component', () => {
  const mountOptions = {
    propsData: {
      rootPath: '/',
      path: '/'
    },
    localVue,
    directives: { translate: jest.fn() }
  }

  describe('when upload folder button is clicked', () => {
    it('should call "triggerUpload"', async () => {
      const spyTriggerUpload = jest.spyOn(FolderUpload.methods, 'triggerUpload')
      const wrapper = mount(FolderUpload, mountOptions)

      const uploadButton = wrapper.find(selector.uploadButton)
      const folderUploadInput = wrapper.find(selector.uploadInput)
      const spyClickUploadInput = jest.spyOn(folderUploadInput.element, 'click')

      await uploadButton.trigger('click')

      expect(spyTriggerUpload).toHaveBeenCalledTimes(1)
      expect(spyClickUploadInput).toHaveBeenCalledTimes(1)
    })

    describe('when folder is selected for upload', () => {
      it('should call "$_ocUpload_addDirectoryToQueue"', async () => {
        const spyOcUploadAddDirectoryToQueue = jest
          .spyOn(FolderUpload.mixins[0].methods, '$_ocUpload_addDirectoryToQueue')
          .mockImplementation()
        const wrapper = shallowMount(FolderUpload, {
          ...mountOptions,
          stubs: {
            'oc-icon': true,
            'oc-resource-icon': true,
            'oc-button': true
          }
        })

        const folderUploadInput = wrapper.find(selector.uploadInput)
        await folderUploadInput.trigger('change')

        expect(spyOcUploadAddDirectoryToQueue).toHaveBeenCalledTimes(1)
      })
    })
  })
})
