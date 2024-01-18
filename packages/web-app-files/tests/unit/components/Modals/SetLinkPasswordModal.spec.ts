import { mock } from 'jest-mock-extended'
import SetLinkPasswordModal from '../../../../src/components/Modals/SetLinkPasswordModal.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { Modal, useMessages, useSharesStore } from '@ownclouders/web-pkg'

describe('SetLinkPasswordModal', () => {
  it('should render a text input field for the password', () => {
    const { wrapper } = getWrapper()

    expect(wrapper.find('oc-text-input-stub').exists()).toBeTruthy()
  })
  describe('method "onConfirm"', () => {
    it('updates the link', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.onConfirm()

      const sharesStore = useSharesStore()
      expect(sharesStore.updateLink).toHaveBeenCalled()
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('shows an error message on error', async () => {
      const { wrapper } = getWrapper()
      const sharesStore = useSharesStore()
      ;(sharesStore.updateLink as any).mockRejectedValue(new Error(''))
      await wrapper.vm.onConfirm()

      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })
})

function getWrapper({ link = {} } = {}) {
  const mocks = { ...defaultComponentMocks() }

  return {
    mocks,
    wrapper: shallowMount(SetLinkPasswordModal, {
      props: {
        modal: mock<Modal>(),
        link
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}
