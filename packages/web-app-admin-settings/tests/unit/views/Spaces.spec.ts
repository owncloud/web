import { mockAxiosResolve } from 'web-test-helpers/src/mocks'
import { Graph } from '@ownclouders/web-client'
import { mockDeep } from 'vitest-mock-extended'
import { ClientService, useAppDefaults } from '@ownclouders/web-pkg'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import Spaces from '../../../src/views/Spaces.vue'
import { useAppDefaultsMock } from 'web-test-helpers/src/mocks/useAppDefaultsMock'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  queryItemAsString: vi.fn(),
  useAppDefaults: vi.fn(),
  useRouteQueryPersisted: vi.fn()
}))
vi.mocked(useAppDefaults).mockImplementation(() => useAppDefaultsMock({}))

const selectors = {
  loadingSpinnerStub: 'app-loading-spinner-stub',
  spacesListStub: 'spaces-list-stub',
  noContentMessageStub: 'no-content-message-stub',
  batchActionsStub: 'batch-actions-stub'
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
    graph.drives.listAllDrives.mockResolvedValue(mockAxiosResolve({ value: [] }))
    const { wrapper } = getWrapper({ spaces: [] })
    await wrapper.vm.loadResourcesTask.last
    expect(wrapper.find(selectors.noContentMessageStub).exists()).toBeTruthy()
  })
  describe('toggle selection', () => {
    describe('selectSpaces method', () => {
      it('selects all spaces', async () => {
        const spaces = [{ name: 'Some Space' }, { name: 'Some other Space' }]
        const { wrapper } = getWrapper({ spaces })
        await wrapper.vm.loadResourcesTask.last
        wrapper.vm.selectSpaces(spaces)
        expect(wrapper.vm.selectedSpaces.length).toBe(spaces.length)
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
  describe('batch actions', () => {
    it('do not display when no space selected', async () => {
      const { wrapper } = getWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeFalsy()
    })
    it('display when one space selected', async () => {
      const spaces = [{ name: 'Some Space' }]
      const { wrapper } = getWrapper({ spaces })
      await wrapper.vm.loadResourcesTask.last
      wrapper.vm.toggleSelectSpace(spaces[0])
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
    it('display when more than one space selected', async () => {
      const spaces = [{ name: 'Some Space' }, { name: 'Some other Space' }]
      const { wrapper } = getWrapper({ spaces })
      await wrapper.vm.loadResourcesTask.last
      wrapper.vm.selectSpaces(spaces)
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
    })
  })
})

function getWrapper({ spaces = [{ name: 'Some Space' }] } = {}) {
  const $clientService = mockDeep<ClientService>()
  $clientService.graphAuthenticated.drives.listAllDrives.mockResolvedValue(
    mockAxiosResolve({ value: spaces })
  )
  const mocks = {
    ...defaultComponentMocks(),
    $clientService
  }

  return {
    wrapper: mount(Spaces, {
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks,
        stubs: {
          AppLoadingSpinner: true,
          NoContentMessage: true,
          SpacesList: true,
          OcBreadcrumb: true,
          BatchActions: true,
          ViewOptions: true
        }
      }
    })
  }
}
