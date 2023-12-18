import { useSpaceActionsEditQuota } from '../../../../../src/composables/actions'
import { useModals } from '../../../../../src/composables/piniaStores'
import { buildSpace } from '@ownclouders/web-client/src/helpers'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { mock } from 'jest-mock-extended'
import { Drive } from '@ownclouders/web-client/src/generated'

describe('editQuota', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when the current user has the "set-space-quota"-permission', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        canEditSpaceQuota: true,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(true)
        }
      })
    })
    it('should be false when the current user does not have the "set-space-quota"-permission', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        driveType: 'project',
        special: null
      })
      getWrapper({
        canEditSpaceQuota: false,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
        }
      })
    })
  })
  describe('handler', () => {
    it('should create a modal', () => {
      getWrapper({
        setup: async ({ actions }) => {
          const { registerModal } = useModals()
          await unref(actions)[0].handler({ resources: [] })
          expect(registerModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  canEditSpaceQuota = false,
  setup
}: {
  canEditSpaceQuota?: boolean
  setup: (
    instance: ReturnType<typeof useSpaceActionsEditQuota>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const mocks = defaultComponentMocks()

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsEditQuota()
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks,
        pluginOptions: {
          abilities: canEditSpaceQuota ? [{ action: 'set-quota-all', subject: 'Drive' }] : []
        }
      }
    )
  }
}
