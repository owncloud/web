import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { ConflictDialog, ResolveConflict } from '@ownclouders/web-pkg/src/helpers/resource'

const getConflictDialogInstance = ({ createModal = jest.fn() } = {}) => {
  return new ConflictDialog(createModal, jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())
}

describe('conflict dialog', () => {
  describe('method "resolveAllConflicts"', () => {
    it('should return the resolved conflicts including the resource(s) and the strategy', async () => {
      const conflictDialog = getConflictDialogInstance()
      const strategy = mockDeep<ResolveConflict>()
      conflictDialog.resolveFileExists = jest.fn().mockImplementation(() => ({
        strategy,
        doForAllConflicts: false
      }))
      const resource = mockDeep<Resource>({ name: 'someFile.txt' })
      const targetFolder = mockDeep<Resource>({ path: '/' })
      const targetFolderResources = [mockDeep<Resource>({ path: '/someFile.txt' })]
      const resolvedConflicts = await conflictDialog.resolveAllConflicts(
        [resource],
        targetFolder,
        targetFolderResources
      )

      expect(resolvedConflicts.length).toBe(1)
      expect(resolvedConflicts[0].resource).toEqual(resource)
      expect(resolvedConflicts[0].strategy).toEqual(strategy)
    })
  })
  describe('method "resolveFileExists"', () => {
    it('should create the modal in the end', () => {
      const createModal = jest.fn()
      const conflictDialog = getConflictDialogInstance({ createModal })
      conflictDialog.resolveFileExists(mockDeep<Resource>(), 2, true)
      expect(createModal).toHaveBeenCalledTimes(1)
    })
  })
})
