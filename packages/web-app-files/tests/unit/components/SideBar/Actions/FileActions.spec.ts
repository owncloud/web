import FileActions from 'web-app-files/src/components/SideBar/Actions/FileActions.vue'
import { fileActions, editors, meta } from 'web-app-files/tests/__fixtures__/fileActions'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  defaultStubs,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { useFileActions } from 'web-pkg/src/composables/actions/files/useFileActions'
import { Action } from 'web-pkg/src/composables/actions'

jest.mock('web-pkg/src/composables/actions/files/useFileActions')

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    describe('action handlers', () => {
      it('renders action handlers as clickable elements', async () => {
        jest.mocked(useFileActions).mockImplementation(() =>
          mock<ReturnType<typeof useFileActions>>({
            getAllAvailableActions: () => Object.values(fileActions) as any as Action[]
          })
        )

        const actions = ['copy', 'move', 'download', 'text-editor']
        const { wrapper } = getWrapper()

        for (const button of actions) {
          const action = fileActions[button]

          const buttonElement = wrapper.find(action.selector)
          expect(buttonElement.exists()).toBeTruthy()

          await buttonElement.trigger('click.stop')
          expect(action.handler).toHaveBeenCalledTimes(1)
        }
      })
    })

    describe('menu items', () => {
      it('renders a list of actions', () => {
        const { wrapper } = getWrapper()
        for (const action of ['copy', 'text-editor']) {
          expect(wrapper.find(fileActions[action].selector).exists()).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.state.currentFolder = { path: '' }
  storeOptions.modules.apps.state.fileEditors = editors
  storeOptions.modules.apps.state.meta = meta
  const store = createStore(storeOptions)
  return {
    wrapper: mount(FileActions, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultComponentMocks({
          currentRoute: mock<RouteLocation>({
            name: 'files-spaces-generic',
            path: '/files/spaces/personal/admin'
          })
        }),
        stubs: { ...defaultStubs, OcButton: false },
        provide: {
          space: mock<SpaceResource>(),
          resource: mock<Resource>({
            extension: 'md'
          })
        }
      }
    })
  }
}
