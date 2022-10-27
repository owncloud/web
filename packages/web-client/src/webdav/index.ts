import { WebDAV, WebDavOptions } from './types'
import { CopyFilesFactory } from './copyFiles'
import { CreateFolderFactory } from './createFolder'
import { GetFileContentsFactory } from './getFileContents'
import { GetFileInfoFactory } from './getFileInfo'
import { GetFileUrlFactory } from './getFileUrl'
import { ListFilesFactory } from './listFiles'
import { MoveFilesFactory } from './moveFiles'
import { PutFileContentsFactory } from './putFileContents'
import { DeleteFileFactory } from './deleteFile'
import { RestoreFileFactory } from './restoreFile'

export * from './types'

export const webdav = (options: WebDavOptions): WebDAV => {
  const listFilesFactory = ListFilesFactory(options)
  const { listFiles } = listFilesFactory

  const getFileInfoFactory = GetFileInfoFactory(listFilesFactory, options)
  const { getFileInfo } = getFileInfoFactory

  const { createFolder } = CreateFolderFactory(getFileInfoFactory, options)
  const getFileContentsFactory = GetFileContentsFactory(options)
  const { getFileContents } = getFileContentsFactory
  const { putFileContents } = PutFileContentsFactory(getFileInfoFactory, options)

  const { getFileUrl, revokeUrl } = GetFileUrlFactory(getFileContentsFactory, options)

  const { copyFiles } = CopyFilesFactory(options)
  const { moveFiles } = MoveFilesFactory(options)

  const { deleteFile } = DeleteFileFactory(options)
  const { restoreFile } = RestoreFileFactory(options)

  return {
    copyFiles,
    createFolder,
    deleteFile,
    restoreFile,
    getFileContents,
    getFileInfo,
    getFileUrl,
    listFiles,
    moveFiles,
    putFileContents,
    revokeUrl
  }
}
