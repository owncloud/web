import { mock } from 'jest-mock-extended'
import SetLinkPasswordModal from '../../../../src/components/Modals/SetLinkPasswordModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { Modal } from '@ownclouders/web-pkg'

describe('SetLinkPasswordModal', () => {
  it('should render a text input field for the password', () => {
    const { wrapper } = getWrapper()

    expect(wrapper.find('oc-text-input-stub').exists()).toBeTruthy()
  })
  describe('method "onConfirm"', () => {
    it('updates the link', async () => {
      const { wrapper, storeOptions } = getWrapper()
      await wrapper.vm.onConfirm()

      expect(storeOptions.modules.Files.actions.updateLink).toHaveBeenCalled()
      expect(storeOptions.actions.showMessage).toHaveBeenCalled()
    })
    it('shows an error message on error', async () => {
      const { wrapper, storeOptions } = getWrapper()
      storeOptions.modules.Files.actions.updateLink.mockRejectedValue(new Error(''))
      await wrapper.vm.onConfirm()

      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
    })
  })
})

function getWrapper({ link = {} } = {}) {
  const mocks = { ...defaultComponentMocks() }

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    mocks,
    storeOptions,
    wrapper: shallowMount(SetLinkPasswordModal, {
      props: {
        modal: mock<Modal>(),
        link
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
