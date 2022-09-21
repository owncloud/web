import { SpaceResource, Resource } from '../helpers'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { GetListFilesFactory } from './listFiles'
import { DavProperty } from 'web-pkg/src/constants'

export interface WebDAV {
  listFiles: (space: SpaceResource, options: { path?: string, publicLinkPassword?: string }) => Promise<Resource[]>
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {
  const listFilesFactory = GetListFilesFactory(sdk)

  return {
    listFiles: (space: SpaceResource, options: { path?: string, publicLinkPassword?: string }): Promise<Resource[]> => {
      return listFilesFactory.listFiles(space, options)
    }
  }
}
