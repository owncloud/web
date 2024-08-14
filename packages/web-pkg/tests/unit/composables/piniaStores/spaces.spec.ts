import { getComposableWrapper } from 'web-test-helpers'
import {
  useSpacesStore,
  sortSpaceMembers,
  useUserStore,
  useSharesStore
} from '../../../../src/composables/piniaStores'
import { createPinia, setActivePinia } from 'pinia'
import { mock, mockDeep } from 'vitest-mock-extended'
import {
  CollaboratorShare,
  GraphSharePermission,
  ShareRole,
  SpaceResource
} from '@ownclouders/web-client'
import { Graph } from '@ownclouders/web-client/graph'
import { User } from '@ownclouders/web-client/graph/generated'
import { ClientService } from '../../../../src/services'

describe('spaces', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('method "sortSpaceMembers"', () => {
    it('sorts space members by amount of permissions', () => {
      const members = [
        mock<CollaboratorShare>({
          permissions: [],
          sharedWith: { displayName: 'user1' }
        }),
        mock<CollaboratorShare>({
          permissions: [GraphSharePermission.updatePermissions],
          sharedWith: { displayName: 'user2' }
        })
      ]

      const sortedMembers = sortSpaceMembers(members)
      expect(
        sortedMembers[0].permissions.includes(GraphSharePermission.updatePermissions)
      ).toBeTruthy()
    })
  })

  describe('computed "personalSpace"', () => {
    it('returns the personal space of a user', () => {
      getWrapper({
        setup: (instance) => {
          instance.spaces = [
            mock<SpaceResource>({ id: '1', isOwner: () => false, driveType: 'project' }),
            mock<SpaceResource>({ id: '2', isOwner: () => true, driveType: 'personal' })
          ]

          expect(instance.personalSpace.id).toEqual('2')
        }
      })
    })
  })

  describe('method "setSpacesInitialized"', () => {
    it('correctly sets spacesInitialized', () => {
      getWrapper({
        setup: (instance) => {
          instance.setSpacesInitialized(true)
          expect(instance.spacesInitialized).toEqual(true)

          instance.setSpacesInitialized(false)
          expect(instance.spacesInitialized).toEqual(false)
        }
      })
    })
  })
  describe('method "setMountPointsInitialized"', () => {
    it('correctly sets mountPointsInitialized', () => {
      getWrapper({
        setup: (instance) => {
          instance.setMountPointsInitialized(true)
          expect(instance.mountPointsInitialized).toEqual(true)

          instance.setMountPointsInitialized(false)
          expect(instance.mountPointsInitialized).toEqual(false)
        }
      })
    })
  })
  describe('method "setSpacesLoading"', () => {
    it('correctly sets spacesLoading', () => {
      getWrapper({
        setup: (instance) => {
          instance.setSpacesLoading(true)
          expect(instance.spacesLoading).toEqual(true)

          instance.setSpacesLoading(false)
          expect(instance.spacesLoading).toEqual(false)
        }
      })
    })
  })
  describe('method "setCurrentSpace"', () => {
    it('correctly sets the current space', () => {
      getWrapper({
        setup: (instance) => {
          expect(instance.currentSpace).not.toBeDefined()

          const space = mock<SpaceResource>()
          instance.setCurrentSpace(space)
          expect(instance.currentSpace).toEqual(space)
        }
      })
    })
  })
  describe('method "addSpaces"', () => {
    it('correctly adds given spaces', () => {
      getWrapper({
        setup: (instance) => {
          expect(instance.spaces.length).toBe(0)

          const spaces = [mock<SpaceResource>({ id: '1' }), mock<SpaceResource>({ id: '2' })]
          instance.addSpaces(spaces)
          expect(instance.spaces).toEqual(spaces)
        }
      })
    })
  })
  describe('method "removeSpace"', () => {
    it('correctly removes a given space', () => {
      getWrapper({
        setup: (instance) => {
          const spaces = [mock<SpaceResource>({ id: '1' })]
          instance.addSpaces(spaces)
          expect(instance.spaces).toEqual(spaces)

          instance.removeSpace(spaces[0])
          expect(instance.spaces.length).toBe(0)
        }
      })
    })
  })
  describe('method "upsertSpace"', () => {
    it('updates a given space if it exsits', () => {
      getWrapper({
        setup: (instance) => {
          const space = mock<SpaceResource>({ id: '1', name: 'foo' })
          instance.addSpaces([space])
          expect(instance.spaces.length).toBe(1)
          expect(instance.spaces[0].name).toEqual('foo')

          instance.upsertSpace({ ...space, name: 'bar' })
          expect(instance.spaces.length).toBe(1)
          expect(instance.spaces[0].name).toEqual('bar')
        }
      })
    })
    it('adds a given space if it does not exsit', () => {
      getWrapper({
        setup: (instance) => {
          const space = mock<SpaceResource>({ id: '1', name: 'foo' })
          instance.addSpaces([space])
          expect(instance.spaces.length).toBe(1)
          expect(instance.spaces[0].name).toEqual('foo')

          instance.upsertSpace(mock<SpaceResource>({ id: '2', name: 'bar' }))
          expect(instance.spaces.length).toBe(2)
        }
      })
    })
  })
  describe('method "updateSpaceField"', () => {
    it('correctly updates a field of a space', () => {
      getWrapper({
        setup: (instance) => {
          const space = mock<SpaceResource>({ id: '1', name: 'foo' })
          instance.addSpaces([space])
          expect(instance.spaces.length).toBe(1)
          expect(instance.spaces[0].name).toEqual('foo')

          instance.updateSpaceField({ id: space.id, field: 'name', value: 'bar' })
          expect(instance.spaces[0].name).toEqual('bar')
        }
      })
    })
  })
  describe('method "loadSpaces"', () => {
    it('correctly loads personal and project spaces', () => {
      getWrapper({
        setup: async (instance) => {
          const spaces = [mock<SpaceResource>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(spaces)
          await instance.loadSpaces({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(2)
          expect(graphClient.drives.listMyDrives).toHaveBeenNthCalledWith(1, {
            orderBy: 'name asc',
            filter: 'driveType eq personal'
          })
          expect(graphClient.drives.listMyDrives).toHaveBeenNthCalledWith(2, {
            orderBy: 'name asc',
            filter: 'driveType eq project'
          })
          expect(instance.spaces.length).toBe(2)
          expect(instance.spacesLoading).toBeFalsy()
          expect(instance.spacesInitialized).toBeTruthy()
        }
      })
    })
  })
  describe('method "loadMountPoints"', () => {
    it('correctly loads mount points', () => {
      getWrapper({
        setup: async (instance) => {
          const spaces = [mock<SpaceResource>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(spaces)
          await instance.loadMountPoints({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.listMyDrives).toHaveBeenCalledWith({
            orderBy: 'name asc',
            filter: 'driveType eq mountpoint'
          })
          expect(instance.spaces.length).toBe(1)
          expect(instance.mountPointsInitialized).toBeTruthy()
        }
      })
    })
  })
  describe('method "reloadProjectSpaces"', () => {
    it('correctly reloads project spaces', () => {
      getWrapper({
        setup: async (instance) => {
          const spaces = [mock<SpaceResource>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(spaces)
          await instance.reloadProjectSpaces({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.listMyDrives).toHaveBeenCalledWith({
            orderBy: 'name asc',
            filter: 'driveType eq project'
          })
          expect(instance.spaces.length).toBe(1)
        }
      })
    })
  })
  describe('method "upsertSpaceMember"', () => {
    it('correctly adds space members', () => {
      getWrapper({
        setup: (instance) => {
          const member = mock<CollaboratorShare>({ id: '1' })

          instance.upsertSpaceMember({ member })

          expect(instance.spaceMembers.length).toBe(1)
          expect(instance.spaceMembers[0].id).toBe(member.id)
        }
      })
    })
    it('correctly updates space members', () => {
      getWrapper({
        setup: (instance) => {
          const member = mock<CollaboratorShare>({ id: '1', indirect: false })
          instance.upsertSpaceMember({ member })

          expect(instance.spaceMembers.length).toBe(1)
          expect(instance.spaceMembers[0].indirect).toBe(member.indirect)

          instance.upsertSpaceMember({ member: { ...member, indirect: true } })

          expect(instance.spaceMembers.length).toBe(1)
          expect(instance.spaceMembers[0].indirect).toBe(true)
        }
      })
    })
  })
  describe('method "loadSpaceMembers"', () => {
    it('loads space members and sets them', () => {
      getWrapper({
        setup: async (instance) => {
          const share = mock<CollaboratorShare>({
            id: '1',
            permissions: [],
            role: mock<ShareRole>({ id: 'roleId' })
          })
          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
            shares: [share],
            allowedActions: [],
            allowedRoles: []
          })

          const userStore = useUserStore()
          userStore.user = mock<User>()

          const sharesStore = useSharesStore()
          sharesStore.graphRoles = { roleId: mock<ShareRole>({ id: 'roleId' }) }

          await instance.loadSpaceMembers({
            graphClient: clientService.graphAuthenticated,
            space: mock<SpaceResource>()
          })

          expect(clientService.graphAuthenticated.permissions.listPermissions).toHaveBeenCalled()
          expect(instance.spaceMembers.length).toBe(1)
          expect(instance.spaceMembers[0].id).toBe(share.id)
        }
      })
    })
  })
})

function getWrapper({ setup }: { setup: (instance: ReturnType<typeof useSpacesStore>) => void }) {
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpacesStore()
        setup(instance)
      },
      { pluginOptions: { pinia: false } }
    )
  }
}
