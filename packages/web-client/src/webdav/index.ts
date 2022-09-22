import { SpaceResource, Resource, FolderResource } from '../helpers'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { ListFilesFactory } from './listFiles'
import { GetFileInfoFactory } from './getFileInfo'
import { CreateFolderFactory } from './createFolder'

export interface WebDAV {
  getFileInfo: (space: SpaceResource, options: { path?: string }) => Promise<Resource>
  listFiles: (space: SpaceResource, options: { path?: string }) => Promise<Resource[]>
  createFolder: (space: SpaceResource, options: { path: string }) => Promise<FolderResource>
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {
  const listFilesFactory = ListFilesFactory(sdk)
  const { listFiles } = listFilesFactory

  const getFileInfoFactory = GetFileInfoFactory(listFilesFactory, sdk)
  const { getFileInfo } = getFileInfoFactory

  const { createFolder } = CreateFolderFactory(getFileInfoFactory, sdk)

  return {
    getFileInfo,
    listFiles,
    createFolder
  }
}
