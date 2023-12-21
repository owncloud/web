import CreateLinkModal from '../../../src/components/CreateLinkModal.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { PasswordPolicyService } from '../../../src/services'
import { usePasswordPolicyService } from '../../../src/composables/passwordPolicyService'
import { getDefaultLinkPermissions } from '../../../src/helpers/share/link'
import {
  AbilityRule,
  LinkShareRoles,
  Resource,
  Share,
  SharePermissionBit,
  linkRoleContributorFolder,
  linkRoleEditorFile,
  linkRoleEditorFolder,
  linkRoleInternalFile,
  linkRoleInternalFolder,
  linkRoleUploaderFolder,
  linkRoleViewerFile,
  linkRoleViewerFolder
} from '@ownclouders/web-client/src/helpers'
import { PasswordPolicy } from 'design-system/src/helpers'
import { useEmbedMode } from '../../../src/composables/embedMode'
import { useCreateLink } from '../../../src/composables/links'
import { ref } from 'vue'
import { CapabilityStore } from '../../../types'

jest.mock('../../../src/composables/embedMode')
jest.mock('../../../src/composables/passwordPolicyService')
jest.mock('../../../src/helpers/share/link', () => ({
  ...jest.requireActual('../../../src/helpers/share/link'),
  getDefaultLinkPermissions: jest.fn()
}))
jest.mock('../../../src/composables/links', () => ({
  ...jest.requireActual('../../../src/composables/links'),
  useCreateLink: jest.fn()
}))

const selectors = {
  passwordInput: '.link-modal-password-input',
  selectedRoleLabel: '.selected .role-dropdown-list-option-label',
  roleLabels: '.role-dropdown-list-option-label',
  contextMenuToggle: '#link-modal-context-menu-toggle',
  confirmBtn: '.link-modal-confirm',
  cancelBtn: '.link-modal-cancel'
}

describe('CreateLinkModal', () => {
  describe('password input', () => {
    it('should be rendered', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.passwordInput).exists()).toBeTruthy()
    })
    it('should be disabled for internal links', () => {
      const { wrapper } = getWrapper({ defaultLinkPermissions: 0 })
      expect(wrapper.find(selectors.passwordInput).attributes('disabled')).toBeTruthy()
    })
    it('should not be rendered if user cannot create public links', () => {
      const { wrapper } = getWrapper({ userCanCreatePublicLinks: false, defaultLinkPermissions: 0 })
      expect(wrapper.find(selectors.passwordInput).exists()).toBeFalsy()
    })
  })
  describe('link role select', () => {
    it.each([SharePermissionBit.Internal, SharePermissionBit.Read])(
      'uses the link default permissions to retrieve the initial role',
      (defaultLinkPermissions) => {
        const expectedRole = LinkShareRoles.getByBitmask(defaultLinkPermissions, false)
        const { wrapper } = getWrapper({ defaultLinkPermissions })

        expect(wrapper.find(selectors.selectedRoleLabel).text()).toEqual(expectedRole.label)
      }
    )
    describe('available roles', () => {
      it('lists all available roles for a folder', () => {
        const resource = mock<Resource>({ isFolder: true })
        const { wrapper } = getWrapper({ resources: [resource] })
        const folderRoleLabels = [
          linkRoleInternalFolder,
          linkRoleViewerFolder,
          linkRoleEditorFolder,
          linkRoleContributorFolder,
          linkRoleUploaderFolder
        ].map(({ label }) => label)

        for (const label of wrapper.findAll(selectors.roleLabels)) {
          expect(folderRoleLabels.includes(label.text())).toBeTruthy()
        }
      })
      it('lists all available roles for a file', () => {
        const resource = mock<Resource>({ isFolder: false })
        const { wrapper } = getWrapper({ resources: [resource] })
        const fileRoleLabels = [linkRoleInternalFile, linkRoleViewerFile, linkRoleEditorFile].map(
          ({ label }) => label
        )

        for (const label of wrapper.findAll(selectors.roleLabels)) {
          expect(fileRoleLabels.includes(label.text())).toBeTruthy()
        }
      })
      it('lists only the internal role if user cannot create public links', () => {
        const resource = mock<Resource>({ isFolder: false })
        const { wrapper } = getWrapper({
          resources: [resource],
          userCanCreatePublicLinks: false,
          defaultLinkPermissions: 0
        })
        expect(wrapper.findAll(selectors.roleLabels).length).toBe(1)
        expect(wrapper.find(selectors.selectedRoleLabel).text()).toEqual(linkRoleInternalFile.label)
      })
    })
  })
  describe('context menu', () => {
    it('should display the button to toggle the context menu', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.contextMenuToggle).exists()).toBeTruthy()
    })
    it('should not display the button to toggle the context menu if user cannot create public links', () => {
      const { wrapper } = getWrapper({ userCanCreatePublicLinks: false, defaultLinkPermissions: 0 })
      expect(wrapper.find(selectors.contextMenuToggle).exists()).toBeFalsy()
    })
  })
  describe('method "confirm"', () => {
    it('shows an error if a password is enforced but empty', async () => {
      jest.spyOn(console, 'error').mockImplementation(undefined)
      const { wrapper } = getWrapper({ passwordEnforced: true })
      try {
        await wrapper.vm.onConfirm()
      } catch (error) {}

      expect(wrapper.vm.password.error).toBeDefined()
    })
    it('does not create links when the password policy is not fulfilled', async () => {
      jest.spyOn(console, 'error').mockImplementation(undefined)
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ passwordPolicyFulfilled: false, callbackFn })
      try {
        await wrapper.vm.onConfirm()
      } catch (error) {}

      expect(callbackFn).not.toHaveBeenCalled()
    })
    it('creates links for all resources', async () => {
      const callbackFn = jest.fn()
      const resources = [mock<Resource>({ isFolder: false }), mock<Resource>({ isFolder: false })]
      const { wrapper, mocks } = getWrapper({ resources, callbackFn })
      await wrapper.vm.onConfirm()
      expect(mocks.createLinkMock).toHaveBeenCalledTimes(resources.length)
      expect(callbackFn).toHaveBeenCalledTimes(1)
    })
    it('emits event in embed mode including the created links', async () => {
      const resources = [mock<Resource>({ isFolder: false })]
      const { wrapper, mocks } = getWrapper({ resources, embedModeEnabled: true })
      const share = mock<Share>({ url: 'someurl' })
      mocks.createLinkMock.mockResolvedValue(share)
      await wrapper.vm.onConfirm()
      expect(mocks.postMessageMock).toHaveBeenCalledWith('owncloud-embed:share', [share.url])
    })
    it('shows error messages for links that failed to be created', async () => {
      const consoleMock = jest.fn(() => undefined)
      jest.spyOn(console, 'error').mockImplementation(consoleMock)
      const resources = [mock<Resource>({ isFolder: false })]
      const { wrapper, mocks } = getWrapper({ resources })
      mocks.createLinkMock.mockRejectedValue(new Error(''))
      await wrapper.vm.onConfirm()
      expect(consoleMock).toHaveBeenCalledTimes(1)
    })
    it('calls the callback at the end if given', async () => {
      const resources = [mock<Resource>({ isFolder: false })]
      const callbackFn = jest.fn()
      const { wrapper } = getWrapper({ resources, callbackFn })
      await wrapper.vm.onConfirm()
      expect(callbackFn).toHaveBeenCalledTimes(1)
    })
    it.each([true, false])(
      'correctly passes the quicklink property to createLink',
      async (isQuickLink) => {
        const resources = [mock<Resource>({ isFolder: false })]
        const { wrapper, mocks } = getWrapper({ resources, isQuickLink })
        await wrapper.vm.onConfirm()
        expect(mocks.createLinkMock).toHaveBeenCalledWith(
          expect.objectContaining({ quicklink: isQuickLink })
        )
      }
    )
  })
})

function getWrapper({
  resources = [],
  defaultLinkPermissions = 1,
  userCanCreatePublicLinks = true,
  passwordEnforced = false,
  passwordPolicyFulfilled = true,
  embedModeEnabled = false,
  callbackFn = undefined,
  isQuickLink = false
} = {}) {
  jest.mocked(usePasswordPolicyService).mockReturnValue(
    mock<PasswordPolicyService>({
      getPolicy: () => mock<PasswordPolicy>({ check: () => passwordPolicyFulfilled })
    })
  )
  jest.mocked(getDefaultLinkPermissions).mockReturnValue(defaultLinkPermissions)
  const createLinkMock = jest.fn()
  jest.mocked(useCreateLink).mockReturnValue({ createLink: createLinkMock })

  const postMessageMock = jest.fn()
  jest.mocked(useEmbedMode).mockReturnValue(
    mock<ReturnType<typeof useEmbedMode>>({
      isEnabled: ref(embedModeEnabled),
      postMessage: postMessageMock
    })
  )

  const mocks = { ...defaultComponentMocks(), postMessageMock, createLinkMock }

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  const abilities = [] as AbilityRule[]
  if (userCanCreatePublicLinks) {
    abilities.push({ action: 'create-all', subject: 'PublicLink' })
  }

  const capabilities = {
    files_sharing: {
      public: {
        expire_date: {},
        can_edit: true,
        can_contribute: true,
        alias: true,
        password: { enforced_for: { read_only: passwordEnforced } }
      }
    }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    storeOptions,
    mocks,
    wrapper: mount(CreateLinkModal, {
      props: {
        resources,
        isQuickLink,
        callbackFn
      },
      global: {
        plugins: [
          ...defaultPlugins({ abilities, piniaOptions: { capabilityState: { capabilities } } }),
          store
        ],
        mocks,
        provide: mocks,
        stubs: { OcTextInput: true, OcDatepicker: true }
      }
    })
  }
}
