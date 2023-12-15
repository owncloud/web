import { useUserActionsAddToGroups } from '../../../../../src/composables/actions/users/useUserActionsAddToGroups'
import { mock } from 'jest-mock-extended'
import { ref, unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { createStore, defaultStoreMockOptions, getComposableWrapper } from 'web-test-helpers'

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
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler({ resources: [mock<User>()] })
          expect(storeOptions.actions.createModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useUserActionsAddToGroups>,
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
        const instance = useUserActionsAddToGroups({ groups: ref([]) })
        setup(instance, { storeOptions })
      },
      { store }
    )
  }
}
