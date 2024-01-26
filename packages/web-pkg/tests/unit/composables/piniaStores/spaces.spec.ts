import { getComposableWrapper, mockAxiosResolve } from 'web-test-helpers'
import { useSpacesStore, sortSpaceMembers } from '../../../../src/composables/piniaStores'
import { createPinia, setActivePinia } from 'pinia'
import { mock, mockDeep } from 'vitest-mock-extended'
import {
  Share,
  ShareTypes,
  SpaceResource,
  spaceRoleEditor,
  spaceRoleManager
} from '@ownclouders/web-client/src/helpers'
import { Graph } from '@ownclouders/web-client'
import { Drive } from '@ownclouders/web-client/src/generated'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'

describe('spaces', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('method "sortSpaceMembers"', () => {
    it('always puts space managers first', () => {
      const members = [
        mock<Share>({
          role: { name: spaceRoleEditor.name },
          collaborator: { displayName: 'user1' }
        }),
        mock<Share>({
          role: { name: spaceRoleManager.name },
          collaborator: { displayName: 'user2' }
        })
      ]

      const sortedMembers = sortSpaceMembers(members)
      expect(sortedMembers[0].role.name).toEqual(spaceRoleManager.name)
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
          const drives = [mock<Drive>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(mockAxiosResolve({ value: drives }))
          await instance.loadSpaces({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(2)
          expect(graphClient.drives.listMyDrives).toHaveBeenNthCalledWith(
            1,
            'name asc',
            'driveType eq personal'
          )
          expect(graphClient.drives.listMyDrives).toHaveBeenNthCalledWith(
            2,
            'name asc',
            'driveType eq project'
          )
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
          const drives = [mock<Drive>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(mockAxiosResolve({ value: drives }))
          await instance.loadMountPoints({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.listMyDrives).toHaveBeenCalledWith(
            'name asc',
            'driveType eq mountpoint'
          )
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
          const drives = [mock<Drive>({ id: '1' })]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.listMyDrives.mockResolvedValue(mockAxiosResolve({ value: drives }))
          await instance.reloadProjectSpaces({ graphClient })

          expect(graphClient.drives.listMyDrives).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.listMyDrives).toHaveBeenCalledWith(
            'name asc',
            'driveType eq project'
          )
          expect(instance.spaces.length).toBe(1)
        }
      })
    })
  })
  describe('method "addSpaceMember"', () => {
    it('correctly adds space members', () => {
      getWrapper({
        setup: async (instance) => {
          const drive = mock<Drive>({ id: '1', special: [] })
          const graphClient = mockDeep<Graph>()
          graphClient.drives.getDrive.mockResolvedValue(mockAxiosResolve(drive))

          const client = mockDeep<OwnCloudSdk>()

          await instance.addSpaceMember({
            client,
            graphClient,
            path: '/',
            shareWith: '',
            permissions: 1,
            expirationDate: '',
            role: spaceRoleEditor,
            storageId: '1',
            displayName: 'foo',
            shareType: ShareTypes.spaceUser
          })

          expect(client.shares.shareSpace).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.getDrive).toHaveBeenCalledTimes(1)
          expect(instance.spaceMembers.length).toBe(1)
        }
      })
    })
  })
  describe('method "changeSpaceMember"', () => {
    it('correctly updates a space member', () => {
      getWrapper({
        setup: async (instance) => {
          const drive = mock<Drive>({ id: '1', special: [] })
          const share = mock<Share>({
            id: '1',
            collaborator: { displayName: 'foo', role: spaceRoleManager }
          })

          instance.spaceMembers = [share]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.getDrive.mockResolvedValue(mockAxiosResolve(drive))

          const client = mockDeep<OwnCloudSdk>()

          await instance.changeSpaceMember({
            client,
            graphClient,
            share,
            permissions: 1,
            expirationDate: '',
            role: spaceRoleEditor
          })

          expect(client.shares.shareSpace).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.getDrive).toHaveBeenCalledTimes(1)
          expect(instance.spaceMembers.length).toBe(1)
          expect(instance.spaceMembers[0].role).toEqual(spaceRoleEditor)
        }
      })
    })
  })
  describe('method "deleteSpaceMember"', () => {
    it('correctly removes a space member', () => {
      getWrapper({
        setup: async (instance) => {
          const drive = mock<Drive>({ id: '1', special: [] })
          const share = mock<Share>({
            id: '1',
            collaborator: { displayName: 'foo', role: spaceRoleManager }
          })

          instance.spaceMembers = [share]
          const graphClient = mockDeep<Graph>()
          graphClient.drives.getDrive.mockResolvedValue(mockAxiosResolve(drive))

          const client = mockDeep<OwnCloudSdk>()

          await instance.deleteSpaceMember({
            client,
            graphClient,
            share,
            reloadSpace: true
          })

          expect(client.shares.deleteShare).toHaveBeenCalledTimes(1)
          expect(graphClient.drives.getDrive).toHaveBeenCalledTimes(1)
          expect(instance.spaceMembers.length).toBe(0)
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
