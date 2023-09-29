import mutations from '../../../src/store/mutations'
import { cloneDeep } from 'lodash-es'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'

const stateFixture = {
  files: [
    {
      id: 1,
      name: 'test1'
    },
    {
      id: 2,
      name: 'test2'
    },
    {
      id: 5,
      name: 'test5'
    }
  ]
}
let stateMock: typeof stateFixture
const resetState = () => {
  stateMock = cloneDeep(stateFixture)
}

describe('vuex store mutations', () => {
  describe('update resources by id', () => {
    beforeEach(resetState)
    it.each([
      [mutations.UPSERT_RESOURCE.name, mutations.UPSERT_RESOURCE],
      [mutations.UPDATE_RESOURCE.name, mutations.UPDATE_RESOURCE]
    ])('succeeds using mutation %s', (name, m) => {
      expect(stateMock.files).toEqual(stateFixture.files)
      expect(stateMock.files[1].name).toBe('test2')
      m(stateMock, {
        id: 2,
        name: 'test2-updated'
      })
      expect(stateMock.files[1].name).toBe('test2-updated')
      expect(stateMock.files.length).toBe(stateFixture.files.length)
    })
  })
  describe('insert resources', () => {
    beforeEach(resetState)
    it('succeeds using mutation UPSERT_RESOURCE', () => {
      expect(stateMock.files).toEqual(stateFixture.files)
      mutations.UPSERT_RESOURCE(stateMock, {
        id: 3,
        name: 'test3-inserted'
      })
      expect(stateMock.files).toEqual([...stateFixture.files, { id: 3, name: 'test3-inserted' }])
    })
    it('is ignored using mutation UPDATE_RESOURCE', () => {
      expect(stateMock.files).toEqual(stateFixture.files)
      mutations.UPDATE_RESOURCE(stateMock, {
        id: 3,
        name: 'test3-inserted'
      })
      expect(stateMock.files).toEqual(stateFixture.files)
    })
  })

  it('SET_HIDDEN_FILES_VISIBILITY', () => {
    const state = { areHiddenFilesShown: true }
    const { SET_HIDDEN_FILES_VISIBILITY } = mutations

    SET_HIDDEN_FILES_VISIBILITY(state, false)

    expect(state.areHiddenFilesShown).toEqual(false)
  })

  it('SET_FILE_EXTENSIONS_VISIBILITY', () => {
    const state = { areFileExtensionsShown: true }
    const { SET_FILE_EXTENSIONS_VISIBILITY } = mutations

    SET_FILE_EXTENSIONS_VISIBILITY(state, false)

    expect(state.areFileExtensionsShown).toEqual(false)
  })

  describe('OUTGOING_SHARES_REMOVE', () => {
    it('removes an outgoing user share', () => {
      const shareToRemove = { id: 1, shareType: ShareTypes.user.value }
      const state = { outgoingShares: [shareToRemove] }
      mutations.OUTGOING_SHARES_REMOVE(state, shareToRemove)

      expect(state.outgoingShares.length).toEqual(0)
    })
    it('removes an outgoing space share', () => {
      const shareToRemove = {
        id: 1,
        shareType: ShareTypes.spaceUser.value,
        collaborator: { name: 'admin' }
      }
      const state = { outgoingShares: [shareToRemove] }
      mutations.OUTGOING_SHARES_REMOVE(state, shareToRemove)

      expect(state.outgoingShares.length).toEqual(0)
    })
  })

  describe('OUTGOING_SHARES_UPSERT', () => {
    it('updates an outgoing user share', () => {
      const share = { id: 1, shareType: ShareTypes.user.value, permissions: 1 }
      const state = { outgoingShares: [share] }
      const updatedShare = { ...share, permissions: 31 }
      mutations.OUTGOING_SHARES_UPSERT(state, updatedShare)

      expect(state.outgoingShares[0]).toEqual(updatedShare)
    })
    it('updates an outgoing space share', () => {
      const share = {
        id: 1,
        shareType: ShareTypes.spaceUser.value,
        permissions: 1,
        collaborator: { name: 'admin' }
      }
      const state = { outgoingShares: [share] }
      const updatedShare = { ...share, permissions: 31 }
      mutations.OUTGOING_SHARES_UPSERT(state, updatedShare)

      expect(state.outgoingShares[0]).toEqual(updatedShare)
    })
  })
})
