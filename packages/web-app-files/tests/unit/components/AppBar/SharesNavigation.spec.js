import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueRouter from 'vue-router'
import VueCompositionAPI from '@vue/composition-api'
import GetTextPlugin from 'vue-gettext'

import stubs from '@/tests/unit/stubs'

import SharesNavigation from '@files/src/components/AppBar/SharesNavigation'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(VueRouter)
localVue.use(VueCompositionAPI)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const router = new VueRouter()

describe('SharesNavigation component', () => {
  it('renders a shares navigation for both mobile and a desktop viewports', () => {
    const wrapper = getWrapper()
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper() {
  return mount(SharesNavigation, {
    localVue,
    setup() {
      const navItems = [
        {
          to: '/files/shares/with-me/',
          text: 'Shared with me',
          active: false
        },
        {
          to: '/files/shares/with-others/',
          text: 'Shared with others',
          active: false
        },
        {
          to: '/files/shares/via-link/',
          text: 'Shared via link',
          active: false
        }
      ]
      const currentNavItem = navItems[0]
      return {
        navItems,
        currentNavItem
      }
    },
    router,
    stubs: {
      ...stubs,
      'oc-drop': false,
      'oc-list': false
    }
  })
}
