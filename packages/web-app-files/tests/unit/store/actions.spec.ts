import actions from '../../../src/store/actions'
import { spaceRoleManager, ShareTypes, Share } from 'web-client/src/helpers/share'
import { mock, mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'
import { Language } from 'vue3-gettext'

jest.mock('../../../src/helpers/resources')

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  rootGetters: {}
}
// we need to define $gettext explicitly to make it enumerable on the mock
const languageMock = mock<Language>({ $gettext: jest.fn() })

describe('vuex store actions', () => {
  describe('changeShare', () => {
    it('succeeds when resolved sucessfully', async () => {
      const clientMock = mockDeep<OwnCloudSdk>()
      clientMock.shares.updateShare.mockResolvedValue({})
      await actions.changeShare(stateMock, {
        ...languageMock,
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
        ...languageMock,
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
        ...languageMock,
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
        ...languageMock,
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

  describe('updateCurrentFileShareTypes', () => {
    const stateMock = { currentFileOutgoingShares: [] }
    const commitSpy = jest.fn()

    it('updates the resource if given', () => {
      const getters = { highlightedFile: mockDeep<Resource>() }
      actions.updateCurrentFileShareTypes({ state: stateMock, getters, commit: commitSpy })
      expect(commitSpy).toHaveBeenCalledTimes(1)
    })
    it('does not update the resource if not given', () => {
      const getters = { highlightedFile: undefined }
      actions.updateCurrentFileShareTypes({ state: stateMock, getters, commit: commitSpy })
      expect(commitSpy).toHaveBeenCalledTimes(0)
    })
    it('does not update project space resources', () => {
      const getters = { highlightedFile: mockDeep<SpaceResource>({ driveType: 'project' }) }
      actions.updateCurrentFileShareTypes({ state: stateMock, getters, commit: commitSpy })
      expect(commitSpy).toHaveBeenCalledTimes(0)
    })
  })
})
