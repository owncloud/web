import Projects from '../../../../src/views/spaces/Projects.vue'
import { mock } from 'jest-mock-extended'
import { nextTick } from 'vue'
import { queryItemAsString } from '@ownclouders/web-pkg'

import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'

jest.mock('@ownclouders/web-pkg/src/helpers/contextMenuDropdown', () => ({
  ...jest.requireActual('@ownclouders/web-pkg/src/helpers/contextMenuDropdown'),
  displayPositionedDropdown: jest.fn()
}))
jest.mock('@ownclouders/web-pkg')

const spacesResources = [
  {
    id: '1',
    name: 'Some space',
    driveType: 'project',
    description: 'desc',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '1'
  },
  {
    id: '2',
    name: 'Some other space',
    driveType: 'project',
    description: 'desc',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '2'
  }
]

describe('Projects view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('side-bar-stub').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('shows the no-content-message after loading', async () => {
      const { wrapper } = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('.no-content-message').exists()).toBeTruthy()
    })
    it('lists all available project spaces', async () => {
      const spaces = spacesResources
      const { wrapper } = getMountedWrapper({ spaces })
      await wrapper.vm.loadResourcesTask.last
      // "space" is undefined for "space-context-actions", seems to be a bug because it's definitely not
      // {{ space }} -> undefined, {{ space.id }} -> "1"
      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.find('.no-content-message').exists()).toBeFalsy()
      expect(wrapper.find('.spaces-list').exists()).toBeTruthy()
    })
    it('shows only filtered spaces if filter applied', async () => {
      const { wrapper } = getMountedWrapper({ spaces: spacesResources })
      wrapper.vm.filterTerm = 'Some other space'
      await nextTick()
      expect(wrapper.vm.items).toEqual([spacesResources[1]])
    })
  })
  it('should display the "Create Space"-button when permission given', () => {
    const { wrapper } = getMountedWrapper({
      abilities: [{ action: 'create-all', subject: 'Drive' }],
      stubAppBar: false
    })
    expect(wrapper.find('create-space-stub').exists()).toBeTruthy()
  })
})

function getMountedWrapper({ mocks = {}, spaces = [], abilities = [], stubAppBar = true } = {}) {
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '1')
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '100')
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => spaces)
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(Projects, {
      global: {
        plugins: [...defaultPlugins({ abilities }), store],
        mocks: defaultMocks,
        provide: defaultMocks,
        stubs: {
          ...defaultStubs,
          'space-context-actions': true,
          'app-bar': stubAppBar,
          CreateSpace: true
        }
      }
    })
  }
}
