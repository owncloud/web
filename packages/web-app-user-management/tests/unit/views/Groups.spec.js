import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'
import Groups from '../../../src/views/Groups'

const localVue = createLocalVue()
localVue.use(Vuex)

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
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveCreateGroup: false })
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
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveDeleteGroup: false })
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
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveEditGroup: false })
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
    it('should be true if every group is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { groups: [{ id: '1' }] },
        data: { selectedGroups: [{ id: '1' }] }
      })
      expect(wrapper.vm.allGroupsSelected).toBeTruthy()
    })
    it('should false if not every group is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { groups: [{ id: '1' }, { id: '2' }] },
        data: { selectedGroups: [{ id: '1' }] }
      })
      expect(wrapper.vm.allGroupsSelected).toBeFalsy()
    })
  })
})

function getMountedWrapper({
  data = {},
  mocks = {},
  resolveCreateGroup = true,
  resolveEditGroup = true,
  resolveDeleteGroup = true
} = {}) {
  return shallowMount(Groups, {
    localVue,
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
      }
    }),
    mocks: {
      $gettext: jest.fn(),
      $ngettext: jest.fn(),
      $gettextInterpolate: jest.fn(),
      loadResourcesTask: {
        isRunning: false,
        perform: jest.fn()
      },
      graphClient: {
        groups: {
          createGroup: () =>
            resolveCreateGroup ? Promise.resolve() : Promise.reject(new Error('')),
          deleteGroup: () =>
            resolveDeleteGroup ? Promise.resolve() : Promise.reject(new Error('')),
          editGroup: () => (resolveEditGroup ? Promise.resolve() : Promise.reject(new Error('')))
        }
      },
      groups: [
        {
          id: '1'
        }
      ],
      ...mocks
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
  })
}
