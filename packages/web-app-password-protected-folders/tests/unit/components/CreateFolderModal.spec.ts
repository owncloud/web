import { defaultComponentMocks, defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import CreateFolderModal from '../../../src/components/CreateFolderModal.vue'
import { useCreateFileHandler } from '../../../src/composables/useCreateFileHandler'
import { mock } from 'vitest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { VueWrapper } from '@vue/test-utils'

vi.mock('../../../src/composables/useCreateFileHandler', () => ({
  useCreateFileHandler: vi.fn().mockReturnValue({ createFileHandler: vi.fn() })
}))

const currentFolder = mock<Resource>()
const currentSpace = mock<SpaceResource>()

const SELECTORS = Object.freeze({
  inputFolderName: '#input-folder-name',
  inputFolderPassword: '#input-folder-password'
})

describe('CreateFolderModal', () => {
  it('should call "createFileHandler" when form is valid', () => {
    const { wrapper } = getWrapper()

    const folderNameInput = wrapper.findComponent(SELECTORS.inputFolderName) as VueWrapper
    const passwordInput = wrapper.findComponent(SELECTORS.inputFolderPassword) as VueWrapper

    folderNameInput.vm.$emit('update:modelValue', 'name')
    passwordInput.vm.$emit('update:modelValue', 'password')

    wrapper.vm.onConfirm()

    expect(useCreateFileHandler().createFileHandler).toHaveBeenCalledWith({
      fileName: 'name',
      password: 'password',
      space: currentSpace,
      currentFolder
    })
  })

  it('should not call "createFileHandler" when form is invalid', () => {
    const { wrapper } = getWrapper()

    const folderNameInput = wrapper.findComponent(SELECTORS.inputFolderName) as VueWrapper
    folderNameInput.vm.$emit('update:modelValue', 'name')

    expect(wrapper.vm.onConfirm()).rejects.toThrow()
    expect(useCreateFileHandler().createFileHandler).not.toHaveBeenCalled()
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()

  return {
    wrapper: shallowMount(CreateFolderModal, {
      global: {
        plugins: defaultPlugins({
          piniaOptions: {
            resourcesStore: { currentFolder },
            spacesState: { currentSpace }
          }
        }),
        mocks,
        provide: mocks
      }
    }),
    mocks
  }
}
