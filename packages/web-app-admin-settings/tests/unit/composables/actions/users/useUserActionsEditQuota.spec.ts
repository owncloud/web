import { useUserActionsEditQuota } from '../../../../../src/composables/actions/users/useUserActionsEditQuota'

import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { useModals } from '@ownclouders/web-pkg'

describe('useUserActionsEditQuota', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when the current user has the "set-space-quota"-permission', () => {
      const userMock = {
        id: '1',
        drive: {
          name: 'some-drive',
          quota: {}
        }
      }
      getWrapper({
        canEditSpaceQuota: true,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toBe(true)
        }
      })
    })
    it('should be false when the current user does not have the "set-space-quota"-permission', () => {
      const userMock = {
        id: '1',
        drive: {
          name: 'some-drive',
          quota: {}
        }
      }
      getWrapper({
        canEditSpaceQuota: false,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toBe(false)
        }
      })
    })
    it('should false if included in capability readOnlyUserAttributes list', () => {
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          const userMock = {
            id: '1',
            drive: {
              name: 'some-drive',
              quota: {}
            }
          }
          storeOptions.getters.capabilities.mockReturnValue({
            graph: {
              read_only_user_attributes: ['drive.quota']
            }
          })
          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toEqual(false)
        }
      })
    })
  })
  describe('handler', () => {
    it('should create a modal', () => {
      getWrapper({
        setup: async ({ actions }) => {
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler({ resources: [] })
          expect(dispatchModal).toHaveBeenCalled()
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
    instance: ReturnType<typeof useUserActionsEditQuota>,
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
        const instance = useUserActionsEditQuota()
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
