import actions from '../../../src/store/actions'
import { spaceRoleManager, ShareTypes } from 'web-client/src/helpers/share'
import { buildSpace } from 'web-client/src/helpers'

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

const graphClientMock = {
  drives: {
    getDrive: () => {
      return Promise.resolve({ data: spaceMock })
    }
  },
  users: {
    getUser: () => {
      return Promise.resolve({})
    }
  }
}
const shareMock = {
  id: '1',
  shareType: ShareTypes.user.value
}

const spaceMock = buildSpace({
  type: 'space',
  name: ' space',
  id: '1',
  root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] }
})

const spaceShareMock = {
  id: '1',
  shareType: ShareTypes.space.value,
  collaborator: {
    onPremisesSamAccountName: 'Alice',
    displayName: 'alice'
  },
  role: {
    name: spaceRoleManager.name
  }
}

describe('vuex store actions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('changeShare', () => {
    it.each([
      { share: spaceShareMock, expectedCommitCalls: 2 },
      { share: shareMock, expectedCommitCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.changeShare(stateMock, {
        client: clientMock,
        graphClient: graphClientMock,
        share: dataSet.share,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })

  describe('addShare', () => {
    it.each([
      { shareType: spaceShareMock.shareType, storageId: spaceMock.id, expectedCommitCalls: 2 },
      { shareType: shareMock.shareType, storageId: null, expectedCommitCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.addShare(stateMock, {
        client: clientMock,
        graphClient: graphClientMock,
        shareType: dataSet.shareType,
        storageId: dataSet.storageId,
        permissions: spaceRoleManager.bitmask(false),
        role: spaceRoleManager,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })

  describe('deleteShare', () => {
    it.each([
      { share: spaceShareMock, storageId: spaceMock.id, expectedCommitCalls: 4 },
      { share: shareMock, storageId: null, expectedCommitCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.deleteShare(stateMock, {
        client: clientMock,
        graphClient: graphClientMock,
        share: dataSet.share,
        resource: {}
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })
})
