import restore from 'web-pkg/src/mixins/spaces/restore'
import { buildSpace, SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [restore]
}

describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when the space is not disabled', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedToIdentities: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
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
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
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
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        false
      )
    })
  })

  describe('method "$_restore_trigger"', () => {
    it('should trigger the restore modal window', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_restore_trigger({
        resources: [mock<SpaceResource>({ id: 1, canRestore: () => true })]
      })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the restore modal window without any resource', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_restore_trigger({
        resources: [mock<SpaceResource>({ id: 1, canRestore: () => false })]
      })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_restore_restoreSpace"', () => {
    it('should hide the modal on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(
        mockAxiosResolve()
      )
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_restore_restoreSpaces([
        mock<SpaceResource>({ id: 1, canRestore: () => true })
      ])

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockRejectedValue(new Error())
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_restore_restoreSpaces([
        mock<SpaceResource>({ id: 1, canRestore: () => true })
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
