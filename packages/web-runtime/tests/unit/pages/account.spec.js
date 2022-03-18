import account from '../../../src/pages/account.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import GetTextPlugin from 'vue-gettext'
import VueCompositionAPI from '@vue/composition-api'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueCompositionAPI)

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

localVue.directive('translate', {
  inserted: (el) => {}
})

const $route = {
  meta: {
    title: 'Some Title'
  }
}

const selectors = {
  pageTitle: '.oc-page-title',
  loaderStub: 'oc-spinner-stub',
  editUrlButton: '[data-testid="account-page-edit-url-btn"]',
  editRouteButton: '[data-testid="account-page-edit-route-btn"]',
  accountPageInfo: '.account-page-info',
  groupNames: '[data-testid="group-names"]',
  groupNamesEmpty: '[data-testid="group-names-empty"]'
}

describe('account page', () => {
  describe('header section', () => {
    it('renders page title', () => {
      const wrapper = getWrapper()
      const pageTitle = wrapper.find(selectors.pageTitle)
      expect(pageTitle.exists()).toBeTruthy()
      expect(pageTitle.text()).toBe($route.meta.title)
    })

    describe('edit buttons', () => {
      describe('edit url button', () => {
        it('should be displayed if not running with ocis', async () => {
          const store = getStore({
            server: 'http://server/address/',
            isAccountEditingEnabled: true
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loadingGroups: false })
          const editUrlButton = wrapper.find(selectors.editUrlButton)
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editUrlButton).toMatchSnapshot()
          expect(editRouteButton.exists()).toBeFalsy()
        })
        it('should not be displayed if running with ocis', async () => {
          const store = getStore({
            server: 'http://server/address/',
            isAccountEditingEnabled: false
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loadingGroups: false })
          const editUrlButton = wrapper.find(selectors.editUrlButton)
          expect(editUrlButton.exists()).toBeFalsy()
        })
      })
      describe('edit route button', () => {
        it('should be displayed if running with ocis and has navItems', async () => {
          const store = getStore({
            isAccountEditingEnabled: false,
            getNavItemsByExtension: jest.fn(() => [{ route: 'some-route' }])
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loadingGroups: false })
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editRouteButton).toMatchSnapshot()
        })
      })
    })
  })

  describe('account information', () => {
    it('displays basic user information', async () => {
      const store = getStore({
        user: {
          username: 'some-username',
          displayname: 'some-displayname',
          email: 'some-email'
        }
      })
      const wrapper = getWrapper(store)

      const accountPageInfo = wrapper.find(selectors.accountPageInfo)
      expect(accountPageInfo).toMatchSnapshot()
    })

    describe('group membership', () => {
      it('shows loading indicator when in loading state', () => {
        const wrapper = getWrapper()
        const groupInfoLoading = wrapper.find(selectors.loaderStub)
        expect(groupInfoLoading.exists()).toBeTruthy()
      })
      it('displays message if not member of any groups', async () => {
        const store = getStore()
        const wrapper = getWrapper(store)
        await wrapper.setData({ loadingGroups: false })

        const groupNamesEmpty = wrapper.find(selectors.groupNamesEmpty)
        expect(groupNamesEmpty.exists()).toBeTruthy()
      })
      it('displays group names', async () => {
        const store = getStore()
        const wrapper = getWrapper(store)
        await wrapper.setData({ loadingGroups: false })
        await wrapper.setData({ groups: ['one', 'two', 'three'] })

        const groupNames = wrapper.find(selectors.groupNames)
        expect(groupNames).toMatchSnapshot()
      })
    })
  })
})

function getWrapper(store = getStore()) {
  const component = {
    ...account,
    mounted: jest.fn()
  }
  const opts = {
    localVue,
    mocks: {
      $route
    },
    stubs: {
      'oc-spinner': true,
      'oc-button': true,
      'oc-icon': true
    },
    store
  }
  return shallowMount(component, opts)
}

function getStore({
  user = {},
  server = '',
  getNavItemsByExtension = jest.fn(() => []),
  isAccountEditingEnabled = true
} = {}) {
  return createStore(Vuex.Store, {
    getters: {
      user: () => user,
      configuration: () => ({
        server: server
      }),
      getNavItemsByExtension: () => getNavItemsByExtension,
      apps: () => ({
        ...(isAccountEditingEnabled || { settings: {} })
      })
    }
  })
}
