import { isShareSpaceResource, Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { configurationManager, ConfigurationManager } from '../../configuration'
import { LocationQuery } from '../../composables'
import { RouteParams } from 'vue-router'
import { isUndefined } from 'lodash-es'

/**
 * Creates route options for routing into a file location:
 * - params.driveAliasAndItem
 * - query.shareId
 * - query.fileId
 *
 * Both query options are optional.
 *
 * @param space {SpaceResource}
 * @param target {path: string, fileId: string | number}
 * @param options {configurationManager: ConfigurationManager}
 */
export const createFileRouteOptions = (
  space: SpaceResource,
  target: { path?: string; fileId?: string | number } = {},
  options?: { configurationManager?: ConfigurationManager }
): { params: RouteParams; query: LocationQuery } => {
  const config = options?.configurationManager || configurationManager
  return {
    params: {
      driveAliasAndItem: space.getDriveAliasAndItem({ path: target.path || '' } as Resource)
    },
    query: {
      ...(isShareSpaceResource(space) && { shareId: space.shareId }),
      ...(config?.options?.routing?.idBased &&
        !isUndefined(target.fileId) && { fileId: `${target.fileId}` })
    }
  }
}
