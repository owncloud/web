import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import Users from '../../../src/views/Users'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Users view', () => {
  describe('method "createUser"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jan' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveCreateUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jana' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "deleteUsers"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveDeleteUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('computed method "availableSideBarPanels"', () => {
    it('should contain EditPanel with property enabled set true when one user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain EditPanel with property enabled set false when no user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
    it('should contain EditPanel with property enabled set false when multiple users are selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }, { id: '2' }] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
  })

  describe('computed method "allUsersSelected"', () => {
    it('should be true if every user is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { users: [{ id: '1' }] },
        data: { selectedUsers: [{ id: '1' }] }
      })
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should false if not every user is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { users: [{ id: '1' }, { id: '2' }] },
        data: { selectedUsers: [{ id: '1' }] }
      })
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
    })
  })

  describe('computed method "userRoles"', () => {
    it('should contain user role if record exists in userAssignments', () => {
      const user = { id: '1' }
      const wrapper = getMountedWrapper({
        mocks: {
          users: [user],
          userAssignments: {
            1: [
              {
                accountUuid: '1',
                roleId: '1'
              }
            ]
          },
          roles: [
            {
              displayName: 'admin',
              id: '1'
            }
          ]
        }
      })
      expect(wrapper.vm.userRoles[user.id]).toEqual({
        displayName: 'admin',
        id: '1'
      })
    })
    it('should not contain user role if userAssignments is empty', () => {
      const user = { id: '1' }
      const wrapper = getMountedWrapper({
        mocks: { users: [user], userAssignments: [] }
      })
      expect(user.id in wrapper.vm.userRoles).toBeFalsy()
    })
    it('should not contain user role if record does not exist in userAssignments', () => {
      const user = { id: '1' }
      const wrapper = getMountedWrapper({
        mocks: {
          users: [user],
          userAssignments: {
            2: [
              {
                accountUuid: '2',
                roleId: '1'
              }
            ]
          },
          roles: [
            {
              displayName: 'admin',
              id: '1'
            }
          ]
        }
      })
      expect(user.id in wrapper.vm.userRoles).toBeFalsy()
    })
    it('should not contain user role if assigned role does not exist', () => {
      const user = { id: '1' }
      const wrapper = getMountedWrapper({
        mocks: {
          users: [user],
          userAssignments: {
            1: [
              {
                accountUuid: '1',
                roleId: '1'
              }
            ]
          },
          roles: [
            {
              displayName: 'admin',
              id: '2'
            }
          ]
        }
      })
      expect(user.id in wrapper.vm.userRoles).toBeFalsy()
    })
    it('should not contain user role if userAssignment does not contain roleId', () => {
      const user = { id: '1' }
      const wrapper = getMountedWrapper({
        mocks: {
          users: [user],
          userAssignments: {
            1: [
              {
                accountUuid: '1'
              }
            ]
          },
          roles: [
            {
              displayName: 'admin',
              id: '2'
            }
          ]
        }
      })
      expect(user.id in wrapper.vm.userRoles).toBeFalsy()
    })
  })

  describe('method toggleSideBar', () => {
    it('should set sideBarOpen to true if current value is false', () => {
      const wrapper = getMountedWrapper({})
      wrapper.vm.sideBarOpen = false
      wrapper.vm.toggleSideBar()
      expect(wrapper.vm.sideBarOpen).toBeTruthy()
    })
    it('should set sideBarOpen to false if current value is true', () => {
      const wrapper = getMountedWrapper({})
      wrapper.vm.sideBarOpen = true
      wrapper.vm.toggleSideBar()
      expect(wrapper.vm.sideBarOpen).toBeFalsy()
    })
  })
})

function getMountedWrapper({
  data = {},
  mocks = {},
  resolveCreateUser = true,
  resolveDeleteUser = true
} = {}) {
  return shallowMount(Users, {
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
        users: {
          createUser: () => (resolveCreateUser ? Promise.resolve() : Promise.reject(new Error(''))),
          deleteUser: () => (resolveDeleteUser ? Promise.resolve() : Promise.reject(new Error('')))
        }
      },
      users: [
        {
          id: '1'
        }
      ],
      roles: [],
      userAssignments: [],
      ...mocks
    },
    data: () => {
      return {
        selectedUsers: [
          {
            id: 1
          }
        ],
        ...data
      }
    },
    stubs: {
      'create-user-modal': true,
      'delete-user-modal': true,
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
