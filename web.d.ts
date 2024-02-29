/// <reference types="vite/client" />

import { OwnCloudSdk } from '@ownclouders/web-client/src/types'
import { UppyService } from '@ownclouders/web-pkg'
import { Route, Router } from 'vue-router'

// This file must have at least one export or import on top-level
export {}

declare global {
  interface Window {
    WEB_APPS_MAP: Record<string, string>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    // TODO: get rid of direct OwnCloudSdk usage
    $client: OwnCloudSdk

    $uppyService: UppyService

    $router: Router
    $route: Route
  }

  interface GlobalComponents {
    // https://github.com/LinusBorg/portal-vue/issues/380
    Portal: typeof import('portal-vue')['Portal']
    PortalTarget: typeof import('portal-vue')['PortalTarget']
  }
}
