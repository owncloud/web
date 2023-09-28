import { OwnCloudSdk } from '../types'
import { CreateFolderFactory } from './createFolder'
import { GetFileContentsFactory } from './getFileContents'
import { GetFileInfoFactory } from './getFileInfo'
import { GetFileUrlFactory } from './getFileUrl'
import { GetPublicFileUrlFactory } from './getPublicFileUrl'
import { ListFilesFactory } from './listFiles'
import { PutFileContentsFactory } from './putFileContents'
import { CopyFilesFactory } from './copyFiles'
import { MoveFilesFactory } from './moveFiles'
import { DeleteFileFactory } from './deleteFile'
import { RestoreFileFactory } from './restoreFile'
import { RestoreFileVersionFactory } from './restoreFileVersion'
import { ClearTrashBinFactory } from './clearTrashBin'
import { SearchFactory } from './search'
import { GetPathForFileIdFactory } from './getPathForFileId'

export interface WebDavOptions {
  sdk: OwnCloudSdk
}

export interface WebDAV {
  getFileInfo: ReturnType<typeof GetFileInfoFactory>['getFileInfo']
  getFileUrl: ReturnType<typeof GetFileUrlFactory>['getFileUrl']
  getPublicFileUrl: ReturnType<typeof GetPublicFileUrlFactory>['getPublicFileUrl']
  revokeUrl: ReturnType<typeof GetFileUrlFactory>['revokeUrl']
  listFiles: ReturnType<typeof ListFilesFactory>['listFiles']
  createFolder: ReturnType<typeof CreateFolderFactory>['createFolder']
  getFileContents: ReturnType<typeof GetFileContentsFactory>['getFileContents']
  putFileContents: ReturnType<typeof PutFileContentsFactory>['putFileContents']
  getPathForFileId: ReturnType<typeof GetPathForFileIdFactory>['getPathForFileId']
  copyFiles: ReturnType<typeof CopyFilesFactory>['copyFiles']
  moveFiles: ReturnType<typeof MoveFilesFactory>['moveFiles']
  deleteFile: ReturnType<typeof DeleteFileFactory>['deleteFile']
  restoreFile: ReturnType<typeof RestoreFileFactory>['restoreFile']
  restoreFileVersion: ReturnType<typeof RestoreFileVersionFactory>['restoreFileVersion']
  clearTrashBin: ReturnType<typeof ClearTrashBinFactory>['clearTrashBin']
  search: ReturnType<typeof SearchFactory>['search']
}
