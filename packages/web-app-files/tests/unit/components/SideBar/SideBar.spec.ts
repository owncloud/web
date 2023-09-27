import fileSideBars from 'web-app-files/src/fileSideBars'
import { createLocationPublic, createLocationSpaces, createLocationTrash } from 'web-pkg/src/router'
import SideBar from 'web-app-files/src/components/SideBar/SideBar.vue'
import { Resource } from 'web-client/src/helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  RouteLocation,
  shallowMount
} from 'web-test-helpers'

jest.mock('web-pkg/src/observer')
jest.mock('web-client/src/helpers/resource', () => {
  const original = jest.requireActual('web-client/src/helpers/resource')
  return {
    ...original,
    buildResource: jest.fn()
  }
})

const selectors = {
  noSelectionInfoPanel: 'no-selection-stub',
  fileInfoStub: 'file-info-stub',
  spaceInfoStub: 'space-info-stub',
  tagsPanel: '#sidebar-panel-tags'
}

describe('SideBar', () => {
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
      const item = mock<Resource>({ path: '/someFolder', driveType: 'project' })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.fileInfoStub).exists()).toBeFalsy()
    })
  })
  describe('space info header', () => {
    it('should show when one project space resource selected', async () => {
      const item = mock<Resource>({ path: '/someFolder', driveType: 'project' })
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
  describe('no selection info panel', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('for public links', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/publicLinkToken/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const { wrapper } = createWrapper({ item })
        wrapper.vm.loadedResource = item
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
    describe('for all files', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '/',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const { wrapper } = createWrapper({ item })
        wrapper.vm.loadedResource = item
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
  })
  describe('tags panel', () => {
    it('shows when enabled via capabilities and possible on the resource', async () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(true)
    })
    it('does not show when disabled via capabilities', async () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item, tagsEnabled: false })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it('does not show for root folders', async () => {
      const item = mockDeep<Resource>({ path: '/', canEditTags: () => true })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it('does not show when not possible on the resource', async () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => false })
      const { wrapper } = createWrapper({ item })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it.each([
      createLocationTrash('files-trash-generic'),
      createLocationPublic('files-public-link')
    ])('does not show on trash and public routes', async (currentRoute) => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item, currentRoute })
      wrapper.vm.loadedResource = item
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
  })
})

function createWrapper({
  item = undefined,
  currentRoute = createLocationSpaces('files-spaces-generic'),
  tagsEnabled = true
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      user: function () {
        return { id: 'marie' }
      },
      capabilities: () => ({
        files: { tags: tagsEnabled },
        files_sharing: {
          api_enabled: true,
          public: { enabled: true }
        }
      })
    }
  }
  storeOptions.modules.apps.getters.fileSideBars.mockImplementation(() => fileSideBars)
  storeOptions.modules.Files.state.highlightedFile = item
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(
    (state) => state.highlightedFile
  )
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({ currentRoute: mock<RouteLocation>(currentRoute as any) })
  return {
    wrapper: shallowMount(SideBar, {
      props: {
        open: true
      },
      global: {
        plugins: [...defaultPlugins(), store],
        renderStubDefaultSlot: true,
        stubs: {
          InnerSideBar: false
        },
        mocks,
        provide: mocks
      }
    })
  }
}
