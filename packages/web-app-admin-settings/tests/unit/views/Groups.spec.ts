import Groups from '../../../src/views/Groups.vue'
import { mock, mockDeep } from 'vitest-mock-extended'
import { ClientService } from '@ownclouders/web-pkg'
import { defaultComponentMocks, defaultPlugins, mount } from '@ownclouders/web-test-helpers'
import { Group } from '@ownclouders/web-client/graph/generated'

const selectors = { batchActionsStub: 'batch-actions-stub' }
const getClientServiceMock = () => {
  const clientService = mockDeep<ClientService>()
  clientService.graphAuthenticated.groups.listGroups.mockResolvedValue([
    mock<Group>({ id: '1', displayName: 'users', groupTypes: [] })
  ])
  return clientService
}
vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useAppDefaults: vi.fn()
}))

describe('Groups view', () => {
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
      const { wrapper } = getWrapper({ selectedGroups: [{ id: '1' }] })
      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
    it('display when more than one groups selected', async () => {
      const { wrapper } = getWrapper({ selectedGroups: [{ id: '1' }, { id: '2' }] })
      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
  })
})

function getWrapper({
  clientService = getClientServiceMock(),
  groups = [],
  selectedGroups = []
}: { clientService?: ClientService; groups?: Group[]; selectedGroups?: Group[] } = {}) {
  const mocks = { ...defaultComponentMocks(), $clientService: clientService }

  return {
    wrapper: mount(Groups, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              groupSettingsStore: { groups, selectedGroups }
            }
          })
        ],
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
