import { useGeneralActionsResetLogo } from '../../../../../src/composables/actions/general/useGeneralActionsResetLogo'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation,
  mockAxiosResolve,
  mockAxiosReject,
  getComposableWrapper
} from 'web-test-helpers'

jest.useFakeTimers()

describe('resetLogo', () => {
  describe('handler', () => {
    it('should show message on request success', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions, clientService, router }) => {
          clientService.httpAuthenticated.delete.mockImplementation(() => mockAxiosResolve())
          await unref(actions)[0].handler()
          jest.runAllTimers()
          expect(router.go).toHaveBeenCalledTimes(1)
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on request error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ actions }, { storeOptions, clientService, router }) => {
          clientService.httpAuthenticated.delete.mockRejectedValue(() => mockAxiosReject())
          await unref(actions)[0].handler()
          jest.runAllTimers()
          expect(router.go).toHaveBeenCalledTimes(0)
          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useGeneralActionsResetLogo>,
    {
      storeOptions,
      clientService,
      router
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
      router: ReturnType<typeof defaultComponentMocks>['$router']
    }
  ) => void
}) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'admin-settings-general' })
  })
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useGeneralActionsResetLogo({ store })
        setup(instance, {
          storeOptions,
          clientService: mocks.$clientService,
          router: mocks.$router
        })
      },
      {
        store,
        mocks,
        provide: mocks
      }
    )
  }
}
