import account from '../../../src/pages/account.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const $route = {
  meta: {
    title: 'Some Title'
  }
}

const selectors = {
  pageTitle: '.oc-page-title',
  loaderStub: 'oc-spinner-stub',
  editUrlButton: '[data-testid="account-page-edit-url-btn"]',
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

    describe('edit url button', () => {
      it('should be displayed if defined via config', () => {
        const { wrapper } = getWrapper({
          accountEditLink: { href: '/' },
          data: { loadingGroups: false }
        })
        const editUrlButton = wrapper.find(selectors.editUrlButton)
        expect(editUrlButton.html()).toMatchSnapshot()
      })
      it('should not be displayed if not defined via config', () => {
        const { wrapper } = getWrapper({
          data: { loadingGroups: false }
        })
        const editUrlButton = wrapper.find(selectors.editUrlButton)
        expect(editUrlButton.exists()).toBeFalsy()
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
      expect(accountPageInfo.html()).toMatchSnapshot()
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
        expect(groupNames.html()).toMatchSnapshot()
      })
    })
  })

  describe('method "editPassword"', () => {
    it('should show message on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.users.changeOwnPassword.mockResolvedValue(
        mockAxiosResolve()
      )
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editPassword('password', 'newPassword')
      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.users.changeOwnPassword.mockRejectedValue(new Error())
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

function getWrapper({ data = {}, user = {}, capabilities = {}, accountEditLink = undefined } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.user.mockReturnValue({ groups: [], ...user })
  storeOptions.getters.capabilities.mockReturnValue(capabilities)
  storeOptions.getters.configuration.mockReturnValue({
    server: 'http://server/address/',
    options: { ...(accountEditLink && { accountEditLink }) }
  })

  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks(),
    $route
  }
  return {
    mocks,
    wrapper: shallowMount(account, {
      data: () => data,
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        stubs: {
          'oc-button': true,
          'oc-icon': true
        }
      }
    })
  }
}
