import { useUserActionsAddToGroups } from '../../../../../src/composables/actions/users/useUserActionsAddToGroups'
import { mock } from 'jest-mock-extended'
import { ref, unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { getComposableWrapper } from 'web-test-helpers'
import { useModals } from '@ownclouders/web-pkg'

describe('useUserActionsAddToGroups', () => {
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
  setup: (instance: ReturnType<typeof useUserActionsAddToGroups>) => void
}) {
  return {
    wrapper: getComposableWrapper(() => {
      const instance = useUserActionsAddToGroups({ groups: ref([]) })
      setup(instance)
    })
  }
}
