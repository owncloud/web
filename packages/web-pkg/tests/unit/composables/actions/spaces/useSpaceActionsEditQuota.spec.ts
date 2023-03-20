import { useSpaceActionsEditQuota } from 'web-pkg/src/composables/actions/spaces'
import { buildSpace } from 'web-client/src/helpers'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { useAbility } from 'web-pkg/src/composables/ability/useAbility'
import { Ability } from 'web-pkg/src'
import { mock } from 'jest-mock-extended'

jest.mock('web-pkg/src/composables/ability/useAbility')

describe('editQuota', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when the current user has the "set-space-quota"-permission', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper({
        canEditSpaceQuota: true,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(true)
        }
      })
    })
    it('should be false when the current user does not have the "set-space-quota"-permission', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper({
        canEditSpaceQuota: false,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(false)
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
    }: // clientService
    {
      storeOptions: typeof defaultStoreMockOptions
      // clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  jest.mocked(useAbility).mockImplementation(() =>
    mock<Ability>({
      can: () => canEditSpaceQuota
    })
  )

  const mocks = defaultComponentMocks()

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsEditQuota({ store })
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks
      }
    )
  }
}
