import { useCapabilityCreateUsersDisabled, useModals } from '@ownclouders/web-pkg'
import { useUserActionsCreateUser } from '../../../../../src/composables/actions/users/useUserActionsCreateUser'
import { computed, unref } from 'vue'
import { getComposableWrapper } from 'web-test-helpers'

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
        setup: async ({ actions }) => {
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler()
          expect(dispatchModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  capabilityCreateUsersDisabled = false
}: {
  setup: (instance: ReturnType<typeof useUserActionsCreateUser>) => void
  capabilityCreateUsersDisabled?: boolean
}) {
  jest
    .mocked(useCapabilityCreateUsersDisabled)
    .mockReturnValue(computed(() => capabilityCreateUsersDisabled))

  return {
    wrapper: getComposableWrapper(() => {
      const instance = useUserActionsCreateUser()
      setup(instance)
    })
  }
}
