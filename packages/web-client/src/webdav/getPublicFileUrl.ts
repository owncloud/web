import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const GetPublicFileUrlFactory = ({ sdk }: WebDavOptions) => {
  return {
    getPublicFileUrl(space: SpaceResource, publicLinkToken: string): string {
      return sdk.publicFiles.getFileUrl(publicLinkToken)
    }
  }
}
