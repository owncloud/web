import { mock, mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src/services'
import Router, { RawLocation, Route } from 'vue-router'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { isUndefined } from 'lodash-es'

export interface ComponentMocksOptions {
  gettext?: boolean
}

export const defaultComponentMocks = (options: ComponentMocksOptions = {}) => {
  const $router = mockDeep<Router>()
  $router.resolve.mockImplementation((to: RawLocation) => ({ href: (to as any).name } as any))

  const mockGetText = isUndefined(options.gettext) ? true : options.gettext

  return {
    $router,
    $route: mock<Route>(),
    $clientService: mockDeep<ClientService>(),
    $uppyService: mockDeep<UppyService>(),
    ...(mockGetText && {
      $gettextInterpolate: jest.fn(),
      $ngettext: jest.fn(),
      $pgettext: jest.fn(),
      $gettext: jest.fn()
    })
  }
}
