import RoleDropdown from 'web-app-files/src/components/SideBar/Shares/Collaborators/RoleDropdown.vue'
import { ShareRole } from '@ownclouders/web-client'
import { defaultPlugins, mount, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { User } from '@ownclouders/web-client/graph/generated'

const selectors = {
  recipientRoleBtn: '.files-recipient-role-select-btn',
  roleButton: '.files-recipient-role-drop-btn'
}

describe('RoleDropdown', () => {
  it('renders a button with invite text if no existing role given', () => {
    const { wrapper } = getWrapper({ mountType: shallowMount })
    expect(wrapper.find(selectors.recipientRoleBtn).exists()).toBeTruthy()
    expect(wrapper.find(`${selectors.recipientRoleBtn} span`).text()).toEqual('Can view')
  })
  it('renders a button with existing role if given', () => {
    const { wrapper } = getWrapper({
      mountType: shallowMount,
      existingRole: mock<ShareRole>({ displayName: 'Can edit' })
    })
    expect(wrapper.find(selectors.recipientRoleBtn).exists()).toBeTruthy()
    expect(wrapper.find(`${selectors.recipientRoleBtn} span`).text()).toEqual('Can edit')
  })
  it('does not render a button if only one role is available', () => {
    const { wrapper } = getWrapper({
      mountType: shallowMount,
      availableShareRoles: [mock<ShareRole>({ displayName: 'Can view', description: '' })]
    })
    expect(wrapper.find(selectors.recipientRoleBtn).exists()).toBeFalsy()
  })
  it('emits "optionChange"-event on role click', async () => {
    const { wrapper } = getWrapper()
    ;(wrapper.vm.$refs.rolesDrop as any).tippy = { hide: vi.fn() }
    await wrapper.find(selectors.roleButton).trigger('click')
    expect(wrapper.emitted('optionChange')).toBeTruthy()
  })
  it('renders a button for each available role', () => {
    const { wrapper } = getWrapper({ mountType: shallowMount })
    expect(wrapper.findAll(selectors.roleButton).length).toBe(2)
  })
})

function getWrapper({
  mountType = mount,
  existingRole = null,
  availableShareRoles = [
    mock<ShareRole>({ displayName: 'Can view', description: '' }),
    mock<ShareRole>({ displayName: 'Can edit', description: '' })
  ]
}: {
  mountType?: typeof mount
  existingRole?: ShareRole
  availableShareRoles?: ShareRole[]
} = {}) {
  return {
    wrapper: mountType(RoleDropdown, {
      props: {
        existingRole
      },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: { userState: { user: { onPremisesSamAccountName: 'name' } as User } }
          })
        ],
        renderStubDefaultSlot: true,
        provide: {
          resource: mock<Resource>(),
          availableShareRoles
        }
      }
    })
  }
}
