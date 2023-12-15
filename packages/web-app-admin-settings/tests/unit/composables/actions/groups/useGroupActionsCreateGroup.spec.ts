import { useGroupActionsCreateGroup } from '../../../../../src/composables/actions/groups/useGroupActionsCreateGroup'
import { unref } from 'vue'
import { defaultStoreMockOptions, getComposableWrapper, createStore } from 'web-test-helpers'

describe('useGroupActionsCreateGroup', () => {
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
  setup
}: {
  setup: (instance: ReturnType<typeof useGroupActionsCreateGroup>, { storeOptions }) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useGroupActionsCreateGroup()
        setup(instance, { storeOptions })
      },
      { store }
    )
  }
}
