import { useUserActionsEdit } from '../../../../../src/composables/actions/users/useUserActionsEdit'
import { mock } from 'vitest-mock-extended'
import { unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { getComposableWrapper } from 'web-test-helpers'

describe('useUserActionsEdit', () => {
  describe('method "isEnabled"', () => {
    it.each([
      { resources: [mock<User>()], isEnabled: true },
      { resources: [], isEnabled: false },
      { resources: [mock<User>(), mock<User>()], isEnabled: false }
    ])('should only return true for one user', ({ resources, isEnabled }) => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources })).toEqual(isEnabled)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useUserActionsEdit>) => void
}) {
  return {
    wrapper: getComposableWrapper(() => {
      const instance = useUserActionsEdit()
      setup(instance)
    })
  }
}
