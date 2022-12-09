import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import merge from 'lodash-es/merge'

import DesignSystem from '@ownclouders/design-system'

import Store from 'web-app-files/src/store'
import stubs from '@/tests/unit/stubs'
import OcPageSize from '@/tests/unit/stubs/OcPageSize'
import OcSwitch from '@/tests/unit/stubs/OcSwitch'

import ViewOptions from 'web-app-files/src/components/AppBar/ViewOptions.vue'

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
            SET_HIDDEN_FILES_VISIBILITY: jest.fn(),
            SET_FILE_EXTENSIONS_VISIBILITY: jest.fn()
          }
        }
      }
    }
    store = new Vuex.Store(merge({}, Store, mockedStore))
  })

  it('updates the files page limit when using page size component', async () => {
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
    await wrapper.vm.$nextTick()
    expect(window.localStorage.getItem('oc_options_items-per-page')).toBe('500')

    select.vm.$emit('input', 'all')
    await wrapper.vm.$nextTick()
    expect(window.localStorage.getItem('oc_options_items-per-page')).toBe('all')
  })

  it('updates the files page limit when route query changes', async () => {
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

    await wrapper.vm.$nextTick()
    expect(window.localStorage.getItem('oc_options_items-per-page')).toBe('500')
  })

  it('triggeres mutation to toggle hidden files', () => {
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

  it('initially shows normal resource-table by default', () => {
    const wrapper = shallowMount(ViewOptions, {
      store,
      router,
      localVue,
      stubs: stubs,
      directives: { OcTooltip }
    })
    const viewModeSwitchButtons = wrapper.find('[data-testid="viewmode-switch-buttons"]')

    expect(viewModeSwitchButtons).toMatchSnapshot()
  })
  it('toggles between normal and condensed resource-table upon clicking the respective buttons', async () => {
    localVue.use(DesignSystem)

    const wrapper = mount(ViewOptions, {
      store,
      router,
      localVue,
      stubs: {
        ...stubs,
        'oc-button': false
      },
      directives: { OcTooltip }
    })

    const viewModeSwitchButtons = wrapper.find('[data-testid="viewmode-switch-buttons"]')
    console.log(viewModeSwitchButtons.html())

    await wrapper
      .findAll('[data-testid="viewmode-switch-buttons"] > .oc-button')
      .at(0)
      .trigger('click')
    expect(viewModeSwitchButtons).toMatchSnapshot()

    await wrapper
      .findAll('[data-testid="viewmode-switch-buttons"] > .oc-button')
      .at(1)
      .trigger('click')
    expect(viewModeSwitchButtons).toMatchSnapshot()
  })
})
