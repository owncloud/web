import { SpaceResource, Resource } from '../helpers'
import { OwnCloudSdk } from 'web-pkg/src/services'

export interface WebDAV {
  listFiles: (space: SpaceResource, webDavPath: string) => Promise<Resource[]>
}

export const webdav = (sdk: OwnCloudSdk): WebDAV => {}
