import { createTestingPinia, getComposableWrapper } from 'web-test-helpers'
import {
  AddLinkOptions,
  AddShareOptions,
  DeleteLinkOptions,
  DeleteShareOptions,
  UpdateLinkOptions,
  UpdateShareOptions,
  useSharesStore,
  useUserStore
} from '../../../../src/composables/piniaStores'
import { mock, mockDeep } from 'vitest-mock-extended'
import { ClientService } from '../../../../src/services'
import { Resource } from '@ownclouders/web-client/src/helpers'
import { Permission, User } from '@ownclouders/web-client/src/generated'
import {
  buildCollaboratorShare,
  buildLinkShare
} from '@ownclouders/web-client/src/helpers/share/functions'

vi.mock('@ownclouders/web-client/src/helpers/share/functions', () => ({
  buildLinkShare: vi.fn((share) => share),
  buildCollaboratorShare: vi.fn((share) => share)
}))

describe('useSharesStore', () => {
  beforeEach(() => {
    createTestingPinia({
      stubActions: false,
      initialState: { resources: { currentFolder: mock<Resource>() } }
    })
  })

  describe('addShare', () => {
    it('adds a collaborator share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const permission = { id: '1' } as Permission
          const user = { id: '1' } as User

          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.invite.mockResolvedValue({
            data: { value: [permission] }
          } as any)

          const userStore = useUserStore()
          userStore.user = user

          await instance.addShare(mock<AddShareOptions>({ clientService, resource }))

          expect(clientService.graphAuthenticated.permissions.invite).toHaveBeenCalledTimes(1)
          expect(instance.collaboratorShares.length).toBe(1)
          expect(buildCollaboratorShare).toHaveBeenCalledWith({
            graphPermission: permission,
            graphRoles: [],
            resourceId: resource.id,
            user
          })
        }
      })
    })
  })
  describe('updateShare', () => {
    it('updates a collaborator share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const permission = { id: '1' } as Permission
          const user = { id: '1' } as User

          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.updatePermission.mockResolvedValue({
            data: permission
          } as any)

          const userStore = useUserStore()
          userStore.user = user

          await instance.updateShare(mock<UpdateShareOptions>({ clientService, resource }))

          expect(
            clientService.graphAuthenticated.permissions.updatePermission
          ).toHaveBeenCalledTimes(1)
          expect(buildCollaboratorShare).toHaveBeenCalledWith({
            graphPermission: permission,
            graphRoles: [],
            resourceId: resource.id,
            user
          })
        }
      })
    })
  })
  describe('deleteShare', () => {
    it('deletes a collaborator share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.deletePermission.mockResolvedValue(undefined)

          await instance.deleteShare(mock<DeleteShareOptions>({ clientService, resource }))

          expect(
            clientService.graphAuthenticated.permissions.deletePermission
          ).toHaveBeenCalledTimes(1)
        }
      })
    })
  })

  describe('addLink', () => {
    it('adds a link share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const permission = { id: '1' } as Permission
          const user = { id: '1' } as User

          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.createLink.mockResolvedValue({
            data: permission
          } as any)

          const userStore = useUserStore()
          userStore.user = user

          await instance.addLink(mock<AddLinkOptions>({ clientService, resource }))

          expect(clientService.graphAuthenticated.permissions.createLink).toHaveBeenCalledTimes(1)
          expect(instance.linkShares.length).toBe(1)
          expect(buildLinkShare).toHaveBeenCalledWith({
            graphPermission: permission,
            resourceId: resource.id,
            user
          })
        }
      })
    })
  })
  describe('updateLink', () => {
    it('updates a link share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const permission = { id: '1' } as Permission
          const user = { id: '1' } as User

          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.updatePermission.mockResolvedValue({
            data: permission
          } as any)

          const userStore = useUserStore()
          userStore.user = user

          await instance.updateLink(mock<UpdateLinkOptions>({ clientService, resource }))

          expect(
            clientService.graphAuthenticated.permissions.updatePermission
          ).toHaveBeenCalledTimes(1)
          expect(buildLinkShare).toHaveBeenCalledWith({
            graphPermission: permission,
            resourceId: resource.id,
            user
          })
        }
      })
    })
  })
  describe('deleteLink', () => {
    it('deletes a link share', () => {
      getWrapper({
        setup: async (instance) => {
          const resource = { id: '1' } as Resource
          const clientService = mockDeep<ClientService>()
          clientService.graphAuthenticated.permissions.deletePermission.mockResolvedValue(undefined)

          await instance.deleteLink(mock<DeleteLinkOptions>({ clientService, resource }))

          expect(
            clientService.graphAuthenticated.permissions.deletePermission
          ).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({ setup }: { setup: (instance: ReturnType<typeof useSharesStore>) => void }) {
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSharesStore()
        setup(instance)
      },
      { pluginOptions: { pinia: false } }
    )
  }
}
