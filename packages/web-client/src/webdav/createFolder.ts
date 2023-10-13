import { FolderResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { urlJoin } from '../utils'
import { DAV } from './client/dav'
import { WebDavOptions } from './types'
import { buildAuthHeader } from './client'
import { unref } from 'vue'

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  { accessToken }: WebDavOptions
) => {
  return {
    async createFolder(space: SpaceResource, { path }: { path?: string }): Promise<FolderResource> {
      const headers = buildAuthHeader(unref(accessToken), space)
      await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: true }), { headers })

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}
