import { useSpaceActionsUploadImage } from 'web-app-files/src/composables/actions/spaces/useSpaceActionsUploadImage'
import { thumbnailService } from '../../../../../src/services'
import { mock, mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { unref, VNodeRef } from 'vue'
import { useStore } from 'web-pkg/src/composables'
import { Graph, SpaceResource } from 'web-client/src'

describe('uploadImage', () => {
  beforeAll(() => {
    thumbnailService.initialize({
      enabled: true,
      version: '0.1',
      supportedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'text/plain']
    })
  })

  afterEach(() => jest.clearAllMocks())

  describe('method "uploadImageSpace"', () => {
    it('should show message on success', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ uploadImageSpace }, { storeOptions, clientService }) => {
          const responseMock = { data: { special: [{ specialFolder: { name: 'image' } }] } }
          const graphMock = mockDeep<Graph>({
            drives: { updateDrive: jest.fn().mockResolvedValue(responseMock) }
          })
          clientService.graphAuthenticated.mockImplementation(() => graphMock)
          clientService.owncloudSdk.files.putFileContents.mockImplementation(() =>
            Promise.resolve({
              'OC-FileId':
                'YTE0ODkwNGItNTZhNy00NTQ4LTk2N2MtZjcwZjhhYTY0Y2FjOmQ4YzMzMmRiLWUxNWUtNDRjMy05NGM2LTViYjQ2MGMwMWJhMw=='
            })
          )
          await uploadImageSpace({
            currentTarget: {
              files: [{ name: 'image.png', lastModifiedDate: new Date(), type: 'image/png' }]
            }
          })

          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper({
        setup: async ({ uploadImageSpace }, { storeOptions, clientService }) => {
          clientService.owncloudSdk.files.putFileContents.mockImplementation(() =>
            Promise.reject(new Error(''))
          )

          await uploadImageSpace({
            currentTarget: {
              files: [{ name: 'image.png', lastModifiedDate: new Date(), type: 'image/png' }]
            }
          })

          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsUploadImage>,
    {
      spaceImageInput,
      storeOptions
    }: {
      spaceImageInput: VNodeRef
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
  })

  mocks.$clientService.graphAuthenticated
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const spaceImageInput = mock<VNodeRef>()
        const instance = useSpaceActionsUploadImage({ store, spaceImageInput })
        unref(instance.actions)[0].handler({
          space: null,
          resources: [
            mock<SpaceResource>({
              id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22'
            })
          ]
        })
        setup(instance, { spaceImageInput, storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        store
      }
    )
  }
}
