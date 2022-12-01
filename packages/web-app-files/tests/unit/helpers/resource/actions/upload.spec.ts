import { mockDeep } from 'jest-mock-extended'
import { ResolveStrategy, ResourcesUpload } from 'web-app-files/src/helpers/resource'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { CreateDirectoryTreeResult, UppyResource } from 'web-runtime/src/composables/upload'
import { UppyService } from 'web-runtime/src/services/uppyService'

const getResourcesUploadInstance = ({
  space = mockDeep<SpaceResource>(),
  currentFolder = '/',
  currentFiles = [mockDeep<Resource>()],
  spaces = [mockDeep<SpaceResource>()],
  showMessage = jest.fn(),
  uppyService = mockDeep<UppyService>({ getFailedFiles: jest.fn(() => []) }),
  createDirectoryTree = jest.fn().mockImplementation(() => ({ failed: [], successful: [] }))
}: {
  space?: SpaceResource
  currentFolder?: string
  currentFiles?: Resource[]
  spaces?: SpaceResource[]
  showMessage?: () => void
  uppyService?: UppyService
  createDirectoryTree?: (
    space: SpaceResource,
    currentPath: string,
    files: UppyResource[],
    currentFolderId?: string | number
  ) => Promise<CreateDirectoryTreeResult>
} = {}) => {
  return new ResourcesUpload(
    [],
    currentFiles,
    jest.fn(() => []),
    uppyService,
    space,
    currentFolder,
    '',
    spaces,
    true,
    createDirectoryTree,
    jest.fn(),
    jest.fn(),
    showMessage,
    jest.fn(),
    jest.fn(),
    jest.fn()
  )
}

describe('upload helper', () => {
  describe('method "perform"', () => {
    it('should handle the file upload when no conflicts found', () => {
      const resourcesUpload = getResourcesUploadInstance()
      const handleFileUppyloadStub = jest.fn()
      const displayOverwriteDialogStub = jest.fn()
      resourcesUpload.handleUppyFileUpload = handleFileUppyloadStub
      resourcesUpload.displayOverwriteDialog = displayOverwriteDialogStub
      resourcesUpload.perform()
      expect(handleFileUppyloadStub).toHaveBeenCalledTimes(1)
      expect(displayOverwriteDialogStub).toHaveBeenCalledTimes(0)
    })
    it('should display the overwrite dialog when conflicts found', () => {
      const resourcesUpload = getResourcesUploadInstance()
      const handleFileUppyloadStub = jest.fn()
      const displayOverwriteDialogStub = jest.fn()
      const getConflictsStub = jest.fn(() => [{ name: 'name', type: 'file' }])
      resourcesUpload.handleUppyFileUpload = handleFileUppyloadStub
      resourcesUpload.displayOverwriteDialog = displayOverwriteDialogStub
      resourcesUpload.getConflicts = getConflictsStub
      resourcesUpload.perform()
      expect(handleFileUppyloadStub).toHaveBeenCalledTimes(0)
      expect(displayOverwriteDialogStub).toHaveBeenCalledTimes(1)
    })
  })
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
      const resourcesUpload = getResourcesUploadInstance({ currentFiles })
      const conflicts = resourcesUpload.getConflicts(filesToUpload)

      expect(conflicts.length).toBe(2)
      expect(conflicts).toContainEqual({ name: fileName, type: 'file' })
      expect(conflicts).toContainEqual({ name: folderName, type: 'folder' })
    })
  })
  describe('method "checkQuotaExceeded"', () => {
    const remainingQuota = 1000
    const spacesMock = mockDeep<SpaceResource>({
      id: '1',
      name: 'admin',
      driveType: 'personal',
      spaceQuota: { remaining: remainingQuota }
    })

    it('should be true if the filesize to be uploaded is greater than the remaining quota', () => {
      const fileToBeUploaded = mockDeep<UppyResource>({
        data: { size: 1001 },
        meta: { spaceId: '1', routeName: 'files-spaces-generic' }
      })
      const showMessageStub = jest.fn()
      const resourcesUpload = getResourcesUploadInstance({
        showMessage: showMessageStub,
        spaces: [spacesMock]
      })

      expect(resourcesUpload.checkQuotaExceeded([fileToBeUploaded])).toBeTruthy()
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
    it('should be false if the filesize to be uploaded is smaller than the remaining quota', () => {
      const fileToBeUploaded = mockDeep<UppyResource>({ data: { size: 900 } })
      const showMessageStub = jest.fn()
      const resourcesUpload = getResourcesUploadInstance({
        showMessage: showMessageStub,
        spaces: [spacesMock]
      })

      expect(resourcesUpload.checkQuotaExceeded([fileToBeUploaded])).toBeFalsy()
      expect(showMessageStub).toHaveBeenCalledTimes(0)
    })
    it('should be false if an existing file is being overwritten with a smaller filesize', () => {
      const existingFile = mockDeep<Resource>({ name: 'someFile.txt', size: 2000 })
      const fileToBeUploaded = mockDeep<UppyResource>({
        name: existingFile.name,
        data: { size: 1999 },
        meta: {
          spaceId: '1',
          routeName: 'files-spaces-generic',
          relativeFolder: ''
        }
      })
      const showMessageStub = jest.fn()
      const resourcesUpload = getResourcesUploadInstance({
        showMessage: showMessageStub,
        spaces: [spacesMock],
        currentFiles: [existingFile]
      })

      expect(resourcesUpload.checkQuotaExceeded([fileToBeUploaded])).toBeFalsy()
      expect(showMessageStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('handleUppyFileUpload method', () => {
    it('should call uploadFiles when having files to upload', async () => {
      const uploadFilesStub = jest.fn()
      const publishStub = jest.fn()
      const uppyService = mockDeep<UppyService>({
        uploadFiles: uploadFilesStub,
        publish: publishStub,
        getFailedFiles: jest.fn(() => [])
      })
      const filesToUpload = [mockDeep<UppyResource>()]
      const resourcesUpload = getResourcesUploadInstance({ uppyService })
      await resourcesUpload.handleUppyFileUpload(mockDeep<SpaceResource>(), '/', filesToUpload)

      expect(publishStub).toHaveBeenCalledWith('uploadStarted')
      expect(publishStub).toHaveBeenCalledTimes(2)
      expect(uploadFilesStub).toHaveBeenCalledWith(filesToUpload)
    })
    it('should not call uploadFiles when having no files to upload', async () => {
      const uploadFilesStub = jest.fn()
      const publishStub = jest.fn()
      const uppyService = mockDeep<UppyService>({
        uploadFiles: uploadFilesStub,
        publish: publishStub,
        getFailedFiles: jest.fn(() => [])
      })
      const filesToUpload = []
      const resourcesUpload = getResourcesUploadInstance({ uppyService })
      await resourcesUpload.handleUppyFileUpload(mockDeep<SpaceResource>(), '/', filesToUpload)

      expect(publishStub).toHaveBeenCalledWith('uploadStarted')
      expect(publishStub).toHaveBeenCalledTimes(2)
      expect(uploadFilesStub).toHaveBeenCalledTimes(0)
    })
    it('should filter out files of which the folder creation failed', async () => {
      const createDirectoryTreeStub = jest
        .fn()
        .mockImplementation(() => ({ failed: ['/parent'], successful: [] }))
      const uploadFilesStub = jest.fn()
      const publishStub = jest.fn()
      const uppyService = mockDeep<UppyService>({
        uploadFiles: uploadFilesStub,
        publish: publishStub,
        getFailedFiles: jest.fn(() => [])
      })
      const filesToUpload = [mockDeep<UppyResource>({ meta: { relativeFolder: '/parent' } })]
      const resourcesUpload = getResourcesUploadInstance({
        uppyService,
        createDirectoryTree: createDirectoryTreeStub
      })
      await resourcesUpload.handleUppyFileUpload(mockDeep<SpaceResource>(), '/', filesToUpload)

      expect(publishStub).toHaveBeenCalledWith('uploadStarted')
      expect(publishStub).toHaveBeenCalledTimes(2)
      expect(uploadFilesStub).toHaveBeenCalledTimes(0)
    })
    it('should filter out retries', async () => {
      const uploadFilesStub = jest.fn()
      const publishStub = jest.fn()
      const retryUploadStub = jest.fn()
      const filesToUpload = [mockDeep<UppyResource>()]
      const uppyService = mockDeep<UppyService>({
        uploadFiles: uploadFilesStub,
        publish: publishStub,
        retryUpload: retryUploadStub,
        getFailedFiles: jest.fn(() => filesToUpload)
      })
      const resourcesUpload = getResourcesUploadInstance({ uppyService })
      await resourcesUpload.handleUppyFileUpload(mockDeep<SpaceResource>(), '/', filesToUpload)

      expect(publishStub).toHaveBeenCalledWith('uploadStarted')
      expect(publishStub).toHaveBeenCalledTimes(2)
      expect(retryUploadStub).toHaveBeenCalled()
      expect(uploadFilesStub).not.toHaveBeenCalled()
    })
  })

  describe('method "displayOverwriteDialog"', () => {
    it.each([ResolveStrategy.REPLACE, ResolveStrategy.KEEP_BOTH])(
      'should upload file if user chooses replace or keep both',
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

        const handleUppyFileUpload = jest.fn()
        const space = mockDeep<SpaceResource>()
        const currentFolder = '/'
        const resourcesUpload = getResourcesUploadInstance({ space, currentFolder })
        resourcesUpload.handleUppyFileUpload = handleUppyFileUpload
        const resolveFileConflictMethod = jest.fn(() =>
          Promise.resolve({ strategy, doForAllConflicts: true })
        )
        resourcesUpload.resolveFileExists = resolveFileConflictMethod

        await resourcesUpload.displayOverwriteDialog([uppyResource], [conflict])

        expect(resolveFileConflictMethod).toHaveBeenCalledTimes(1)
        expect(handleUppyFileUpload).toHaveBeenCalledTimes(1)
        expect(handleUppyFileUpload).toHaveBeenCalledWith(space, currentFolder, [uppyResource])
      }
    )
    it('should not upload file if user chooses skip', async () => {
      const uppyResource = mockDeep<UppyResource>({ name: 'test' })
      const conflict = { name: uppyResource.name, type: 'file' }

      const resourcesUpload = getResourcesUploadInstance()
      resourcesUpload.handleUppyFileUpload = jest.fn()
      const resolveFileConflictMethod = jest.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.SKIP, doForAllConflicts: true })
      )
      resourcesUpload.resolveFileExists = resolveFileConflictMethod

      await resourcesUpload.displayOverwriteDialog([uppyResource], [conflict])

      expect(resolveFileConflictMethod).toHaveBeenCalledTimes(1)
      expect(resourcesUpload.handleUppyFileUpload).not.toHaveBeenCalled()
    })
    it('should show dialog once if do for all conflicts is ticked', async () => {
      const uppyResourceOne = mockDeep<UppyResource>({ name: 'test' })
      const uppyResourceTwo = mockDeep<UppyResource>({ name: 'test2' })
      const conflictOne = { name: uppyResourceOne.name, type: 'file' }
      const conflictTwo = { name: uppyResourceTwo.name, type: 'file' }

      const space = mockDeep<SpaceResource>()
      const currentFolder = '/'
      const resourcesUpload = getResourcesUploadInstance({ space, currentFolder })
      resourcesUpload.handleUppyFileUpload = jest.fn()
      const resolveFileConflictMethod = jest.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.REPLACE, doForAllConflicts: true })
      )
      resourcesUpload.resolveFileExists = resolveFileConflictMethod

      await resourcesUpload.displayOverwriteDialog(
        [uppyResourceOne, uppyResourceTwo],
        [conflictOne, conflictTwo]
      )

      expect(resolveFileConflictMethod).toHaveBeenCalledTimes(1)
      expect(resourcesUpload.handleUppyFileUpload).toHaveBeenCalledTimes(1)
      expect(resourcesUpload.handleUppyFileUpload).toHaveBeenCalledWith(space, currentFolder, [
        uppyResourceOne,
        uppyResourceTwo
      ])
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

      const space = mockDeep<SpaceResource>()
      const currentFolder = '/'
      const resourcesUpload = getResourcesUploadInstance({ space, currentFolder })
      resourcesUpload.handleUppyFileUpload = jest.fn()
      resourcesUpload.resolveFileExists = jest.fn(() =>
        Promise.resolve({ strategy: ResolveStrategy.REPLACE, doForAllConflicts: true })
      )

      await resourcesUpload.displayOverwriteDialog(
        [uppyResourceOne, uppyResourceTwo],
        [conflictOne, conflictTwo]
      )

      expect(resourcesUpload.resolveFileExists).toHaveBeenCalledTimes(2)
      expect(resourcesUpload.handleUppyFileUpload).toHaveBeenCalledTimes(1)
      expect(resourcesUpload.handleUppyFileUpload).toHaveBeenCalledWith(space, currentFolder, [
        uppyResourceOne,
        uppyResourceTwo
      ])
    })
  })
})
