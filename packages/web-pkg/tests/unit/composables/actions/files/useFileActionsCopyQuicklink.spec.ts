import { computed, unref } from 'vue'
import {
  useFileActionsCopyQuickLink,
  useFileActionsCreateLink
} from '../../../../../src/composables/actions/files'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { FileAction } from '../../../../../src/composables/actions'
import { useCanShare } from '../../../../../src/composables/shares'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { LinkShare } from '@ownclouders/web-client'
import { useClipboard } from '../../../../../src/composables/clipboard'
import { useMessages } from '../../../../../src/composables/piniaStores'

vi.mock('../../../../../src/composables/shares', () => ({
  useCanShare: vi.fn()
}))

vi.mock('../../../../../src/composables/actions/files/useFileActionsCreateLink', () => ({
  useFileActionsCreateLink: vi.fn()
}))

vi.mock('../../../../../src/composables/clipboard', () => ({
  useClipboard: vi.fn()
}))

describe('useFileActionsCopyQuickLink', () => {
  describe('isVisible property', () => {
    it('should return false if no resource selected', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isVisible({ space: null, resources: [] })).toBeFalsy()
        }
      })
    })
    it('should return false if canShare is false', () => {
      getWrapper({
        canShare: false,
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({ resources: [mock<Resource>()], space: undefined })
          ).toBeFalsy()
        }
      })
    })
    it('should return true if resource can be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({ resources: [mock<Resource>()], space: undefined })
          ).toBeTruthy()
        }
      })
    })
  })
  describe('handler', () => {
    it('should create a new link if quick link does not yet exist', () => {
      getWrapper({
        setup: async ({ actions }, { mocks }) => {
          await unref(actions)[0].handler({
            resources: [mock<Resource>()],
            space: mock<SpaceResource>()
          })
          expect(mocks.createLinkMock).toHaveBeenCalledTimes(1)
          expect(
            mocks.$clientService.graphAuthenticated.permissions.listPermissions
          ).toHaveBeenCalled()
        }
      })
    })
    it('should not create a new link if quick link does already exist', () => {
      getWrapper({
        quickLinkExists: true,
        setup: async ({ actions }, { mocks }) => {
          await unref(actions)[0].handler({
            resources: [mock<Resource>()],
            space: mock<SpaceResource>()
          })
          expect(mocks.createLinkMock).not.toHaveBeenCalled()
          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('calls the graph root endpoint for spaces', () => {
      getWrapper({
        setup: async ({ actions }, { mocks }) => {
          await unref(actions)[0].handler({
            resources: [mock<SpaceResource>({ type: 'space' })],
            space: mock<SpaceResource>()
          })
          expect(mocks.createLinkMock).toHaveBeenCalledTimes(1)
          expect(
            mocks.$clientService.graphAuthenticated.permissions.listPermissions
          ).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  canShare = true,
  quickLinkExists = false
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsCopyQuickLink>,
    mocks: Record<string, any>
  ) => void
  canShare?: boolean
  quickLinkExists?: boolean
}) {
  const createLinkMock = vi.fn()
  vi.mocked(useFileActionsCreateLink).mockReturnValue({
    actions: computed(() => [
      mock<FileAction>({ name: 'create-quick-links', handler: createLinkMock })
    ])
  })
  vi.mocked(useCanShare).mockReturnValue({ canShare: vi.fn(() => canShare) })
  vi.mocked(useClipboard).mockReturnValue({ copyToClipboard: vi.fn() })

  const mocks = { ...defaultComponentMocks(), createLinkMock }

  const graphClientMock = mocks.$clientService.graphAuthenticated
  graphClientMock.permissions.listPermissions.mockResolvedValue({
    shares: [mock<LinkShare>({ isQuickLink: quickLinkExists })],
    allowedActions: [],
    allowedRoles: []
  })

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCopyQuickLink()
        setup(instance, { mocks })
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
