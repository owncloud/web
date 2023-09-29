import { useGroupActionsEdit } from '../../../../../src/composables/actions/groups/useGroupActionsEdit'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { Group } from '@ownclouders/web-client/src/generated'
import { getComposableWrapper } from 'web-test-helpers'

describe('useGroupActionsEdit', () => {
  describe('method "isEnabled"', () => {
    it.each([
      { resources: [mock<Group>({ groupTypes: [] })], isEnabled: true },
      { resources: [], isEnabled: false },
      {
        resources: [mock<Group>({ groupTypes: [] }), mock<Group>({ groupTypes: [] })],
        isEnabled: false
      }
    ])('should only return true for one group', ({ resources, isEnabled }) => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources })).toEqual(isEnabled)
        }
      })
    })
    it('should return false for read-only groups', () => {
      getWrapper({
        setup: ({ actions }) => {
          const resources = [mock<Group>({ groupTypes: ['ReadOnly'] })]
          expect(unref(actions)[0].isEnabled({ resources })).toBeFalsy()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useGroupActionsEdit>) => void
}) {
  return {
    wrapper: getComposableWrapper(() => {
      const instance = useGroupActionsEdit()
      setup(instance)
    })
  }
}
