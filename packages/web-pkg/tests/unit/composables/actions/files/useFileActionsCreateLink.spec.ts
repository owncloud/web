import { ref, unref } from 'vue'
import { useFileActionsCreateLink } from '../../../../../src/composables/actions/files/useFileActionsCreateLink'
import {
  useMessages,
  useModals,
  CapabilityStore,
  useSharesStore
} from '../../../../../src/composables/piniaStores'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'
import { useLinkTypes } from '../../../../../src/composables/links/useLinkTypes'

vi.mock('../../../../../src/composables/links/useLinkTypes', () => ({
  useLinkTypes: vi.fn()
}))

describe('useFileActionsCreateLink', () => {
  describe('isVisible property', () => {
    it('should return false if no resource selected', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isVisible({ space: null, resources: [] })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource can not be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [mock<Resource>({ canShare: () => false })]
          expect(unref(actions)[0].isVisible({ space: null, resources })).toBeFalsy()
        }
      })
    })
    it('should return false if one resource is a disabled project space', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [
            mock<SpaceResource>({ canShare: () => true, disabled: true, driveType: 'project' })
          ]
          expect(unref(actions)[0].isVisible({ space: null, resources })).toBeFalsy()
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
          expect(unref(actions)[0].isVisible({ space: null, resources })).toBeTruthy()
        }
      })
    })
  })
  describe('handler', () => {
    it('calls the createLink method and shows messages', () => {
      getWrapper({
        setup: async ({ actions }) => {
          const { addLink } = useSharesStore()
          // link action
          await unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(addLink).toHaveBeenCalledWith(
            expect.objectContaining({
              options: expect.objectContaining({ '@libre.graph.quickLink': false })
            })
          )
          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledTimes(1)

          // quick link action
          await unref(actions)[1].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(addLink).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
              options: expect.objectContaining({ '@libre.graph.quickLink': true })
            })
          )
        }
      })
    })
    it('shows a modal if enforced', () => {
      getWrapper({
        enforceModal: true,
        setup: ({ actions }) => {
          const { addLink } = useSharesStore()
          const { dispatchModal } = useModals()
          unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(addLink).not.toHaveBeenCalled()
          expect(dispatchModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('shows a modal if password is enforced and link is not internal', () => {
      getWrapper({
        passwordEnforced: true,
        defaultLinkType: SharingLinkType.View,
        setup: ({ actions }) => {
          const { addLink } = useSharesStore()
          const { dispatchModal } = useModals()
          unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          expect(addLink).not.toHaveBeenCalled()
          expect(dispatchModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('calls the onLinkCreatedCallback if given', () => {
      const onLinkCreatedCallback = vi.fn()
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
        setup: async ({ actions }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>({ canShare: () => true })] })
          const { showMessage } = useMessages()
          expect(showMessage).not.toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  enforceModal = false,
  passwordEnforced = false,
  defaultLinkType = SharingLinkType.View,
  onLinkCreatedCallback = undefined,
  showMessages = true
}) {
  vi.mocked(useLinkTypes).mockReturnValue(
    mock<ReturnType<typeof useLinkTypes>>({ defaultLinkType: ref(defaultLinkType) })
  )

  const mocks = { ...defaultComponentMocks() }
  const capabilities = {
    files_sharing: { public: { password: { enforced_for: { read_only: passwordEnforced } } } }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCreateLink({
          enforceModal,
          showMessages,
          onLinkCreatedCallback
        })
        setup(instance, { mocks })
      },
      {
        provide: mocks,
        pluginOptions: { piniaOptions: { capabilityState: { capabilities } } }
      }
    )
  }
}
