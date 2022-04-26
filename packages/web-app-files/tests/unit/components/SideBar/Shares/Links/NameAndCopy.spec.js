import { createLocalVue, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import NameAndCopy from '@files/src/components/SideBar/Shares/Links/NameAndCopy.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const exampleLink = {
  name: 'Example link',
  url: 'https://some-url.com/abc'
}

describe('NameAndCopy', () => {
  it('should show link info component', () => {
    const wrapper = getShallowWrapper()
    expect(wrapper).toMatchSnapshot()
  })
})

function getShallowWrapper() {
  return shallowMount(NameAndCopy, {
    localVue,
    propsData: {
      link: exampleLink
    },
    stubs: {
      'oc-icon': true,
      'copy-to-clipboard-button': true
    }
  })
}
