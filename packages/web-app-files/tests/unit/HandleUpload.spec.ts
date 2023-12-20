import Uppy, { UppyFile, State, UIPlugin } from '@uppy/core'
import { HandleUpload } from '../../src/HandleUpload'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { ref, unref } from 'vue'
import {
  ClientService,
  UppyService,
  UppyResource,
  locationSpacesGeneric,
  useUserStore
} from '@ownclouders/web-pkg'
import { Language } from 'vue3-gettext'
import { ResourceConflict } from 'web-app-files/src/helpers/resource/actions'
import { createTestingPinia } from 'web-test-helpers'

jest.mock('web-app-files/src/helpers/resource/actions')

describe('HandleUpload', () => {
  it('installs the handleUpload callback when files are being added', () => {
    const { instance, mocks } = getWrapper()
    instance.install()
    expect(mocks.uppy.on).toHaveBeenCalledWith('files-added', instance.handleUpload)
  })
  it('uninstalls the handleUpload callback when files are being added', () => {
    const { instance, mocks } = getWrapper()
    instance.uninstall()
    expect(mocks.uppy.off).toHaveBeenCalledWith('files-added', instance.handleUpload)
  })
  it('removes files from the uppy upload queue', () => {
    const { instance, mocks } = getWrapper()
    const fileToRemove = mock<UppyResource>()
    instance.removeFilesFromUpload([fileToRemove])
    expect(mocks.uppy.removeFile).toHaveBeenCalledWith(fileToRemove.id)
  })
  it('correctly prepares all files that need to be uploaded', () => {
    const { instance, mocks } = getWrapper()
    mocks.uppy.getPlugin.mockReturnValue(mock<UIPlugin>())
    const fileToUpload = mock<UppyFile>({ name: 'name' })
    const processedFiles = instance.prepareFiles([fileToUpload])

    const currentFolder = mocks.opts.store.getters['Files/currentFolder']
    const route = unref(mocks.opts.route)

    expect(processedFiles[0].tus.endpoint).toEqual('/')
    expect(processedFiles[0].meta.name).toEqual(fileToUpload.name)
    expect(processedFiles[0].meta.spaceId).toEqual(mocks.opts.space.id)
    expect(processedFiles[0].meta.spaceName).toEqual(mocks.opts.space.name)
    expect(processedFiles[0].meta.driveAlias).toEqual(mocks.opts.space.driveAlias)
    expect(processedFiles[0].meta.driveType).toEqual(mocks.opts.space.driveType)
    expect(processedFiles[0].meta.currentFolder).toEqual(currentFolder.path)
    expect(processedFiles[0].meta.currentFolderId).toEqual(currentFolder.id)
    expect(processedFiles[0].meta.tusEndpoint).toEqual(currentFolder.path)
    expect(processedFiles[0].meta.relativeFolder).toEqual('')
    expect(processedFiles[0].meta.routeName).toEqual(route.name)
    expect(processedFiles[0].meta.routeDriveAliasAndItem).toEqual(route.params.driveAliasAndItem)
    expect(processedFiles[0].meta.routeShareId).toEqual(route.query.shareId)
  })
  describe('method createDirectoryTree', () => {
    it('creates a directory for a single file with a relative folder given', async () => {
      const { instance, mocks } = getWrapper()
      mocks.uppy.getPlugin.mockReturnValue(mock<UIPlugin>())
      const relativeFolder = '/relativeFolder'
      const fileToUpload = mock<UppyResource>({ name: 'name', meta: { relativeFolder } })
      const createdFolder = mock<Resource>()
      mocks.opts.clientService.webdav.createFolder.mockResolvedValue(createdFolder)

      const result = await instance.createDirectoryTree([fileToUpload])
      const currentFolder = mocks.opts.store.getters['Files/currentFolder']

      expect(mocks.opts.uppyService.publish).toHaveBeenCalledWith(
        'uploadSuccess',
        expect.objectContaining({
          name: relativeFolder.split('/')[1],
          isFolder: true,
          type: 'folder',
          meta: expect.objectContaining({
            spaceId: mocks.opts.space.id,
            spaceName: mocks.opts.space.name,
            driveAlias: mocks.opts.space.driveAlias,
            driveType: mocks.opts.space.driveType,
            currentFolder: currentFolder.path,
            currentFolderId: currentFolder.id,
            relativeFolder: '',
            routeName: fileToUpload.meta.routeName,
            routeDriveAliasAndItem: fileToUpload.meta.routeDriveAliasAndItem,
            routeShareId: fileToUpload.meta.routeShareId,
            fileId: createdFolder.fileId
          })
        })
      )
      expect(mocks.opts.clientService.webdav.createFolder).toHaveBeenCalledTimes(1)
      expect(mocks.opts.clientService.webdav.createFolder).toHaveBeenCalledWith(mocks.opts.space, {
        path: relativeFolder,
        fetchFolder: true
      })
      expect(result.length).toBe(1)
    })
    it('filters out files whose folders could not be created', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { instance, mocks } = getWrapper()
      mocks.uppy.getPlugin.mockReturnValue(mock<UIPlugin>())
      const relativeFolder = '/relativeFolder'
      const fileToUpload = mock<UppyResource>({ name: 'name', meta: { relativeFolder } })
      mocks.opts.clientService.webdav.createFolder.mockRejectedValue({})

      const result = await instance.createDirectoryTree([fileToUpload])

      expect(mocks.opts.uppyService.publish).toHaveBeenCalledWith('uploadError', expect.anything())
      expect(mocks.uppy.removeFile).toHaveBeenCalled()
      expect(result.length).toBe(0)
    })
  })
  describe('method handleUpload', () => {
    it('prepares files and eventually triggers the upload in uppy', async () => {
      const { instance, mocks } = getWrapper()
      const prepareFilesSpy = jest.spyOn(instance, 'prepareFiles')
      await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
      expect(prepareFilesSpy).toHaveBeenCalledTimes(1)
      expect(mocks.opts.uppyService.publish).toHaveBeenCalledWith(
        'addedForUpload',
        expect.anything()
      )
      expect(mocks.opts.uppyService.uploadFiles).toHaveBeenCalledTimes(1)
    })
    describe('quota check', () => {
      it('checks quota if check enabled', async () => {
        const { instance } = getWrapper()
        const checkQuotaExceededSpy = jest.spyOn(instance, 'checkQuotaExceeded')
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(checkQuotaExceededSpy).toHaveBeenCalled()
      })
      it('does not check quota if check disabled', async () => {
        const { instance } = getWrapper({ quotaCheckEnabled: false })
        const checkQuotaExceededSpy = jest.spyOn(instance, 'checkQuotaExceeded')
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(checkQuotaExceededSpy).not.toHaveBeenCalled()
      })
      it.each([
        { size: 100, remaining: 90, driveType: 'project', quotaExceeded: true },
        { size: 10, remaining: 90, driveType: 'project', quotaExceeded: false },
        { size: 100, remaining: 90, driveType: 'personal', quotaExceeded: true },
        { size: 10, remaining: 90, driveType: 'personal', quotaExceeded: false }
      ])(
        'returns a correct result after quota has been checked for own personal and project spaces',
        async ({ size, remaining, driveType, quotaExceeded }) => {
          const space = mock<SpaceResource>({
            driveType,
            id: '1',
            spaceQuota: { remaining },
            isOwner: () => true
          })
          const { instance } = getWrapper({ spaces: [space] })
          const result = await instance.checkQuotaExceeded([
            mock<UppyResource>({
              name: 'name',
              meta: { spaceId: '1', routeName: locationSpacesGeneric.name as any },
              data: { size }
            })
          ])
          expect(result).toBe(quotaExceeded)
        }
      )
      it('does not check quota for share spaces', async () => {
        const size = 100
        const remaining = 90
        const space = mock<SpaceResource>({
          driveType: 'share',
          id: '1',
          spaceQuota: { remaining }
        })
        const { instance } = getWrapper({ spaces: [space] })
        const result = await instance.checkQuotaExceeded([
          mock<UppyResource>({
            name: 'name',
            meta: { spaceId: '1', routeName: locationSpacesGeneric.name as any },
            data: { size }
          })
        ])
        expect(result).toBeFalsy()
      })
      it("does not check quota for other's personal spaces", async () => {
        const size = 100
        const remaining = 90
        const space = mock<SpaceResource>({
          driveType: 'personal',
          id: '1',
          spaceQuota: { remaining },
          isOwner: () => false
        })
        const { instance } = getWrapper({ spaces: [space] })
        const result = await instance.checkQuotaExceeded([
          mock<UppyResource>({
            name: 'name',
            meta: { spaceId: '1', routeName: locationSpacesGeneric.name as any },
            data: { size }
          })
        ])
        expect(result).toBeFalsy()
      })
    })
    describe('conflict handling check', () => {
      it('checks for conflicts if check enabled', async () => {
        const { instance, mocks } = getWrapper()
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(mocks.resourceConflict.getConflicts).toHaveBeenCalled()
      })
      it('does not check for conflicts if check disabled', async () => {
        const { instance, mocks } = getWrapper({ conflictHandlingEnabled: false })
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(mocks.resourceConflict.getConflicts).not.toHaveBeenCalled()
      })
      it('does not start upload if all files were skipped in conflict handling', async () => {
        const { instance, mocks } = getWrapper({ conflicts: [{}], conflictHandlerResult: [] })
        const removeFilesFromUploadSpy = jest.spyOn(instance, 'removeFilesFromUpload')

        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(mocks.opts.uppyService.uploadFiles).not.toHaveBeenCalled()
        expect(mocks.opts.uppyService.clearInputs).toHaveBeenCalled()
        expect(removeFilesFromUploadSpy).toHaveBeenCalled()
      })
      it('sets the result of the conflict handler as uppy file state', async () => {
        const conflictHandlerResult = [mock<UppyResource>({ id: '1' })]
        const { instance, mocks } = getWrapper({ conflicts: [{}], conflictHandlerResult })
        await instance.handleUpload([mock<UppyFile>(), mock<UppyFile>()])

        expect(mocks.uppy.setState).toHaveBeenCalledWith({
          files: { [conflictHandlerResult[0].id]: conflictHandlerResult[0] }
        })
      })
    })
    describe('create directory tree', () => {
      it('creates the directly tree if enabled', async () => {
        const { instance } = getWrapper()
        const createDirectoryTreeSpy = jest.spyOn(instance, 'createDirectoryTree')
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(createDirectoryTreeSpy).toHaveBeenCalled()
      })
      it('does not create the directly tree if disabled', async () => {
        const { instance } = getWrapper({ directoryTreeCreateEnabled: false })
        const createDirectoryTreeSpy = jest.spyOn(instance, 'createDirectoryTree')
        await instance.handleUpload([mock<UppyFile>({ name: 'name' })])
        expect(createDirectoryTreeSpy).not.toHaveBeenCalled()
      })
    })
  })
})

const getWrapper = ({
  conflictHandlingEnabled = true,
  directoryTreeCreateEnabled = true,
  quotaCheckEnabled = true,
  conflicts = [],
  conflictHandlerResult = [],
  spaces = []
} = {}) => {
  const resourceConflict = mock<ResourceConflict>()
  resourceConflict.getConflicts.mockReturnValue(conflicts)
  resourceConflict.displayOverwriteDialog.mockResolvedValue(conflictHandlerResult)
  jest.mocked(ResourceConflict).mockImplementation(() => resourceConflict)

  const store = {
    getters: {
      'Files/currentFolder': mock<Resource>({ path: '/' }),
      'Files/files': [mock<Resource>()],
      'runtime/spaces/spaces': spaces
    },
    dispatch: jest.fn()
  } as any
  const route = mock<RouteLocationNormalizedLoaded>()
  route.params.driveAliasAndItem = '1'
  route.query.shareId = '1'

  const uppy = mockDeep<Uppy>()
  uppy.getState.mockReturnValue(mock<State>({ files: {} }))

  const opts = {
    clientService: mockDeep<ClientService>(),
    hasSpaces: ref(true),
    language: mock<Language>(),
    route: ref(route),
    store,
    userStore: useUserStore(createTestingPinia()),
    space: mock<SpaceResource>(),
    uppyService: mock<UppyService>(),
    conflictHandlingEnabled,
    directoryTreeCreateEnabled,
    quotaCheckEnabled
  }

  const mocks = { uppy, opts, resourceConflict }
  const instance = new HandleUpload(uppy, opts)
  return { instance, mocks }
}
