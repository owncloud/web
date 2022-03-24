import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import ContextActionMenu from '@files/src/components/ContextActionMenu'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('ContextActionMenu component', () => {
  it('renders the menu with actions', () => {
    const menuSections = [{ name: 'action 1' }, { name: 'action 2' }]
    const wrapper = getShallowWrapper(menuSections)
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('.oc-files-context-actions').exists()).toBeTruthy()
    expect(wrapper.findAll('.oc-files-context-actions').length).toEqual(menuSections.length)
  })
})

function getShallowWrapper(menuSections, items = []) {
  return shallowMount(ContextActionMenu, {
    localVue,
    propsData: {
      menuSections,
      items
    }
  })
}
