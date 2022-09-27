import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import Router, { RawLocation, Route } from 'vue-router'

export const defaultComponentMocks = (() => {
  const $router = mockDeep<Router>()
  $router.resolve.mockImplementation((to: RawLocation) => ({ href: (to as any).name } as any))

  return {
    $router,
    $route: mock<Route>(),
    $clientService: mockDeep<ClientService>(),
    $gettextInterpolate: jest.fn(),
    $gettext: jest.fn()
  }
})()
