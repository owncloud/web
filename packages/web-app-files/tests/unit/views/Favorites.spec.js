import GetTextPlugin from 'vue-gettext'
import { mount } from '@vue/test-utils'
import Favorites from 'packages/web-app-files/src/views/Favorites.vue'
import { createStore } from 'vuex-extensions'
import { createFile, localVue, getStore } from './views.setup'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(VueRouter)

const router = new VueRouter()

jest.unmock('axios')

const selectors = {
  favoritesTable: '#files-favorites-table'
}
const component = { ...Favorites, created: jest.fn(), mounted: jest.fn() }
const stubs = {
  'router-link': true,
  translate: true,
  'oc-pagination': true,
  'oc-table-files': true,
  'oc-spinner': true,
  'context-actions': true
}

const defaultWrapper = mount(component, {
  store: getStore(),
  localVue,
  router,
  stubs: stubs,
  data: () => ({
    loading: false
  })
})

describe('Favorites component', () => {
  describe('loading indicator', () => {
    it('shows only the list-loader during loading', () => {
      const wrapper = mount(component, {
        store: getStore(),
        localVue,
        router,
        stubs: stubs,
        data: () => ({
          loading: true
        })
      })
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
      expect(wrapper.find('oc-table-files-stub').exists()).toBeFalsy()
    })
    it('shows only the files table when loading is finished', () => {
      expect(defaultWrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(defaultWrapper.find('oc-table-files-stub').exists()).toBeTruthy()
    })
  })
  describe('no content message', () => {
    it('shows only the "no content" message if no resources are marked as favorite', () => {
      const wrapper = mount(component, {
        store: createStore(Vuex.Store, {
          modules: {
            Files: {
              state: {
                resource: null,
                currentPage: 1
              },
              getters: {
                activeFiles: () => [],
                inProgress: () => [null]
              },
              mutations: {
                UPDATE_CURRENT_PAGE: () => {},
                SET_FILES_PAGE_LIMIT: () => {}
              },
              namespaced: true
            }
          }
        }),
        localVue,
        router,
        stubs: stubs,
        data: () => ({
          loading: false
        })
      })
      expect(wrapper.find('#files-favorites-empty').exists()).toBeTruthy()
      expect(wrapper.find('oc-table-files-stub').exists()).toBeFalsy()
    })
    it('does not show the no content message if resources are marked as favorite', () => {
      expect(defaultWrapper.find('#files-favorites-empty').exists()).toBeFalsy()
      expect(defaultWrapper.find('oc-table-files-stub').exists()).toBeTruthy()
    })
  })
  describe('files table', () => {
    describe('no file is highlighted', () => {
      it("don't squash the table", () => {
        expect(defaultWrapper.find(selectors.favoritesTable).attributes('class')).not.toContain(
          'files-table-squashed'
        )
        expect(defaultWrapper.find(selectors.favoritesTable).attributes('class')).toContain(
          'files-table'
        )
      })
      it('don\'t sets the "highlighted" attribute', () => {
        expect(defaultWrapper.find(selectors.favoritesTable).attributes('highlighted')).toBeFalsy()
      })
    })
    describe('a file is highlighted', () => {
      const wrapper = mount(component, {
        store: getStore({ highlightedFile: createFile({ id: 234 }) }),
        localVue,
        router,
        stubs: stubs,
        data: () => ({
          loading: false
        })
      })
      it('squash the table', () => {
        expect(wrapper.find(selectors.favoritesTable).attributes('class')).toContain(
          'files-table-squashed'
        )
      })
    })
    describe('previews', () => {
      it('displays previews when the "disablePreviews" config is disabled', () => {
        const wrapper = mount(component, {
          store: getStore({
            configuration: {
              options: {
                disablePreviews: false
              }
            }
          }),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(
          wrapper.find(selectors.favoritesTable).attributes('arethumbnailsdisplayed')
        ).toBeTruthy()
      })
      it('hides previews when the "disablePreviews" config is enabled', () => {
        expect(
          defaultWrapper.find(selectors.favoritesTable).attributes('arethumbnailsdisplayed')
        ).toBeFalsy()
      })
    })
    describe('pagination', () => {
      beforeEach(() => {
        stubs['oc-table-files'] = false
      })
      it('sets the pages count & the current page', () => {
        const wrapper = mount(component, {
          store: getStore(),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(wrapper.find('oc-pagination-stub').attributes('currentpage')).toEqual('3')
        expect(wrapper.find('oc-pagination-stub').attributes('pages')).toEqual('4')
      })

      it('does not show any pagination when there is only one page', () => {
        const wrapper = mount(component, {
          store: getStore({ pages: 1 }),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(wrapper.find('oc-pagination-stub').exists()).toBeFalsy()
      })
    })
    describe('list-info', () => {
      beforeEach(() => {
        stubs['oc-table-files'] = false
        stubs['list-info'] = true
      })
      it('sets the counters and the size', () => {
        const wrapper = mount(component, {
          store: getStore(),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(wrapper.find('list-info-stub').attributes('files')).toEqual('15')
        expect(wrapper.find('list-info-stub').attributes('folders')).toEqual('20')
        expect(wrapper.find('list-info-stub').attributes('size')).toEqual('1024')
      })
      it('shows the list info when there is only one active file', () => {
        const wrapper = mount(component, {
          store: getStore({ activeFiles: [createFile({ id: 3, status: 2, type: 'file' })] }),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(wrapper.find('list-info-stub').exists()).toBeTruthy()
      })

      it('does not show the list info when there are no active files', () => {
        const wrapper = mount(component, {
          store: getStore({ activeFiles: [] }),
          localVue,
          router,
          stubs: stubs,
          data: () => ({
            loading: false
          })
        })
        expect(wrapper.find('list-info-stub').exists()).toBeFalsy()
      })
    })
  })
})
