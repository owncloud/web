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

const selectedFile = Files['/'][1]
const selectedFiles = [Files['/'][1], Files['/'][4]]

describe('AppBar component', () => {
  describe('with no selected files', () => {
    const store = createStore({ selected: [] })
    const wrapper = getShallowWrapper(store)

    it('renders basic appBar with content slot', () => {
      const slotEl = wrapper.find('ruby')
      expect(slotEl.exists()).toBeTruthy()

      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('with one selected file', () => {
    it('tbd', () => {
      const store = createStore({ selected: selectedFile })
      const wrapper = getShallowWrapper(store)
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('with multiple selected files', () => {
    it('tbd', () => {
      const store = createStore({ selected: selectedFiles })
      const wrapper = getShallowWrapper(store)
      expect(wrapper).toMatchSnapshot()
    })
  })

  it.todo('renders breadcrumbs')
  it.todo('last breadcrumb item emits event upon click')
})

function getShallowWrapper(store = {}) {
  return shallowMount(AppBar, {
    localVue,
    mocks: {
      $route: {
        meta: {
          title: 'ExampleTitle'
        }
      }
    },
    propsData: {
      slots: {
        actions: '<button>Click me</button>',
        content: '<ruby>Static content</ruby>'
      }
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
