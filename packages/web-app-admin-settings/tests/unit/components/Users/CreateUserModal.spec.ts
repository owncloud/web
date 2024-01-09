import CreateUserModal from '../../../../src/components/Users/CreateUserModal.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosReject,
  mockAxiosResolve,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { AxiosResponse } from 'axios'
import { Modal, eventBus, useMessages } from '@ownclouders/web-pkg'

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
  describe('method "onConfirm"', () => {
    it('should not create user if form is invalid', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper()

      const eventSpy = jest.spyOn(eventBus, 'publish')
      try {
        await wrapper.vm.onConfirm()
      } catch (error) {}

      const { showMessage } = useMessages()
      expect(showMessage).not.toHaveBeenCalled()
      expect(eventSpy).not.toHaveBeenCalled()
    })
    it('should create user on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.users.getUser.mockRejectedValueOnce(new Error(''))

      wrapper.vm.user.onPremisesSamAccountName = 'foo'
      wrapper.vm.validateUserName()
      wrapper.vm.user.displayName = 'foo bar'
      await wrapper.vm.validateDisplayName()
      wrapper.vm.user.mail = 'foo@bar.com'
      wrapper.vm.validateEmail()
      wrapper.vm.user.passwordProfile.password = 'asecret'
      wrapper.vm.validatePassword()

      mocks.$clientService.graphAuthenticated.users.createUser.mockImplementation(() =>
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )
      mocks.$clientService.graphAuthenticated.users.getUser.mockResolvedValueOnce(
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )

      const eventSpy = jest.spyOn(eventBus, 'publish')
      await wrapper.vm.onConfirm()

      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
      expect(eventSpy).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.users.getUser.mockRejectedValue(new Error(''))

      wrapper.vm.user.onPremisesSamAccountName = 'foo'
      wrapper.vm.validateUserName()
      wrapper.vm.user.displayName = 'foo bar'
      await wrapper.vm.validateDisplayName()
      wrapper.vm.user.mail = 'foo@bar.com'
      wrapper.vm.validateEmail()
      wrapper.vm.user.passwordProfile.password = 'asecret'
      wrapper.vm.validatePassword()

      mocks.$clientService.graphAuthenticated.users.createUser.mockImplementation(() =>
        mockAxiosResolve({ id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5' })
      )
      const eventSpy = jest.spyOn(eventBus, 'publish')
      await wrapper.vm.onConfirm()

      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
      expect(eventSpy).not.toHaveBeenCalled()
    })
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()

  return {
    mocks,
    wrapper: shallowMount(CreateUserModal, {
      props: {
        modal: mock<Modal>()
      },
      global: {
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins()]
      }
    })
  }
}
