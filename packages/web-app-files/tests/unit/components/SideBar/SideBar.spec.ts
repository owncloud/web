import fileSideBars from 'web-app-files/src/fileSideBars'
import {
  createLocationPublic,
  createLocationSpaces,
  createLocationTrash
} from '../../../../src/router'
import InnerSideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import SideBar from 'web-app-files/src/components/SideBar/SideBar.vue'
import { Resource } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  shallowMount
} from 'web-test-helpers'

jest.mock('web-pkg/src/observer')
jest.mock('web-app-files/src/helpers/resources', () => {
  const original = jest.requireActual('web-app-files/src/helpers/resources')
  return {
    ...original,
    buildResource: jest.fn()
  }
})

const selectors = {
  noSelectionInfoPanel: 'noselection-stub',
  tagsPanel: '#sidebar-panel-tags'
}

describe('SideBar', () => {
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
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
  })
  describe('tags panel', () => {
    it('shows when enabled via capabilities and possible on the resource', () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item })
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(true)
    })
    it('does not show when disabled via capabilities', () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item, tagsEnabled: false })
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it('does not show for root folders', () => {
      const item = mockDeep<Resource>({ path: '/', canEditTags: () => true })
      const { wrapper } = createWrapper({ item })
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it('does not show when not possible on the resource', () => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => false })
      const { wrapper } = createWrapper({ item })
      expect(wrapper.find(selectors.tagsPanel).exists()).toBe(false)
    })
    it.each([
      createLocationTrash('files-trash-generic'),
      createLocationPublic('files-public-link')
    ])('does not show on trash and public routes', (currentRoute) => {
      const item = mockDeep<Resource>({ path: '/someFolder', canEditTags: () => true })
      const { wrapper } = createWrapper({ item, currentRoute })
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
  return {
    wrapper: shallowMount(SideBar, {
      props: {
        open: true
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: {
          ...defaultStubs,
          SideBar: InnerSideBar
        },
        directives: {
          'click-outside': jest.fn()
        },
        mocks: {
          ...defaultComponentMocks({ currentRoute: currentRoute as unknown })
        }
      }
    })
  }
}
