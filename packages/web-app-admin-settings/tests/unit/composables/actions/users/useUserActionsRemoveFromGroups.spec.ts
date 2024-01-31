import { useUserActionsRemoveFromGroups } from '../../../../../src/composables/actions/users/useUserActionsRemoveFromGroups'
import { mock } from 'vitest-mock-extended'
import { ref, unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { getComposableWrapper } from 'web-test-helpers'
import { useModals } from '@ownclouders/web-pkg'

describe('useUserActionsRemoveFromGroups', () => {
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
              users: { read_only_attributes: ['user.memberOf'] }
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
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler({ resources: [mock<User>()] })
          expect(dispatchModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useUserActionsRemoveFromGroups>) => void
}) {
  return {
    wrapper: getComposableWrapper(() => {
      const instance = useUserActionsRemoveFromGroups({ groups: ref([]) })
      setup(instance)
    })
  }
}
