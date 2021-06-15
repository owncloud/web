import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import SidebarQuota from 'web-runtime/src/components/SidebarQuota.vue'
import stubs from '../../../../tests/unit/stubs'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

describe('Sidebar Quota component', () => {
  it.each([2, 3.34, 0])('displays the progressbar', relativeQuota => {
    const wrapper = mount(SidebarQuota, {
      store: new Vuex.Store({
        getters: {
          quota: function() {
            return { relative: relativeQuota }
          }
        }
      }),
      localVue,
      stubs: { ...stubs, translate: true }
    })
    expect(wrapper.find('progress').exists()).toBeTruthy()
    expect(wrapper.find('progress').element.getAttribute('value')).toEqual(relativeQuota.toString())
    expect(wrapper.find('progress').element.getAttribute('max')).toEqual('100')
  })
  it('displays the quota information', () => {
    localVue.use(GetTextPlugin, {
      translations: 'does-not-matter.json',
      silent: true
    })
    const wrapper = mount(SidebarQuota, {
      store: new Vuex.Store({
        getters: {
          quota: function() {
            return { used: 1287654323, definition: '2 GB' }
          }
        }
      }),
      localVue,
      stubs
    })
    expect(wrapper.html()).toContain('1.2 GB of 2 GB')
  })
})
