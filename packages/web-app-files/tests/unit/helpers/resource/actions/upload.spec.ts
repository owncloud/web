import { mock, mockDeep } from 'vitest-mock-extended'
import { Language } from 'vue3-gettext'
import { UploadResourceConflict } from '../../../../../src/helpers/resource'
import { ResolveStrategy, UppyResource, useResourcesStore } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { createTestingPinia } from '@ownclouders/web-test-helpers'

const getResourceConflictInstance = ({
  currentFiles = [mockDeep<Resource>()]
}: {
  currentFiles?: Resource[]
} = {}) => {
  createTestingPinia({ initialState: { resources: { resources: currentFiles } } })
  const resourcesStore = useResourcesStore()
  return new UploadResourceConflict(resourcesStore, mock<Language>())
}

describe('upload helper', () => {
  describe('method "getConflicts"', () => {
    it('should return file and folder conflicts', () => {
      const fileName = 'someFile.txt'
      const folderName = 'someFolder'
      const currentFiles = [
        mockDeep<Resource>({ name: fileName }),
        mockDeep<Resource>({ name: folderName })
      ]
      const filesToUpload = [
        mockDeep<UppyResource>({ name: fileName, meta: { relativePath: '', relativeFolder: '' } }),
        mockDeep<UppyResource>({
          name: 'anotherFile',
          meta: { relativePath: `/${folderName}/anotherFile` }
        })
      ]
      const instance = getResourceConflictInstance({ currentFiles })
      const conflicts = instance.getConflicts(filesToUpload)

      expect(conflicts.length).toBe(2)
      expect(conflicts).toContainEqual({ name: fileName, type: 'file' })
      expect(conflicts).toContainEqual({ name: folderName, type: 'folder' })
    })
  })
  describe('method "displayOverwriteDialog"', () => {
    it.each([ResolveStrategy.REPLACE, ResolveStrategy.KEEP_BOTH])(
      'should return all files if user chooses replace or keep both for all',
      async (strategy) => {
        const uppyResource = mockDeep<UppyResource>({
          name: 'test',
          meta: {
            relativeFolder: ''
          }
        })
        const conflict = {
          name: uppyResource.name,
          type: 'file'
        }

        const instance = getResourceConflictInstance()
        const resolveFileConflictMethod = vi.fn(() =>
          Promise.resolve({ strategy, doForAllConflicts: true })
        )
        instance.resolveFileExists = resolveFileConflictMethod

        const result = await instance.displayOverwriteDialog([uppyResource], [conflict])
        expect(result.length).toBe(1)
        expect(result).toEqual([uppyResource])
      }
    )
    it('should return no files if user chooses skip for all', async () => {
      const uppyResource = mockDeep<UppyResource>({ name: 'test' })
      const conflict = { name: uppyResource.name, type: 'file' }

      const instance = getResourceConflictInstance()

      const resolveFileConflictMethod = vi.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.SKIP, doForAllConflicts: true })
      )
      instance.resolveFileExists = resolveFileConflictMethod

      const result = await instance.displayOverwriteDialog([uppyResource], [conflict])
      expect(result.length).toBe(0)
    })
    it('should show dialog once if do for all conflicts is ticked', async () => {
      const uppyResourceOne = mockDeep<UppyResource>({ name: 'test' })
      const uppyResourceTwo = mockDeep<UppyResource>({ name: 'test2' })
      const conflictOne = { name: uppyResourceOne.name, type: 'file' }
      const conflictTwo = { name: uppyResourceTwo.name, type: 'file' }

      const instance = getResourceConflictInstance()
      const resolveFileConflictMethod = vi.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.REPLACE, doForAllConflicts: true })
      )
      instance.resolveFileExists = resolveFileConflictMethod

      await instance.displayOverwriteDialog(
        [uppyResourceOne, uppyResourceTwo],
        [conflictOne, conflictTwo]
      )

      expect(resolveFileConflictMethod).toHaveBeenCalledTimes(1)
    })
    it('should show dialog twice if do for all conflicts is ticked and folders and files are uploaded', async () => {
      const uppyResourceOne = mockDeep<UppyResource>({ name: 'test' })
      const uppyResourceTwo = mockDeep<UppyResource>({ name: 'folder' })
      const conflictOne = {
        name: uppyResourceOne.name,
        type: 'file',
        meta: { relativeFolder: '/' }
      }
      const conflictTwo = { name: uppyResourceTwo.name, type: 'folder' }

      const instance = getResourceConflictInstance()
      instance.resolveFileExists = vi.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.REPLACE, doForAllConflicts: true })
      )

      await instance.displayOverwriteDialog(
        [uppyResourceOne, uppyResourceTwo],
        [conflictOne, conflictTwo]
      )

      expect(instance.resolveFileExists).toHaveBeenCalledTimes(2)
    })
  })
})
