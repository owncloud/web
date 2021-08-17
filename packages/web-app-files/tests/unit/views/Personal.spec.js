import GetTextPlugin from 'vue-gettext'
import { mount } from '@vue/test-utils'
import Personal from 'packages/web-app-files/src/views/Personal.vue'
import { localVue, getStore } from './views.setup'
import { createStore } from 'vuex-extensions'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'files-personal'
    }
  ]
})

jest.unmock('axios')

const stubs = {
  translate: true,
  'oc-pagination': true,
  'list-loader': true,
  'oc-table-files': true,
  'not-found-message': true,
  'quick-actions': true,
  'list-info': true
}

describe('Personal component', () => {
  describe('file move with drag & drop', () => {
    it('should react to drop event', async () => {
      const spyOnFileDropped = jest.spyOn(Personal.methods, 'fileDropped').mockImplementation()
      const component = { ...Personal, created: jest.fn(), mounted: jest.fn() }
      const wrapper = mount(component, {
        store: getStore(),
        localVue,
        router,
        stubs: stubs,
        data: () => ({
          loading: false
        })
      })
      const ocTableFiled = wrapper.find('#files-personal-table')
      ocTableFiled.vm.$emit('fileDropped', '123')
      await wrapper.vm.$nextTick()
      expect(spyOnFileDropped).toBeCalled()
    })
    it('should move a file', async () => {
      const spyOnFileDropped = jest.spyOn(Personal.methods, 'fileDropped').mockImplementation()
      const component = { ...Personal, created: jest.fn(), mounted: jest.fn() }
      const wrapper = mount(component, {
        store: createStore(Vuex.Store, {
          getters: {
            homeFolder: () => '/'
          },
          modules: {
            Files: {
              state: {
                resource: null,
                currentPage: 1
              },
              getters: {
                activeFiles: () => [],
                inProgress: () => [null],
                currentFolder: () => '/',
                pages: () => 4
              },
              mutations: {
                UPDATE_CURRENT_PAGE: () => {},
                SET_FILES_PAGE_LIMIT: () => {},
                CLEAR_FILES_SEARCHED: () => {}
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
      const ocTableFiled = wrapper.find('#files-personal-table')
      ocTableFiled.$emit('fileDropped', '123')
      await wrapper.vm.$nextTick()
      expect(spyOnFileDropped).toBeCalled()
    })
  })
})
