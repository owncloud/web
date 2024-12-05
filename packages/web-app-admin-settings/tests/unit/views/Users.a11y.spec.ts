import Users from '../../../src/views/Users.vue'
import { OptionsConfig, UserAction, useAppDefaults } from '@ownclouders/web-pkg'
import { mock, mockDeep } from 'vitest-mock-extended'
import {
  defaultComponentMocks,
  defaultPlugins,
  mount,
  shallowMount,
  useAppDefaultsMock
} from '@ownclouders/web-test-helpers'
import { ClientService, queryItemAsString } from '@ownclouders/web-pkg'
import { Group, User } from '@ownclouders/web-client/graph/generated'
import { useUserActionsCreateUser } from '../../../src/composables/actions/users/useUserActionsCreateUser'
import { ref } from 'vue'
import axe from 'axe-core'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  queryItemAsString: vi.fn(),
  useAppDefaults: vi.fn()
}))
vi.mock('../../../src/composables/actions/users/useUserActionsCreateUser')
vi.mocked(useAppDefaults).mockImplementation(() => useAppDefaultsMock())

/**
 *
 *
 * Accessibility tests for the Users view
 *
 *
 */
describe('Accessibility: Users view', () => {
  it('should be accessible', async () => {
    const { wrapper } = getMountedWrapper({ mountType: mount, users: [getDefaultUser()] })
    await wrapper.vm.loadResourcesTask.last

    document.body.innerHTML = wrapper.html()

    const element = document.getElementsByClassName('user-filters')[0]
    const results = await axe.run(element)

    expect(results.violations).toEqual([])
  })
})

/**
 *
 *
 *
 *
 *
 */
function getMountedWrapper({
  mountType = shallowMount,
  clientService = getClientService(),
  displayNameFilterQuery = null,
  groupFilterQuery = null,
  roleFilterQuery = null,
  options = {},
  createUserActionEnabled = true,
  users = [],
  selectedUsers = []
}: {
  mountType?: typeof shallowMount | typeof mount
  clientService?: ReturnType<typeof mockDeep<ClientService>>
  displayNameFilterQuery?: string
  groupFilterQuery?: string
  roleFilterQuery?: string
  options?: OptionsConfig
  createUserActionEnabled?: boolean
  users?: User[]
  selectedUsers?: User[]
} = {}) {
  vi.mocked(queryItemAsString).mockImplementationOnce(() => displayNameFilterQuery)
  vi.mocked(queryItemAsString).mockImplementationOnce(() => groupFilterQuery)
  vi.mocked(queryItemAsString).mockImplementationOnce(() => roleFilterQuery)
  vi.mocked(queryItemAsString).mockImplementationOnce(() => displayNameFilterQuery)
  vi.mocked(useUserActionsCreateUser).mockReturnValue(
    mock<ReturnType<typeof useUserActionsCreateUser>>({
      actions: ref([mock<UserAction>({ isVisible: () => createUserActionEnabled })])
    })
  )

  const mocks = {
    ...defaultComponentMocks(),
    $clientService: clientService
  }

  const user = { id: '1' } as User

  return {
    mocks,
    wrapper: mountType(Users, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              userState: { user },
              configState: { options },
              userSettingsStore: { users, selectedUsers }
            }
          })
        ],
        mocks,
        provide: mocks,
        stubs: {
          AppLoadingSpinner: true,
          ViewOptions: true,
          OcBreadcrumb: true,
          NoContentMessage: true,
          ItemFilter: true,
          BatchActions: true,
          OcButton: false
        }
      }
    })
  }
}

const getDefaultUser = (): User => {
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
  } as User
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

const getClientService = () => {
  const clientService = mockDeep<ClientService>()
  clientService.graphAuthenticated.users.listUsers.mockResolvedValue([mock<User>(getDefaultUser())])
  clientService.graphAuthenticated.users.getUser.mockResolvedValue(mock<User>(getDefaultUser()))
  clientService.graphAuthenticated.users.editUser.mockResolvedValue(mock<User>(getDefaultUser()))
  clientService.graphAuthenticated.groups.listGroups.mockResolvedValue([mock<Group>()])
  clientService.graphAuthenticated.applications.listApplications.mockResolvedValue(
    getDefaultApplications()
  )
  return clientService
}
