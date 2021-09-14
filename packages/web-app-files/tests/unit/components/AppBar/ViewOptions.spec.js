import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import merge from 'lodash-es/merge'

import Store from '@files/src/store'
import stubs from '@/tests/unit/stubs'
import OcPageSize from '@/tests/unit/stubs/OcPageSize'
import OcSwitch from '@/tests/unit/stubs/OcSwitch'

import ViewOptions from '@files/src/components/AppBar/ViewOptions.vue'

const OcTooltip = jest.fn()

describe('ViewOptions', () => {
  let localVue, router, mockedStore, store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VueRouter)

    router = new VueRouter()

    mockedStore = {
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            SET_HIDDEN_FILES_VISIBILITY: jest.fn()
          },
          modules: {
            sidebar: {
              namespaced: true
            },
            pagination: {
              namespaced: true,
              mutations: {
                SET_ITEMS_PER_PAGE: jest.fn()
              }
            }
          }
        }
      }
    }
    store = new Vuex.Store(merge({}, Store, mockedStore))
  })

  it('updates the files page limit when using page size component', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      router,
      localVue,
      stubs,
      directives: { OcTooltip }
    })
    const select = wrapper.find('[data-testid="files-pagination-size"]')

    expect(select.exists()).toBe(true)

    select.vm.$emit('input', 500)

    expect(
      mockedStore.modules.Files.modules.pagination.mutations.SET_ITEMS_PER_PAGE
    ).toHaveBeenCalled()
  })

  it('updates the files page limit when route query changes', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      router,
      localVue,
      stubs: {
        ...stubs,
        'oc-page-size': OcPageSize(localVue)
      },
      directives: {
        OcTooltip
      }
    })

    wrapper.vm.$router.replace({ query: { 'items-per-page': 500 } }).catch(() => {})

    expect(
      mockedStore.modules.Files.modules.pagination.mutations.SET_ITEMS_PER_PAGE
    ).toHaveBeenCalled()
  })

  it('triggers mutation to toggle hidden files', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      localVue,
      stubs: {
        ...stubs,
        'oc-switch': OcSwitch(localVue)
      },
      directives: {
        OcTooltip
      },
      router
    })

    wrapper.find('[data-testid="files-switch-hidden-files"]').vm.$emit('change', false)

    expect(mockedStore.modules.Files.mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
  })
})
