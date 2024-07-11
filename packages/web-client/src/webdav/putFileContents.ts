import { urlJoin } from '../utils'
import { extractNodeId, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'
import { DAV, DAVRequestOptions } from './client'
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
        fileName,
        fileId,
        path,
        content = '',
        previousEntityTag = '',
        overwrite,
        onUploadProgress = null,
        ...opts
      }: {
        fileName?: string
        fileId?: string
        path?: string
        content?: string | ArrayBuffer
        previousEntityTag?: string
        overwrite?: boolean
        onUploadProgress?: ProgressEventCallback
      } & DAVRequestOptions
    ) {
      let webDavPath = urlJoin(space.webDavPath, path)
      if (fileId && !isPublicSpaceResource(space)) {
        webDavPath = urlJoin(`${space.webDavPath}!${extractNodeId(fileId)}`, fileName)
      }

      const { result } = await dav.put(webDavPath, content, {
        previousEntityTag,
        overwrite,
        onUploadProgress,
        ...opts
      })

      return getFileInfoFactory.getFileInfo(space, {
        fileId: result.headers.get('Oc-Fileid'),
        path
      })
    }
  }
}
