import RoleDropdown from 'web-app-files/src/components/SideBar/Shares/Collaborators/RoleDropdown.vue'
import { PeopleShareRoles, SharePermissions } from '@ownclouders/web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  mount,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'

const selectors = {
  recipientRoleBtn: '.files-recipient-role-select-btn',
  roleButton: '.files-recipient-role-drop-btn',
  roleButtonPrefix: '#files-recipient-role-drop-btn-',
  collaboratorsPermissionPrefix: '#files-collaborators-permission-',
  customPermissionsDrop: '.files-recipient-custom-permissions-drop',
  cancelCustomPermissionsBtn: '.files-recipient-custom-permissions-drop-cancel',
  confirmCustomPermissionsBtn: '.files-recipient-custom-permissions-drop-confirm'
}

describe('RoleDropdown', () => {
  it.each(['folder', 'file'])(
    'renders a button with invite text if no existing role given for resource type %s',
    (type) => {
      const { wrapper } = getWrapper({ mountType: shallowMount, resourceType: type })
      expect(wrapper.html()).toMatchSnapshot()
    }
  )
  it.each(['folder', 'file'])(
    'renders a button with existing role if given for resource type %s',
    (type) => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        existingRole: PeopleShareRoles.list(type === 'folder')[0]
      })
      expect(wrapper.html()).toMatchSnapshot()
    }
  )
  it('does not render a button if only one role is available', () => {
    const { wrapper } = getWrapper({
      mountType: shallowMount,
      canShare: true,
      incomingParentShare: {}
    })
    expect(wrapper.find(selectors.recipientRoleBtn).exists()).toBeFalsy()
  })
  it('emits "optionChange"-event on role click', async () => {
    const { wrapper } = getWrapper()
    ;(wrapper.vm.$refs.rolesDrop as any).tippy = { hide: jest.fn() }
    await wrapper.find(selectors.roleButton).trigger('click')
    expect(wrapper.emitted('optionChange')).toBeTruthy()
  })
  describe('custom permissions', () => {
    it.each(['folder', 'file'])(
      'opens custom permissions drop when custom permissions item in the roles gets selected for resource type %s',
      async (type) => {
        const isFolder = type === 'folder'
        const { wrapper } = getWrapper({ resourceType: type })
        const customPermissionsDrop = wrapper.findComponent<any>(selectors.customPermissionsDrop)
        const showHideMock = jest.fn()
        ;(customPermissionsDrop.vm as any).show = showHideMock
        ;(wrapper.vm.$refs.rolesDrop as any).tippy = { hide: showHideMock }

        await wrapper
          .find(selectors.roleButtonPrefix + PeopleShareRoles.custom(isFolder).name)
          .trigger('click')

        expect(showHideMock).toHaveBeenCalled()
      }
    )
    it('can be cancelled and restored', async () => {
      const { wrapper } = getWrapper()
      const showRoleDropMock = jest.fn()
      const hideCustomPermissionsDropMock = jest.fn()
      ;(wrapper.vm.$refs.rolesDrop as any).show = showRoleDropMock
      ;(wrapper.vm.$refs.customPermissionsDrop as any).hide = hideCustomPermissionsDropMock
      await wrapper.find(selectors.cancelCustomPermissionsBtn).trigger('click')

      expect(showRoleDropMock).toHaveBeenCalled()
      expect(hideCustomPermissionsDropMock).toHaveBeenCalled()
      expect(wrapper.vm.customPermissions).toEqual(wrapper.vm.defaultCustomPermissions)
    })
    it('can be confirmed', async () => {
      const { wrapper } = getWrapper()
      const hideCustomPermissionsDropMock = jest.fn()
      ;(wrapper.vm.$refs.customPermissionsDrop as any).hide = hideCustomPermissionsDropMock
      await wrapper.find(selectors.confirmCustomPermissionsBtn).trigger('click')

      expect(hideCustomPermissionsDropMock).toHaveBeenCalled()
      expect(wrapper.emitted('optionChange')).toBeTruthy()
    })
    it.each([
      { permissions: [SharePermissions.read, SharePermissions.share] },
      { permissions: [SharePermissions.read, SharePermissions.share, SharePermissions.delete] },
      {
        permissions: [
          SharePermissions.read,
          SharePermissions.update,
          SharePermissions.share,
          SharePermissions.delete
        ]
      }
    ])("inherits the parents share's permissions: %s", ({ permissions }) => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        canShare: true,
        incomingParentShare: {
          fileOwner: { name: 'name' },
          permissions: permissions.reduce((a, b) => a + b.bit, 0)
        }
      })

      for (const permission of permissions) {
        expect(
          wrapper.find(`${selectors.collaboratorsPermissionPrefix}${permission.key}`).exists()
        ).toBeTruthy()
      }
    })
  })
})

function getWrapper({
  mountType = mount,
  existingRole = null,
  resourceType = 'folder',
  canShare = false,
  incomingParentShare = null
} = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockReturnValue({ id: 'name' })
  const store = createStore(storeOptions)
  return {
    wrapper: mountType(RoleDropdown, {
      props: {
        existingRole,
        allowSharePermission: true
      },
      global: {
        plugins: [...defaultPlugins(), store],
        renderStubDefaultSlot: true,
        provide: {
          resource: mock<Resource>({
            name: resourceType === 'folder' ? 'testfolder' : 'testfile',
            extension: resourceType === 'folder' ? '' : 'jpg',
            type: resourceType,
            isFolder: resourceType === 'folder',
            canShare: () => canShare
          }),
          incomingParentShare
        }
      }
    })
  }
}
