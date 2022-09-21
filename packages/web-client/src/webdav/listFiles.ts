import { buildResource } from 'files/src/helpers/resources'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { isPublicSpaceResource, Resource, SpaceResource } from '../helpers'

export const GetListFilesFactory = (sdk: OwnCloudSdk) => {
  return {
    async listFiles(space: SpaceResource, { path, publicLinkPassword }: { path?: string, publicLinkPassword?: string }): Promise<Resource[]> {

      let resources: Resource[]
      if (isPublicSpaceResource(space)) {
        resources = await sdk.publicFiles.list(
          `${space.webDavPath}/${path}`.replace(/^\/public-files/, ''),
          publicLinkPassword,
          DavProperties.PublicLink
        )

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link resource itself knows it's a public link
        resources.forEach(resource => {
          console.log('resources', resource)
          resource.name = resource.name.split('/').slice(2).join('/')
        })
      } else {
        // FIXME: why does typescript assign type never here? Not every Resource is a PublicSpaceResource
        space = space as SpaceResource
        resources = await sdk.files.list(`${space.webDavPath}/${path}`, 1, DavProperties.Default)
      }

      return resources.map(buildResource)
    }
  }
}
