import Delete from 'web-app-files/src/mixins/actions/delete.js'

import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [Delete]
}

describe('delete', () => {
  describe('computed property "$_delete_items"', () => {
    describe('delete isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canBeDeleted: () => true }], invalidLocation: false, expectedStatus: true },
        { resources: [{ canBeDeleted: () => true }], invalidLocation: true, expectedStatus: false },
        {
          resources: [{ canBeDeleted: () => false }],
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({ invalidLocation: inputData.invalidLocation })
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
    describe('delete-permanent isEnabled property of returned element', () => {
      it.each([
        { resources: [{}], deletePermanent: true, invalidLocation: false, expectedStatus: true },
        { resources: [{}], deletePermanent: true, invalidLocation: true, expectedStatus: false },
        {
          resources: [],
          deletePermanent: true,
          invalidLocation: false,
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          deletePermanent: true,
          invalidLocation: inputData.invalidLocation
        })
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[1].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })
})

function getWrapper({ deletePermanent = false, invalidLocation = false } = {}) {
  const routeName = invalidLocation
    ? 'files-shares-via-link'
    : deletePermanent
    ? 'files-trash-generic'
    : 'files-spaces-generic'
  const mocks = {
    ...defaultComponentMocks({ currentRoute: { name: routeName } }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(Component, {
      global: { plugins: [...defaultPlugins(), store], mocks }
    })
  }
}
