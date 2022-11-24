import actions from '../../../src/store/actions'
import { spaceRoleManager, ShareTypes, Share } from 'web-client/src/helpers/share'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'

jest.mock('../../../src/helpers/resources')

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  rootGetters: {}
}

describe('vuex store actions', () => {
  beforeEach(() => {
    // because of the $gettext warnings
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('changeShare', () => {
    it('succeeds when resolved sucessfully', async () => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares.updateShare.mockResolvedValue({})
      await actions.changeShare(stateMock, {
        client: clientMock,
        share: mockDeep<Share>({ shareType: ShareTypes.user.value }),
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(stateMock.commit).toHaveBeenCalledTimes(1)
    })
    it('fails on error', async () => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares.updateShare.mockRejectedValue(new Error())
      await actions.changeShare(stateMock, {
        client: clientMock,
        share: mockDeep<Share>({ shareType: ShareTypes.user.value }),
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(stateMock.commit).toHaveBeenCalledTimes(0)
      expect(stateMock.dispatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('addShare', () => {
    it.each([
      { shareType: ShareTypes.user.value, shareMethod: 'shareFileWithUser' },
      { shareType: ShareTypes.group.value, shareMethod: 'shareFileWithGroup' }
    ])('succeeds when resolved sucessfully', async (data) => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares[data.shareMethod].mockResolvedValue({})
      await actions.addShare(stateMock, {
        client: clientMock,
        path: '/someFile.txt',
        shareWith: 'user',
        shareType: data.shareType,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null,
        storageId: null
      })

      expect(clientMock.shares[data.shareMethod]).toHaveBeenCalledTimes(1)
      expect(stateMock.commit).toHaveBeenCalledTimes(1)
    })
    it('fails on error', async () => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares.shareFileWithUser.mockRejectedValue(new Error())
      await actions.addShare(stateMock, {
        client: clientMock,
        path: '/someFile.txt',
        shareWith: 'user',
        shareType: ShareTypes.user.value,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null,
        storageId: null
      })

      expect(stateMock.commit).toHaveBeenCalledTimes(0)
      expect(stateMock.dispatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteShare', () => {
    it('succeeds when resolved sucessfully', async () => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares.deleteShare.mockResolvedValue({})
      await actions.deleteShare(stateMock, {
        client: clientMock,
        share: mockDeep<Share>({ shareType: ShareTypes.user.value }),
        path: '/someFile.txt',
        storageId: undefined
      })

      expect(stateMock.commit).toHaveBeenCalledTimes(1)
    })
  })
})
