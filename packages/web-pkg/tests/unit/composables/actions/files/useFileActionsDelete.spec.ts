import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import {
  useFileActionsDeleteResources,
  useFileActionsDelete
} from '../../../../../src/composables/actions'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useStore } from '../../../../../src/composables/store'

import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'

jest.mock('../../../../../src/composables/actions/helpers/useFileActionsDeleteResources')

describe('delete', () => {
  describe('computed property "actions"', () => {
    describe('delete isEnabled property of returned element', () => {
      it.each([
        {
          resources: [{ canBeDeleted: () => true }] as Resource[],
          invalidLocation: false,
          expectedStatus: true
        },
        {
          resources: [{ canBeDeleted: () => true }] as Resource[],
          invalidLocation: true,
          expectedStatus: false
        },
        {
          resources: [{ canBeDeleted: () => false }] as Resource[],
          invalidLocation: false,
          expectedStatus: false
        },
        {
          resources: [{ canBeDeleted: () => true, locked: true }] as Resource[],
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          invalidLocation: inputData.invalidLocation,
          setup: () => {
            const store = useStore()
            const { actions } = useFileActionsDelete({ store })

            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
    describe('delete-permanent isEnabled property of returned element', () => {
      it.each([
        {
          resources: [{}] as Resource[],
          deletePermanent: true,
          invalidLocation: false,
          expectedStatus: true
        },
        {
          resources: [{}] as Resource[],
          deletePermanent: true,
          invalidLocation: true,
          expectedStatus: false
        },
        {
          resources: [] as Resource[],
          deletePermanent: true,
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          deletePermanent: true,
          invalidLocation: inputData.invalidLocation,
          setup: () => {
            const store = useStore()
            const { actions } = useFileActionsDelete({ store })

            const resources = inputData.resources
            expect(unref(actions)[1].isEnabled({ space: mock<SpaceResource>(), resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })
  describe('search context', () => {
    describe('computed property "actions"', () => {
      describe('handler', () => {
        it.each([
          {
            resources: [
              { id: '1', canBeDeleted: () => true, isShareRoot: () => false },
              { id: '2', canBeDeleted: () => true, isShareRoot: () => false }
            ] as Resource[],
            deletableResourceIds: ['1', '2']
          },
          {
            resources: [
              { id: '1', canBeDeleted: () => true, isShareRoot: () => false },
              { id: '2', canBeDeleted: () => true, isShareRoot: () => false },
              { id: '3', canBeDeleted: () => true, isShareRoot: () => false },
              { id: '4', canBeDeleted: () => false, isShareRoot: () => false },
              { id: '5', canBeDeleted: () => true, isShareRoot: () => true },
              { id: '6', canBeDeleted: () => true, isShareRoot: () => false, driveType: 'project' }
            ] as Resource[],
            deletableResourceIds: ['1', '2', '3']
          }
        ])('should filter non deletable resources', ({ resources, deletableResourceIds }) => {
          const filesListDeleteMock = jest.fn()

          const { wrapper } = getWrapper({
            searchLocation: true,
            filesListDeleteMock,
            setup: () => {
              const store = useStore()
              const { actions } = useFileActionsDelete({ store })

              unref(actions)[0].handler({ space: null, resources })

              expect(filesListDeleteMock).toHaveBeenCalledWith(
                resources.filter((r) => deletableResourceIds.includes(r.id as string))
              )
            }
          })
        })
      })
    })
  })
})

function getWrapper({
  deletePermanent = false,
  invalidLocation = false,
  searchLocation = false,
  filesListDeleteMock = jest.fn(),
  setup = () => undefined
} = {}) {
  const routeName = invalidLocation
    ? 'files-shares-via-link'
    : deletePermanent
      ? 'files-trash-generic'
      : searchLocation
        ? 'files-common-search'
        : 'files-spaces-generic'
  jest
    .mocked(useFileActionsDeleteResources)
    .mockImplementation(() => ({ filesList_delete: filesListDeleteMock, displayDialog: jest.fn() }))
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({ spaces: { enabled: true } }))
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(setup, {
      mocks,
      provide: mocks,
      store
    })
  }
}
