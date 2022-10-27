import { buildResource } from '../helpers/resource'
import { DavProperties, DavProperty } from './constants'
import {
  buildPublicSpaceResource,
  isPublicSpaceResource,
  PropfindResult,
  SpaceResource
} from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'

export type ListFilesOptions = {
  depth?: number
  davProperties?: DavProperty[]
}

export const ListFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    async listFiles(
      space: SpaceResource,
      { path, fileId }: { path?: string; fileId?: string | number } = {},
      { depth = 1, davProperties }: ListFilesOptions = {}
    ): Promise<PropfindResult> {
      let webDavResources: any[]
      if (isPublicSpaceResource(space)) {
        webDavResources = await sdk.publicFiles.list(
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          space.publicLinkPassword,
          davProperties || DavProperties.PublicLink,
          `${depth}`
        )

        // FIXME: This is a workaround for https://github.com/owncloud/ocis/issues/4758
        if (webDavResources.length === 1) {
          webDavResources[0].name = urlJoin(space.id, path, {
            leadingSlashes: true
          })
        }

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link root resource knows it's a public link
        webDavResources.forEach((resource) => {
          resource.name = resource.name.split('/').slice(2).join('/')
        })
        if (!path) {
          const [rootFolder, ...children] = webDavResources
          return {
            node: buildPublicSpaceResource(rootFolder),
            children: children.map(buildResource)
          } as PropfindResult
        }
        const resources = webDavResources.map(buildResource)
        return { node: resources[0], children: resources.slice(1) } as PropfindResult
      }

      const listFilesCorrectedPath = async () => {
        const correctPath = await sdk.files.getPathForFileId(fileId)
        return this.listFiles(space, { path: correctPath }, { depth, davProperties })
      }

      try {
        webDavResources = await sdk.files.list(
          urlJoin(space.webDavPath, path),
          `${depth}`,
          davProperties || DavProperties.Default
        )
        const resources = webDavResources.map(buildResource)
        if (fileId && fileId !== resources[0].fileId) {
          return listFilesCorrectedPath()
        }
        return { node: resources[0], children: resources.slice(1) } as PropfindResult
      } catch (e) {
        if (e.statusCode === 404 && fileId) {
          return listFilesCorrectedPath()
        }
        throw e
      }
    }
  }
}
