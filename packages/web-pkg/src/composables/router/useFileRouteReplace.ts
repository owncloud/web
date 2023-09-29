import { useRouter } from './useRouter'
import { useConfigurationManager } from '../configuration'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { createFileRouteOptions } from '../../helpers/router'
import { Router } from 'vue-router'
import { ConfigurationManager } from '../../configuration'

export interface FileRouteReplaceOptions {
  router?: Router
  configurationManager?: ConfigurationManager
}

export const useFileRouteReplace = (options: FileRouteReplaceOptions = {}) => {
  const router = options.router || useRouter()
  const configurationManager = options.configurationManager || useConfigurationManager()

  const replaceInvalidFileRoute = ({
    space,
    resource,
    path,
    fileId
  }: {
    space: SpaceResource
    resource: Resource
    path: string
    fileId?: string | number
  }): boolean => {
    if (!configurationManager?.options?.routing?.idBased) {
      return false
    }
    if (path === resource.path && fileId === resource.fileId) {
      return false
    }

    const routeOptions = createFileRouteOptions(space, resource, {
      configurationManager
    })
    router.replace(routeOptions)
    return true
  }

  return {
    replaceInvalidFileRoute
  }
}
