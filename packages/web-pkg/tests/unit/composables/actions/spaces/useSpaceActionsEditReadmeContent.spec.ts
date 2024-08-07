import {
  useOpenWithDefaultApp,
  useSpaceActionsEditReadmeContent
} from '../../../../../src/composables/actions'
import { Resource, SpaceResource, buildSpace } from '@ownclouders/web-client'
import { getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { mock, mockDeep } from 'vitest-mock-extended'
import { Drive } from '@ownclouders/web-client/graph/generated'
import { ClientService } from '../../../../../src/services'
import { useSpaceHelpers } from '../../../../../src/composables/spaces/useSpaceHelpers'

vi.mock('../../../../../src/composables/actions/useOpenWithDefaultApp', () => ({
  useOpenWithDefaultApp: vi.fn()
}))

vi.mock('../../../../../src/composables/spaces/useSpaceHelpers', () => ({
  useSpaceHelpers: vi.fn()
}))

describe('editReadmeContent', () => {
  describe('isVisible property', () => {
    it('should be true for space managers', () => {
      const spaceMock = mock<Drive>({
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: '1' } }] }]
        },
        special: [{ specialFolder: { name: 'readme' } }]
      })

      getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({
              resources: [buildSpace(spaceMock)]
            })
          ).toBe(true)
        }
      })
    })
    it('should be false when not resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isVisible({ resources: [] })).toBe(false)
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

      getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isVisible({
              resources: [buildSpace(spaceMock)]
            })
          ).toBe(false)
        }
      })
    })
  })
  describe('method "handler"', () => {
    it('calls method "openWithDefaultApp"', () => {
      getWrapper({
        setup: async ({ actions }, { openWithDefaultApp }) => {
          await unref(actions)[0].handler({ resources: [mock<SpaceResource>()] })
          expect(openWithDefaultApp).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  openWithDefaultApp = vi.fn()
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsEditReadmeContent>,
    mocks: { openWithDefaultApp: () => void }
  ) => void
  openWithDefaultApp?: () => void
}) {
  vi.mocked(useOpenWithDefaultApp).mockReturnValue(
    mock<ReturnType<typeof useOpenWithDefaultApp>>({
      openWithDefaultApp
    })
  )

  vi.mocked(useSpaceHelpers).mockReturnValue({
    checkSpaceNameModalInput: vi.fn(),
    getDefaultMetaFolder: () => new Promise(() => mock<Resource>())
  })

  const mocks = { openWithDefaultApp }

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsEditReadmeContent()
        setup(instance, mocks)
      },
      {
        provide: { $clientService: mockDeep<ClientService>() },
        pluginOptions: {
          piniaOptions: { userState: { user: { id: '1', onPremisesSamAccountName: 'alice' } } }
        }
      }
    )
  }
}
