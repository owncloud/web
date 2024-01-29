import { createTestingPinia, getComposableWrapper } from 'web-test-helpers'
import {
  AddLinkOptions,
  AddShareOptions,
  DeleteLinkOptions,
  DeleteShareOptions,
  UpdateLinkOptions,
  UpdateShareOptions,
  useSharesStore
} from '../../../../src/composables/piniaStores'
import { mock, mockDeep } from 'vitest-mock-extended'
import { ClientService } from '../../../../src/services'
import { Resource, Share, ShareTypes } from '@ownclouders/web-client/src/helpers'

vi.mock('@ownclouders/web-client/src/helpers/share/functions', () => ({
  buildShare: (share) => share,
  buildCollaboratorShare: (share) => share
}))

describe('useSharesStore', () => {
  beforeEach(() => {
    createTestingPinia({
      stubActions: false,
      initialState: { resources: { currentFolder: mock<Resource>() } }
    })
  })

  describe('loadShares', () => {
    it('fetches shares and sets them as in- and outgoing shares', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.getShares.mockResolvedValueOnce([
            { shareInfo: { id: 1 } }
          ])
          clientService.owncloudSdk.shares.getShares.mockResolvedValueOnce([
            { shareInfo: { id: 3 } }
          ])
          clientService.owncloudSdk.shares.getShares.mockResolvedValueOnce([
            { shareInfo: { id: 2 } }
          ])
          clientService.owncloudSdk.shares.getShares.mockResolvedValueOnce([
            { shareInfo: { id: 4 } }
          ])

          await instance.loadShares({
            clientService,
            resource: mock<Resource>(),
            path: '/someFolder/someFile.txt',
            storageId: '1',
            ancestorMetaData: {}
          })

          expect(instance.outgoingShares).toEqual([
            { id: 1, outgoing: true, indirect: false },
            { id: 2, outgoing: true, indirect: true }
          ])
          expect(instance.incomingShares).toEqual([
            { id: 3, outgoing: false, indirect: false },
            { id: 4, outgoing: false, indirect: true }
          ])

          // FIXME: pqueue makes issues?!
          // expect(clientService.owncloudSdk.shares.getShares).toHaveBeenCalledTimes(4)
        }
      })
    })
    it('uses the cache and only updates the "indirect" state', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          const loadedShare = mock<Share>({
            outgoing: true,
            indirect: true,
            path: '/someFile.txt'
          })

          instance.shares = [loadedShare]

          await instance.loadShares({
            clientService,
            resource: mock<Resource>(),
            path: '/someFile.txt',
            storageId: '1',
            ancestorMetaData: {},
            useCached: true
          })

          expect(instance.outgoingShares).toEqual([{ ...loadedShare, indirect: false }])
          expect(clientService.owncloudSdk.shares.getShares).not.toHaveBeenCalled()
        }
      })
    })
  })

  describe('addShare', () => {
    it('adds a user share', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.shareFileWithUser.mockResolvedValue({})
          await instance.addShare(
            mock<AddShareOptions>({
              clientService,
              shareType: ShareTypes.user.value
            })
          )

          expect(clientService.owncloudSdk.shares.shareFileWithUser).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('adds a group share', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.shareFileWithGroup.mockResolvedValue({})
          await instance.addShare(
            mock<AddShareOptions>({
              clientService,
              shareType: ShareTypes.group.value
            })
          )

          expect(clientService.owncloudSdk.shares.shareFileWithGroup).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
  describe('updateShare', () => {
    it('updates a share', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.updateShare.mockResolvedValue({})
          await instance.updateShare(mock<UpdateShareOptions>({ clientService }))

          expect(clientService.owncloudSdk.shares.updateShare).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
  describe('deleteShare', () => {
    it('deletes a share', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.deleteShare.mockResolvedValue({})
          await instance.deleteShare(
            mock<DeleteShareOptions>({
              clientService
            })
          )

          expect(clientService.owncloudSdk.shares.deleteShare).toHaveBeenCalledTimes(1)
        }
      })
    })
  })

  describe('addLink', () => {
    it('adds a link', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.shareFileWithLink.mockResolvedValue({})
          await instance.addLink(mock<AddLinkOptions>({ clientService }))

          expect(clientService.owncloudSdk.shares.shareFileWithLink).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
  describe('updateLink', () => {
    it('updates a link', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.updateShare.mockResolvedValue({})
          await instance.updateLink(mock<UpdateLinkOptions>({ clientService }))

          expect(clientService.owncloudSdk.shares.updateShare).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
  describe('deleteLink', () => {
    it('deletes a link', () => {
      getWrapper({
        setup: async (instance) => {
          const clientService = mockDeep<ClientService>()
          clientService.owncloudSdk.shares.deleteShare.mockResolvedValue({})
          await instance.deleteLink(mock<DeleteLinkOptions>({ clientService }))

          expect(clientService.owncloudSdk.shares.deleteShare).toHaveBeenCalledTimes(1)
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
