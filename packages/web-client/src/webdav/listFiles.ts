import { buildResource } from 'files/src/helpers/resources'
import { DavProperties } from 'web-pkg/src/constants'
import { isPublicSpaceResource, Resource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const ListFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    async listFiles(
      space: SpaceResource,
      { path, depth = 1 }: { path?: string; depth?: number }
    ): Promise<Resource[]> {
      let resources: Resource[]
      if (isPublicSpaceResource(space)) {
        resources = await sdk.publicFiles.list(
          `${space.webDavPath.replace(/^\/public-files/, '')}/${path || ''}`,
          space.publicLinkPassword,
          DavProperties.PublicLink,
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
          DavProperties.Default
        )
      }

      return resources.map(buildResource)
    }
  }
}
