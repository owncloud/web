import ResolvePublicLink from '../../../src/pages/resolvePublicLink.vue'
import { defaultPlugins, defaultComponentMocks, shallowMount } from 'web-test-helpers'
import { mockDeep } from 'vitest-mock-extended'
import { CapabilityStore, ClientService, useRouteParam, useRouteQuery } from '@ownclouders/web-pkg'
import { DavHttpError, SpaceResource } from '@ownclouders/web-client'
import { authService } from '../../../src/services/auth'
import { ref } from 'vue'

vi.mock('../../../src/services/auth')

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useRouteParam: vi.fn(),
  useRouteQuery: vi.fn()
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
      await wrapper.vm.loadPublicSpaceTask.last

      expect(wrapper.find('form').html()).toMatchSnapshot()
    })
    describe('submit button', () => {
      it('should be set as disabled if "password" is empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadPublicSpaceTask.last

        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('true')
      })
      it('should be set as enabled if "password" is not empty', async () => {
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadPublicSpaceTask.last
        wrapper.vm.password = 'password'
        await wrapper.vm.$nextTick()

        expect(wrapper.find(selectors.submitButton).attributes().disabled).toBe('false')
      })
      it('should resolve the public link on click', async () => {
        const resolvePublicLinkSpy = vi.spyOn(authService, 'resolvePublicLink')
        const { wrapper } = getWrapper({ passwordRequired: true })
        await wrapper.vm.loadPublicSpaceTask.last

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
      await wrapper.vm.loadPublicSpaceTask.last

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

  // loadPublicSpaceTask response
  if (passwordRequired) {
    $clientService.webdav.getFileInfo.mockRejectedValueOnce(
      new DavHttpError('', 'ERR_MISSING_BASIC_AUTH', undefined, 401)
    )
  } else if (isInternalLink) {
    $clientService.webdav.getFileInfo.mockRejectedValueOnce(
      new DavHttpError('', 'ERR_MISSING_BEARER_AUTH', undefined, 401)
    )
  }

  $clientService.webdav.getFileInfo.mockResolvedValueOnce(spaceResource)
  const mocks = { ...defaultComponentMocks(), $clientService }

  const capabilities = {
    files_sharing: { federation: { incoming: true, outgoing: true } }
  } satisfies Partial<CapabilityStore['capabilities']>

  vi.mocked(useRouteParam).mockReturnValue(ref('token'))
  vi.mocked(useRouteQuery).mockReturnValue(ref('redirectUrl'))

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
