import { shallowMount, createLocalVue, config } from '@vue/test-utils'
import Vuex from 'vuex'

import Store from '@files/src/store'
import stubs from '@/tests/unit/stubs'

import AppBar from '@files/src/components/AppBar/AppBar.vue'

describe('AppBar', () => {
  let store, mutations
  const localVue = createLocalVue()

  localVue.use(Vuex)

  beforeEach(() => {
    mutations = { SET_HIDDEN_FILES_VISIBILITY: jest.fn() }
    store = new Vuex.Store({
      modules: {
        Files: {
          ...Store,
          mutations
        }
      },
      getters: {
        getToken: () => 'token',
        newFileHandlers: () => []
      }
    })
    config.mocks = Object.assign(config.mocks, {
      $route: {
        meta: { title: 'files' },
        params: { item: '' }
      },
      publicPage: () => false
    })
  })

  it('triggeres mutation to toggle hidden files', async () => {
    const OcSwitch = localVue.component('oc-switch', {
      model: { prop: 'value', event: 'change' },
      template: '<input type="checkbox" />'
    })
    const wrapper = shallowMount(AppBar, {
      store,
      localVue,
      stubs: {
        ...stubs,
        'oc-switch': OcSwitch
      },
      directives: { OcTooltip: () => {} }
    })

    wrapper.find('[data-test-id="files-switch-hidden-files"]').vm.$emit('change', false)
    await wrapper.vm.$nextTick()

    expect(mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
  })
})
