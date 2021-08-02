import GetTextPlugin from 'vue-gettext'
import { mount, shallowMount } from '@vue/test-utils'
import Personal from 'packages/web-app-files/src/views/Personal.vue'
import { createStore } from 'vuex-extensions'
import { createFile, localVue, getStore } from './views.setup'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(VueRouter)

const router = new VueRouter({
  routes: [{
    path: '/',
    name: 'files-personal'
  }]
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

const component = { ...Personal, created: jest.fn(), mounted: jest.fn() }

const spyOnFileDropped = jest
    .spyOn(Personal.methods, "fileDropped")
    .mockImplementation()

const wrapper = mount(component, {
  store: getStore(),
  localVue,
  router,
  stubs: stubs,
  data: () => ({
    loading: false
  }),
})

describe('Personal component', () => {
  describe('file move with drag & drop', () => {
    it('should react to drop event', async () => {
      const ocTableFiled = wrapper.find('#files-personal-table')
      ocTableFiled.vm.$emit('fileDropped', '123')
      await wrapper.vm.$nextTick()
      expect(spyOnFileDropped).toBeCalled();
    })
  })
})
