import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import Router, { RawLocation, Route } from 'vue-router'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { OwnCloudSdk } from 'web-client/src/types'

export interface ComponentMocksOptions {
  gettext?: boolean
  currentRoute?: {
    name?: string
    path?: string
    query?: { [key: string]: string }
    params?: { [key: string]: any }
  }
}

export const defaultComponentMocks = ({
  gettext = true,
  currentRoute = undefined
}: ComponentMocksOptions = {}) => {
  const $router = mockDeep<Router>({ ...(currentRoute && { currentRoute }) })
  $router.resolve.mockImplementation(
    (to: RawLocation) => ({ href: (to as any).name, location: { path: '' } } as any)
  )
  const $route = mockDeep<Route>()
  $route.path = currentRoute?.path || '/'

  return {
    $router,
    $route,
    $clientService: mockDeep<ClientService>(),
    $client: mockDeep<OwnCloudSdk>(),
    $uppyService: mockDeep<UppyService>(),
    ...(gettext && {
      $gettextInterpolate: jest.fn((text) => text),
      $ngettext: jest.fn((text) => text),
      $pgettext: jest.fn((text) => text),
      $gettext: jest.fn((text) => text)
    })
  }
}
