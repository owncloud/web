import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { useDelete } from 'web-app-files/src/mixins/actions/delete'
import { Resource, SpaceResource } from 'web-client/src'
import { useStore } from 'web-pkg/src'

import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'

describe('delete', () => {
  describe('computed property "$_delete_items"', () => {
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
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          invalidLocation: inputData.invalidLocation,
          setup: () => {
            const store = useStore()
            const { actions } = useDelete({ store })

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
            const { actions } = useDelete({ store })

            const resources = inputData.resources
            expect(unref(actions)[1].isEnabled({ space: mock<SpaceResource>(), resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })
})

function getWrapper({
  deletePermanent = false,
  invalidLocation = false,
  setup = () => undefined
} = {}) {
  const routeName = invalidLocation
    ? 'files-shares-via-link'
    : deletePermanent
    ? 'files-trash-generic'
    : 'files-spaces-generic'
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(setup, {
      mocks,
      store
    })
  }
}
