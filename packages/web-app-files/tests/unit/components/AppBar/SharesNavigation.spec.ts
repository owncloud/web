import { shallowMount } from '@vue/test-utils'
import SharesNavigation from '../../../../src/components/AppBar/SharesNavigation.vue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import Vuex from 'vuex'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { locationSharesWithMe } from 'web-app-files/src/router/shares'
import { mock } from 'jest-mock-extended'
import { RouteRecordPublic } from 'vue-router/types/router'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'

const localVue = defaultLocalVue()
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
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper({ currentRouteName = locationSharesWithMe.name } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = new Vuex.Store(storeOptions)
  const mocks = defaultComponentMocks({ currentRoute: { name: currentRouteName } })
  mocks.$router.getRoutes.mockImplementation(() => routes)
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(SharesNavigation, {
      localVue,
      mocks,
      store
    })
  }
}
