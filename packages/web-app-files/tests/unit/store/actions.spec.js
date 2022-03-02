import actions from '../../../src/store/actions'
import { ShareTypes, spaceManager } from '../../../src/helpers/share'

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {
    highlightedFile: { isFolder: false }
  },
  rootGetters: {
    isOcis: true
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

const shareMock = {
  id: '1',
  shareType: ShareTypes.user.value
}

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spacePermissions: [{ grantedTo: [{ user: { id: 1 } }], roles: ['manager'] }],
  spaceQuota: {
    used: 100,
    total: 1000
  }
}

const spaceShareMock = {
  id: '1',
  shareType: ShareTypes.space.value,
  collaborator: {
    onPremisesSamAccountName: 'Alice',
    displayName: 'alice'
  },
  role: {
    name: spaceManager.name
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
        space: dataSet.space
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
      expect(dispatchSpy).toBeCalledTimes(dataSet.expectedDispatchCalls)
    })
  })

  describe('changeShare', () => {
    it.each([{ share: spaceShareMock }, { share: shareMock }])(
      'succeeds using action %s',
      async (dataSet) => {
        const commitSpy = jest.spyOn(stateMock, 'commit')

        await actions.changeShare(stateMock, {
          client: clientMock,
          share: dataSet.share,
          permissions: 1,
          expirationDate: null
        })

        expect(commitSpy).toBeCalledTimes(1)
      }
    )
  })

  describe('addShare', () => {
    it.each([
      { shareType: spaceShareMock.shareType, spaceId: spaceMock.id, expectedCommitCalls: 2 },
      { shareType: shareMock.shareType, spaceId: null, expectedCommitCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.addShare(stateMock, {
        client: clientMock,
        shareType: dataSet.shareType,
        spaceId: dataSet.spaceId,
        permissions: 1,
        expirationDate: null
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })

  describe('deleteShare', () => {
    it.each([
      { share: spaceShareMock, spaceId: spaceMock.id, expectedCommitCalls: 2 },
      { share: shareMock, spaceId: null, expectedCommitCalls: 1 }
    ])('succeeds using action %s', async (dataSet) => {
      const commitSpy = jest.spyOn(stateMock, 'commit')

      await actions.deleteShare(stateMock, {
        client: clientMock,
        share: dataSet.share,
        resource: {}
      })

      expect(commitSpy).toBeCalledTimes(dataSet.expectedCommitCalls)
    })
  })
})
