import FileSideBar from '../../../../src/components/SideBar/FileSideBar.vue'
import { CollaboratorShare, LinkShare, Resource, SpaceResource } from '@ownclouders/web-client'
import { mock } from 'vitest-mock-extended'
import {
  defaultComponentMocks,
  defaultPlugins,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'
import { defineComponent, ref } from 'vue'
import { useSelectedResources } from '../../../../src/composables/selection'
import {
  useAppsStore,
  useExtensionRegistry,
  useResourcesStore,
  useSharesStore
} from '../../../../src/composables/piniaStores'
import { AncestorMetaDataValue } from '../../../../src'

const InnerSideBarComponent = defineComponent({
  props: { availablePanels: { type: Array, required: true } },
  template: '<div id="foo"><slot name="rootHeader"></slot></div>'
})

vi.mock('../../../../src/composables/selection', () => ({ useSelectedResources: vi.fn() }))
vi.mock('../../../../src/composables/resources/useCanListVersions', () => ({
  useCanListVersions: () => ({ canListVersions: vi.fn() })
}))

const selectors = {
  sideBar: '.files-side-bar',
  fileInfoStub: 'file-info-stub',
  spaceInfoStub: 'space-info-stub'
}

describe('FileSideBar', () => {
  describe('isOpen', () => {
    it.each([true, false])(
      'should show or hide the sidebar according to the isOpen prop',
      (isOpen) => {
        const { wrapper } = createWrapper({ isOpen })
        expect(wrapper.find(selectors.sideBar).exists()).toBe(isOpen)
      }
    )
  })
  describe('file info header', () => {
    it('should show when one resource selected', async () => {
      const item = mock<Resource>({ path: '/someFolder' })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.fileInfoStub).exists()).toBeTruthy()
    })
    it('not show when no resource selected', () => {
      const { wrapper } = createWrapper()
      expect(wrapper.find(selectors.fileInfoStub).exists()).toBeFalsy()
    })
    it('should not show when selected resource is a project space', async () => {
      const item = mock<SpaceResource>({ path: '/someFolder', driveType: 'project' })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.fileInfoStub).exists()).toBeFalsy()
    })
  })
  describe('space info header', () => {
    it('should show when one project space resource selected', async () => {
      const item = mock<SpaceResource>({ path: '/someFolder', driveType: 'project' })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.spaceInfoStub).exists()).toBeTruthy()
    })
    it('not show when no resource selected', () => {
      const { wrapper } = createWrapper()
      expect(wrapper.find(selectors.spaceInfoStub).exists()).toBeFalsy()
    })
    it('should not show when selected resource is not a project space', async () => {
      const item = mock<Resource>({ path: '/someFolder' })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.spaceInfoStub).exists()).toBeFalsy()
    })
  })
  describe('loadSharesTask', () => {
    it('sets the loading state correctly', async () => {
      const resource = mock<Resource>()
      const { wrapper, mocks } = createWrapper()

      mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
        shares: [],
        allowedActions: [],
        allowedRoles: []
      })

      const { setLoading } = useSharesStore()
      await wrapper.vm.loadSharesTask.perform(resource)

      expect(setLoading).toHaveBeenCalledTimes(2)
    })
    it('sets direct collaborator and link shares', async () => {
      const resource = mock<Resource>()
      const { wrapper, mocks } = createWrapper()

      const collaboratorShare = { id: '1', role: {} } as unknown as CollaboratorShare
      const linkShare = { id: '2' } as unknown as LinkShare
      mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
        shares: [collaboratorShare, linkShare],
        allowedActions: [],
        allowedRoles: []
      })

      const { setCollaboratorShares, setLinkShares } = useSharesStore()
      await wrapper.vm.loadSharesTask.perform(resource)

      expect(setCollaboratorShares).toHaveBeenCalledWith([expect.anything()])
      expect(setLinkShares).toHaveBeenCalledWith([expect.anything()])
    })
    it('sets indirect shares', async () => {
      const resource = mock<Resource>()
      const { wrapper, mocks } = createWrapper()

      mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValueOnce({
        shares: [],
        allowedActions: [],
        allowedRoles: []
      })

      const collaboratorShare = { id: '1', role: {} } as unknown as CollaboratorShare
      mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValueOnce({
        shares: [collaboratorShare],
        allowedActions: [],
        allowedRoles: []
      })

      const resourcesStore = useResourcesStore()
      resourcesStore.ancestorMetaData = { '/foo': mock<AncestorMetaDataValue>({ id: '1' }) }

      await wrapper.vm.loadSharesTask.perform(resource)

      expect(
        mocks.$clientService.graphAuthenticated.permissions.listPermissions
      ).toHaveBeenCalledTimes(2)
    })
    it('loads available external share roles if the ocm app is enabled', async () => {
      const resource = mock<Resource>()
      const { wrapper, mocks } = createWrapper()

      mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
        shares: [],
        allowedActions: [],
        allowedRoles: []
      })

      const { isAppEnabled } = useAppsStore()
      vi.mocked(isAppEnabled).mockReturnValue(true)
      await wrapper.vm.loadSharesTask.perform(resource)

      expect(
        mocks.$clientService.graphAuthenticated.permissions.listPermissions
      ).toHaveBeenCalledTimes(2)
    })
    describe('cache', () => {
      it('is being used in non-flat file lists', async () => {
        const resource = mock<Resource>()
        const { wrapper, mocks } = createWrapper()

        mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
          shares: [],
          allowedActions: [],
          allowedRoles: []
        })

        const sharesStore = useSharesStore()
        sharesStore.collaboratorShares = [mock<CollaboratorShare>()]

        await wrapper.vm.loadSharesTask.perform(resource)

        expect(sharesStore.setCollaboratorShares).toHaveBeenCalledWith([expect.anything()])
      })
      it('is not being used in flat file lists', async () => {
        const resource = mock<Resource>()
        const { wrapper, mocks } = createWrapper({ currentRouteName: 'files-shares-with-me' })

        mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
          shares: [],
          allowedActions: [],
          allowedRoles: []
        })

        const sharesStore = useSharesStore()
        sharesStore.collaboratorShares = [mock<CollaboratorShare>()]

        await wrapper.vm.loadSharesTask.perform(resource)

        expect(sharesStore.setCollaboratorShares).toHaveBeenCalledWith([])
      })
      it('is not being used on projects overview', async () => {
        const resource = mock<Resource>()
        const { wrapper, mocks } = createWrapper({ currentRouteName: 'files-spaces-projects' })

        mocks.$clientService.graphAuthenticated.permissions.listPermissions.mockResolvedValue({
          shares: [],
          allowedActions: [],
          allowedRoles: []
        })

        const sharesStore = useSharesStore()
        sharesStore.collaboratorShares = [mock<CollaboratorShare>()]

        await wrapper.vm.loadSharesTask.perform(resource)

        expect(sharesStore.setCollaboratorShares).toHaveBeenCalledWith([])
      })
    })
  })
})

function createWrapper({
  item = undefined,
  isOpen = true,
  currentRouteName = 'files-spaces-generic',
  space = undefined
}: { item?: Resource; isOpen?: boolean; currentRouteName?: string; space?: SpaceResource } = {}) {
  const plugins = defaultPlugins()

  const { requestExtensions } = useExtensionRegistry()
  vi.mocked(requestExtensions).mockReturnValue([])

  const useSelectedResourcesMock = mock<ReturnType<typeof useSelectedResources>>()
  useSelectedResourcesMock.selectedResources = item ? ref([item]) : ref([])
  vi.mocked(useSelectedResources).mockReturnValue(useSelectedResourcesMock)

  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: currentRouteName })
  })
  return {
    mocks,
    wrapper: shallowMount(FileSideBar, {
      props: {
        isOpen,
        space
      },
      global: {
        plugins,
        renderStubDefaultSlot: true,
        stubs: {
          InnerSideBar: InnerSideBarComponent
        },
        mocks,
        provide: mocks
      }
    })
  }
}
