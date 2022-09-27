import { buildResource } from 'files/src/helpers/resources'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import {
  buildPublicSpaceResource,
  isPublicSpaceResource,
  Resource,
  SpaceResource
} from '../helpers'
import { WebDavOptions } from './types'
import urlJoin from 'url-join'

export type ListFilesOptions = {
  depth?: number
  davProperties?: DavProperty[]
}

export const ListFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    async listFiles(
      space: SpaceResource,
      { path }: { path?: string } = {},
      { depth = 1, davProperties }: ListFilesOptions = {}
    ): Promise<Resource[]> {
      let webDavResources: any[]
      if (isPublicSpaceResource(space)) {
        webDavResources = await sdk.publicFiles.list(
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          space.publicLinkPassword,
          davProperties || DavProperties.PublicLink,
          `${depth}`
        )

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link root resource knows it's a public link
        webDavResources.forEach((resource) => {
          resource.name = resource.name.split('/').slice(2).join('/')
        })
        if (!path) {
          const [rootFolder, ...children] = webDavResources
          return [buildPublicSpaceResource(rootFolder), ...children.map(buildResource)]
        }
        return webDavResources.map(buildResource)
      }

      webDavResources = await sdk.files.list(
        urlJoin(space.webDavPath, path),
        `${depth}`,
        davProperties || DavProperties.Default
      )
      return webDavResources.map(buildResource)
    }
  }
}
