import actions from '../../../src/store/actions'
import { SpaceResource, Resource } from '@ownclouders/web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import { createTestingPinia } from 'web-test-helpers'

jest.mock('@ownclouders/web-client/src/helpers/share/functions', () => {
  return {
    buildShare: (share) => share,
    buildCollaboratorShare: (share) => share
  }
})

const stateMock = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  rootGetters: {},
  state: {}
}
// we need to define $gettext explicitly to make it enumerable on the mock

describe('vuex store actions', () => {
  beforeEach(() => {
    createTestingPinia({
      initialState: { config: { options: { concurrentRequests: { shares: { list: 4 } } } } }
    })
  })

  describe('updateFileShareTypes', () => {
    const getRootStateMock = (file: Resource) => ({
      runtime: {
        ancestorMetaData: {
          ancestorMetaData: file ? { [file.path]: {} } : {}
        }
      }
    })
    const commitSpy = jest.fn()

    it('updates the resource if given', () => {
      const file = mockDeep<Resource>({ path: '/foo' })
      const getters = { files: [file] }
      actions.updateFileShareTypes(
        {
          rootState: getRootStateMock(null),
          getters,
          commit: commitSpy
        },
        { path: file.path, outgoingShares: [] }
      )
      expect(commitSpy).toHaveBeenCalledTimes(1)
    })
    it('does not update the resource if not given', () => {
      const file = undefined
      const getters = { files: [file] }
      actions.updateFileShareTypes(
        {
          rootState: getRootStateMock(file),
          getters,
          commit: commitSpy
        },
        { path: '/foo', outgoingShares: [] }
      )
      expect(commitSpy).toHaveBeenCalledTimes(0)
    })
    it('does not update project space resources', () => {
      const file = mockDeep<SpaceResource>({ driveType: 'project' })
      const getters = { files: [file] }
      actions.updateFileShareTypes(
        {
          rootState: getRootStateMock(file),
          getters,
          commit: commitSpy
        },
        { path: file.path, outgoingShares: [] }
      )
      expect(commitSpy).toHaveBeenCalledTimes(0)
    })
    it('updates the ancestor if found', () => {
      const file = mockDeep<Resource>({ path: '/path' })
      const getters = { files: [file] }
      actions.updateFileShareTypes(
        {
          rootState: getRootStateMock(file),
          getters,
          commit: commitSpy
        },
        { path: file.path, outgoingShares: [] }
      )
      expect(commitSpy).toHaveBeenCalledTimes(2)
    })
  })
})
