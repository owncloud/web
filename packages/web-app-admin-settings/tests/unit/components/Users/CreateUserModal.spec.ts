import CreateUserModal from '../../../../src/components/Users/CreateUserModal.vue'
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

describe('CreateUserModal', () => {
  describe('computed method "isFormInvalid"', () => {
    it('should be true if any data set is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.userName.valid = false
      expect(wrapper.vm.isFormInvalid).toBeTruthy()
    })
  })
  it('should be false if no data set is invalid', () => {
    const { wrapper } = getWrapper()
    Object.keys(wrapper.vm.formData).forEach((key) => {
      wrapper.vm.formData[key].valid = true
    })
    expect(wrapper.vm.isFormInvalid).toBeFalsy()
  })

  describe('method "validateUserName"', () => {
    it('should be false when userName is empty', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = ''
      expect(await wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName is longer than 255 characters', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = 'n'.repeat(256)
      expect(await wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName contains white spaces', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = 'jan owncCloud'
      expect(await wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName starts with a numeric value', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = '1moretry'
      expect(await wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName is already existing', async () => {
      const { wrapper, mocks } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      const getUserStub = graphMock.users.getUser.mockResolvedValue(
        mock<AxiosResponse>({ data: { onPremisesSamAccountName: 'jan' } })
      )
      wrapper.vm.user.onPremisesSamAccountName = 'jan'
      expect(await wrapper.vm.validateUserName()).toBeFalsy()
      expect(getUserStub).toHaveBeenCalled()
    })
    it('should be true when userName is valid', async () => {
      const { wrapper, mocks } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      const getUserStub = graphMock.users.getUser.mockRejectedValue(() => mockAxiosReject())
      wrapper.vm.user.onPremisesSamAccountName = 'jana'
      expect(await wrapper.vm.validateUserName()).toBeTruthy()
      expect(getUserStub).toHaveBeenCalled()
    })
  })

  describe('method "validateDisplayName"', () => {
    it('should be false when displayName is empty', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.displayName = ''
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be false when displayName is longer than 255 characters', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.displayName = 'n'.repeat(256)
      expect(await wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be true when displayName is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.displayName = 'jana'
      expect(wrapper.vm.validateDisplayName()).toBeTruthy()
    })
  })

  describe('method "validateEmail"', () => {
    it('should be false when email is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.mail = 'jana@'
      expect(wrapper.vm.validateEmail()).toBeFalsy()
    })

    it('should be true when email is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.mail = 'jana@owncloud.com'
      expect(wrapper.vm.validateEmail()).toBeTruthy()
    })
  })

  describe('method "validatePassword"', () => {
    it('should be false when password is empty', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.passwordProfile.password = ''
      expect(wrapper.vm.validatePassword()).toBeFalsy()
    })

    it('should be true when password is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.passwordProfile.password = 'asecret'
      expect(wrapper.vm.validatePassword()).toBeTruthy()
    })
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    mocks,
    wrapper: shallowMount(CreateUserModal, {
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
