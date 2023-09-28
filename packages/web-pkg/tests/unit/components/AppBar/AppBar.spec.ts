import { ref } from 'vue'
import AppBar from '../../../../src/components/AppBar/AppBar.vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'
import { ArchiverService } from '../../../../src/services'
import { ViewModeConstants } from '../../../../src/composables'

const selectors = {
  ocBreadcrumbStub: 'oc-breadcrumb-stub',
  batchActionsStub: 'batch-actions-stub',
  viewOptionsStub: 'view-options-stub',
  sidebarToggleStub: 'sidebar-toggle-stub',
  mobileNavPortal: 'portal-target[name="app.runtime.mobile.nav"]'
}

const selectedFiles = [mockDeep<Resource>(), mockDeep<Resource>()]
const actionSlot = "<button class='action-slot'>Click</button>"
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

describe('AppBar component', () => {
  describe('renders', () => {
    it('by default no breadcrumbs, no bulkactions, no sharesnavigation but viewoptions and sidebartoggle', () => {
      const { wrapper } = getShallowWrapper()
      expect(wrapper.html()).toMatchSnapshot()
    })
    describe('breadcrumbs', () => {
      it('if given, by default without breadcrumbsContextActionsItems', () => {
        const { wrapper } = getShallowWrapper([], {}, { breadcrumbs: breadcrumbItems })
        expect(wrapper.find(selectors.ocBreadcrumbStub).exists()).toBeTruthy()
        expect(wrapper.findComponent<any>(selectors.ocBreadcrumbStub).props('items')).toEqual(
          breadcrumbItems
        )
      })
      it('if given, with breadcrumbsContextActionsItems if allowed on last breadcrumb item', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper.find(selectors.ocBreadcrumbStub).exists()).toBeTruthy()
        expect(wrapper.findComponent<any>(selectors.ocBreadcrumbStub).props('items')).toEqual([
          ...breadcrumbItems,
          breadCrumbItemWithContextActionAllowed
        ])
      })
      it('not if no breadcrumb items given', () => {
        const { wrapper } = getShallowWrapper([], {}, { breadcrumbs: [] })
        expect(wrapper.find(selectors.ocBreadcrumbStub).exists()).toBeFalsy()
      })
      it('not if one breadcrumb item is given in mobile view', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { breadcrumbs: [breadcrumbItems[0]] },
          mock<RouteLocation>(),
          true
        )
        expect(wrapper.find(selectors.ocBreadcrumbStub).exists()).toBeFalsy()
      })
    })
    describe('bulkActions', () => {
      it('if enabled', () => {
        const { wrapper } = getShallowWrapper(selectedFiles, {}, { hasBulkActions: true })
        expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
      })
      it('if 1 file selected on trash routes', () => {
        const { wrapper } = getShallowWrapper(
          [selectedFiles[0]],
          {},
          { hasBulkActions: true },
          mock<RouteLocation>({
            name: 'files-trash-generic',
            path: '/files/trash/personal/admin'
          })
        )
        expect(wrapper.find(selectors.batchActionsStub).exists()).toBeTruthy()
      })
    })
    describe('mobile navigation portal', () => {
      it.each([
        { items: [], shows: true },
        { items: [breadcrumbItems[0]], shows: true },
        { items: [breadcrumbItems[0], breadcrumbItems[1]], shows: false }
      ])('if less than 2 breadcrumb items given', ({ items, shows }) => {
        const { wrapper } = getShallowWrapper([], {}, { breadcrumbs: items })
        expect(wrapper.find(selectors.mobileNavPortal).exists()).toBe(shows)
      })
    })
    describe('viewoptions and sidebartoggle', () => {
      it('only viewoptions if sidebartoggle is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasSidebarToggle: false })
        expect(wrapper.find(selectors.viewOptionsStub).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sidebarToggleStub).exists()).toBeFalsy()
      })
      it('only sidebartoggle if viewoptions is disabled', () => {
        const { wrapper } = getShallowWrapper([], {}, { hasViewOptions: false })
        expect(wrapper.find(selectors.viewOptionsStub).exists()).toBeFalsy()
        expect(wrapper.find(selectors.sidebarToggleStub).exists()).toBeTruthy()
      })
      it('neither if both are disabled', () => {
        const { wrapper } = getShallowWrapper(
          [],
          {},
          { hasSidebarToggle: false, hasViewOptions: false }
        )
        expect(wrapper.find(selectors.viewOptionsStub).exists()).toBeFalsy()
        expect(wrapper.find(selectors.sidebarToggleStub).exists()).toBeFalsy()
      })
      it('passes viewModes array to ViewOptions', () => {
        const viewModes = [ViewModeConstants.tilesView]
        const { wrapper } = getShallowWrapper([], {}, { hasViewOptions: true, viewModes })
        expect(wrapper.findComponent<any>(selectors.viewOptionsStub).props('viewModes')).toEqual(
          viewModes
        )
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
    hasSidebarToggle: true,
    hasViewOptions: true
  },
  currentRoute = mock<RouteLocation>({
    name: 'files-spaces-generic',
    path: '/files/spaces/personal/admin'
  }),
  isMobileWidth = false
) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute
    }),
    $archiverService: mock<ArchiverService>()
  }
  mocks.$route.meta.title = 'ExampleTitle'
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.getters.selectedFiles.mockImplementation(() => selected)
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(AppBar, {
      props: { ...props, space: mock<SpaceResource>() },
      slots,
      global: {
        plugins: [...defaultPlugins(), store],
        provide: { ...mocks, isMobileWidth: ref(isMobileWidth) },
        mocks
      }
    })
  }
}
