import { useSpaceActionsEditReadmeContent } from '../../../../../src/composables/actions'
import { buildSpace } from 'web-client/src/helpers'
import { createStore, defaultStoreMockOptions, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { mock } from 'jest-mock-extended'
import { Drive } from 'web-client/src/generated'

describe('editReadmeContent', () => {
  describe('isEnabled property', () => {
    it('should be true for space managers', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        special: [{ specialFolder: { name: 'readme' } }]
      })

      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [buildSpace(spaceMock)]
            })
          ).toBe(true)
        }
      })
    })
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when spaceReadmeData does not exist', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        special: null
      })

      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [buildSpace(spaceMock)]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        special: null
      })

      const { wrapper } = getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [buildSpace(spaceMock)]
            })
          ).toBe(false)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsEditReadmeContent>,
    {
      storeOptions
    }: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.getters.user.mockReturnValue({ id: 'alice', uuid: 1 })

  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsEditReadmeContent({ store })
        setup(instance, { storeOptions })
      },
      {
        store
      }
    )
  }
}
