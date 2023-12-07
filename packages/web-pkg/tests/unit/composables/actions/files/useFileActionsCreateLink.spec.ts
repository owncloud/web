import { computed, unref } from 'vue'
import { useFileActionsCreateLink } from '../../../../../src/composables/actions/files/useFileActionsCreateLink'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { useCreateLink, useDefaultLinkPermissions } from '../../../../../src/composables/links'
import { useCapabilityFilesSharingPublicPasswordEnforcedFor } from '../../../../../src/composables/capability'
import { PasswordEnforcedForCapability } from '@ownclouders/web-client/src/ocs/capabilities'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'

jest.mock('../../../../../src/composables/links', () => ({
  ...jest.requireActual('../../../../../src/composables/links'),
  useCreateLink: jest.fn(),
  useDefaultLinkPermissions: jest.fn()
}))

jest.mock('../../../../../src/composables/capability', () => ({
  useCapabilityFilesSharingPublicPasswordEnforcedFor: jest.fn()
}))

describe('useFileActionsCreateLink', () => {
  describe('isEnabled property', () => {
    it('should return false if no resource selected', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ space: null, resources: [] })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource can not be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [mock<Resource>({ canShare: () => false })]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource is a disabled project space', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [
            mock<Resource>({ canShare: () => true, disabled: true, driveType: 'project' })
          ]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeFalsy()
        }
      })
    })
    it('should return true if all files can be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [
            mock<Resource>({ canShare: () => true }),
            mock<Resource>({ canShare: () => true })
          ]
          expect(unref(actions)[0].isEnabled({ space: null, resources })).toBeTruthy()
        }
      })
    })
  })
  describe('handler', () => {
    it('calls the createLink method and shows messages', () => {
      getWrapper({
        setup: async ({ actions }, { mocks, storeOptions }) => {
          // link action
          await unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(mocks.createLinkMock).toHaveBeenCalledWith(
            expect.objectContaining({ quicklink: false })
          )
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)

          // quick link action
          await unref(actions)[1].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(mocks.createLinkMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ quicklink: true })
          )
        }
      })
    })
    it('shows a modal if enforced', () => {
      getWrapper({
        enforceModal: true,
        setup: ({ actions }, { mocks, storeOptions }) => {
          unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(mocks.createLinkMock).not.toHaveBeenCalled()
          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('shows a modal if password is enforced and link is not internal', () => {
      getWrapper({
        passwordEnforced: true,
        defaultLinkPermissions: SharePermissionBit.Read,
        setup: ({ actions }, { mocks, storeOptions }) => {
          unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(mocks.createLinkMock).not.toHaveBeenCalled()
          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('calls the onLinkCreatedCallback if given', () => {
      const onLinkCreatedCallback = jest.fn()
      getWrapper({
        onLinkCreatedCallback,
        setup: async ({ actions }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(onLinkCreatedCallback).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('does not show messages if disabled', () => {
      getWrapper({
        showMessages: false,
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(storeOptions.actions.showMessage).not.toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  enforceModal = false,
  passwordEnforced = false,
  defaultLinkPermissions = SharePermissionBit.Read,
  onLinkCreatedCallback = undefined,
  showMessages = true
}) {
  const createLinkMock = jest.fn()
  jest.mocked(useCreateLink).mockReturnValue({ createLink: createLinkMock })
  jest
    .mocked(useDefaultLinkPermissions)
    .mockReturnValue({ defaultLinkPermissions: computed(() => defaultLinkPermissions) })
  jest
    .mocked(useCapabilityFilesSharingPublicPasswordEnforcedFor)
    .mockReturnValue(
      computed(() => mock<PasswordEnforcedForCapability>({ read_only: passwordEnforced }))
    )

  const mocks = { ...defaultComponentMocks(), createLinkMock }

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCreateLink({
          store,
          enforceModal,
          showMessages,
          onLinkCreatedCallback
        })
        setup(instance, { storeOptions, mocks })
      },
      {
        mocks,
        store,
        provide: mocks
      }
    )
  }
}
