import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import Store from '@files/src/store'
import stubs from '@/tests/unit/stubs'
import OcPageSize from '@/tests/unit/stubs/OcPageSize'
import OcSwitch from '@/tests/unit/stubs/OcSwitch'

import ViewOptions from '@files/src/components/AppBar/ViewOptions.vue'

describe('ViewOptions', () => {
  let localVue, router, mutations, store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VueRouter)

    router = new VueRouter()
    mutations = {
      ...Store.mutations,
      SET_FILES_PAGE_LIMIT: jest.fn(),
      SET_HIDDEN_FILES_VISIBILITY: jest.fn()
    }
    store = new Vuex.Store({
      modules: {
        Files: {
          ...Store,
          mutations
        }
      }
    })
  })

  it('updates the files page limit when using page size component', () => {
    const wrapper = shallowMount(ViewOptions, { store, router, localVue, stubs })
    const select = wrapper.find('[data-testid="files-pagination-size"]')

    expect(select.exists()).toBe(true)

    select.vm.$emit('input', 500)

    expect(mutations.SET_FILES_PAGE_LIMIT).toHaveBeenCalled()
  })

  it('updates the files page limit when route query changes', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      router,
      localVue,
      stubs: { ...stubs, 'oc-page-size': OcPageSize(localVue) }
    })

    wrapper.vm.$router.replace({ query: { 'items-limit': 500 } }).catch(() => {})

    expect(mutations.SET_FILES_PAGE_LIMIT).toHaveBeenCalled()
  })

  it('triggeres mutation to toggle hidden files', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      localVue,
      stubs: {
        ...stubs,
        'oc-switch': OcSwitch(localVue)
      },
      directives: { OcTooltip: jest.fn() },
      router
    })

    wrapper.find('[data-testid="files-switch-hidden-files"]').vm.$emit('change', false)

    expect(mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
  })
})
