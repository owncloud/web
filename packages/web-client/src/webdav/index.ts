import { OwnCloudSdk } from 'web-pkg/src/services'
import { ListFilesFactory } from './listFiles'
import { GetFileInfoFactory } from './getFileInfo'
import { CreateFolderFactory } from './createFolder'
import { PutFileContentsFactory } from './putFileContents'

export interface WebDAV {
  getFileInfo: ReturnType<typeof GetFileInfoFactory>['getFileInfo']
  listFiles: ReturnType<typeof ListFilesFactory>['listFiles']
  createFolder: ReturnType<typeof CreateFolderFactory>['createFolder']
  putFileContents: ReturnType<typeof PutFileContentsFactory>['putFileContents']
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {
  const listFilesFactory = ListFilesFactory(sdk)
  const { listFiles } = listFilesFactory

  const getFileInfoFactory = GetFileInfoFactory(listFilesFactory, sdk)
  const { getFileInfo } = getFileInfoFactory

  const { createFolder } = CreateFolderFactory(getFileInfoFactory, sdk)
  const { putFileContents } = PutFileContentsFactory(getFileInfoFactory, sdk)

  return {
    createFolder,
    getFileInfo,
    listFiles,
    putFileContents
  }
}
