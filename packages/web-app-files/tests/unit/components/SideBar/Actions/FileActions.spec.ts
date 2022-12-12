import stubs from '../../../../../../../tests/unit/stubs'
import FileActions from 'web-app-files/src/components/SideBar/Actions/FileActions.vue'
import { apps } from 'web-app-files/tests/__fixtures__/fileActions.js'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const filesPersonalRoute = { name: 'files-personal' }

describe('FileActions', () => {
  // FIXME: Fix tests, see down below
  it.todo('Fix tests')
  // describe('when user is on personal route', () => {
  //   describe('action handlers', () => {
  //     afterEach(() => {
  //       jest.clearAllMocks()
  //     })
  //     it('renders action handlers as clickable elements', async () => {
  //       const actions = ['copy', 'move', 'download', 'text-editor']
  //       const wrapper = getWrapper(filesPersonalRoute, actions)
  //
  //       for (const button of actions) {
  //         const action = fileActions[button]
  //
  //         const buttonElement = wrapper.find(action.selector)
  //         expect(buttonElement.exists()).toBeTruthy()
  //
  //         await buttonElement.trigger('click.stop')
  //         expect(action.handler).toHaveBeenCalledTimes(1)
  //       }
  //     })
  //   })
  //
  //   describe('menu items', () => {
  //     it.each([
  //       [['copy']],
  //       [['copy', 'move']],
  //       [['copy', 'text-editor']],
  //       [['copy', 'move', 'download', 'text-editor']]
  //     ])('renders a list of actions', (actions) => {
  //       const wrapper = getWrapper(filesPersonalRoute, actions)
  //
  //       for (const defaultAction of actions) {
  //         expect(wrapper.find(fileActions[defaultAction].selector).exists()).toBeTruthy()
  //       }
  //     })
  //   })
  // })
})

function getWrapper(route, actions = []) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: {
      apps: { apps }
    }
  }
  storeOptions.modules.Files.state.currentFolder = { path: '' }
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => mockDeep<Resource>())
  const store = createStore(storeOptions)
  return mount(FileActions, {
    // FIXME: Make it work without this computed mock
    // computed: {
    //   actions: () => getActions(actions)
    // },
    global: {
      plugins: [...defaultPlugins(), store],
      stubs: { ...stubs, 'oc-button': false },
      mocks: {
        $route: route
      },
      provide: {
        displayedSpace: mockDeep<SpaceResource>()
      }
    }
  })
}
