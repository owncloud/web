import { mock, mockDeep } from 'vitest-mock-extended'
import {
  ClientService,
  LoadingService,
  LoadingTaskCallbackArguments,
  PasswordPolicyService,
  PreviewService,
  UppyService
} from '../../../web-pkg/src/'
import { Router, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { ref } from 'vue'
import { writable } from '../helpers'

export interface ComponentMocksOptions {
  currentRoute?: RouteLocationNormalizedLoaded
}

export const defaultComponentMocks = ({ currentRoute = undefined }: ComponentMocksOptions = {}) => {
  const $router = mock<Router>()
  if (currentRoute) {
    writable($router).currentRoute = ref(currentRoute)
  } else {
    writable($router).currentRoute = ref(
      mock<RouteLocationNormalizedLoaded>({ name: '', path: '' })
    )
  }

  $router.resolve.mockImplementation(
    (to: RouteLocationRaw) => ({ href: (to as any).name, location: { path: '' } }) as any
  )
  const $route = $router.currentRoute.value
  $route.path = $route.path || '/'
  $route.meta = $route.meta || {}
  $route.meta.title = $route.meta.title || ''

  return {
    $router,
    $route,
    $clientService: mockDeep<ClientService>(),
    $previewService: mockDeep<PreviewService>(),
    $uppyService: mockDeep<UppyService>(),
    $loadingService: mock<LoadingService>({
      addTask: (callback) => {
        return callback(mock<LoadingTaskCallbackArguments>())
      }
    }),
    $passwordPolicyService: mockDeep<PasswordPolicyService>()
  }
}
