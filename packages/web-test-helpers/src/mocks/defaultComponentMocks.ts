import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import Router, { RawLocation, Route } from 'vue-router'
import { UppyService } from 'web-runtime/src/services/uppyService'

export interface ComponentMocksOptions {
  gettext?: boolean
}

export const defaultComponentMocks = ({ gettext = true }: ComponentMocksOptions = {}) => {
  const $router = mockDeep<Router>()
  $router.resolve.mockImplementation((to: RawLocation) => ({ href: (to as any).name } as any))
  const $route = mockDeep<Route>()
  $route.path = '/'

  return {
    $router,
    $route,
    $clientService: mockDeep<ClientService>(),
    $uppyService: mockDeep<UppyService>(),
    ...(gettext && {
      $gettextInterpolate: jest.fn(),
      $ngettext: jest.fn(),
      $pgettext: jest.fn(),
      $gettext: jest.fn()
    })
  }
}
