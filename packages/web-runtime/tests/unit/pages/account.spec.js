import account from '../../../src/pages/account.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import GetTextPlugin from 'vue-gettext'
import VueCompositionAPI from '@vue/composition-api'
import mockAxios from 'jest-mock-axios'
import { clientService } from 'web-pkg/src/services'

const localVue = createLocalVue()
localVue.prototype.$clientService = clientService

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
        it('should be displayed if not running with ocis', () => {
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
        it('should not be displayed if running with ocis', () => {
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
        it('should be displayed if running with ocis and has navItems', () => {
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
    it('displays basic user information', () => {
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
      it('displays message if not member of any groups', () => {
        const store = getStore({ user: { groups: [] } })
        const wrapper = getWrapper(store)

        const groupNamesEmpty = wrapper.find(selectors.groupNamesEmpty)
        expect(groupNamesEmpty.exists()).toBeTruthy()
      })
      it('displays group names', () => {
        const store = getStore({ user: { groups: ['one', 'two', 'three'] } })
        const wrapper = getWrapper(store)

        const groupNames = wrapper.find(selectors.groupNames)
        expect(groupNames).toMatchSnapshot()
      })
    })
  })

  describe('method "editPassword"', () => {
    it('should show message on success', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve()
      })
      const store = getStore({ server: 'https://example.com' })
      const wrapper = getWrapper(store)

      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')

      await wrapper.vm.editPassword('password', 'newPassword')

      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.reject(new Error())
      })
      const store = getStore({ server: 'https://example.com' })
      const wrapper = getWrapper(store)

      jest.spyOn(console, 'error').mockImplementation(() => {})
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')

      await wrapper.vm.editPassword('password', 'newPassword')

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('computed method "isChangePasswordEnabled"', () => {
    it('should be true if capability is enabled', () => {
      const store = getStore({ capabilities: { spaces: { enabled: true } } })
      const wrapper = getWrapper(store)
      expect(wrapper.vm.isChangePasswordEnabled).toBeTruthy()
    })
    it('should be false if capability is not enabled', () => {
      const store = getStore()
      const wrapper = getWrapper(store)
      expect(wrapper.vm.isChangePasswordEnabled).toBeFalsy()
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
  isAccountEditingEnabled = true,
  capabilities = {}
} = {}) {
  return createStore(Vuex.Store, {
    actions: {
      createModal: jest.fn(),
      hideModal: jest.fn(),
      showMessage: jest.fn(),
      setModalInputErrorMessage: jest.fn()
    },
    getters: {
      user: () => {
        return {
          groups: [],
          ...user
        }
      },
      configuration: () => ({
        server: server
      }),
      getToken: () => 'token',
      capabilities: () => {
        return capabilities
      },
      getNavItemsByExtension: () => getNavItemsByExtension,
      apps: () => ({
        ...(isAccountEditingEnabled || { settings: {} })
      })
    }
  })
}
