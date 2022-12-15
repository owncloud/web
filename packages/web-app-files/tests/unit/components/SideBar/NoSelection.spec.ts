import NoSelection from 'web-app-files/src/components/SideBar/NoSelection.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('NoSelection', () => {
  it('should render the component', () => {
    const { wrapper } = getWrapper()
    expect(wrapper).toMatchSnapshot()
  })
})

function getWrapper() {
  return {
    wrapper: shallowMount(NoSelection, {
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
