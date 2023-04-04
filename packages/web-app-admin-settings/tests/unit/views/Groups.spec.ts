import Groups from '../../../src/views/Groups.vue'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'
import { mockDeep } from 'jest-mock-extended'
import { ClientService, eventBus } from 'web-pkg/src'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mount
} from 'web-test-helpers'

const selectors = { batchActionsStub: 'batch-actions-stub' }
const getClientServiceMock = () => {
  const clientService = mockDeep<ClientService>()
  clientService.graphAuthenticated.groups.listGroups.mockImplementation(() =>
    mockAxiosResolve({ value: [{ id: '1', name: 'users', groupTypes: [] }] })
  )
  return clientService
}
jest.mock('web-pkg/src/composables/appDefaults')

describe('Groups view', () => {
  describe('method "createGroup"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.createGroup.mockImplementation(() =>
        mockAxiosReject()
      )
      const { wrapper } = getWrapper({ clientService })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editGroup"', () => {
    it('should emit event on success', async () => {
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.editGroup.mockImplementation(() => mockAxiosResolve())
      clientService.graphAuthenticated.groups.getGroup.mockImplementation(() =>
        mockAxiosResolve({ id: '1', displayName: 'administrators' })
      )
      const { wrapper } = getWrapper({ clientService })

      const editGroup = {
        id: '1',
        name: 'administrators'
      }

      const busStub = jest.spyOn(eventBus, 'publish')
      await wrapper.vm.loadResourcesTask.last

      const updatedGroup = await wrapper.vm.editGroup(editGroup)

      expect(updatedGroup.id).toEqual('1')
      expect(updatedGroup.displayName).toEqual('administrators')
      expect(busStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.editGroup.mockImplementation(() => mockAxiosReject())
      const { wrapper } = getWrapper({ clientService })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editGroup({})

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('computed method "sideBarAvailablePanels"', () => {
    describe('EditPanel', () => {
      it('should be available when one group is selected', () => {
        const { wrapper } = getWrapper()
        wrapper.vm.selectedGroups = [{ id: '1' }]
        expect(
          wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel')
        ).toBeTruthy()
      })
      it('should not be available when multiple groups are selected', () => {
        const { wrapper } = getWrapper()
        wrapper.vm.selectedGroups = [{ id: '1' }, { id: '2' }]
        expect(
          wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel')
        ).toBeFalsy()
      })
      it('should not be available when one read-only group is selected', () => {
        const { wrapper } = getWrapper()
        wrapper.vm.selectedGroups = [{ id: '1', groupTypes: ['ReadOnly'] }]
        expect(
          wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel')
        ).toBeFalsy()
      })
    })
    describe('DetailsPanel', () => {
      it('should contain DetailsPanel when no group is selected', () => {
        const { wrapper } = getWrapper()
        expect(
          wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'DetailsPanel')
        ).toBeTruthy()
      })
    })
  })

  describe('computed method "allGroupsSelected"', () => {
    it('should be true if every group is selected', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.selectedGroups = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeTruthy()
    })
    it('should be false if not every group is selected', async () => {
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.listGroups.mockImplementation(() =>
        mockAxiosResolve({ value: [{ id: '1' }, { id: '2' }] })
      )
      const { wrapper } = getWrapper({ clientService })
      wrapper.vm.selectedGroups = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeFalsy()
    })
  })

  describe('batch actions', () => {
    it('do not display when no group selected', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeFalsy()
    })
    it('display when one group selected', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadResourcesTask.last
      wrapper.vm.toggleSelectGroup({ id: '1' })
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
    it('display when more than one groups selected', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadResourcesTask.last
      wrapper.vm.toggleSelectAllGroups()
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
  })
})

function getWrapper({ clientService = getClientServiceMock() } = {}) {
  const mocks = { ...defaultComponentMocks(), $clientService: clientService }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Groups, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        stubs: {
          CreateGroupModal: true,
          AppLoadingSpinner: true,
          NoContentMessage: true,
          GroupsList: true,
          OcBreadcrumb: true,
          BatchActions: true
        }
      }
    })
  }
}
