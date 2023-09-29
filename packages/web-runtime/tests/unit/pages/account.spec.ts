import account from '../../../src/pages/account.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  shallowMount,
  defaultStoreMockOptions,
  mockAxiosReject
} from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'
import { AxiosResponse } from 'axios'
import { ClientService, ConfigurationManager } from '@ownclouders/web-pkg'
import { SettingsBundle, SettingsValue } from 'web-runtime/src/helpers/settings'

const $route = {
  meta: {
    title: 'Some Title'
  }
}

const selectors = {
  pageTitle: '.oc-page-title',
  loaderStub: 'oc-spinner-stub',
  editUrlButton: '[data-testid="account-page-edit-url-btn"]',
  editPasswordButton: '[data-testid="account-page-edit-password-btn"]',
  logoutButton: '[data-testid="account-page-logout-url-btn"]',
  accountPageInfo: '.account-page-info',
  groupNames: '[data-testid="group-names"]',
  groupNamesEmpty: '[data-testid="group-names-empty"]',
  gdprExport: '[data-testid="gdpr-export"]'
}

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useConfigurationManager: () =>
    mock<ConfigurationManager>({
      logoutUrl: 'https://account-manager/logout',
      options: {
        logoutUrl: 'https://account-manager/logout'
      }
    })
}))

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

    describe('change password button', () => {
      it('should be displayed if not disabled via capability', () => {
        const { wrapper } = getWrapper({
          capabilities: { graph: { users: { change_password_self_disabled: false } } }
        })
        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeTruthy()
      })
      it('should not be displayed if disabled via capability', () => {
        const { wrapper } = getWrapper({
          capabilities: { graph: { users: { change_password_self_disabled: true } } }
        })
        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeFalsy()
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

  describe('gdpr export section', () => {
    it('does show if announced via capabilities and user has a personal space', () => {
      const spaces = [mock<SpaceResource>({ driveType: 'personal' })]
      const { wrapper } = getWrapper({
        spaces,
        capabilities: { graph: { 'personal-data-export': true } }
      })
      expect(wrapper.find(selectors.gdprExport).exists()).toBeTruthy()
    })
    it('does not show if not announced via capabilities', () => {
      const spaces = [mock<SpaceResource>({ driveType: 'personal' })]
      const { wrapper } = getWrapper({
        spaces,
        capabilities: { graph: { 'personal-data-export': false } }
      })
      expect(wrapper.find(selectors.gdprExport).exists()).toBeFalsy()
    })
    it('does not show if user has no personal space', () => {
      const spaces = [mock<SpaceResource>({ driveType: 'project' })]
      const { wrapper } = getWrapper({
        spaces,
        capabilities: { graph: { 'personal-data-export': true } }
      })
      expect(wrapper.find(selectors.gdprExport).exists()).toBeFalsy()
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
      const showErrorMessageStub = jest.spyOn(wrapper.vm, 'showErrorMessage')
      await wrapper.vm.editPassword('password', 'newPassword')
      expect(showErrorMessageStub).toHaveBeenCalled()
    })
  })

  describe('Logout from all devices link', () => {
    it('should render the logout from active devices if logoutUrl is provided', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
    })
    it("shouldn't render the logout from active devices if logoutUrl isn't provided", () => {
      const { wrapper } = getWrapper()
      wrapper.vm.logoutUrl = undefined
      expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
    })
    it('should use url from configuration manager', () => {
      const { wrapper } = getWrapper()
      const logoutButton = wrapper.find(selectors.logoutButton)
      expect(logoutButton.attributes('href')).toBe('https://account-manager/logout')
    })
  })

  describe('Method "updateDisableEmailNotifications', () => {
    it('should show a message on success', async () => {
      const clientServiceMock = mockDeep<ClientService>()
      clientServiceMock.httpAuthenticated.post.mockResolvedValueOnce(
        mock<AxiosResponse>({ data: { bundles: [mock<SettingsBundle>()] } })
      )
      clientServiceMock.httpAuthenticated.post.mockResolvedValueOnce(
        mock<AxiosResponse>({ data: { values: [mock<SettingsValue>()] } })
      )

      const { wrapper, mocks, storeOptions } = getWrapper({
        clientServiceMock,
        capabilities: { spaces: { enabled: true } }
      })

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last

      mocks.$clientService.httpAuthenticated.post.mockResolvedValueOnce(mockAxiosResolve({}))
      await wrapper.vm.updateDisableEmailNotifications(true)
      expect(storeOptions.actions.showMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.not.objectContaining({ status: 'danger' })
      )
    })
    it('should show a message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const clientServiceMock = mockDeep<ClientService>()
      clientServiceMock.httpAuthenticated.post.mockResolvedValueOnce(
        mock<AxiosResponse>({ data: { bundles: [mock<SettingsBundle>()] } })
      )
      clientServiceMock.httpAuthenticated.post.mockResolvedValueOnce(
        mock<AxiosResponse>({ data: { values: [mock<SettingsValue>()] } })
      )

      const { wrapper, mocks, storeOptions } = getWrapper({
        clientServiceMock,
        capabilities: { spaces: { enabled: true } }
      })

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last

      mocks.$clientService.httpAuthenticated.post.mockImplementation(() => mockAxiosReject('err'))
      await wrapper.vm.updateDisableEmailNotifications(true)
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
    })
  })
})

function getWrapper({
  data = {},
  user = {},
  capabilities = {},
  accountEditLink = undefined,
  spaces = [],
  clientServiceMock = mockDeep<ClientService>()
} = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.runtime.modules.spaces.getters.spaces.mockReturnValue(spaces)
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
  mocks.$clientService = clientServiceMock
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(account, {
      data: () => data,
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks,
        stubs: {
          'oc-button': true,
          'oc-icon': true
        }
      }
    })
  }
}
