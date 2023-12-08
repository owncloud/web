import { computed, unref } from 'vue'
import {
  useFileActionsCopyQuickLink,
  useFileActionsCreateLink
} from '../../../../../src/composables/actions/files'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { FileAction } from '../../../../../src/composables/actions'
import { useCanShare } from '../../../../../src/composables/shares'
import { Resource } from '@ownclouders/web-client'
import { Share, buildShare } from '@ownclouders/web-client/src/helpers/share'
import { useClipboard } from '../../../../../src/composables/clipboard'

jest.mock('../../../../../src/composables/shares', () => ({
  useCanShare: jest.fn()
}))

jest.mock('../../../../../src/composables/actions/files/useFileActionsCreateLink', () => ({
  useFileActionsCreateLink: jest.fn()
}))

jest.mock('../../../../../src/composables/clipboard', () => ({
  useClipboard: jest.fn()
}))

jest.mock('@ownclouders/web-client/src/helpers/share', () => ({
  ...jest.requireActual('@ownclouders/web-client/src/helpers/share'),
  buildShare: jest.fn()
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
        setup: async ({ actions }, { mocks, storeOptions }) => {
          await unref(actions)[0].handler({ resources: [mock<Resource>()] })
          expect(mocks.createLinkMock).not.toHaveBeenCalled()
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({ setup, canShare = true, quickLinkExists = false }) {
  const createLinkMock = jest.fn()
  jest.mocked(useFileActionsCreateLink).mockReturnValue({
    actions: computed(() => [
      mock<FileAction>({ name: 'create-quick-links', handler: createLinkMock })
    ])
  })
  jest.mocked(useCanShare).mockReturnValue({ canShare: jest.fn(() => canShare) })
  jest.mocked(buildShare).mockReturnValue(mock<Share>({ quicklink: quickLinkExists }))
  jest.mocked(useClipboard).mockReturnValue({ copyToClipboard: jest.fn() })

  const mocks = { ...defaultComponentMocks(), createLinkMock }
  mocks.$clientService.owncloudSdk.shares.getShares.mockResolvedValue([{}])

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCopyQuickLink({
          store
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
