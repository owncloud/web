import Groups from '../../../src/views/Groups.vue'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'
import { Graph } from 'web-client'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src'
import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'

const defaultGraphMock = () => {
  const graph = mockDeep<Graph>()
  graph.groups.listGroups.mockImplementation(() => mockAxiosResolve({ value: [{ id: '1' }] }))
  return graph
}

describe('Groups view', () => {
  describe('method "createGroup"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getWrapper()
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
      const wrapper = getWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateGroupModalStub = jest.spyOn(wrapper.vm, 'toggleCreateGroupModal')
      await wrapper.vm.createGroup({ displayName: 'admins' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateGroupModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editGroup"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editGroup({ id: '1', displayName: 'Super group' })

      expect(showMessageStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.groups.editGroup.mockImplementation(() => mockAxiosReject())
      const wrapper = getWrapper({ graph })
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
    it.skip('should contain EditPanel when one group is selected', () => {
      const wrapper = getWrapper()
      wrapper.vm.selectedGroups = [{ id: '1' }]
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain DetailsPanel when no group is selected', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'DetailsPanel').enabled
      ).toBeTruthy()
    })
    it('should not contain EditPanel multiple groups are selected', () => {
      const wrapper = getWrapper()
      wrapper.vm.selectedGroups = [{ id: '1' }, { id: '2' }]
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel')
      ).toBeFalsy()
    })
  })

  describe('computed method "allGroupsSelected"', () => {
    it('should be true if every group is selected', async () => {
      const wrapper = getWrapper()
      wrapper.vm.selectedGroups = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeTruthy()
    })
    it('should be false if not every group is selected', async () => {
      const graph = defaultGraphMock()
      graph.groups.listGroups.mockImplementation(() =>
        mockAxiosResolve({ value: [{ id: '1' }, { id: '2' }] })
      )
      const wrapper = getWrapper({ graph })
      wrapper.vm.selectedGroups = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allGroupsSelected).toBeFalsy()
    })
  })
})

function getWrapper({ graph = defaultGraphMock(), mocks = {} } = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.mockImplementation(() => graph)
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)

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
        sideBarActivePanel: 'DetailsPanel'
      }
    }
  })
}
