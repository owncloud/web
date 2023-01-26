import Users from '../../../src/views/Users.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mock, mockDeep } from 'jest-mock-extended'
import { Graph } from 'web-client/src'
import { mockAxiosResolve, mockAxiosReject } from 'web-test-helpers/src/mocks'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { AxiosResponse } from 'axios'

const getDefaultUser = () => {
  return {
    id: '1',
    displayName: 'Admin',
    givenName: 'Admin',
    surname: 'Admin',
    memberOf: [],
    mail: 'admin@example.org',
    drive: {
      id: '1',
      name: 'admin',
      quota: { remaining: 5000000000, state: 'normal', total: 5000000000, used: 0 }
    },
    appRoleAssignments: [
      {
        appRoleId: '1',
        id: '1',
        principalId: '1',
        principalType: 'User',
        resourceDisplayName: 'ownCloud Infinite Scale',
        resourceId: 'some-graph-app-id'
      }
    ]
  }
}

const getDefaultApplications = () => {
  return [
    {
      appRoles: [
        {
          displayName: 'Admin',
          id: '1'
        },
        {
          displayName: 'Guest',
          id: '2'
        },
        {
          displayName: 'Space Admin',
          id: '3'
        },
        {
          displayName: 'User',
          id: '4'
        }
      ],
      displayName: 'ownCloud Infinite Scale',
      id: 'some-graph-app-id'
    }
  ]
}

const getDefaultGraphMock = () => {
  const graph = mockDeep<Graph>()
  graph.users.listUsers.mockResolvedValue(
    mock<AxiosResponse>({ data: { value: [getDefaultUser()] } })
  )
  graph.users.getUser.mockResolvedValue(mock<AxiosResponse>({ data: getDefaultUser() }))
  graph.groups.listGroups.mockResolvedValue(mock<AxiosResponse>({ data: { value: [] } }))
  graph.applications.listApplications.mockResolvedValue(
    mock<AxiosResponse>({ data: { value: getDefaultApplications() } })
  )

  return graph
}

describe('Users view', () => {
  describe('method "createUser"', () => {
    it('should hide the modal and show message on success', async () => {
      const graph = getDefaultGraphMock()
      graph.users.createUser.mockImplementation(() =>
        mockAxiosResolve({
          displayName: 'benedikt coolman',
          givenName: '',
          id: '2',
          mail: 'benedikt@example.org',
          onPremisesSamAccountName: 'bene',
          surname: 'bene'
        })
      )
      graph.users.getUser.mockImplementation(() =>
        mockAxiosResolve({
          appRoleAssignments: [
            {
              appRoleId: '1',
              id: '1',
              principalId: '2',
              principalType: 'User',
              resourceDisplayName: 'ownCloud Infinite Scale',
              resourceId: 'some-graph-app-id'
            }
          ],
          displayName: 'benedikt coolman',
          givenName: '',
          id: 'e3515ffb-d264-4dfc-8506-6c239f6673b5',
          mail: 'benedikt@example.org',
          memberOf: [],
          onPremisesSamAccountName: 'bene',
          surname: 'bene'
        })
      )
      const { wrapper } = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jan' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = getDefaultGraphMock()
      graph.users.createUser.mockImplementation(() => mockAxiosReject())
      const { wrapper } = getMountedWrapper({ graph })
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
        appRoleAssignments: [
          {
            appRoleId: '2',
            resourceId: 'some-graph-app-id',
            principalId: '1'
          }
        ],
        displayName: 'administrator',
        id: '1',
        mail: 'administrator@example.org',
        memberOf: [
          {
            displayName: 'admins',
            id: '1'
          }
        ],
        drive: {
          id: '1',
          name: 'admin',
          quota: {
            total: 1000000000
          }
        },
        passwordProfile: {
          password: 'administrator'
        }
      }

      const graph = getDefaultGraphMock()
      graph.users.editUser.mockImplementation(() => mockAxiosResolve())
      graph.users.createUserAppRoleAssignment.mockImplementation(() => mockAxiosResolve())
      graph.groups.addMember.mockImplementation(() => mockAxiosResolve())
      graph.drives.updateDrive.mockImplementation(() =>
        mockAxiosResolve({
          id: '1',
          name: 'admin',
          quota: { remaining: 1000000000, state: 'normal', total: 1000000000, used: 0 }
        })
      )
      graph.users.getUser.mockImplementation(() =>
        mockAxiosResolve({
          appRoleAssignments: [
            {
              appRoleId: '2',
              id: '1',
              principalId: '1',
              principalType: 'User',
              resourceDisplayName: 'ownCloud Infinite Scale',
              resourceId: 'some-graph-app-id'
            }
          ],
          displayName: 'administrator',
          drive: {
            id: '1',
            name: 'admin',
            quota: { remaining: 1000000000, state: 'normal', total: 1000000000, used: 0 }
          },
          id: '1',
          mail: 'administrator@example.org',
          memberOf: [
            {
              displayName: 'admins',
              id: '1'
            }
          ],
          onPremisesSamAccountName: 'admin',
          surname: 'Admin'
        })
      )

      const { wrapper } = getMountedWrapper({
        graph,
        data: {
          selectedUsers: [
            {
              ...getDefaultUser(),
              quota: {
                remaining: 1000000000,
                state: 'normal',
                total: 1000000000,
                used: 0
              }
            }
          ]
        }
      })
      const busStub = jest.spyOn(eventBus, 'publish')
      const updateSpaceFieldStub = jest.spyOn(wrapper.vm, 'UPDATE_SPACE_FIELD')
      const updateUserDriveStub = jest.spyOn(wrapper.vm, 'updateUserDrive')
      const updateUserGroupAssignmentsStub = jest.spyOn(wrapper.vm, 'updateUserGroupAssignments')
      const updateUserAppRoleAssignmentsStub = jest.spyOn(
        wrapper.vm,
        'updateUserAppRoleAssignments'
      )

      await wrapper.vm.loadResourcesTask.last

      const userToUpDate = wrapper.vm.users.find((user) => user.id === '1')
      const updatedUser = await wrapper.vm.editUser({ user: userToUpDate, editUser })

      expect(updatedUser.id).toEqual('1')
      expect(updatedUser.displayName).toEqual('administrator')
      expect(updatedUser.mail).toEqual('administrator@example.org')
      expect(updatedUser.appRoleAssignments[0].appRoleId).toEqual('2')
      expect(updatedUser.drive.quota.total).toEqual(1000000000)
      expect(updatedUser.memberOf[0].id).toEqual('1')

      expect(busStub).toHaveBeenCalledTimes(2)
      expect(updateUserDriveStub).toHaveBeenCalled()
      expect(updateSpaceFieldStub).toHaveBeenCalled()
      expect(updateUserGroupAssignmentsStub).toHaveBeenCalled()
      expect(updateUserAppRoleAssignmentsStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = getDefaultGraphMock()
      graph.users.editUser.mockImplementation(() => mockAxiosReject())
      const { wrapper } = getMountedWrapper({ graph })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')

      await wrapper.vm.loadResourcesTask.last
      await wrapper.vm.editUser({
        editUser: {}
      })

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('method "deleteUsers"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(1)
    })
    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graph = getDefaultGraphMock()
      graph.users.deleteUser.mockImplementation(() => mockAxiosReject())
      const { wrapper } = getMountedWrapper({ graph })
      const graphDeleteUserStub = jest.spyOn(graph.users, 'deleteUser')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '2' }])

      expect(graphDeleteUserStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(0)
    })
    it('should show message while user tries to delete own account', async () => {
      const { wrapper } = getMountedWrapper()
      const graph = getDefaultGraphMock()
      const graphDeleteUserStub = jest.spyOn(graph.users, 'deleteUser')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(graphDeleteUserStub).toHaveBeenCalledTimes(0)
      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalled()
    })
  })

  describe('computed method "sideBarAvailablePanels"', () => {
    it('should contain EditPanel when one user is selected', () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.selectedUsers = [{ id: '1' }]
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain DetailsPanel no user is selected', () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.selectedUsers = []
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'DetailsPanel').enabled
      ).toBeTruthy()
    })
    it('should not contain EditPanel when multiple users are selected', () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.selectedUsers = [{ id: '1' }, { id: '2' }]
      expect(
        wrapper.vm.sideBarAvailablePanels.find((panel) => panel.app === 'EditPanel')
      ).toBeFalsy()
    })
  })

  describe('computed method "allUsersSelected"', () => {
    it('should be true if every user is selected', async () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.selectedUsers = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should be false if not every user is selected', async () => {
      const graph = getDefaultGraphMock()
      graph.users.listUsers.mockImplementation(() =>
        mockAxiosResolve({ value: [{ id: '1' }, { id: '2' }] })
      )
      const { wrapper } = getMountedWrapper({ graph })
      wrapper.vm.selectedUsers = [{ id: '1' }]
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
    })
  })
})

function getMountedWrapper({ data = {}, graph = getDefaultGraphMock() } = {}) {
  const mocks = {
    ...defaultComponentMocks()
  }
  mocks.$clientService.graphAuthenticated.mockImplementation(() => graph)

  const storeOptions = {
    ...defaultStoreMockOptions,
    state: {
      user: { id: '1', uuid: '1' }
    }
  }

  const store = createStore(storeOptions)

  return {
    mocks,
    wrapper: shallowMount(Users, {
      data: () => {
        return { ...data }
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
