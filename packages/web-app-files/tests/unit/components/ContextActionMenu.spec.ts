import ContextActionMenu from 'web-app-files/src/components/ContextActionMenu.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'

describe('ContextActionMenu component', () => {
  it('renders the menu with actions', () => {
    const menuSections = [{ name: 'action 1' }, { name: 'action 2' }]
    const { wrapper } = getShallowWrapper(menuSections)
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('.oc-files-context-actions').exists()).toBeTruthy()
    expect(wrapper.findAll('.oc-files-context-actions').length).toEqual(menuSections.length)
  })
})

function getShallowWrapper(menuSections, items = []) {
  return {
    wrapper: shallowMount(ContextActionMenu, {
      props: {
        space: mockDeep<SpaceResource>(),
        menuSections,
        items
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
