import CreateGroupModal from '../../../../src/components/Groups/CreateGroupModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mockAxiosReject,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { AxiosResponse } from 'axios'

describe('CreateGroupModal', () => {
  describe('computed method "isFormInvalid"', () => {
    it('should be true if any data set is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.displayName.valid = false
      expect(wrapper.vm.isFormInvalid).toBeTruthy()
    })
    it('should be false if no data set is invalid', () => {
      const { wrapper } = getWrapper()
      Object.keys(wrapper.vm.formData).forEach((key) => {
        wrapper.vm.formData[key].valid = true
      })
      expect(wrapper.vm.isFormInvalid).toBeFalsy()
    })
  })
  describe('method "validateDisplayName"', () => {
    it('should be false when displayName is empty', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.group.displayName = ''
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be false when displayName is longer than 255 characters', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.group.displayName = 'n'.repeat(256)
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be false when displayName is already existing', async () => {
      const { wrapper, mocks } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      wrapper.vm.group.displayName = 'admins'
      const getGroupSub = graphMock.groups.getGroup.mockResolvedValue(
        mock<AxiosResponse>({ data: { displayName: 'admins' } })
      )
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
      expect(getGroupSub).toHaveBeenCalled()
    })
    it('should be true when displayName is valid', async () => {
      const { wrapper, mocks } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      const getGroupSub = graphMock.groups.getGroup.mockRejectedValue(() => mockAxiosReject())
      wrapper.vm.group.displayName = 'users'
      expect(await wrapper.vm.validateDisplayName()).toBeTruthy()
      expect(getGroupSub).toHaveBeenCalled()
    })
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    mocks,
    wrapper: shallowMount(CreateGroupModal, {
      props: {
        cancel: jest.fn(),
        confirm: jest.fn()
      },
      global: {
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
