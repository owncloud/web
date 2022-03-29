import { createLocalVue, shallowMount } from '@vue/test-utils'
import Files from '@/__fixtures__/files'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import AppBar from '@files/src/components/AppBar/AppBar.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectedFiles = [Files['/'][1], Files['/'][4]]

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

describe('AppBar component', () => {
  describe('renders', () => {
    it('by default no breadcrumbs, no bulkactions, no sharesnavigation but viewoptions and sidebartoggle', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store)
      expect(wrapper).toMatchSnapshot()
    })
    describe('breadcrumbs', () => {
      it('if given, by default without breadcrumbsContextActionsItems', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store, {}, { breadcrumbs: breadcrumbItems })
        expect(wrapper).toMatchSnapshot()
      })
      it('if given, with breadcrumbsContextActionsItems if allowed on last breadcrumb item', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(
          store,
          {},
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper).toMatchSnapshot()
      })
      it('if given, with content in the contextMenu slot', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(
          store,
          { contextMenu: contextMenuSlot },
          { breadcrumbs: [...breadcrumbItems, breadCrumbItemWithContextActionAllowed] }
        )
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('bulkActions', () => {
      it('if enabled', () => {
        const store = createStore({ selected: selectedFiles })
        const wrapper = getShallowWrapper(store, {}, { hasBulkActions: true })
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('sharesNavigation', () => {
      it('if enabled', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store, {}, { hasSharesNavigation: true })
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('viewoptions and sidebartoggle', () => {
      it('only viewoptions if sidebartoggle is disabled', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store, {}, { hasSidebarToggle: false })
        expect(wrapper).toMatchSnapshot()
      })
      it('only sidebartoggle if viewoptions is disabled', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store, {}, { hasViewOptions: false })
        expect(wrapper).toMatchSnapshot()
      })
      it('neither if both are disabled', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(
          store,
          {},
          { hasSidebarToggle: false, hasViewOptions: false }
        )
        expect(wrapper).toMatchSnapshot()
      })
    })
    it('if given, with content in the actions slot', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store, { actions: actionSlot })
      expect(wrapper).toMatchSnapshot()
    })
    it('if given, with content in the content slot', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store, { content: contentSlot })
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getShallowWrapper(
  store = {},
  slots = {},
  props = {
    breadcrumbs: [],
    hasBulkActions: false,
    hasSharesNavigation: false,
    hasSidebarToggle: true,
    hasViewOptions: true
  }
) {
  return shallowMount(AppBar, {
    localVue,
    mocks: {
      $route: {
        meta: {
          title: 'ExampleTitle'
        }
      }
    },
    slots,
    propsData: {
      ...props
    },
    store
  })
}

function createStore(state = { selected: [] }) {
  return new Vuex.Store({
    modules: {
      Files: {
        namespaced: true,
        state,
        getters: {
          selectedFiles: () => state.selected
        },
        mutations: {
          SET_HIDDEN_FILES_VISIBILITY: jest.fn()
        }
      }
    }
  })
}
