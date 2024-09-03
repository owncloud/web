import account from '../../../src/pages/account.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount,
  mockAxiosReject
} from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import {
  Extension,
  ExtensionPoint,
  OptionsConfig,
  useExtensionRegistry,
  useMessages,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { LanguageOption, SettingsBundle, SettingsValue } from '../../../src/helpers/settings'
import { User } from '@ownclouders/web-client/graph/generated'
import { VueWrapper } from '@vue/test-utils'
import { SpaceResource } from '@ownclouders/web-client'
import { Capabilities } from '@ownclouders/web-client/ocs'

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
  gdprExport: '[data-testid="gdpr-export"]',
  extensionsSection: '.account-page-extensions'
}

describe('account page', () => {
  describe('public link context', () => {
    it('should render a limited view', async () => {
      const { wrapper } = getWrapper({ isUserContext: false, isPublicLinkContext: true })
      await blockLoadingState(wrapper)

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('header section', () => {
    describe('edit url button', () => {
      it('should be displayed if defined via config', async () => {
        const { wrapper } = getWrapper({
          accountEditLink: { href: '/' }
        })
        await blockLoadingState(wrapper)

        const editUrlButton = wrapper.find(selectors.editUrlButton)
        expect(editUrlButton.html()).toMatchSnapshot()
      })
      it('should not be displayed if not defined via config', async () => {
        const { wrapper } = getWrapper()
        await blockLoadingState(wrapper)

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
      await blockLoadingState(wrapper)

      const accountPageInfo = wrapper.find(selectors.accountPageInfo)
      expect(accountPageInfo.html()).toMatchSnapshot()
    })

    describe('group membership', () => {
      it('displays message if not member of any groups', async () => {
        const { wrapper } = getWrapper()
        await blockLoadingState(wrapper)

        const groupNamesEmpty = wrapper.find(selectors.groupNamesEmpty)
        expect(groupNamesEmpty.exists()).toBeTruthy()
      })
      it('displays group names', async () => {
        const { wrapper } = getWrapper({
          user: mock<User>({
            memberOf: [{ displayName: 'one' }, { displayName: 'two' }, { displayName: 'three' }]
          })
        })
        await blockLoadingState(wrapper)

        const groupNames = wrapper.find(selectors.groupNames)
        expect(groupNames.html()).toMatchSnapshot()
      })
    })

    describe('Logout from all devices link', () => {
      it('should render the logout from active devices if logoutUrl is provided', async () => {
        const { wrapper } = getWrapper()
        await blockLoadingState(wrapper)

        expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
      })
      it("shouldn't render the logout from active devices if logoutUrl isn't provided", async () => {
        const { wrapper } = getWrapper()
        await blockLoadingState(wrapper)

        wrapper.vm.logoutUrl = undefined
        expect(wrapper.find('[data-testid="logout"]').exists()).toBe(true)
      })
      it('should use url from configuration manager', async () => {
        const { wrapper } = getWrapper()
        await blockLoadingState(wrapper)

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
        await blockLoadingState(wrapper)

        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeTruthy()
      })
      it('should not be displayed if disabled via capability', async () => {
        const { wrapper } = getWrapper({
          capabilities: { graph: { users: { change_password_self_disabled: true } } }
        })
        await blockLoadingState(wrapper)

        const editPasswordButton = wrapper.find(selectors.editPasswordButton)
        expect(editPasswordButton.exists()).toBeFalsy()
      })
    })
  })

  describe('Method "updateDisableEmailNotifications', () => {
    it('should show a message on success', async () => {
      const { wrapper, mocks } = getWrapper()
      await blockLoadingState(wrapper)

      mocks.$clientService.httpAuthenticated.post.mockResolvedValueOnce(mockAxiosResolve({}))
      await wrapper.vm.updateDisableEmailNotifications(true)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('should show a message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper, mocks } = getWrapper()
      await blockLoadingState(wrapper)

      mocks.$clientService.httpAuthenticated.post.mockImplementation(() => mockAxiosReject('err'))
      await wrapper.vm.updateDisableEmailNotifications(true)
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Method "updateSelectedLanguage', () => {
    it('should show a message on success', async () => {
      const { wrapper, mocks } = getWrapper({})
      await blockLoadingState(wrapper)

      mocks.$clientService.graphAuthenticated.users.editMe.mockResolvedValueOnce(undefined)
      await wrapper.vm.updateSelectedLanguage({ value: 'en' } as LanguageOption)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()
    })
    it('should show a message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper, mocks } = getWrapper({})
      await blockLoadingState(wrapper)

      mocks.$clientService.graphAuthenticated.users.editMe.mockRejectedValue(new Error())
      await wrapper.vm.updateSelectedLanguage({ value: 'en' } as LanguageOption)
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('Method "updateViewOptionsWebDavDetails', () => {
    it('should show a message on success', async () => {
      const { wrapper } = getWrapper({})
      await blockLoadingState(wrapper)

      await wrapper.vm.updateViewOptionsWebDavDetails(true)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalled()

      const { setAreWebDavDetailsShown } = useResourcesStore()
      expect(setAreWebDavDetailsShown).toHaveBeenCalled()
    })
  })

  describe('Extensions section', () => {
    it('should be hidden if no extension points offer preferences', async () => {
      const { wrapper } = getWrapper({})
      await blockLoadingState(wrapper)

      expect(wrapper.find(selectors.extensionsSection).exists()).toBeFalsy()
    })

    it('should be hidden if an extension point only has 1 or less extensions', async () => {
      const extensionPointMock = mock<ExtensionPoint<Extension>>({
        userPreference: {
          label: 'example-extension-point'
        }
      })
      const { wrapper } = getWrapper({
        extensionPoints: [extensionPointMock]
      })
      await blockLoadingState(wrapper)

      expect(wrapper.find(selectors.extensionsSection).exists()).toBeFalsy()
    })

    it('should be visible if an extension point has at least 2 extensions', async () => {
      const extensionPoint = mock<ExtensionPoint<Extension>>({
        id: 'test-extension-point',
        multiple: false,
        defaultExtensionId: 'foo-2',
        userPreference: {
          label: 'Foo container'
        }
      })
      const extensions = [
        mock<Extension>({
          id: 'foo-1',
          userPreference: {
            optionLabel: 'Foo 1'
          }
        }),
        mock<Extension>({
          id: 'foo-2',
          userPreference: {
            optionLabel: 'Foo 2'
          }
        })
      ]
      const { wrapper } = getWrapper({
        extensionPoints: [extensionPoint],
        extensions
      })
      await blockLoadingState(wrapper)

      expect(wrapper.find(selectors.extensionsSection).exists()).toBeTruthy()
    })
  })
})

const blockLoadingState = async (wrapper: VueWrapper<any, any>) => {
  await wrapper.vm.loadAccountBundleTask.last
  await wrapper.vm.loadValuesListTask.last
  await wrapper.vm.loadGraphUserTask.last
}

function getWrapper({
  user = mock<User>({ memberOf: [] }),
  capabilities = {},
  accountEditLink = undefined,
  spaces = [],
  isPublicLinkContext = false,
  isUserContext = true,
  extensionPoints = [],
  extensions = []
}: {
  user?: User
  capabilities?: Partial<Capabilities['capabilities']>
  accountEditLink?: OptionsConfig['accountEditLink']
  spaces?: SpaceResource[]
  isPublicLinkContext?: boolean
  isUserContext?: boolean
  extensionPoints?: ExtensionPoint<Extension>[]
  extensions?: Extension[]
} = {}) {
  const plugins = defaultPlugins({
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

  const { getExtensionPoints, requestExtensions } = useExtensionRegistry()
  vi.mocked(getExtensionPoints).mockReturnValue(extensionPoints)
  vi.mocked(requestExtensions).mockReturnValue(extensions)

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
  mocks.$clientService.graphAuthenticated.users.getMe.mockResolvedValue(mock<User>({ id: '1' }))

  return {
    mocks,
    wrapper: mount(account, {
      global: {
        plugins,
        mocks,
        provide: mocks,
        stubs: {
          'extension-preference': true
        }
      }
    })
  }
}
