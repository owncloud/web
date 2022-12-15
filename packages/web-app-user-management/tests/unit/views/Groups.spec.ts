import Groups from '../../../src/views/Groups.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosReject,
  mockAxiosResolve,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Graph } from 'web-client'
import { Group, CollectionOfGroup } from 'web-client/src/generated'

describe('Groups view', () => {
  describe('method "createGroup"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getMountedWrapper({ resolveCreateGroup: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "deleteGroups"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteGroupModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteGroupModal')
      await wrapper.vm.deleteGroups([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteGroupModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getMountedWrapper({ resolveDeleteGroup: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteGroupModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteGroupModal')
      await wrapper.vm.deleteGroups([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editGroup"', () => {
    it('should show message on success', async () => {
      const { wrapper } = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editGroup({ id: '1', displayName: 'Super group' })

      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getMountedWrapper({ resolveEditGroup: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editGroup({})

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('computed method "sideBarAvailablePanels"', () => {
    /**
     * As soon as edit panel will be available in group management, please un-skip it.
     */
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should contain EditPanel with property enabled set true when one group is selected', () => {
      const { wrapper } = getMountedWrapper({ data: { selectedGroups: [{ id: '1' }] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain EditPanel with property enabled set false when no group is selected', () => {
      const { wrapper } = getMountedWrapper({ data: { selectedGroups: [] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
    it('should contain EditPanel with property enabled set false when multiple groups are selected', () => {
      const { wrapper } = getMountedWrapper({
        data: { selectedGroups: [{ id: '1' }, { id: '2' }] }
      })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
  })

  describe('computed method "allGroupsSelected"', () => {
    it('should be true if every group is selected', async () => {
      const { wrapper } = getMountedWrapper({
        groups: [mockDeep<Group>({ id: '1' })],
        data: { selectedGroups: [{ id: '1' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeTruthy()
    })
    it('should false if not every group is selected', async () => {
      const { wrapper } = getMountedWrapper({
        groups: [mockDeep<Group>({ id: '1' })],
        data: { selectedGroups: [{ id: '1' }, { id: '2' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeFalsy()
    })
  })
})

function getMountedWrapper({
  data = {},
  groups = [],
  resolveCreateGroup = true,
  resolveEditGroup = true,
  resolveDeleteGroup = true
} = {}) {
  const mocks = defaultComponentMocks()
  const graphMock = mockDeep<Graph>()
  graphMock.groups.listGroups.mockResolvedValue(
    mockAxiosResolve(mockDeep<CollectionOfGroup>({ value: groups }))
  )
  graphMock.groups.createGroup.mockImplementation(() =>
    resolveCreateGroup ? mockAxiosResolve() : mockAxiosReject()
  )
  graphMock.groups.editGroup.mockImplementation(() =>
    resolveEditGroup ? mockAxiosResolve() : mockAxiosReject()
  )
  graphMock.groups.deleteGroup.mockImplementation(() =>
    resolveDeleteGroup ? mockAxiosResolve() : mockAxiosReject()
  )
  mocks.$clientService.graphAuthenticated.mockImplementation(() => graphMock)
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(Groups, {
      data: () => ({
        selectedGroups: [{ id: 1 }],
        sideBarActivePanel: 'DetailsPanel',
        ...data
      }),
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
