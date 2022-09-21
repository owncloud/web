import actions from '../../../src/store/actions'
import { spaceRoleManager, ShareTypes } from 'web-client/src/helpers/share'

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {
    highlightedFile: { isFolder: false }
  },
  rootGetters: {}
}

const clientMock = {
  users: {
    getUser: () => {
      return Promise.resolve({})
    }
  },
  shares: {
    getShares: () => {
      return Promise.resolve([{ shareInfo: { share_type: ShareTypes.user.value, permissions: 1 } }])
    },
    updateShare: () => {
      return Promise.resolve({ shareInfo: { share_type: ShareTypes.user.value, permissions: 1 } })
    },
    deleteShare: () => {
      return Promise.resolve({})
    },
    shareSpaceWithUser: () => {
      return Promise.resolve({})
    },
    shareFileWithUser: () => {
      return Promise.resolve({ shareInfo: { share_type: ShareTypes.user.value, permissions: 1 } })
    }
  }
}

const shareMock = {
  id: '1',
  shareType: ShareTypes.user.value
}

describe('vuex store actions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('changeShare', () => {
    it('succeeds using action %s', async () => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.changeShare(stateMock, {
        client: clientMock,
        share: shareMock,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(1)
    })
  })

  describe('addShare', () => {
    it('succeeds using action %s', async () => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.addShare(stateMock, {
        client: clientMock,
        shareType: shareMock.shareType,
        storageId: null,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(1)
    })
  })

  describe('deleteShare', () => {
    it('succeeds using action %s', async () => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.deleteShare(stateMock, {
        client: clientMock,
        share: shareMock,
        resource: {}
      })

      expect(commitSpy).toBeCalledTimes(1)
    })
  })
})
