import { ConfigurationManager, useConfigurationManager, useRouter } from 'web-pkg'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { createFileRouteOptions } from '../../helpers/router'
import { Router } from 'vue-router'

export interface FileRouteReplaceOptions {
  router?: Router
  configurationManager?: ConfigurationManager
}

export const useFileRouteReplace = (options: FileRouteReplaceOptions = {}) => {
  const router = options.router || useRouter()
  const configurationManager = options.configurationManager || useConfigurationManager()

  const replaceInvalidFileRoute = async ({
    space,
    resource,
    path,
    fileId
  }: {
    space: SpaceResource
    resource: Resource
    path: string
    fileId?: string | number
  }): Promise<boolean> => {
    if (!configurationManager?.options?.routing?.idBased) {
      return false
    }
    if (path === resource.path && fileId === resource.fileId && !resource.visiblePath) {
      return false
    }

    const routeOptions = createFileRouteOptions(space, resource, {
      configurationManager
    })
    await router.replace(routeOptions)
    return true
  }

  return {
    replaceInvalidFileRoute
  }
}
