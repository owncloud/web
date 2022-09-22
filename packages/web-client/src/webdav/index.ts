import { SpaceResource, Resource } from '../helpers'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { ListFilesFactory } from './listFiles'
import { GetFileInfoFactory } from './getFileInfo'

export interface WebDAV {
  getFileInfo: (space: SpaceResource, options: { path?: string }) => Promise<Resource>
  listFiles: (space: SpaceResource, options: { path?: string }) => Promise<Resource[]>
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {
  const getFileInfoFactory = GetFileInfoFactory(sdk)
  const listFilesFactory = ListFilesFactory(sdk)

  return {
    getFileInfo: (space: SpaceResource, options: { path?: string } = {}): Promise<Resource> => {
      return getFileInfoFactory.getFileInfo(space, options)
    },
    listFiles: (space: SpaceResource, options: { path?: string } = {}): Promise<Resource[]> => {
      return listFilesFactory.listFiles(space, options)
    }
  }
}
