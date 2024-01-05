import { unref } from 'vue'
import { SpaceResource } from '@ownclouders/web-client/src'
import { useSpaceActionsShowMembers } from '../../../../../src'
import { createStore, defaultStoreMockOptions, getComposableWrapper } from 'web-test-helpers'

describe('showMembers', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when a resource is given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [{ id: '1' } as SpaceResource] })).toBe(
            true
          )
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useSpaceActionsShowMembers>) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsShowMembers({ store })
        setup(instance)
      },
      {
        store
      }
    )
  }
}
