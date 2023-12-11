import ResolvePublicLink from '../../../src/pages/resolvePublicLink.vue'
import {
  defaultPlugins,
  defaultComponentMocks,
  createStore,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { authService } from 'web-runtime/src/services/auth'
import { createMockThemeStore } from 'web-test-helpers/src/mocks/pinia'

jest.mock('web-runtime/src/services/auth')
const selectors = {
  cardFooter: '.oc-card-footer',
  ocSpinnerStub: 'oc-spinner-stub',
  submitButton: '.oc-login-authorize-button'
}

describe('resolvePublicLink', () => {
  it('should display the configuration theme general slogan as the login card footer', () => {
    const { wrapper } = getWrapper()
    const slogan = wrapper.find(selectors.cardFooter)
    expect(slogan.html()).toMatchSnapshot()
  })
  it('should display the loading spinner', () => {
    const { wrapper } = getWrapper({ passwordRequired: true })
    const loading = wrapper.find(selectors.ocSpinnerStub)
    expect(loading.exists()).toBeTruthy()
  })
  describe('password required form', () => {
    it('should display if password is required', async () => {
      const { wrapper } = getWrapper({ passwordRequired: true })
      await wrapper.vm.loadTokenInfoTask.last
      await wrapper.vm.isPasswordRequiredTask.last
      await wrapper.vm.$nextTick()
      expect(wrapper.find('form').html()).toMatchSnapshot()
    })
    describe('submit button', () => {
      it('should be set as disabled if "password" is empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadTokenInfoTask.last
        await wrapper.vm.isPasswordRequiredTask.last
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('true')
      })
      it('should be set as enabled if "password" is not empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadTokenInfoTask.last
        await wrapper.vm.isPasswordRequiredTask.last
        await wrapper.vm.$nextTick()
        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('false')
      })
      it('should resolve the public link on click', async () => {
        const resolvePublicLinkSpy = jest.spyOn(authService, 'resolvePublicLink')
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadTokenInfoTask.last
        await wrapper.vm.isPasswordRequiredTask.last
        await wrapper.vm.$nextTick()
        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()
        await wrapper.find(selectors.submitButton).trigger('submit')
        await wrapper.vm.resolvePublicLinkTask.last
        expect(resolvePublicLinkSpy).toHaveBeenCalled()
      })
    })
  })
})

function getWrapper({ passwordRequired = false } = {}) {
  const tokenInfo = { password_protected: passwordRequired ? 'true' : 'false' }
  const $clientService = mockDeep<ClientService>()
  $clientService.webdav.getFileInfo.mockResolvedValue(mockDeep<Resource>({ driveType: 'public' }))
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
      global: {
        plugins: [...defaultPlugins(), store, createMockThemeStore()],
        mocks,
        provide: mocks
      }
    })
  }
}
