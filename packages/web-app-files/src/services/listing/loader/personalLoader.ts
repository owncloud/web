import { ResourceLoader, ResourceNode } from './resourceLoader'
import { buildResource } from '../../../helpers/resources'
import OwnCloud from 'owncloud-sdk'
import { DavProperty } from 'web-pkg/src/constants'

export class PersonalLoader implements ResourceLoader {
  async loadResources(
    sdk: OwnCloud,
    path: string,
    davProperties: DavProperty[]
  ): Promise<ResourceNode> {
    let resources = await sdk.files.list(path, 1, davProperties)
    resources = resources.map(buildResource)
    const currentFolder = resources.shift()
    return {
      parent: currentFolder,
      children: resources
    }
  }
}
