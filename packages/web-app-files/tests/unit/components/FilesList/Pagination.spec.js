import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import Pagination from '../../../../src/components/FilesList/Pagination.vue'
import { createLocalVue, mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('Pagination', () => {
  describe('pages', () => {
    describe('when value is less than or equals one', () => {
      it.each([-1, 0, 1])('should not show wrapper', pages => {
        const store = createStore(0, pages)
        const wrapper = getWrapper(store)

        expect(wrapper.find(selectors.filesPagination).exists()).toBeFalsy()
      })
    })

    describe('when value is greater than one', () => {
      const wrapper = getWrapper(createStore(1, 2))

      it('should show wrapper', () => {
        const paginationEl = wrapper.find('.files-pagination')

        expect(paginationEl.exists()).toBeTruthy()
        expect(paginationEl.attributes().pages).toBe('2')
      })

      it('should set provided current page', () => {
        const paginationEl = wrapper.find(selectors.filesPagination)

        expect(paginationEl.attributes().currentpage).toBe('1')
      })
    })
  })

  describe('current route', () => {
    it('should use provided route to render pages', () => {
      const wrapper = getMountedWrapper(createStore())
      const currentRoute = wrapper.vm.$route
      const links = wrapper.findAllComponents(RouterLinkStub)

      // three links (route to prev, next and last page)
      expect(links.length).toBe(3)
      expect(links.at(0).props().to.name).toBe(currentRoute.name)
      expect(links.at(1).props().to.name).toBe(currentRoute.name)
      expect(links.at(2).props().to.name).toBe(currentRoute.name)
    })
  })

  const filesPersonalRoute = { name: 'files-personal', path: '/files/home' }

  const selectors = {
    filesPagination: '.files-pagination'
  }

  function createStore(currentPage = 1, pages = 10) {
    return new Vuex.Store({
      modules: {
        Files: {
          namespaced: true,
          state: {
            currentPage: currentPage
          },
          getters: {
            pages: () => {
              return pages
            }
          }
        }
      }
    })
  }

  function getWrapper(store) {
    return shallowMount(Pagination, {
      localVue,
      store: store,
      stubs: {
        'oc-pagination': true
      },
      mocks: {
        $route: filesPersonalRoute
      }
    })
  }

  function getMountedWrapper(store) {
    return mount(Pagination, {
      localVue,
      store: store,
      stubs: {
        'oc-pagination': false,
        RouterLink: RouterLinkStub
      },
      mocks: {
        $route: filesPersonalRoute
      }
    })
  }
})
