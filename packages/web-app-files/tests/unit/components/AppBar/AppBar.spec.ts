import AppBar from 'web-app-files/src/components/AppBar/AppBar.vue'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const selectedFiles = [mockDeep<Resource>(), mockDeep<Resource>()]
const actionSlot = "<button class='action-slot'>Click</button>"
const contextMenuSlot = "<button class='context-menu-slot'>Click</button>"
const contentSlot = "<div class='content-slot'>Foo</div>"

const breadcrumbItems = [
  { text: 'Example1', to: '/' },
  { text: 'Example2', to: '/foo' }
]
const breadCrumbItemWithContextActionAllowed = {
  text: 'Example Special',
  to: '/bar',
  allowContextActions: true
}

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))

describe('AppBar component', () => {
  describe('renders', () => {
    it('by default no breadcrumbs, no bulkactions, no sharesnavigation but viewoptions and sidebartoggle', () => {
      const { wrapper } = getShallowWrapper()
      expect(wrapper).toMatchSnapshot()
    })
    describe('breadcrumbs', () => {
      it('if given, by default without breadcrumbsContextActionsItems', () => {
        const { wrapper } = getShallowWrapper([], {}, { breadcrumbs: breadcrumbItems })
        expect(wrapper).toMatchSnapshot()
      })
      it('if given, with breadcrumbsContextActionsItems if allowed on last breadcrumb item', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper).toMatchSnapshot()
      })
      it('if given, with content in the contextMenu slot', () => {
        const { wrapper } = getShallowWrapper(
          [],
          { contextMenu: contextMenuSlot },
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('bulkActions', () => {
      it('if enabled', () => {
        const { wrapper } = getShallowWrapper(selectedFiles, {}, { hasBulkActions: true })
        expect(wrapper).toMatchSnapshot()
      })
      it('not if 1 file selected', () => {
        const { wrapper } = getShallowWrapper([selectedFiles[0]], {}, { hasBulkActions: true })
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('sharesNavigation', () => {
      it('if enabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasSharesNavigation: true })
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('viewoptions and sidebartoggle', () => {
      it('only viewoptions if sidebartoggle is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasSidebarToggle: false })
        expect(wrapper).toMatchSnapshot()
      })
      it('only sidebartoggle if viewoptions is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasViewOptions: false })
        expect(wrapper).toMatchSnapshot()
      })
      it('neither if both are disabled', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { hasSidebarToggle: false, hasViewOptions: false }
        )
        expect(wrapper).toMatchSnapshot()
      })
    })
    it('if given, with content in the actions slot', () => {
      const { wrapper } = getShallowWrapper([], { actions: actionSlot })
      expect(wrapper).toMatchSnapshot()
    })
    it('if given, with content in the content slot', () => {
      const { wrapper } = getShallowWrapper([], { content: contentSlot })
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getShallowWrapper(
  selected = [],
  slots = {},
  props: { [key: string]: any } = {
    breadcrumbs: [],
    hasBulkActions: false,
    hasSharesNavigation: false,
    hasSidebarToggle: true,
    hasViewOptions: true
  }
) {
  const mocks = defaultComponentMocks({
    gettext: false,
    currentRoute: { name: 'files-trash-generic' }
  })
  mocks.$route.meta.title = 'ExampleTitle'
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.getters.selectedFiles.mockImplementation(() => selected)
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(AppBar, {
      props: { ...props },
      slots,
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
