import { ResourceLoader, ResourceNode } from './resourceLoader'
import { buildResource } from '../../../helpers/resources'
import OwnCloud from 'owncloud-sdk'
import { DavProperty } from 'web-pkg/src/constants'

export class FavoritesLoader implements ResourceLoader {
  async loadResources(
    sdk: OwnCloud,
    path: string,
    davProperties: DavProperty[]
  ): Promise<ResourceNode> {
    let resources = await sdk.files.getFavoriteFiles(davProperties)
    resources = resources.map(buildResource)
    return {
      parent: null,
      children: resources
    }
  }
}
