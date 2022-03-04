import account from '../../../src/pages/account.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(Vuex)

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
  loaderStub: 'oc-loader-stub',
  accountPageTitle: '#account-page-title',
  editUrlButton: '[data-testid="account-page-edit-url-btn"]',
  editRouteButton: '[data-testid="account-page-edit-route-btn"]',
  accountPageInfo: '.account-page-info',
  groupInformation: '.account-page-info-groups'
}

describe('account', () => {
  describe('when the wrapper is still loading', () => {
    let wrapper
    beforeEach(() => {
      wrapper = getWrapper()
      wrapper.setData({ loading: true })
    })
    it('should render the loading state', () => {
      const pageTitle = wrapper.find(selectors.pageTitle)
      const ocLoader = wrapper.find(selectors.loaderStub)
      expect(pageTitle.text()).toBe($route.meta.title)
      expect(ocLoader.exists()).toBeTruthy()
    })
    it('should not render the account page content', () => {
      const accountPageTitle = wrapper.find(selectors.accountPageTitle)
      const accountPageInfo = wrapper.find('.account-page-info')
      expect(accountPageTitle.exists()).toBeFalsy()
      expect(accountPageInfo.exists()).toBeFalsy()
    })
  })
  describe('when the wrapper is not loading anymore', () => {
    it('should not render the loading state', async () => {
      const store = getStore()
      const wrapper = getWrapper(store)
      await wrapper.setData({ loading: false })
      const pageTitle = wrapper.find(selectors.pageTitle)
      const ocLoader = wrapper.find(selectors.loaderStub)
      expect(pageTitle.text()).toBe('Account')
      expect(ocLoader.exists()).toBeFalsy()
    })

    describe('edit buttons', () => {
      describe('edit url button', () => {
        it('should be displayed if not running with ocis', async () => {
          const store = getStore({
            server: 'http://server/address/',
            isOcis: false
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loading: false })
          const editUrlButton = wrapper.find(selectors.editUrlButton)
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editUrlButton).toMatchSnapshot()
          expect(editUrlButton.attributes()).toMatchSnapshot()
          expect(editRouteButton.exists()).toBeFalsy()
        })
        it('should not be displayed if running with ocis', async () => {
          const store = getStore({
            server: 'http://server/address/',
            isOcis: true
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loading: false })
          const editButton = wrapper.find(selectors.editUrlButton)
          expect(editButton.exists()).toBeFalsy()
        })
      })
      describe('edit route button', () => {
        it('should be displayed if running with ocis and has navItems', async () => {
          const store = getStore({
            isOcis: true,
            getNavItemsByExtension: jest.fn(() => [{ route: 'some-route' }])
          })
          const wrapper = getWrapper(store)
          await wrapper.setData({ loading: false })
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editRouteButton).toMatchSnapshot()
          expect(editRouteButton.attributes()).toMatchSnapshot()
        })
      })
    })

    describe('account information', () => {
      it('without group information', async () => {
        const store = getStore({
          user: {
            username: 'some-username',
            displayname: 'some-displayname',
            email: 'some-email'
          }
        })
        const wrapper = getWrapper(store)
        await wrapper.setData({ loading: false })

        const accountPageInfo = wrapper.find(selectors.accountPageInfo)
        expect(accountPageInfo).toMatchSnapshot()
      })
      it('with group information', async () => {
        const store = getStore()
        const wrapper = getWrapper(store)
        await wrapper.setData({ loading: false })
        await wrapper.setData({ groups: ['one', 'two', 'three'] })

        const groupInformation = wrapper.find(selectors.groupInformation)
        expect(groupInformation).toMatchSnapshot()
      })
    })
  })
})

function getWrapper(store = null) {
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
      'oc-loader': true,
      'oc-button': true,
      'oc-icon': true
    }
  }
  if (store) opts.store = store
  return shallowMount(component, opts)
}

function getStore({
  user = {},
  server = '',
  getNavItemsByExtension = jest.fn(() => []),
  isOcis = false
} = {}) {
  return createStore(Vuex.Store, {
    getters: {
      user: () => user,
      configuration: () => ({
        server: server
      }),
      getNavItemsByExtension: () => getNavItemsByExtension,
      isOcis: () => isOcis
    }
  })
}
