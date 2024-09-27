import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { AppProviderService, useRequest, useRoute } from '@ownclouders/web-pkg'
import { ref } from 'vue'

import { Resource } from '@ownclouders/web-client'
import App from '../../src/App.vue'
import { RouteLocation } from 'vue-router'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useRequest: vi.fn(),
  useRoute: vi.fn()
}))

const appUrl = 'https://example.test/d12ab86/loe009157-MzBw'

const providerSuccessResponsePost = {
  app_url: appUrl,
  method: 'POST',
  form_parameters: {
    access_token: 'asdfsadfsadf',
    access_token_ttl: '123456'
  }
}

const providerSuccessResponseGet = {
  app_url: appUrl,
  method: 'GET'
}

describe('The app provider extension', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('should fail for unauthenticated users', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 401,
      message: 'Login Required'
    })
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should be able to load an iFrame via get', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: providerSuccessResponseGet
    })

    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should be able to load an iFrame via post', async () => {
    const makeRequest = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: providerSuccessResponsePost
    })
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function createShallowMountWrapper(makeRequest = vi.fn().mockResolvedValue({ status: 200 })) {
  vi.mocked(useRequest).mockImplementation(() => ({
    makeRequest
  }))
  vi.mocked(useRoute).mockImplementation(() =>
    ref(mock<RouteLocation>({ name: 'external-example-app-apps' }))
  )
  const mocks = {
    ...defaultComponentMocks(),
    $appProviderService: mock<AppProviderService>({ appNames: ['example-app'] })
  }

  const capabilities = {
    files: {
      app_providers: [{ apps_url: '/app/list', enabled: true, open_url: '/app/open' }]
    }
  }

  return {
    wrapper: shallowMount(App, {
      props: {
        space: null,
        resource: mock<Resource>(),
        isReadOnly: false
      },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { editor: { openAsPreview: true } } }
            }
          })
        ],
        provide: mocks,
        mocks
      }
    })
  }
}
