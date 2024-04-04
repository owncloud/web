import FileSideBar from '../../../../src/components/SideBar/FileSideBar.vue'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { mock } from 'vitest-mock-extended'
import {
  defaultComponentMocks,
  defaultPlugins,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'
import { defineComponent, ref } from 'vue'
import { useSelectedResources } from '../../../../src/composables/selection'
import { useExtensionRegistry } from '../../../../src'

const InnerSideBarComponent = defineComponent({
  props: { availablePanels: { type: Array, required: true } },
  template: '<div id="foo"><slot name="header"></slot></div>'
})

vi.mock('../../../../src/composables/selection', () => ({ useSelectedResources: vi.fn() }))

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
})

function createWrapper({
  item = undefined,
  isOpen = true
}: { item?: Resource; isOpen?: boolean } = {}) {
  const plugins = defaultPlugins()

  const { requestExtensions } = useExtensionRegistry()
  vi.mocked(requestExtensions).mockReturnValue([])

  vi.mocked(useSelectedResources).mockReturnValue(
    mock<ReturnType<typeof useSelectedResources>>({
      selectedResources: item ? ref([item]) : ref([])
    })
  )

  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
  })
  return {
    wrapper: shallowMount(FileSideBar, {
      props: {
        isOpen
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
