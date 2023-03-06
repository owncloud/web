import TrashOverview from '../../../../src/views/trash/Overview.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mockAxiosResolve,
  mount
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Graph } from 'web-client'
import { ClientService } from 'web-pkg'
import { nextTick } from 'vue'

const spaceMocks = [
  {
    id: '1',
    name: 'admin',
    disabled: false,
    driveType: 'personal'
  },
  {
    id: '2',
    name: 'Project space 1',
    disabled: false,
    driveType: 'project'
  },
  {
    id: '3',
    name: 'Project space 2',
    disabled: false,
    driveType: 'project'
  }
]

const defaultGraphMock = () => {
  const graph = mockDeep<Graph>()
  graph.drives.listMyDrives.mockImplementation(() => mockAxiosResolve({ value: spaceMocks }))
  return graph
}

describe('TrashOverview', () => {
  it('should navigate to default trash if "hasProjectSpaces" is false', () => {
    const { mocks } = getWrapper({ hasProjectSpaces: false })
    expect(mocks.$router.push).toHaveBeenCalledWith({ name: 'files-trash-generic' })
  })
  it('should navigate to single space trash if only one space exists', async () => {
    const graph = mockDeep<Graph>()
    graph.drives.listMyDrives.mockImplementation(() => mockAxiosResolve({ value: [spaceMocks[0]] }))
    const { mocks, wrapper } = getWrapper({ graph })
    await wrapper.vm.loadResourcesTask.last
    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'files-trash-generic',
      params: { driveAliasAndItem: '' },
      query: {}
    })
  })
  it('shows the loading spinner during loading', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find('app-loading-spinner').exists()).toBeTruthy()
  })
  it('should render all spaces in a table', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.loadResourcesTask.last
    expect(wrapper.find('app-loading-spinner').exists()).toBeFalsy()
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
  it('emits events on file click', () => {
    // fake
    const { wrapper } = getWrapper()
    const sortBy = 'name'
    const sortDir = 'desc'
    wrapper.vm.handleSort({ sortBy, sortDir })
    expect(wrapper.vm.sortBy).toEqual(sortBy)
    expect(wrapper.vm.sortDir).toEqual(sortDir)
  })
  it('shows only filtered spaces if filter applied', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.loadResourcesTask.last
    wrapper.vm.filterTerm = 'admin'
    await nextTick()
    expect(wrapper.vm.orderedSpaces.length).toEqual(1)
    expect(wrapper.vm.orderedSpaces[0].id).toEqual(spaceMocks[0].id)
  })
})

function getWrapper({ hasProjectSpaces = true, graph = defaultGraphMock() } = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.mockImplementation(() => graph)
  const mocks = { ...defaultComponentMocks(), $clientService }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  storeOptions.getters.capabilities.mockImplementation(() => ({
    spaces: { projects: hasProjectSpaces }
  }))

  return {
    mocks,
    wrapper: mount(TrashOverview, {
      global: {
        stubs: defaultStubs,
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
