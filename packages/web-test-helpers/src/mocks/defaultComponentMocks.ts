import { mock, mockDeep } from 'jest-mock-extended'
import {
  ClientService,
  LoadingService,
  LoadingTaskCallbackArguments,
  PasswordPolicyService,
  PreviewService
} from '../../../web-pkg/src'
import { Router, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { OwnCloudSdk } from 'web-client/src/types'
import { ref } from 'vue'

export interface ComponentMocksOptions {
  currentRoute?: RouteLocationNormalizedLoaded
}

export const defaultComponentMocks = ({ currentRoute = undefined }: ComponentMocksOptions = {}) => {
  const $router = mockDeep<Router>({ ...(currentRoute && { currentRoute: ref(currentRoute) }) })
  $router.resolve.mockImplementation(
    (to: RouteLocationRaw) => ({ href: (to as any).name, location: { path: '' } } as any)
  )
  const $route = $router.currentRoute.value
  $route.path = $route.path || '/'

  return {
    $router,
    $route,
    $clientService: mockDeep<ClientService>(),
    $previewService: mockDeep<PreviewService>(),
    $client: mockDeep<OwnCloudSdk>(),
    $uppyService: mockDeep<UppyService>(),
    $loadingService: mock<LoadingService>({
      addTask: (callback) => {
        return callback(mock<LoadingTaskCallbackArguments>())
      }
    }),
    $passwordPolicyService: mockDeep<PasswordPolicyService>()
  }
}
