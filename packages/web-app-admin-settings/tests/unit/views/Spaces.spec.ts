import { mockAxiosResolve } from 'web-test-helpers/src/mocks'
import { Graph } from 'web-client'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg/src'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  mount
} from 'web-test-helpers'
import Spaces from '../../../src/views/Spaces.vue'

const selectors = {
  loadingSpinnerStub: 'apploadingspinner-stub',
  spacesListStub: 'spaceslist-stub',
  noContentMessageStub: 'nocontentmessage-stub'
}

describe('Spaces view', () => {
  describe('loading states', () => {
    it('should show loading spinner if loading', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.loadingSpinnerStub).exists()).toBeTruthy()
    })
    it('should render spaces list after loading has been finished', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.find(selectors.spacesListStub).exists()).toBeTruthy()
    })
  })
  it('should render no content message if no spaces found', async () => {
    const graph = mockDeep<Graph>()
    graph.drives.listAllDrives.mockImplementation(() => mockAxiosResolve({ value: [] }))
    const { wrapper } = getWrapper({ spaces: [] })
    await wrapper.vm.loadResourcesTask.last
    expect(wrapper.find(selectors.noContentMessageStub).exists()).toBeTruthy()
  })
  describe('toggle selection', () => {
    describe('toggleSelectAllSpaces method', () => {
      it('selects all spaces', async () => {
        const spaces = [{ name: 'Some Space' }]
        const { wrapper } = getWrapper({ spaces })
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.toggleSelectAllSpaces()
        expect(wrapper.vm.selectedSpaces).toEqual(
          expect.arrayContaining([expect.objectContaining({ name: spaces[0].name })])
        )
      })
      it('de-selects all selected spaces', async () => {
        const spaces = [{ name: 'Some Space' }]
        const { wrapper } = getWrapper({ spaces })
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.selectedSpaces = spaces
        wrapper.vm.toggleSelectAllSpaces()
        expect(wrapper.vm.selectedSpaces.length).toBe(0)
      })
    })
    describe('toggleSelectSpace method', () => {
      it('selects a space', async () => {
        const spaces = [{ name: 'Some Space' }]
        const { wrapper } = getWrapper()
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.toggleSelectSpace(spaces[0])
        expect(wrapper.vm.selectedSpaces).toEqual(
          expect.arrayContaining([expect.objectContaining({ name: spaces[0].name })])
        )
      })
      it('de-selects a selected space', async () => {
        const spaces = [{ name: 'Some Space' }]
        const { wrapper } = getWrapper()
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.selectedSpaces = spaces
        wrapper.vm.toggleSelectSpace(spaces[0])
        expect(wrapper.vm.selectedSpaces.length).toBe(0)
      })
    })
    describe('unselectAllSpaces method', () => {
      it('de-selects all selected spaces', async () => {
        const spaces = [{ name: 'Some Space' }]
        const { wrapper } = getWrapper({ spaces })
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.selectedSpaces = spaces
        wrapper.vm.unselectAllSpaces()
        expect(wrapper.vm.selectedSpaces.length).toBe(0)
      })
    })
  })
})

function getWrapper({ spaces = [{ name: 'Some Space' }] } = {}) {
  const graph = mockDeep<Graph>()
  graph.drives.listAllDrives.mockImplementation(() => mockAxiosResolve({ value: spaces }))
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.mockImplementation(() => graph)
  const mocks = { ...defaultComponentMocks(), $clientService }

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)

  return {
    wrapper: mount(Spaces, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        stubs: {
          AppLoadingSpinner: true,
          NoContentMessage: true,
          SpacesList: true
        }
      }
    })
  }
}
