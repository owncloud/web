import { mount, createLocalVue } from '@vue/test-utils'
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
    directives: { translate: jest.fn() },
    mocks: {
      $uppyService: {
        registerUploadInput: jest.fn(),
        removeUploadInput: jest.fn()
      }
    }
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
  })
})
