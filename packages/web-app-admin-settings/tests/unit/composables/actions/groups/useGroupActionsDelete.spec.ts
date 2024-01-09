import { useGroupActionsDelete } from '../../../../../src/composables/actions/groups/useGroupActionsDelete'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { Group } from '@ownclouders/web-client/src/generated'
import { eventBus } from '@ownclouders/web-pkg'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'

describe('useGroupActionsDelete', () => {
  describe('method "isEnabled"', () => {
    it.each([
      { resources: [], isEnabled: false },
      { resources: [mock<Group>({ groupTypes: [] })], isEnabled: true },
      {
        resources: [mock<Group>({ groupTypes: [] }), mock<Group>({ groupTypes: [] })],
        isEnabled: true
      }
    ])('should only return true if 1 or more groups are selected', ({ resources, isEnabled }) => {
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
  describe('method "deleteGroups"', () => {
    it('should successfully delete all given gropups and reload the groups list', () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      getWrapper({
        setup: async ({ deleteGroups }, { clientService }) => {
          const group = mock<Group>({ id: '1' })
          await deleteGroups([group])
          expect(clientService.graphAuthenticated.groups.deleteGroup).toHaveBeenCalledWith(group.id)
          expect(eventSpy).toHaveBeenCalledWith('app.admin-settings.list.load')
        }
      })
    })
    it('should handle errors', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const eventSpy = jest.spyOn(eventBus, 'publish')
      getWrapper({
        setup: async ({ deleteGroups }, { clientService }) => {
          clientService.graphAuthenticated.groups.deleteGroup.mockRejectedValue({})
          const group = mock<Group>({ id: '1' })
          await deleteGroups([group])
          expect(clientService.graphAuthenticated.groups.deleteGroup).toHaveBeenCalledWith(group.id)
          expect(eventSpy).toHaveBeenCalledWith('app.admin-settings.list.load')
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useGroupActionsDelete>,
    {
      storeOptions,
      clientService
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useGroupActionsDelete()
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      { store, mocks, provide: mocks }
    )
  }
}
