import ContextActionMenu from '@ownclouders/web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('ContextActionMenu component', () => {
  it('renders the menu with actions', () => {
    const menuSections = [{ name: 'action 1' }, { name: 'action 2' }]
    const { wrapper } = getShallowWrapper(menuSections)
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find('.oc-files-context-actions').exists()).toBeTruthy()
    expect(wrapper.findAll('.oc-files-context-actions').length).toEqual(menuSections.length)
  })
})

function getShallowWrapper(menuSections, items = []) {
  return {
    wrapper: shallowMount(ContextActionMenu, {
      props: {
        menuSections,
        actionOptions: { resources: items }
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
