import ResolvePublicLink from '../../../src/pages/resolvePublicLink.vue'
import { defaultPlugins, defaultComponentMocks, shallowMount } from 'web-test-helpers'
import { mockDeep } from 'vitest-mock-extended'
import { CapabilityStore, ClientService, useRouteParam } from '@ownclouders/web-pkg'
import { HttpError, SpaceResource } from '@ownclouders/web-client'
import { authService } from 'web-runtime/src/services/auth'
import { ref } from 'vue'

vi.mock('web-runtime/src/services/auth')

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useRouteParam: vi.fn()
}))

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
      await wrapper.vm.loadLinkMetaDataTask.last

      expect(wrapper.find('form').html()).toMatchSnapshot()
    })
    describe('submit button', () => {
      it('should be set as disabled if "password" is empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadLinkMetaDataTask.last

        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('true')
      })
      it('should be set as enabled if "password" is not empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadLinkMetaDataTask.last
        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()

        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('false')
      })
      it('should resolve the public link on click', async () => {
        const resolvePublicLinkSpy = vi.spyOn(authService, 'resolvePublicLink')
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadLinkMetaDataTask.last

        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()
        await wrapper.find(selectors.submitButton).trigger('submit')
        await wrapper.vm.resolvePublicLinkTask.last

        expect(resolvePublicLinkSpy).toHaveBeenCalled()
      })
    })
  })
  describe('internal link', () => {
    it('redirects the user to the login page', async () => {
      const { wrapper, mocks } = getWrapper({ isInternalLink: true })
      await wrapper.vm.loadLinkMetaDataTask.last

      expect(mocks.$router.push).toHaveBeenCalledWith({
        name: 'login',
        query: { redirectUrl: '/i/token' }
      })
    })
  })
})

function getWrapper({
  passwordRequired = false,
  isInternalLink = false
}: { passwordRequired?: boolean; isInternalLink?: boolean } = {}) {
  const $clientService = mockDeep<ClientService>()
  const spaceResource = mockDeep<SpaceResource>({ driveType: 'public' })

  // loadLinkMetaDataTask response
  if (passwordRequired) {
    $clientService.webdav.getFileInfo.mockRejectedValueOnce(
      new HttpError("No 'Authorization: Basic' header found", undefined, 401)
    )
  } else if (isInternalLink) {
    $clientService.webdav.getFileInfo.mockRejectedValueOnce(
      new HttpError("No 'Authorization: Bearer' header found", undefined, 401)
    )
  } else {
    $clientService.webdav.getFileInfo.mockResolvedValueOnce(spaceResource)
  }

  $clientService.webdav.getFileInfo.mockResolvedValueOnce(spaceResource)
  const mocks = { ...defaultComponentMocks(), $clientService }

  const capabilities = {
    files_sharing: { federation: { incoming: true, outgoing: true } }
  } satisfies Partial<CapabilityStore['capabilities']>

  vi.mocked(useRouteParam).mockReturnValue(ref('token'))

  return {
    mocks,
    wrapper: shallowMount(ResolvePublicLink, {
      global: {
        plugins: [...defaultPlugins({ piniaOptions: { capabilityState: { capabilities } } })],
        mocks,
        provide: mocks
      }
    })
  }
}
