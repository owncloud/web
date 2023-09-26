import UsersList from '../../../../src/components/Users/UsersList.vue'
import { defaultComponentMocks, defaultPlugins, mount, shallowMount } from 'web-test-helpers'
import { displayPositionedDropdown, eventBus, queryItemAsString } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

const getUserMocks = () => [{ id: '1', displayName: 'jan' }]
jest.mock('web-pkg/src/helpers', () => ({
  ...jest.requireActual('web-pkg/src/helpers'),
  displayPositionedDropdown: jest.fn()
}))
jest.mock('web-pkg/src/composables/appDefaults')

describe('UsersList', () => {
  describe('computed method "allUsersSelected"', () => {
    it('should be true if all users are selected', () => {
      const { wrapper } = getWrapper({
        props: {
          users: getUserMocks(),
          selectedUsers: getUserMocks()
        }
      })
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should be false if not every user is selected', () => {
      const { wrapper } = getWrapper({
        props: {
          users: getUserMocks(),
          selectedUsers: []
        }
      })
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
    })
  })

  describe('method "orderBy"', () => {
    it('should return an ascending ordered list while desc is set to false', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'user' }, { displayName: 'admin' }],
          'displayName',
          false
        )
      ).toEqual([{ displayName: 'admin' }, { displayName: 'user' }])
    })
    it('should return an descending ordered list based on role while desc is set to true', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.orderBy([{ displayName: 'admin' }, { displayName: 'user' }], 'displayName', true)
      ).toEqual([{ displayName: 'user' }, { displayName: 'admin' }])
    })

    it('should return ascending ordered list based on role while desc is set to false', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.orderBy(
          [
            { appRoleAssignments: [{ appRoleId: '1' }] },
            { appRoleAssignments: [{ appRoleId: '2' }] }
          ],
          'role',
          false
        )
      ).toEqual([
        { appRoleAssignments: [{ appRoleId: '1' }] },
        { appRoleAssignments: [{ appRoleId: '2' }] }
      ])
    })
    it('should return an role based descending ordered list while desc is set to true', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.orderBy(
          [
            { appRoleAssignments: [{ appRoleId: '1' }] },
            { appRoleAssignments: [{ appRoleId: '2' }] }
          ],
          'role',
          true
        )
      ).toEqual([
        { appRoleAssignments: [{ appRoleId: '2' }] },
        { appRoleAssignments: [{ appRoleId: '1' }] }
      ])
    })
  })

  describe('method "filter"', () => {
    it('should return a list containing record admin if search term is "ad"', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.vm.filter([{ displayName: 'user' }, { displayName: 'admin' }], 'ad')).toEqual([
        { displayName: 'admin' }
      ])
    })
    it('should return an an empty list if search term does not match any entry', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'admin' }, { displayName: 'user' }], 'jana')
      ).toEqual([])
    })
  })

  it('emits events on row click', () => {
    const users = getUserMocks()
    const { wrapper } = getWrapper({ props: { users } })
    wrapper.vm.rowClicked([users[0]])
    expect(wrapper.emitted('toggleSelectUser')).toBeTruthy()
  })
  it('should show the context menu on right click', async () => {
    const users = getUserMocks()
    const spyDisplayPositionedDropdown = jest.mocked(displayPositionedDropdown)
    const { wrapper } = getWrapper({ mountType: mount, props: { users } })
    await wrapper.find(`[data-item-id="${users[0].id}"]`).trigger('contextmenu')
    expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
  })
  it('should show the context menu on context menu button click', async () => {
    const users = getUserMocks()
    const spyDisplayPositionedDropdown = jest.mocked(displayPositionedDropdown)
    const { wrapper } = getWrapper({ mountType: mount, props: { users } })
    await wrapper.find('.users-table-btn-action-dropdown').trigger('click')
    expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
  })
  it('should show the user details on details button click', async () => {
    const users = getUserMocks()
    const eventBusSpy = jest.spyOn(eventBus, 'publish')
    const { wrapper } = getWrapper({ mountType: mount, props: { users } })
    await wrapper.find('.users-table-btn-details').trigger('click')
    expect(eventBusSpy).toHaveBeenCalledWith(SideBarEventTopics.open)
  })
  it('should show the user edit panel on edit button click', async () => {
    const users = getUserMocks()
    const eventBusSpy = jest.spyOn(eventBus, 'publish')
    const { wrapper } = getWrapper({ mountType: mount, props: { users } })
    await wrapper.find('.users-table-btn-edit').trigger('click')
    expect(eventBusSpy).toHaveBeenCalledWith(SideBarEventTopics.openWithPanel, 'EditPanel')
  })
})

function getWrapper({ mountType = shallowMount, props = {} } = {}) {
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '1')
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '100')
  const mocks = defaultComponentMocks()
  return {
    wrapper: mountType(UsersList, {
      props: {
        users: [],
        selectedUsers: [],
        roles: [
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
        headerPosition: 0,
        ...props
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks,
        stubs: {
          OcCheckbox: true
        }
      }
    })
  }
}
