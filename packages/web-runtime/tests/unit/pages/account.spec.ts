import account from '../../../src/pages/account.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Graph } from 'web-client'
import { ClientService } from 'web-pkg'

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
      const { wrapper } = getWrapper()
      const pageTitle = wrapper.find(selectors.pageTitle)
      expect(pageTitle.exists()).toBeTruthy()
      expect(pageTitle.text()).toBe($route.meta.title)
    })

    describe('edit buttons', () => {
      describe('edit url button', () => {
        it('should be displayed if not running with ocis', () => {
          const { wrapper } = getWrapper({
            isAccountEditingEnabled: true,
            data: { loadingGroups: false }
          })
          const editUrlButton = wrapper.find(selectors.editUrlButton)
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editUrlButton).toMatchSnapshot()
          expect(editRouteButton.exists()).toBeFalsy()
        })
        it('should not be displayed if running with ocis', () => {
          const { wrapper } = getWrapper({
            isAccountEditingEnabled: false,
            data: { loadingGroups: false }
          })
          const editUrlButton = wrapper.find(selectors.editUrlButton)
          expect(editUrlButton.exists()).toBeFalsy()
        })
      })
      describe('edit route button', () => {
        it('should be displayed if running with ocis and has navItems', () => {
          const { wrapper } = getWrapper({
            isAccountEditingEnabled: false,
            getNavItemsByExtension: jest.fn(() => [{ route: 'some-route' }]),
            data: { loadingGroups: false }
          })
          const editRouteButton = wrapper.find(selectors.editRouteButton)
          expect(editRouteButton).toMatchSnapshot()
        })
      })
    })
  })
  describe('account information', () => {
    it('displays basic user information', () => {
      const { wrapper } = getWrapper({
        user: {
          user: {
            username: 'some-username',
            displayname: 'some-displayname',
            email: 'some-email'
          }
        }
      })

      const accountPageInfo = wrapper.find(selectors.accountPageInfo)
      expect(accountPageInfo).toMatchSnapshot()
    })

    describe('group membership', () => {
      it('displays message if not member of any groups', () => {
        const { wrapper } = getWrapper({ user: { groups: [] } })

        const groupNamesEmpty = wrapper.find(selectors.groupNamesEmpty)
        expect(groupNamesEmpty.exists()).toBeTruthy()
      })
      it('displays group names', () => {
        const { wrapper } = getWrapper({ user: { groups: ['one', 'two', 'three'] } })

        const groupNames = wrapper.find(selectors.groupNames)
        expect(groupNames).toMatchSnapshot()
      })
    })
  })

  describe('method "editPassword"', () => {
    it('should show message on success', async () => {
      const graphMock = mockDeep<Graph>()
      graphMock.users.changeOwnPassword.mockResolvedValue(mockAxiosResolve())
      const { wrapper } = getWrapper({ graphMock })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editPassword('password', 'newPassword')
      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>()
      graphMock.users.changeOwnPassword.mockRejectedValue(new Error())
      const { wrapper } = getWrapper({ graphMock })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editPassword('password', 'newPassword')
      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('computed method "isChangePasswordEnabled"', () => {
    it('should be true if capability is enabled', () => {
      const { wrapper } = getWrapper({ capabilities: { spaces: { enabled: true } } })
      expect(wrapper.vm.isChangePasswordEnabled).toBeTruthy()
    })
    it('should be false if capability is not enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.isChangePasswordEnabled).toBeFalsy()
    })
  })
})

function getWrapper({
  data = {},
  user = {},
  capabilities = {},
  getNavItemsByExtension = jest.fn(() => []),
  isAccountEditingEnabled = false,
  graphMock = mockDeep<Graph>()
} = {}) {
  const $clientService = mockDeep<ClientService>({ graphAuthenticated: () => graphMock })
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.user.mockReturnValue({ groups: [], ...user })
  storeOptions.getters.capabilities.mockReturnValue(capabilities)
  storeOptions.getters.configuration.mockReturnValue({ server: 'http://server/address/' })
  storeOptions.getters.getNavItemsByExtension.mockReturnValue(getNavItemsByExtension)
  if (!isAccountEditingEnabled) {
    storeOptions.getters.apps.mockReturnValue({ settings: {} })
  } else {
    storeOptions.getters.apps.mockReturnValue({})
  }
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(account, {
      data: () => data,
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: {
          ...defaultComponentMocks(),
          $clientService,
          $route
        },
        stubs: {
          'oc-button': true,
          'oc-icon': true
        }
      }
    })
  }
}
