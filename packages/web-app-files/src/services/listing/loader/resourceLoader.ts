import { Resource } from '../../../types/resource'
import { DavProperty } from 'web-pkg/src/constants'
import OwnCloud from 'owncloud-sdk'

export type ResourceNode = {
  parent?: Resource
  children: Resource[]
}

export interface ResourceLoader {
  loadResources(sdk: OwnCloud, path: string, davProperties: DavProperty[]): Promise<ResourceNode>
}
