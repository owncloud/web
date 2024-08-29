import CreateQuickLink from '../../../../../../src/components/SideBar/Shares/Links/CreateQuickLink.vue'
import { defaultPlugins, mount } from 'web-test-helpers'

describe('CreateQuickLink component', () => {
  it('emits the "createPublicLink" event on button click', async () => {
    const { wrapper } = getWrapper()
    const btn = wrapper.find('.create-quicklink-button')
    await btn.trigger('click')

    expect(wrapper.emitted('createPublicLink').length).toBeGreaterThan(0)
  })
})

function getWrapper() {
  return {
    wrapper: mount(CreateQuickLink, {
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
