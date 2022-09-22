import { SpaceResource, Resource } from '../helpers'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { ListFilesFactory } from './listFiles'

export interface WebDAV {
  listFiles: (space: SpaceResource, options: { path?: string }) => Promise<Resource[]>
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {
  const listFilesFactory = ListFilesFactory(sdk)

  return {
    listFiles: (space: SpaceResource, options: { path?: string }): Promise<Resource[]> => {
      return listFilesFactory.listFiles(space, options)
    }
  }
}
