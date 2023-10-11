import { useSpaceActionsUploadImage } from 'web-app-files/src/composables/actions/spaces/useSpaceActionsUploadImage'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation,
  getComposableWrapper,
  mockAxiosResolve
} from 'web-test-helpers'
import { unref, VNodeRef } from 'vue'
import { useStore } from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { Drive } from '@ownclouders/web-client/src/generated'

describe('uploadImage', () => {
  describe('method "uploadImageSpace"', () => {
    it('should show message on success', () => {
      getWrapper({
        setup: async ({ uploadImageSpace }, { storeOptions, clientService }) => {
          const driveMock = mock<Drive>({ special: [{ specialFolder: { name: 'image' } }] })
          clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(
            mockAxiosResolve(driveMock)
          )
          clientService.webdav.putFileContents.mockResolvedValue(
            mock<Resource>({
              fileId:
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

    it('should show showErrorMessage on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ uploadImageSpace }, { storeOptions, clientService }) => {
          clientService.webdav.putFileContents.mockRejectedValue(new Error(''))

          await uploadImageSpace({
            currentTarget: {
              files: [{ name: 'image.png', lastModifiedDate: new Date(), type: 'image/png' }]
            }
          })

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
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    })
  }
  mocks.$previewService.isMimetypeSupported.mockReturnValue(true)

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const spaceImageInput = mock<VNodeRef>()
        const instance = useSpaceActionsUploadImage({ store, spaceImageInput })
        unref(instance.actions)[0].handler({
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
        provide: mocks,
        store
      }
    )
  }
}
