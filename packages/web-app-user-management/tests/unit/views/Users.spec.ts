import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import Users from '../../../src/views/Users.vue'
import Vuex from 'vuex'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src'
import { Graph } from 'web-client/src'
import { useLoadTasks } from '../../../src/composables/loadTasks/useLoadTasks'
import { Task } from 'vue-concurrency'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'

const localVue = createLocalVue()
localVue.use(Vuex)

const defaultGraphMock = () => {
  const defaultUser = {
    id: '1',
    memberOf: [],
    drive: {}
  }

  const graph = mockDeep<Graph>()
  graph.users.listUsers.mockImplementation(() => mockAxiosResolve({ value: [defaultUser] }))
  graph.users.getUser.mockImplementation(() => mockAxiosResolve(defaultUser))

  graph.groups.listGroups.mockImplementation(() => mockAxiosResolve({ value: [] }))

  return graph
}

jest.mock('../../../src/composables/loadTasks/useLoadTasks')
jest.mocked(useLoadTasks).mockImplementation(({ roles, userAssignments }) => {
  roles.value = []
  userAssignments.value = []

  return {
    loadRolesTask: mockDeep<Task<void, []>>(),
    loadUserRoleTask: mockDeep<Task<void, []>>(),
    addRoleAssignment: jest.fn()
  }
})

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
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.users.createUser.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jana' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editUser"', () => {
    it('should emit event on success', async () => {
      const editUser = {
        id: '1',
        displayName: 'jan',
        role: { id: '1', displayName: 'admin' },
        drive: { id: '1', quota: { total: 10000 } },
        passwordProfile: { password: 'newpassword' }
      }

      const graph = defaultGraphMock()
      graph.users.editUser.mockImplementation(() =>
        mockAxiosResolve({
          accountUuid: '1',
          id: '1',
          roleId: '1'
        })
      )
      graph.drives.updateDrive.mockImplementation(() => mockAxiosResolve({}))
      const wrapper = getMountedWrapper({ graph })
      const busStub = jest.spyOn(eventBus, 'publish')
      const setStub = jest.spyOn(wrapper.vm, '$set').mockImplementation(() => undefined)
      const updateSpaceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_SPACE_FIELD')

      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.editUser(editUser)

      expect(wrapper.vm.selectedUsers[0]).toEqual(editUser)
      expect(busStub).toHaveBeenCalledWith('sidebar.entity.saved')
      expect(setStub).toHaveBeenCalled()
      expect(updateSpaceFieldStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.users.editUser.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')

      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.editUser({
        editUser: {}
      })

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('method "editUserGroupAssignments"', () => {
    const editUser = {
      id: '1',
      memberOf: [
        {
          displayName: 'group',
          id: '04114ac6-f050-41d2-98db-6f016abccf2c'
        }
      ]
    }
    it('should emit event on success2', async () => {
      const wrapper = getMountedWrapper()
      const busStub = jest.spyOn(eventBus, 'publish')
      const setStub = jest.spyOn(wrapper.vm, '$set')
      setStub.mockImplementation(() => undefined)
      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.editUserGroupAssignments(editUser)

      expect(wrapper.vm.selectedUsers[0]).toEqual(editUser)
      expect(busStub).toHaveBeenCalledWith('sidebar.entity.saved')
      expect(setStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const graph = defaultGraphMock()
      graph.groups.addMember.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest
        .spyOn(wrapper.vm, 'showMessage')
        .mockImplementation(() => undefined)

      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.editUserGroupAssignments(editUser)

      expect(showMessageStub).toHaveBeenCalled()
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
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = defaultGraphMock()
      graph.users.deleteUser.mockImplementation(() => mockAxiosReject())
      const wrapper = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('computed method "sideBarAvailablePanels"', () => {
    it('should contain EditPanel with property enabled set true when one user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain EditPanel with property enabled set false when no user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
    it('should contain EditPanel with property enabled set false when multiple users are selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }, { id: '2' }] } })
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
  })

  describe('computed method "allUsersSelected"', () => {
    it('should be true if every user is selected', async () => {
      const wrapper = getMountedWrapper({
        data: { selectedUsers: [{ id: '1' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should be false if not every user is selected', async () => {
      const graph = defaultGraphMock()
      graph.users.listUsers.mockImplementation(() =>
        mockAxiosResolve({ value: [{ id: '1' }, { id: '2' }] })
      )
      const wrapper = getMountedWrapper({
        graph,
        data: { selectedUsers: [{ id: '1' }] }
      })
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
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

function getMountedWrapper({ data = {}, mocks = {}, graph = defaultGraphMock() } = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.mockImplementation(() => graph)

  return shallowMount(Users, {
    localVue,
    store: createStore(Vuex.Store, {
      state: {
        user: { id: '1', uuid: '1' }
      },
      actions: {
        showMessage: jest.fn()
      },
      getters: {
        configuration: () => ({
          server: 'https://example.com/'
        })
      },
      modules: {
        runtime: {
          namespaced: true,
          modules: {
            auth: {
              namespaced: true,
              getters: {
                accessToken: () => ''
              }
            },
            spaces: {
              namespaced: true,
              mutations: {
                UPDATE_SPACE_FIELD: jest.fn()
              }
            }
          }
        }
      }
    }),
    mocks: {
      $gettext: jest.fn(),
      $ngettext: jest.fn(),
      $gettextInterpolate: jest.fn(),
      $clientService,
      ...mocks
    },
    data: () => {
      return {
        selectedUsers: [
          {
            id: '1',
            memberOf: []
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
