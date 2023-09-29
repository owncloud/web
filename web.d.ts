/// <reference types="vite/client" />

import { OwnCloudSdk } from 'web-client/src/types'
import { UppyService } from 'web-pkg/src/services/uppy/uppyService'

// This file must have at least one export or import on top-level
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    // TODO: get rid of direct OwnCloudSdk usage
    $client: OwnCloudSdk

    $uppyService: UppyService
  }

  interface GlobalComponents {
    // https://github.com/LinusBorg/portal-vue/issues/380
    Portal: typeof import('portal-vue')['Portal']
    PortalTarget: typeof import('portal-vue')['PortalTarget']
  }
}
