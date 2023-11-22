import { useSpaceActionsDuplicate } from '../../../../../src/composables/actions'
import { buildSpace, Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  mockAxiosResolve,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper,
  defaultPlugins
} from 'web-test-helpers'
import { unref } from 'vue'
import { Drive } from '@ownclouders/web-client/src/generated'
import { Ability } from '@casl/ability'

describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when multiple resource given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({ disabled: false }),
                mock<SpaceResource>({ disabled: false })
              ]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when the space is disabled', () => {
      const spaceMock = mock<SpaceResource>({
        disabled: true
      })
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [spaceMock] })).toBe(false)
        }
      })
    })
    it('should be false when the current user can not create spaces', () => {
      const { wrapper } = getWrapper({
        abilities: [],
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({ resources: [mock<SpaceResource>({ disabled: false })] })
          ).toBe(false)
        }
      })
    })
    it('should be true when the current user can create spaces', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({ resources: [mock<SpaceResource>({ disabled: false })] })
          ).toBe(true)
        }
      })
    })
  })
})

function getWrapper({
  setup,
  abilities = [{ action: 'create-all', subject: 'Drive' }]
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsDuplicate>,
    {
      storeOptions,
      clientService
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
  abilities?
}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.getters.user.mockReturnValue({ id: 'alice', uuid: 1 })
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsDuplicate({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        provide: mocks,
        store,
        pluginOptions: { abilities }
      }
    )
  }
}
