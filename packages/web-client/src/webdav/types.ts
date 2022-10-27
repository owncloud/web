import { OwnCloudSdk } from '../types'
import { CreateFolderFactory } from './createFolder'
import { GetFileContentsFactory } from './getFileContents'
import { GetFileInfoFactory } from './getFileInfo'
import { GetFileUrlFactory } from './getFileUrl'
import { ListFilesFactory } from './listFiles'
import { PutFileContentsFactory } from './putFileContents'
import { CopyFilesFactory } from './copyFiles'
import { MoveFilesFactory } from './moveFiles'
import { DeleteFileFactory } from './deleteFile'
import { RestoreFileFactory } from './restoreFile'

export interface WebDavOptions {
  sdk: OwnCloudSdk
}

export interface WebDAV {
  getFileInfo: ReturnType<typeof GetFileInfoFactory>['getFileInfo']
  getFileUrl: ReturnType<typeof GetFileUrlFactory>['getFileUrl']
  revokeUrl: ReturnType<typeof GetFileUrlFactory>['revokeUrl']
  listFiles: ReturnType<typeof ListFilesFactory>['listFiles']
  createFolder: ReturnType<typeof CreateFolderFactory>['createFolder']
  getFileContents: ReturnType<typeof GetFileContentsFactory>['getFileContents']
  putFileContents: ReturnType<typeof PutFileContentsFactory>['putFileContents']
  copyFiles: ReturnType<typeof CopyFilesFactory>['copyFiles']
  moveFiles: ReturnType<typeof MoveFilesFactory>['moveFiles']
  deleteFile: ReturnType<typeof DeleteFileFactory>['deleteFile']
  restoreFile: ReturnType<typeof RestoreFileFactory>['restoreFile']
}
