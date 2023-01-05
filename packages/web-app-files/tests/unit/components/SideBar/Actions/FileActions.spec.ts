import FileActions from 'web-app-files/src/components/SideBar/Actions/FileActions.vue'
import { getActions, fileActions } from 'web-app-files/tests/__fixtures__/fileActions.js'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  defaultStubs,
  mount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const Component = { ...FileActions, mixins: [] }

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    describe('action handlers', () => {
      it('renders action handlers as clickable elements', async () => {
        const actions = ['copy', 'move', 'download', 'text-editor']
        const { wrapper } = getWrapper(actions)

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
      it.each([
        [['copy']],
        [['copy', 'move']],
        [['copy', 'text-editor']],
        [['copy', 'move', 'download', 'text-editor']]
      ])('renders a list of actions', (actions) => {
        const { wrapper } = getWrapper(actions)

        for (const defaultAction of actions) {
          expect(wrapper.find(fileActions[defaultAction].selector).exists()).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper(actions = []) {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.state.currentFolder = { path: '' }
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => mock<Resource>())
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { ...defaultStubs, OcButton: false },
        mocks: {
          $_fileActions_getAllAvailableActions: jest.fn(() => getActions(actions))
        },
        provide: {
          displayedSpace: mock<SpaceResource>()
        }
      }
    })
  }
}
