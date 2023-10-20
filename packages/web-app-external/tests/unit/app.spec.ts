import App from '../../src/App.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { FileContext, useAppDefaults } from 'web-pkg/src/composables/appDefaults'
import { useAppDefaultsMock } from 'web-test-helpers/src/mocks/useAppDefaultsMock'
import { ref } from 'vue'
import { mock } from 'jest-mock-extended'
import { RouteLocation } from 'web-test-helpers'
import { useRouteParam } from 'web-pkg/src/composables/router/useRouteParam'

jest.mock('web-pkg/src/composables/appDefaults', () => {
  const { queryItemAsString } = jest.requireActual('web-pkg/src/composables/appDefaults')
  return {
    useAppDefaults: jest.fn(),
    useAppFileHandling: jest.fn(),
    queryItemAsString
  }
})

jest.mock('web-pkg/src/composables/router/useRouteParam')

const componentStubs = {
  AppTopBar: true,
  ErrorScreen: true,
  LoadingScreen: true
}

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
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show a loading spinner while loading', async () => {
    const makeRequest = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200
            })
          }, 500)
        })
    )
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should show a meaningful message if an error occurs during loading', async () => {
    const makeRequest = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      message: 'We encountered an internal error'
    })
    const { wrapper } = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should fail for unauthenticated users', async () => {
    const makeRequest = jest.fn().mockResolvedValue({
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
    const makeRequest = jest.fn().mockResolvedValue({
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
    const makeRequest = jest.fn().mockResolvedValue({
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

function createShallowMountWrapper(makeRequest = jest.fn().mockResolvedValue({ status: 200 })) {
  jest.mocked(useAppDefaults).mockImplementation(() =>
    useAppDefaultsMock({
      currentFileContext: ref(mock<FileContext>({ path: 'someFile.md' })),
      makeRequest
    })
  )
  jest.mocked(useRouteParam).mockReturnValue(ref('foo'))

  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({
    files: {
      app_providers: [
        {
          apps_url: '/app/list',
          enabled: true,
          open_url: '/app/open'
        }
      ]
    }
  }))

  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ query: { app: 'exampleApp' } })
    })
  }

  return {
    wrapper: shallowMount(App, {
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: componentStubs,
        mocks,
        provide: mocks
      }
    })
  }
}
