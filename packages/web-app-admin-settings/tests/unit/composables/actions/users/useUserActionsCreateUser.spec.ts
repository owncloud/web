import { useCapabilityCreateUsersDisabled } from '@ownclouders/web-pkg'
import { useUserActionsCreateUser } from '../../../../../src/composables/actions/users/useUserActionsCreateUser'
import { computed, unref } from 'vue'
import { defaultStoreMockOptions, getComposableWrapper, createStore } from 'web-test-helpers'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useCapabilityCreateUsersDisabled: jest.fn()
}))

describe('useUserActionsCreateUser', () => {
  describe('method "isEnabled"', () => {
    it.each([true, false])(
      'is enabled based on the capability',
      (capabilityCreateUsersDisabled) => {
        getWrapper({
          capabilityCreateUsersDisabled,
          setup: ({ actions }) => {
            expect(unref(actions)[0].isEnabled()).toEqual(!capabilityCreateUsersDisabled)
          }
        })
      }
    )
  })
  describe('method "handler"', () => {
    it('creates a modal', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler()
          expect(storeOptions.actions.createModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  capabilityCreateUsersDisabled = false
}: {
  setup: (instance: ReturnType<typeof useUserActionsCreateUser>, { storeOptions }) => void
  capabilityCreateUsersDisabled?: boolean
}) {
  jest
    .mocked(useCapabilityCreateUsersDisabled)
    .mockReturnValue(computed(() => capabilityCreateUsersDisabled))

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useUserActionsCreateUser()
        setup(instance, { storeOptions })
      },
      { store }
    )
  }
}
