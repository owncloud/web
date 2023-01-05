import SharesNavigation from '../../../../src/components/AppBar/SharesNavigation.vue'
import { locationSharesWithMe } from 'web-app-files/src/router/shares'
import { mock } from 'jest-mock-extended'
import { RouteRecordPublic } from 'vue-router/types/router'
import {
  createStore,
  defaultPlugins,
  defaultStubs,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const routes = [
  mock<RouteRecordPublic>({
    path: '/files/shares/with-me/',
    name: 'files-shares-with-me'
  }),
  mock<RouteRecordPublic>({
    path: '/files/shares/with-others/',
    name: 'files-shares-with-others'
  }),
  mock<RouteRecordPublic>({
    path: '/files/shares/via-link/',
    name: 'files-shares-via-link'
  })
]

describe('SharesNavigation component', () => {
  it('renders a shares navigation for both mobile and a desktop viewports', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper({ currentRouteName = locationSharesWithMe.name } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({ currentRoute: { name: currentRouteName } })
  mocks.$router.getRoutes.mockImplementation(() => routes)
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(SharesNavigation as any, {
      global: {
        stubs: defaultStubs,
        renderStubDefaultSlot: true,
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
