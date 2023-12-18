import { useUserActionsEditLogin } from '../../../../../src/composables/actions/users/useUserActionsEditLogin'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { createStore, defaultStoreMockOptions, getComposableWrapper } from 'web-test-helpers'
import { useModals } from '@ownclouders/web-pkg'

describe('useUserActionsEditLogin', () => {
  describe('method "isEnabled"', () => {
    it.each([
      { resources: [], isEnabled: false },
      { resources: [mock<User>()], isEnabled: true },
      { resources: [mock<User>(), mock<User>()], isEnabled: true }
    ])('requires at least one user to be enabled', ({ resources, isEnabled }) => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources })).toEqual(isEnabled)
        }
      })
    })
    it('returns false if included in capability readOnlyUserAttributes list', () => {
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          storeOptions.getters.capabilities.mockReturnValue({
            graph: {
              users: { read_only_attributes: ['user.accountEnabled'] }
            }
          })

          expect(unref(actions)[0].isEnabled({ resources: [mock<User>()] })).toEqual(false)
        }
      })
    })
  })
  describe('method "handler"', () => {
    it('creates a modal', () => {
      getWrapper({
        setup: async ({ actions }) => {
          const { registerModal } = useModals()
          await unref(actions)[0].handler({ resources: [mock<User>()] })
          expect(registerModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useUserActionsEditLogin>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useUserActionsEditLogin()
        setup(instance, { storeOptions })
      },
      { store }
    )
  }
}
