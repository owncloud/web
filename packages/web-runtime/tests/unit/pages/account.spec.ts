import account from '../../../src/pages/account.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  shallowMount,
  mockAxiosReject
} from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { AxiosResponse } from 'axios'
import { useMessages, useResourcesStore } from '@ownclouders/web-pkg'
import { LanguageOption, SettingsBundle, SettingsValue } from 'web-runtime/src/helpers/settings'
import { User } from '@ownclouders/web-client/src/generated'

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

describe('account page', () => {
  describe('public link context', () => {
    it('should render a limited view', async () => {
      const { wrapper } = getWrapper({ isUserContext: false, isPublicLinkContext: true })
      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('header section', () => {
    describe('edit url button', () => {
      it('should be displayed if defined via config', async () => {
        const { wrapper } = getWrapper({
          accountEditLink: { href: '/' }
        })

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const editUrlButton = wrapper.find(selectors.editUrlButton)
        expect(editUrlButton.html()).toMatchSnapshot()
      })
      it('should not be displayed if not defined via config', async () => {
        const { wrapper } = getWrapper()

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const editUrlButton = wrapper.find(selectors.editUrlButton)
        expect(editUrlButton.exists()).toBeFalsy()
      })
    })
  })

  describe('account information section', () => {
    it('displays basic user information', async () => {
      const { wrapper } = getWrapper({
        user: mock<User>({
          onPremisesSamAccountName: 'some-username',
          displayName: 'some-displayname',
          mail: 'some-email',
          memberOf: []
        })
      })

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      const accountPageInfo = wrapper.find(selectors.accountPageInfo)
      expect(accountPageInfo.html()).toMatchSnapshot()
    })

    describe('group membership', () => {
      it('displays message if not member of any groups', async () => {
        const { wrapper } = getWrapper()

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const groupNamesEmpty = wrapper.find(selectors.groupNamesEmpty)
        expect(groupNamesEmpty.exists()).toBeTruthy()
      })
      it('displays group names', async () => {
        const { wrapper } = getWrapper({
          user: mock<User>({
            memberOf: [{ displayName: 'one' }, { displayName: 'two' }, { displayName: 'three' }]
          })
        })

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const groupNames = wrapper.find(selectors.groupNames)
        expect(groupNames.html()).toMatchSnapshot()
      })
    })

    describe('Logout from all devices link', () => {
      it('should render the logout from active devices if logoutUrl is provided', async () => {
        const { wrapper } = getWrapper()

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
      })
      it("shouldn't render the logout from active devices if logoutUrl isn't provided", async () => {
        const { wrapper } = getWrapper()

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        wrapper.vm.logoutUrl = undefined
        expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
      })
      it('should use url from configuration manager', async () => {
        const { wrapper } = getWrapper()

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const logoutButton = wrapper.find(selectors.logoutButton)
        expect(logoutButton.attributes('href')).toBe('https://account-manager/logout')
      })
    })
  })

  describe('Preferences section', () => {
    describe('change password button', () => {
      it('should be displayed if not disabled via capability', async () => {
        const { wrapper } = getWrapper({
          capabilities: { graph: { users: { change_password_self_disabled: false } } }
        })

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeTruthy()
      })
      it('should not be displayed if disabled via capability', async () => {
        const { wrapper } = getWrapper({
          capabilities: { graph: { users: { change_password_self_disabled: true } } }
        })

        await wrapper.vm.loadAccountBundleTask.last
        await wrapper.vm.loadValuesListTask.last
        await wrapper.vm.loadGraphUserTask.last

        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeFalsy()
      })
    })
  })

  describe('Method "updateDisableEmailNotifications', () => {
    it('should show a message on success', async () => {
      const { wrapper, mocks } = getWrapper()

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      mocks.$clientService.httpAuthenticated.post.mockResolvedValueOnce(mockAxiosResolve({}))
      await wrapper.vm.updateDisableEmailNotifications(true)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('should show a message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper, mocks } = getWrapper()

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      mocks.$clientService.httpAuthenticated.post.mockImplementation(() => mockAxiosReject('err'))
      await wrapper.vm.updateDisableEmailNotifications(true)
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Method "updateSelectedLanguage', () => {
    it('should show a message on success', async () => {
      const { wrapper, mocks } = getWrapper({})

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      mocks.$clientService.graphAuthenticated.users.editMe.mockResolvedValueOnce(
        mockAxiosResolve({})
      )
      await wrapper.vm.updateSelectedLanguage({ value: 'en' } as LanguageOption)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('should show a message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper, mocks } = getWrapper({})

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      mocks.$clientService.graphAuthenticated.users.editMe.mockImplementation(() =>
        mockAxiosReject('err')
      )
      await wrapper.vm.updateSelectedLanguage({ value: 'en' } as LanguageOption)
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Method "updateViewOptionsWebDavDetails', () => {
    it('should show a message on success', async () => {
      const { wrapper } = getWrapper({})

      await wrapper.vm.loadAccountBundleTask.last
      await wrapper.vm.loadValuesListTask.last
      await wrapper.vm.loadGraphUserTask.last

      await wrapper.vm.updateViewOptionsWebDavDetails(true)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()

      const { setAreWebDavDetailsShown } = useResourcesStore()
      expect(setAreWebDavDetailsShown).toHaveBeenCalled()
    })
  })
})

function getWrapper({
  user = mock<User>({ memberOf: [] }),
  capabilities = {},
  accountEditLink = undefined,
  spaces = [],
  isPublicLinkContext = false,
  isUserContext = true
} = {}) {
  const mocks = {
    ...defaultComponentMocks(),
    $route
  }

  mocks.$clientService.httpAuthenticated.post.mockImplementation((url) => {
    let response = {}

    if (url.endsWith('bundles-list')) {
      response = { bundles: [mock<SettingsBundle>()] }
    }
    if (url.endsWith('values-list')) {
      response = { values: [mock<SettingsValue>()] }
    }

    return Promise.resolve(mockAxiosResolve(response))
  })
  mocks.$clientService.graphAuthenticated.users.getMe.mockResolvedValue(
    mock<AxiosResponse>({ data: { id: '1' } })
  )

  return {
    mocks,
    wrapper: shallowMount(account, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              userState: { user },
              authState: {
                userContextReady: isUserContext,
                publicLinkContextReady: isPublicLinkContext
              },
              spacesState: { spaces },
              capabilityState: { capabilities },
              configState: {
                options: {
                  logoutUrl: 'https://account-manager/logout',
                  ...(accountEditLink && { accountEditLink })
                }
              }
            }
          })
        ],
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
