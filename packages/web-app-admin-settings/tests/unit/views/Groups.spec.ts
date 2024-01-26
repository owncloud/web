import Groups from '../../../src/views/Groups.vue'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'
import { mock, mockDeep } from 'vitest-mock-extended'
import { ClientService, eventBus, useMessages } from '@ownclouders/web-pkg'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { Group } from '@ownclouders/web-client/src/generated'

const selectors = { batchActionsStub: 'batch-actions-stub' }
const getClientServiceMock = () => {
  const clientService = mockDeep<ClientService>()
  clientService.graphAuthenticated.groups.listGroups.mockResolvedValue(
    mockAxiosResolve({ value: [{ id: '1', name: 'users', groupTypes: [] }] })
  )
  return clientService
}
vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useAppDefaults: vi.fn()
}))

describe('Groups view', () => {
  describe('method "onEditGroup"', () => {
    it('should emit event on success', async () => {
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.editGroup.mockResolvedValue(mockAxiosResolve())
      clientService.graphAuthenticated.groups.getGroup.mockResolvedValue(
        mockAxiosResolve({ id: '1', displayName: 'administrators' })
      )
      const { wrapper } = getWrapper({ clientService })

      const editGroup = {
        id: '1',
        name: 'administrators'
      }

      const busStub = vi.spyOn(eventBus, 'publish')
      await wrapper.vm.loadResourcesTask.last

      const updatedGroup = await wrapper.vm.onEditGroup(editGroup)

      expect(updatedGroup.id).toEqual('1')
      expect(updatedGroup.displayName).toEqual('administrators')
      expect(busStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const clientService = getClientServiceMock()
      clientService.graphAuthenticated.groups.editGroup.mockImplementation(() => mockAxiosReject())
      const { wrapper } = getWrapper({ clientService })
      await wrapper.vm.onEditGroup({})

      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalled()
    })
  })

  describe('computed method "sideBarAvailablePanels"', () => {
    describe('EditPanel', () => {
      it('should be available when one group is selected', () => {
        const { wrapper } = getWrapper()
        expect(
          wrapper.vm.sideBarAvailablePanels
            .find(({ name }) => name === 'EditPanel')
            .isVisible({ items: [{ id: '1' }] })
        ).toBeTruthy()
      })
      it('should not be available when multiple groups are selected', () => {
        const { wrapper } = getWrapper()
        expect(
          wrapper.vm.sideBarAvailablePanels
            .find(({ name }) => name === 'EditPanel')
            .isVisible({ items: [{ id: '1' }, { id: '2' }] })
        ).toBeFalsy()
      })
      it('should not be available when one read-only group is selected', () => {
        const { wrapper } = getWrapper()
        expect(
          wrapper.vm.sideBarAvailablePanels
            .find(({ name }) => name === 'EditPanel')
            .isVisible({ items: [{ id: '1', groupTypes: ['ReadOnly'] }] })
        ).toBeFalsy()
      })
    })
    describe('DetailsPanel', () => {
      it('should contain DetailsPanel when no group is selected', () => {
        const { wrapper } = getWrapper()
        expect(
          wrapper.vm.sideBarAvailablePanels
            .find(({ name }) => name === 'DetailsPanel')
            .isVisible({ items: [] })
        ).toBeTruthy()
      })
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
      wrapper.vm.selectGroups([mock<Group>({ groupTypes: [] }), mock<Group>({ groupTypes: [] })])
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
  })
})

function getWrapper({ clientService = getClientServiceMock() } = {}) {
  const mocks = { ...defaultComponentMocks(), $clientService: clientService }

  return {
    wrapper: mount(Groups, {
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks,
        stubs: {
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
