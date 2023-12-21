import ApplicationsMenu from 'web-runtime/src/components/Topbar/ApplicationsMenu.vue'
import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useFileActions: jest.fn(() => ({ openEditor: jest.fn() }))
}))

const menuLinks = [
  {
    icon: 'folder',
    iconUrl: undefined,
    title: 'Files',
    path: '/files'
  },
  {
    icon: 'some-icon',
    iconUrl: undefined,
    title: 'External',
    url: 'http://some.org',
    target: '_blank'
  }
]

describe('ApplicationsMenu component', () => {
  it('should render navigation with button and menu items in dropdown', () => {
    const { wrapper } = getWrapper(menuLinks)
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper(applicationsList = []) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ query: { app: 'admin-settings' } })
    }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }

  return {
    wrapper: shallowMount(ApplicationsMenu, {
      props: {
        applicationsList
      },
      global: {
        renderStubDefaultSlot: true,
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
