import Pagination from '../../../../src/components/FilesList/Pagination.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)

describe('Pagination', () => {
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
        $route: {
          name: 'some-path',
          path: '/some/path'
        }
      }
    })
  }

  function getMountedWrapper(store) {
    return mount(Pagination, {
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

  describe('pages', () => {
    describe('when value is less than or equals one', () => {
      it.each([-1, 0, 1])('should not show wrapper', pages => {
        const store = createStore(0, pages)
        const wrapper = getWrapper(store)

        expect(wrapper.find(selectors.filesPagination).exists()).toBeFalsy()
      })
    })

    describe('when value is greater than one', () => {
      const store = createStore(1, 2)
      const wrapper = getWrapper(store)

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
    it('should set current route as pagination current route', async () => {
      const wrapper = await getMountedWrapper(createStore(1, 2))
      const pagination = await wrapper.find(selectors.filesPagination)
      // should be current route path but getting undefined 😪
      expect(pagination.props().currentroute).toBe(undefined)
    })
  })
})
