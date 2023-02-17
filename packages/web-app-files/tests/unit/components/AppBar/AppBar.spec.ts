import AppBar from 'web-app-files/src/components/AppBar/AppBar.vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  getActionMixinMocks,
  shallowMount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'

const selectedFiles = [mockDeep<Resource>(), mockDeep<Resource>()]
const actionSlot = "<button class='action-slot'>Click</button>"
const contextMenuSlot = "<button class='context-menu-slot'>Click</button>"
const contentSlot = "<div class='content-slot'>Foo</div>"

const mixins = [
  '$_clearSelection_items',
  '$_acceptShare_items',
  '$_declineShare_items',
  '$_downloadArchive_items',
  '$_downloadFile_items',
  '$_move_items',
  '$_copy_items',
  '$_emptyTrashBin_items',
  '$_delete_items',
  '$_restore_items'
]

const breadcrumbItems = [
  { text: 'Example1', to: '/' },
  { text: 'Example2', to: '/foo' }
]
const breadCrumbItemWithContextActionAllowed = {
  text: 'Example Special',
  to: '/bar',
  allowContextActions: true
}

describe('AppBar component', () => {
  describe('renders', () => {
    it('by default no breadcrumbs, no bulkactions, no sharesnavigation but viewoptions and sidebartoggle', () => {
      const { wrapper } = getShallowWrapper()
      expect(wrapper.html()).toMatchSnapshot()
    })
    describe('breadcrumbs', () => {
      it('if given, by default without breadcrumbsContextActionsItems', () => {
        const { wrapper } = getShallowWrapper([], {}, { breadcrumbs: breadcrumbItems })
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('if given, with breadcrumbsContextActionsItems if allowed on last breadcrumb item', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('if given, with content in the contextMenu slot', () => {
        const { wrapper } = getShallowWrapper(
          [],
          { contextMenu: contextMenuSlot },
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
    describe('bulkActions', () => {
      it('if enabled', () => {
        const { wrapper } = getShallowWrapper(selectedFiles, {}, { hasBulkActions: true })
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('not if 1 file selected', () => {
        const { wrapper } = getShallowWrapper([selectedFiles[0]], {}, { hasBulkActions: true })
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
    describe('sharesNavigation', () => {
      it('if enabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasSharesNavigation: true })
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
    describe('viewoptions and sidebartoggle', () => {
      it('only viewoptions if sidebartoggle is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasSidebarToggle: false })
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('only sidebartoggle if viewoptions is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasViewOptions: false })
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('neither if both are disabled', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { hasSidebarToggle: false, hasViewOptions: false }
        )
        expect(wrapper.html()).toMatchSnapshot()
      })
      it('passes viewModes array to ViewOptions if displayViewModeSwitch props is enabled', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { displayViewModeSwitch: true, hasViewOptions: true }
        )
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
    it('if given, with content in the actions slot', () => {
      const { wrapper } = getShallowWrapper([], { actions: actionSlot })
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('if given, with content in the content slot', () => {
      const { wrapper } = getShallowWrapper([], { content: contentSlot })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getShallowWrapper(
  selected = [],
  slots = {},
  props: { [key: string]: any } = {
    breadcrumbs: [],
    displayViewModeSwitch: false,
    hasBulkActions: false,
    hasSharesNavigation: false,
    hasSidebarToggle: true,
    hasViewOptions: true
  }
) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-trash-generic' })
    }),
    ...getActionMixinMocks({ actions: mixins })
  }
  mocks.$route.meta.title = 'ExampleTitle'
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.getters.selectedFiles.mockImplementation(() => selected)
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(
      { ...AppBar, mixins },
      {
        props: { ...props },
        slots,
        global: {
          plugins: [...defaultPlugins(), store],
          mocks
        }
      }
    )
  }
}
