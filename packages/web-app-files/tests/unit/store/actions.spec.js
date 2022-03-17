import actions from '../../../src/store/actions'
import { ShareTypes, spaceRoleManager } from '../../../src/helpers/share'
import { buildSpace } from '../../../src/helpers/resources'

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {
    highlightedFile: { isFolder: false }
  }
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

  describe('loadCurrentFileOutgoingShares', () => {
    it.each([
      { space: spaceMock, expectedCommitCalls: 5, expectedDispatchCalls: 1 },
      { space: null, expectedCommitCalls: 5, expectedDispatchCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')
      const dispatchSpy = jest.spyOn(stateMock, 'dispatch')

      await actions.loadCurrentFileOutgoingShares(stateMock, {
        client: clientMock,
        path: 'path',
        resource: dataSet.space
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
      expect(dispatchSpy).toBeCalledTimes(dataSet.expectedDispatchCalls)
    })
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
        permissions: 1,
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
        permissions: 1,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })

  describe('deleteShare', () => {
    it.each([
      { share: spaceShareMock, storageId: spaceMock.id, expectedCommitCalls: 2 },
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
