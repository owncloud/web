import ResolvePublicLink from '../../../src/pages/resolvePublicLink.vue'
import {
  defaultPlugins,
  defaultComponentMocks,
  createStore,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'
import { Resource } from 'web-client'

jest.mock('web-runtime/src/services/auth')
const selectors = {
  cardFooter: '.oc-card-footer',
  cardBody: '.oc-card-body',
  submitButton: '.oc-login-authorize-button',
  errorTitle: '.oc-link-resolve-error-title',
  publicLinkPasswordRequired: 'form > .oc-card-title'
}
const spinnerStub = 'oc-spinner-stub'
const textInputStub = 'oc-text-input-stub'

describe('resolvePublicLink', () => {
  describe('theming options', () => {
    it('should display the configuration theme general slogan as the login card footer', () => {
      const { wrapper } = getWrapper({ loading: true })
      const slogan = wrapper.find(selectors.cardFooter)
      expect(slogan.html()).toMatchSnapshot()
    })
  })

  describe('when the view is still loading', () => {
    const { wrapper } = getWrapper({ loading: true })
    it('should display the loading text with the spinner', () => {
      const loading = wrapper.find(selectors.cardBody)

      expect(wrapper.find(spinnerStub).exists()).toBeTruthy()
      expect(loading.html()).toMatchSnapshot()
    })
    it('should not display the error message', () => {
      expect(wrapper.find(selectors.errorTitle).exists()).toBeFalsy()
    })
    it('should not display the password required form', () => {
      expect(wrapper.find(selectors.publicLinkPasswordRequired).exists()).toBeFalsy()
    })
  })

  describe('when the view is not loading anymore', () => {
    it('should not display the loading text and the spinner', async () => {
      const { wrapper } = getWrapper()
      const loading = wrapper.find(selectors.cardBody)
      expect(loading.exists()).toBeFalsy()
    })
    it('should display the error message if "errorMessage" is not empty', async () => {
      const { wrapper } = getWrapper({ errorMessage: 'some-error-message' })
      expect(wrapper.find(selectors.errorTitle).exists()).toBeTruthy()
      expect(wrapper.find(selectors.errorTitle).html()).toMatchSnapshot()
    })

    describe('and when "passwordRequired" is set as true', () => {
      let passwordRequiredForm
      const { wrapper } = getWrapper({ passwordRequired: true })

      beforeEach(async () => {
        passwordRequiredForm = wrapper.find('form')
      })
      it('should display the password required form', () => {
        expect(passwordRequiredForm.exists()).toBeTruthy()
        expect(passwordRequiredForm.html()).toMatchSnapshot()
      })
      describe('and the password input', () => {
        it('should have a computed label', () => {
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput.html()).toMatchSnapshot()
        })
        it('should not display the error message if "inputErrorMessage" is falsy', () => {
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput.attributes().errormessage).toBeUndefined()
        })
        it('should display the error message if "inputErrorMessage" is not empty', async () => {
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput.html()).toMatchSnapshot()
        })
      })
      describe('and the submit button', () => {
        it('should be set as disabled if "password" is empty', () => {
          expect(wrapper.vm.password).toBe('')

          const submitButton = wrapper.find(selectors.submitButton)
          expect(submitButton.exists()).toBeTruthy()
          expect(submitButton.html()).toMatchSnapshot()
        })
        it('should be set as enabled if "password" is not empty', async () => {
          const { wrapper } = getWrapper({ passwordRequired: true, password: 'some-value' })
          expect(wrapper.vm.password).toBe('some-value')

          const submitButton = wrapper.find(selectors.submitButton)
          expect(submitButton.exists()).toBeTruthy()
          expect(submitButton.attributes().disabled).toBeUndefined()
        })
      })
      it('should call "resolvePublicLink" method on form submit', async () => {
        const spyResolvePublicLink = jest.spyOn(wrapper.vm.resolvePublicLinkTask, 'perform')
        const submitButton = wrapper.find(selectors.submitButton)
        await submitButton.trigger('submit')

        expect(spyResolvePublicLink).toHaveBeenCalledTimes(1)
      })
    })
  })
})

function getWrapper({
  loading = false,
  tokenInfo = {},
  driveType = 'public',
  errorMessage = undefined,
  password = '',
  passwordRequired = false
} = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.webdav.getFileInfo.mockResolvedValue(mockDeep<Resource>({ driveType }))
  $clientService.owncloudSdk.shares.getUnprotectedTokenInfo.mockResolvedValue(tokenInfo)
  $clientService.owncloudSdk.shares.getProtectedTokenInfo.mockResolvedValue(tokenInfo)
  const mocks = { ...defaultComponentMocks(), $clientService }

  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({
    files_sharing: { federation: { incoming: true, outgoing: true } }
  }))
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(ResolvePublicLink, {
      data: () => ({
        isLoading: loading,
        password,
        errorMessage,
        isPasswordRequired: passwordRequired
      }),
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
