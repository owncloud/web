import { ListFilesFactory } from './listFiles'
import { GetFileInfoFactory } from './getFileInfo'
import { CreateFolderFactory } from './createFolder'
import { PutFileContentsFactory } from './putFileContents'
import { GetFileContentsFactory } from './getFileContents'
import { WebDAV, WebDavOptions } from './types'
import { GetFileUrlFactory } from './getFileUrl'

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

  return {
    createFolder,
    getFileInfo,
    listFiles,
    getFileContents,
    putFileContents
  }
}
