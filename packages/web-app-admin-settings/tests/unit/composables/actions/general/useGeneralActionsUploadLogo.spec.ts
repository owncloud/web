import { useGeneralActionsUploadLogo } from '../../../../../src/composables/actions/general/useGeneralActionsUploadLogo'
import { mock } from 'jest-mock-extended'
import { VNodeRef } from 'vue'
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

describe('uploadImage', () => {
  describe('method "uploadImage"', () => {
    it('should show message on request success', () => {
      getWrapper({
        setup: async ({ uploadImage }, { storeOptions, clientService, router }) => {
          clientService.httpAuthenticated.post.mockImplementation(() => mockAxiosResolve())
          await uploadImage({
            currentTarget: {
              files: [{ name: 'image.png', type: 'image/png' }]
            }
          } as unknown as InputEvent)
          jest.runAllTimers()
          expect(router.go).toHaveBeenCalledTimes(1)
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on request error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ uploadImage }, { storeOptions, clientService, router }) => {
          clientService.httpAuthenticated.post.mockRejectedValue(() => mockAxiosReject())
          await uploadImage({
            currentTarget: {
              files: [{ name: 'image.png', type: 'image/png' }]
            }
          } as unknown as InputEvent)
          jest.runAllTimers()
          expect(router.go).toHaveBeenCalledTimes(0)
          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on invalid mimeType', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ uploadImage }, { storeOptions, clientService }) => {
          await uploadImage({
            currentTarget: {
              files: [{ name: 'text.txt', type: 'text/plain' }]
            }
          } as unknown as InputEvent)
          expect(clientService.httpAuthenticated.post).toHaveBeenCalledTimes(0)
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
    instance: ReturnType<typeof useGeneralActionsUploadLogo>,
    {
      imageInput,
      storeOptions,
      clientService,
      router
    }: {
      imageInput: VNodeRef
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
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const imageInput = mock<VNodeRef>()
        const instance = useGeneralActionsUploadLogo({ store, imageInput })
        setup(instance, {
          imageInput,
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
