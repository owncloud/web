import { computed, unref } from 'vue'
import {
  useFileActionsCopyQuickLink,
  useFileActionsCreateLink
} from '../../../../../src/composables/actions/files'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { FileAction } from '../../../../../src/composables/actions'
import { useCanShare } from '../../../../../src/composables/shares'
import { Resource } from '@ownclouders/web-client'
import { Share, buildShare } from '@ownclouders/web-client/src/helpers/share'
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

vi.mock('@ownclouders/web-client/src/helpers/share', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  buildShare: vi.fn()
}))

describe('useFileActionsCopyQuickLink', () => {
  describe('isEnabled property', () => {
    it('should return false if no resource selected', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ space: null, resources: [] })).toBeFalsy()
        }
      })
    })
    it('should return false if canShare is false', () => {
      getWrapper({
        canShare: false,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [mock<Resource>()] })).toBeFalsy()
        }
      })
    })
    it('should return true if resource can be shared', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [mock<Resource>()] })).toBeTruthy()
        }
      })
    })
  })
  describe('handler', () => {
    it('should create a new link if quick link does not yet exist', () => {
      getWrapper({
        setup: async ({ actions }, { mocks }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>()] })
          expect(mocks.createLinkMock).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should not create a new link if quick link does already exist', () => {
      getWrapper({
        quickLinkExists: true,
        setup: async ({ actions }, { mocks }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>()] })
          expect(mocks.createLinkMock).not.toHaveBeenCalled()
          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({ setup, canShare = true, quickLinkExists = false }) {
  const createLinkMock = vi.fn()
  vi.mocked(useFileActionsCreateLink).mockReturnValue({
    actions: computed(() => [
      mock<FileAction>({ name: 'create-quick-links', handler: createLinkMock })
    ])
  })
  vi.mocked(useCanShare).mockReturnValue({ canShare: vi.fn(() => canShare) })
  vi.mocked(buildShare).mockReturnValue(mock<Share>({ quicklink: quickLinkExists }))
  vi.mocked(useClipboard).mockReturnValue({ copyToClipboard: vi.fn() })

  const mocks = { ...defaultComponentMocks(), createLinkMock }
  mocks.$clientService.owncloudSdk.shares.getShares.mockResolvedValue([{}])

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
