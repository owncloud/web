import ResolvePublicLink from '../../../src/pages/resolvePublicLink.vue'
import { defaultPlugins, defaultComponentMocks, shallowMount, nextTicks } from 'web-test-helpers'
import { mockDeep } from 'vitest-mock-extended'
import { CapabilityStore, ClientService } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { authService } from 'web-runtime/src/services/auth'
import { useLoadTokenInfo } from '../../../src/composables/tokenInfo'
import { Task } from 'vue-concurrency'

vi.mock('web-runtime/src/services/auth')
vi.mock('web-runtime/src/composables/tokenInfo')

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
      await wrapper.vm.isPasswordRequiredTask.last
      await nextTicks(4)
      expect(wrapper.find('form').html()).toMatchSnapshot()
    })
    describe('submit button', () => {
      it('should be set as disabled if "password" is empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.isPasswordRequiredTask.last
        await nextTicks(4)
        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('true')
      })
      it('should be set as enabled if "password" is not empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.isPasswordRequiredTask.last
        await nextTicks(4)
        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('false')
      })
      it('should resolve the public link on click', async () => {
        const resolvePublicLinkSpy = vi.spyOn(authService, 'resolvePublicLink')
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.isPasswordRequiredTask.last
        await nextTicks(4)
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
  const tokenInfo = { password_protected: passwordRequired } as any
  vi.mocked(useLoadTokenInfo).mockReturnValue({
    loadTokenInfoTask: mockDeep<Task<any, any>>({
      perform: () => tokenInfo,
      isRunning: false,
      isError: false
    })
  })

  const $clientService = mockDeep<ClientService>()
  $clientService.webdav.getFileInfo.mockResolvedValue(mockDeep<Resource>({ driveType: 'public' }))
  const mocks = { ...defaultComponentMocks(), $clientService }

  const capabilities = {
    files_sharing: { federation: { incoming: true, outgoing: true } }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    wrapper: shallowMount(ResolvePublicLink, {
      global: {
        plugins: [...defaultPlugins({ piniaOptions: { capabilityState: { capabilities } } })],
        mocks,
        provide: mocks
      }
    })
  }
}
