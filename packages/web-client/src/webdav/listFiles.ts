import {
  buildDeletedResource,
  buildResource,
  buildWebDavFilesTrashPath,
  Resource,
  WebDavResponseResource
} from '../helpers/resource'
import { DavProperties, DavPropertyValue } from './constants'
import {
  buildPublicSpaceResource,
  buildWebDavSpacesTrashPath,
  isPublicSpaceResource,
  SpaceResource
} from '../helpers'
import { urlJoin } from '../utils'
import { DAV, buildAuthHeader } from './client'
import { GetPathForFileIdFactory } from './getPathForFileId'
import { WebDavOptions } from './types'
import { unref } from 'vue'

export type ListFilesOptions = {
  depth?: number
  davProperties?: DavPropertyValue[]
  isTrash?: boolean
}

export const ListFilesFactory = (
  dav: DAV,
  pathForFileIdFactory: ReturnType<typeof GetPathForFileIdFactory>,
  { accessToken, capabilities }: WebDavOptions
) => {
  return {
    async listFiles(
      space: SpaceResource,
      { path, fileId }: { path?: string; fileId?: string | number } = {},
      { depth = 1, davProperties, isTrash = false }: ListFilesOptions = {}
    ): Promise<ListFilesResult> {
      let webDavResources: WebDavResponseResource[]
      const headers = buildAuthHeader(unref(accessToken), space)
      if (isPublicSpaceResource(space)) {
        webDavResources = await dav.propfind(urlJoin(space.webDavPath, path), {
          depth,
          headers,
          properties: davProperties || DavProperties.PublicLink
        })

        // FIXME: strip out token, ooof
        webDavResources.forEach((r) => {
          r.filename = r.filename.split('/').slice(1).join('/')
        })

        // FIXME: This is a workaround for https://github.com/owncloud/ocis/issues/4758
        if (webDavResources.length === 1) {
          webDavResources[0].filename = urlJoin(space.id, path, {
            leadingSlashes: true
          })
        }

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link root resource knows it's a public link
        webDavResources.forEach((resource) => {
          resource.filename = resource.filename.split('/').slice(2).join('/')
        })

        if (!path) {
          const [rootFolder, ...children] = webDavResources
          return {
            resource: buildPublicSpaceResource({
              ...rootFolder,
              id: space.id,
              driveAlias: space.driveAlias,
              webDavPath: space.webDavPath
            }),
            children: children.map(buildResource)
          } as ListFilesResult
        }
        const resources = webDavResources.map(buildResource)
        return { resource: resources[0], children: resources.slice(1) } as ListFilesResult
      }

      const listFilesCorrectedPath = async () => {
        const correctPath = await pathForFileIdFactory.getPathForFileId(fileId.toString())
        return this.listFiles(space, { path: correctPath }, { depth, davProperties })
      }

      try {
        let webDavPath = urlJoin(space.webDavPath, path)
        if (isTrash) {
          webDavPath = unref(capabilities).spaces?.share_jail
            ? buildWebDavSpacesTrashPath(space.id.toString())
            : buildWebDavFilesTrashPath(space.id.toString())
        }

        webDavResources = await dav.propfind(webDavPath, {
          depth,
          headers,
          properties: davProperties || DavProperties.Default
        })
        if (isTrash) {
          return {
            resource: buildResource(webDavResources[0]),
            children: webDavResources.slice(1).map(buildDeletedResource)
          } as ListFilesResult
        }
        const resources = webDavResources.map(buildResource)
        if (fileId && fileId !== resources[0].fileId) {
          return listFilesCorrectedPath()
        }
        return { resource: resources[0], children: resources.slice(1) } as ListFilesResult
      } catch (e) {
        if (e.statusCode === 404 && fileId) {
          return listFilesCorrectedPath()
        }
        throw e
      }
    }
  }
}
export interface ListFilesResult {
  resource: Resource
  children?: Resource[]
}
