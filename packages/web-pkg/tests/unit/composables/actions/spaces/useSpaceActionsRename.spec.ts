import { useSpaceActionsRename } from '../../../../../src'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  mockAxiosResolve,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { SpaceResource } from '@ownclouders/web-client/src'

describe('rename', () => {
  describe('handler', () => {
    it('should trigger the rename modal window', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler({
            resources: [{ id: '1', name: 'renamed space' } as SpaceResource]
          })

          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should not trigger the rename modal window without any resource', () => {
      getWrapper({
        setup: async ({ actions }, { storeOptions }) => {
          await unref(actions)[0].handler({ resources: [] })

          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(0)
        }
      })
    })
  })
  describe('method "renameSpace"', () => {
    it('should hide the modal and show message on success', () => {
      getWrapper({
        setup: async ({ renameSpace }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(mockAxiosResolve())
          await renameSpace(1, 'renamed space')

          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
          expect(storeOptions.actions.showMessage).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should show message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ renameSpace }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.updateDrive.mockRejectedValue(new Error())
          await renameSpace(1, 'renamed space')

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
    instance: ReturnType<typeof useSpaceActionsRename>,
    {
      storeOptions,
      clientService
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsRename({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        store,
        mocks,
        provide: mocks
      }
    )
  }
}
