import Delete from 'web-pkg/src/mixins/spaces/delete'
import { buildSpace, SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'

const Component = {
  template: '<div></div>',
  mixins: [Delete]
}

describe('delete', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when the space is not disabled', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        false
      )
    })
    it('should be true when the space is disabled', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }],
          deleted: { state: 'trashed' }
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        true
      )
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['viewer'], grantedToIdentities: [{ user: { id: 1 } }] }],
          deleted: { state: 'trashed' }
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        false
      )
    })
  })

  describe('method "$_delete_trigger"', () => {
    it('should trigger the delete modal window', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({
        resources: [mock<SpaceResource>({ id: 1, canBeDeleted: () => true })]
      })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the delete modal window without any resource to delete', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({
        resources: [mock<SpaceResource>({ id: 1, canBeDeleted: () => false })]
      })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_delete_deleteSpace"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.deleteDrive.mockResolvedValue(
        mockAxiosResolve()
      )
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpaces([
        mock<SpaceResource>({ id: 1, canBeDeleted: () => true })
      ])

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.deleteDrive.mockRejectedValue(new Error())
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpaces([
        mock<SpaceResource>({ id: 1, canBeDeleted: () => true })
      ])

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
