import { unref, Ref } from 'vue'

import { ConfigurationManager } from 'web-pkg/src'
import { useGetMatchingSpace } from 'web-pkg/src/composables'
import { useConfigurationManager } from 'web-pkg/src/composables/configuration'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { createLocationSpaces, createLocationShares } from '../../router'
import { CreateTargetRouteOptions } from '../../helpers/folderLink/types'
import { Resource, SpaceResource } from 'web-client/src'
import { buildShareSpaceResource } from 'web-client/src/helpers'

type ResourceRouteResolverOptions = {
  configurationManager?: ConfigurationManager
  targetRouteCallback?: Ref<any>
  space?: Ref<SpaceResource>
}

export const useResourceRouteResolver = (options: ResourceRouteResolverOptions, context) => {
  const configurationManager = options.configurationManager || useConfigurationManager()
  const targetRouteCallback = options.targetRouteCallback
  const { getInternalSpace, getMatchingSpace } = useGetMatchingSpace(options)

  const createFolderLink = (createTargetRouteOptions: CreateTargetRouteOptions) => {
    if (unref(targetRouteCallback)) {
      return unref(targetRouteCallback)(createTargetRouteOptions)
    }

    const { path, fileId, resource } = createTargetRouteOptions
    let space
    if (!resource.shareId && !unref(options.space) && !getInternalSpace(resource.storageId)) {
      if (path === '/') {
        return createLocationShares('files-shares-with-me')
      }
      // FIXME: This is a hacky way to resolve re-shares, but we don't have other options currently
      return { name: 'resolvePrivateLink', params: { fileId } }
    } else {
      space = unref(options.space) || getMatchingSpace(resource)
    }
    if (!space) {
      return {}
    }
    return createLocationSpaces(
      'files-spaces-generic',
      createFileRouteOptions(space, { path, fileId })
    )
  }

  const createFileAction = (resource: Resource) => {
    let space = unref(options.space) || getMatchingSpace(resource)
    if (!space) {
      space = buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    }
    /**
     * Triggered when a default action is triggered on a file
     * @property {object} resource resource for which the event is triggered
     */
    context.emit('fileClick', { space, resources: [resource] })
  }

  return {
    createFileAction,
    createFolderLink,
    getInternalSpace,
    getMatchingSpace
  }
}
