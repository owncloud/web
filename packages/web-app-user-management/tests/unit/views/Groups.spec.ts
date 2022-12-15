import Groups from '../../../src/views/Groups.vue'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'
import { Graph } from 'web-client'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src'
import { createStore, defaultPlugins, shallowMount } from 'web-test-helpers'

const defaultGraphMock = () => {
  const graph = mockDeep<Graph>()
  graph.groups.listGroups.mockImplementation(() => mockAxiosResolve({ value: [{ id: '1' }] }))

  return graph
}

describe('Groups view', () => {
  describe('method "createGroup"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.groups.createGroup.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "deleteGroups"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteGroupModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteGroupModal')
      await wrapper.vm.deleteGroups([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteGroupModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.groups.deleteGroup.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteGroupModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteGroupModal')
      await wrapper.vm.deleteGroups([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editGroup"', () => {
    it('should show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editGroup({ id: '1', displayName: 'Super group' })

      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.groups.editGroup.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
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
      const wrapper = getMountedWrapper({ data: { selectedGroups: [{ id: '1' }] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain EditPanel with property enabled set false when no group is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedGroups: [] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
    it('should contain EditPanel with property enabled set false when multiple groups are selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedGroups: [{ id: '1' }, { id: '2' }] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
  })

  describe('computed method "allGroupsSelected"', () => {
    it('should be true if every group is selected', async () => {
      const wrapper = getMountedWrapper({
        data: { selectedGroups: [{ id: '1' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeTruthy()
    })
    it('should be false if not every group is selected', async () => {
      const graph = defaultGraphMock()
      graph.groups.listGroups.mockImplementation(() =>
        mockAxiosResolve({ value: [{ id: '1' }, { id: '2' }] })
      )
      const wrapper = getMountedWrapper({
        graph,
        data: { selectedGroups: [{ id: '1' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeFalsy()
    })
  })
})

function getMountedWrapper({
  graph = defaultGraphMock(),
  data = {},
  mocks = {},
  resolveCreateGroup = true,
  resolveEditGroup = true,
  resolveDeleteGroup = true
} = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.mockImplementation(() => graph)

  const store = createStore({
    actions: {
      showMessage: jest.fn()
    },
    getters: {
      configuration: () => ({
        server: 'https://example.com/'
      })
    }
  })

  return shallowMount(Groups, {
    global: {
      plugins: [...defaultPlugins(), store],
      mocks: {
        $gettext: jest.fn(),
        $ngettext: jest.fn(),
        $gettextInterpolate: jest.fn(),
        $clientService,
        ...mocks
      },
      stubs: {
        'create-group-modal': true,
        'delete-group-modal': true,
        'app-loading-spinner': true,
        'no-content-message': true,
        'oc-breadcrumb': true,
        'oc-button': true,
        'oc-icon': true,
        translate: true
      },
      directives: {
        'oc-tooltip': jest.fn()
      }
    },
    data: () => {
      return {
        selectedGroups: [
          {
            id: 1
          }
        ],
        sideBarActivePanel: 'DetailsPanel',
        ...data
      }
    }
  })
}
