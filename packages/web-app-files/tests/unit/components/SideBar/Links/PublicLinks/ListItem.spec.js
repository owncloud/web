import ListItem from '@files/src/components/SideBar/Links/PublicLinks/ListItem.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'

const localVue = createLocalVue()

describe('ListItem', () => {
  it('should show link info component', () => {
    const wrapper = getShallowWrapper(getLinkObject())
    expect(wrapper.find('link-info-stub').props('link')).toMatchObject({
      name: 'public link',
      url: 'some-url',
      indirect: false
    })
  })

  it('should show link actions component if link is not indirect', () => {
    const wrapper = getShallowWrapper(getLinkObject())
    const linkActions = wrapper.find('link-actions-stub')
    expect(linkActions.exists()).toBeTruthy()
    expect(linkActions.props('link')).toMatchObject({
      name: 'public link',
      url: 'some-url',
      indirect: false
    })
  })
  it('should not show link actions component if link is indirect', () => {
    const wrapper = getShallowWrapper(getLinkObject(true))
    const linkActions = wrapper.find('link-actions-stub')
    expect(linkActions.exists()).toBeFalsy()
  })
})

function getLinkObject(indirect = false) {
  return {
    link: {
      name: 'public link',
      url: 'some-url',
      indirect: indirect
    }
  }
}

function getShallowWrapper(props) {
  return shallowMount(ListItem, {
    localVue,
    propsData: props,
    stubs: {
      'oc-grid': true,
      'link-info': true,
      'link-actions': true
    }
  })
}
