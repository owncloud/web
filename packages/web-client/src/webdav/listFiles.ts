import { buildResource } from 'files/src/helpers/resources'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { isPublicSpaceResource, Resource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export type ListFilesOptions = {
  depth?: number
  davProperties?: DavProperty[]
}

export const ListFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    async listFiles(
      space: SpaceResource,
      { path }: { path?: string },
      { depth = 1, davProperties }: ListFilesOptions = {}
    ): Promise<Resource[]> {
      let resources: Resource[]
      if (isPublicSpaceResource(space)) {
        resources = await sdk.publicFiles.list(
          `${space.webDavPath.replace(/^\/public-files/, '')}/${path || ''}`,
          space.publicLinkPassword,
          davProperties || [DavProperties.PublicLink],
          `${depth}`
        )

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link root resource knows it's a public link
        resources.forEach((resource) => {
          resource.name = resource.name.split('/').slice(2).join('/')
        })
      } else {
        resources = await sdk.files.list(
          `${space.webDavPath}/${path || ''}`,
          `${depth}`,
          davProperties || DavProperties.Default
        )
      }

      return resources.map(buildResource)
    }
  }
}
