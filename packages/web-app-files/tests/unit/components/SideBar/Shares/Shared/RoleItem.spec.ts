import RoleItem from 'web-app-files/src/components/SideBar/Shares/Shared/RoleItem.vue'
import { mockDeep } from 'jest-mock-extended'
import { ShareRole } from 'web-client/src/helpers/share'
import { defaultPlugins, mount } from 'web-test-helpers'

describe('RoleItem', () => {
  it('renders the role information', () => {
    const { wrapper } = createWrapper()
    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper({ props = {} } = {}) {
  return {
    wrapper: mount(RoleItem, {
      props: { role: mockDeep<ShareRole>(), allowSharePermission: true, ...props },
      global: { plugins: [...defaultPlugins()] }
    })
  }
}
