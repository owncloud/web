import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'
import { DAV, buildPublicLinkAuthHeader } from './client'
import { ProgressEventCallback } from 'webdav'

export const PutFileContentsFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async putFileContents(
      space: SpaceResource,
      {
        path,
        content = '',
        previousEntityTag = '',
        headers = {},
        overwrite,
        onUploadProgress = null
      }: {
        path?: string
        content?: string
        previousEntityTag?: string
        headers?: Record<string, string>
        overwrite?: boolean
        onUploadProgress?: ProgressEventCallback
      }
    ) {
      if (isPublicSpaceResource(space)) {
        headers.Authorization = null
        if (space.publicLinkPassword) {
          headers.Authorization = buildPublicLinkAuthHeader(space.publicLinkPassword)
        }
      }

      await dav.put(urlJoin(space.webDavPath, path), content, {
        previousEntityTag,
        overwrite,
        onUploadProgress,
        headers
      })

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}
