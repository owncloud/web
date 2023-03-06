import TrashOverview from '../../../../src/views/trash/Overview.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { nextTick } from 'vue'

const spaceMocks = [
  {
    id: '1',
    name: 'admin',
    disabled: false,
    driveType: 'personal',
    getDriveAliasAndItem: () => '1'
  },
  {
    id: '2',
    name: 'Project space 1',
    disabled: false,
    driveType: 'project',
    getDriveAliasAndItem: () => '2'
  },
  {
    id: '3',
    name: 'Project space 2',
    disabled: false,
    driveType: 'project',
    getDriveAliasAndItem: () => '3'
  }
]

describe('TrashOverview', () => {
  it('should navigate to single space trash if only one space exists', async () => {
    const { mocks, wrapper } = getWrapper()
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'files-trash-generic',
      params: { driveAliasAndItem: '' },
      query: {}
    })
  })
  it('shows the loading spinner during loading', () => {
    const { wrapper } = getWrapper()
    wrapper.vm.loadResourcesTask.perform()
    expect(wrapper.find('app-loading-spinner').exists()).toBeTruthy()
  })
  it('should render spaces list', async () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('sorts by property name', async () => {
    // fake
    const { wrapper } = getWrapper()
    const sortBy = 'name'
    const sortDir = 'desc'
    wrapper.vm.handleSort({ sortBy, sortDir })
    expect(wrapper.vm.sortBy).toEqual(sortBy)
    expect(wrapper.vm.sortDir).toEqual(sortDir)
  })
  it('should set the sort parameters accordingly when calling "handleSort"', () => {
    const { wrapper } = getWrapper()
    const sortBy = 'name'
    const sortDir = 'desc'
    wrapper.vm.handleSort({ sortBy, sortDir })
    expect(wrapper.vm.sortBy).toEqual(sortBy)
    expect(wrapper.vm.sortDir).toEqual(sortDir)
  })
  it('navigates to trash on space click', async () => {
    const { mocks, wrapper } = getWrapper()
    await wrapper.find(`[data-item-id="${spaceMocks[0].id}"] a`).trigger('click')
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'files-trash-generic',
      params: { driveAliasAndItem: '' },
      query: {}
    })
  })
  it('shows only filtered spaces if filter applied', async () => {
    const { wrapper } = getWrapper()
    wrapper.vm.filterTerm = 'admin'
    await nextTick()
    expect(wrapper.vm.orderedSpaces.length).toEqual(1)
    expect(wrapper.vm.orderedSpaces[0].id).toEqual(spaceMocks[0].id)
  })
})

function getWrapper({ spaces = spaceMocks } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => spaces)
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'trash-overview' })
    })
  }

  return {
    mocks,
    wrapper: mount(TrashOverview, {
      global: {
        stubs: { ...defaultStubs },
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
