import CreateQuickLink from 'web-app-files/src/components/SideBar/Shares/Links/CreateQuickLink.vue'
import { defaultPlugins, mount } from 'web-test-helpers'

const selectors = { createBtn: '.link-name-container button' }

describe('CreateQuickLink', () => {
  it('renders the quick link button', () => {
    const { wrapper } = createWrapper()
    expect(wrapper.find(selectors.createBtn).exists()).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('emits the "createPublicLink"-action', async () => {
    const { wrapper } = createWrapper()
    const emitSpy = jest.spyOn(wrapper.vm, '$emit')
    await wrapper.find(selectors.createBtn).trigger('click')
    expect(emitSpy).toHaveBeenCalledWith('createPublicLink', expect.anything())
  })
})

function createWrapper({ props = {} } = {}) {
  return {
    wrapper: mount(CreateQuickLink, {
      props: { expirationDate: {}, ...props },
      global: { plugins: [...defaultPlugins()] }
    })
  }
}
