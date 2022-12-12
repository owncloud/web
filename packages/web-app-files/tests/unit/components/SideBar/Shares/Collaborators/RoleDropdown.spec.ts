import RoleDropdown from 'web-app-files/src/components/SideBar/Shares/Collaborators/RoleDropdown.vue'
import { PeopleShareRoles, SharePermissions, ShareTypes } from 'web-client/src/helpers/share'
import { createStore, defaultPlugins, mount, shallowMount } from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const selectors = {
  button: '.files-recipient-role-select-btn',
  roles: '.files-recipient-role-drop-list',
  roleButtonPrefix: '#files-recipient-role-drop-btn-',
  customPermissionsDrop: '.files-recipient-custom-permissions-drop'
}

// needs differentiation between file and folder type?
describe('RoleDropdown', () => {
  describe('for file shares', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('when no existing role is present', () => {
      it.each(['folder', 'file'])(
        'renders a button with invite text if no existing role given for resource type %s',
        (type) => {
          const { wrapper } = getMountedWrapper({
            mountType: shallowMount,
            existingRole: undefined,
            resourceType: type
          })
          expect(wrapper).toMatchSnapshot()
        }
      )
      it.each(['folder', 'file'])(
        'displays a dropdown with all available roles on button click for resource type %s',
        async (type) => {
          const isFolder = type === 'folder'
          const { wrapper } = getMountedWrapper({ resourceType: type })
          const button = wrapper.find(selectors.button)
          await button.trigger('click')

          expect(wrapper.find(selectors.roles).isVisible()).toBeTruthy()
          for (const role of PeopleShareRoles.list(isFolder)) {
            expect(wrapper.find(selectors.roleButtonPrefix + role.name).exists()).toBeTruthy()
          }
        }
      )
      describe('custom permissions', () => {
        it.each(['folder', 'file'])(
          'opens custom permissions drop when custom permissions item in the roles gets selected for resource type %s',
          async (type) => {
            const isFolder = type === 'folder'
            const { wrapper } = getMountedWrapper({ resourceType: type })
            const customPermissionsDrop = wrapper.find(selectors.customPermissionsDrop)
            const showHideMock = jest.fn()
            customPermissionsDrop.vm.show = showHideMock
            ;(wrapper.vm.$refs.rolesDrop as any).tippy = { hide: showHideMock }

            await wrapper
              .find(selectors.roleButtonPrefix + PeopleShareRoles.custom(isFolder).name)
              .trigger('click')

            expect(showHideMock).toHaveBeenCalled()
          }
        )
      })

      //   it.each(['update', 'create', 'delete', 'share'])(
      //     'displays custom permission %s in the custom permissions drop',
      //     (permission) => {
      //       const {wrapper} = getWrapper()
      //       expect(
      //         wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
      //       ).toBeTruthy()
      //     }
      //   )
      //   it('closes custom permissions drop when they are confirmed', async () => {
      //     const {wrapper} = getWrapper()
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-confirm"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //   })

      //   it('opens role drop when custom permissions drop is cancelled', async () => {
      //     const {wrapper} = getWrapper()
      //     const rolesDrop = wrapper.find('[data-testid="files-recipient-roles-drop"]')
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     rolesDrop.vm.show = jest.fn()
      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-cancel"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //     expect(rolesDrop.vm.show).toHaveBeenCalled()
      //   })
      it.todo('emits an event upon role selection')
    })
    describe('custom permissions', () => {
      it.each([
        SharePermissions.read.bit + SharePermissions.share.bit,
        SharePermissions.read.bit +
          SharePermissions.share.bit +
          SharePermissions.update.bit +
          SharePermissions.create.bit,
        SharePermissions.read.bit + SharePermissions.share.bit + SharePermissions.delete.bit
      ])("inherits the parents share's permissions: %s", (sharePermissions) => {
        const { wrapper } = getMountedWrapper({
          mountType: shallowMount,
          existingRole: PeopleShareRoles.list(true)[0],
          isReceivedShare: true,
          sharesTree: {
            '/testfolder': [
              {
                permissions: sharePermissions,
                shareType: ShareTypes.user.value
              }
            ]
          }
        })
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('when an existing role is present', () => {
      it.each(['folder', 'file'])(
        'renders a button with existing role if given for resource type %s',
        (type) => {
          const { wrapper } = getMountedWrapper({
            mountType: shallowMount,
            existingRole: PeopleShareRoles.list(type === 'folder')[0]
          })
          expect(wrapper).toMatchSnapshot()
        }
      )
      it('does not render a button if only one role is available', () => {
        const { wrapper } = getMountedWrapper({
          mountType: shallowMount,
          existingRole: PeopleShareRoles.list(true)[0],
          isReceivedShare: true,
          sharesTree: {
            '/testfolder': [
              {
                permissions: SharePermissions.read.bit,
                shareType: ShareTypes.user.value
              }
            ]
          }
        })
        expect(wrapper).toMatchSnapshot()
      })
      it.todo(
        'displays a dropdown with viewer, editor and custom permissions if no custom permissions had been selected'
      )
      it.todo('displays a dropdown with custom permissions if they already were selected')
      //   it('opens custom permissions drop when custom permissions item in the roles is selected', async () => {
      //     const {wrapper} = getWrapper()
      //     const advancedPermissionsDrop = wrapper.find(
      //       '[data-testid="files-recipient-custom-permissions-drop"]'
      //     )
      //     const showHideMock = jest.fn()
      //     advancedPermissionsDrop.vm.show = showHideMock
      //     wrapper.vm.$refs.rolesDrop.tippy = { hide: showHideMock }

      //     await wrapper
      //       .find('[data-testid="files-recipient-role-drop-btn-advancedRole"]')
      //       .trigger('click')

      //     expect(showHideMock).toHaveBeenCalledTimes(2)
      //   })
      //   it.each(['update', 'create', 'delete', 'share'])(
      //     'displays custom permission %s in the custom permissions drop',
      //     (permission) => {
      //       const {wrapper} = getWrapper()
      //       expect(
      //         wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
      //       ).toBeTruthy()
      //     }
      //   )
      //   it('closes custom permissions drop when they are confirmed', async () => {
      //     const {wrapper} = getWrapper()
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-confirm"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //   })

      //   it('opens role drop when custom permissions drop is cancelled', async () => {
      //     const {wrapper} = getWrapper()
      //     const rolesDrop = wrapper.find('[data-testid="files-recipient-roles-drop"]')
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     rolesDrop.vm.show = jest.fn()
      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-cancel"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //     expect(rolesDrop.vm.show).toHaveBeenCalled()
      //   })
      it.todo('emits an event upon role selection')
    })
  })
})

function getMountedWrapper({
  mountType = mount,
  existingRole = null,
  shareId = null,
  resourceType = 'folder',
  sharesTree = {},
  isReceivedShare = false
} = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.state.sharesTree = sharesTree
  const store = createStore(storeOptions)
  return {
    wrapper: mountType(RoleDropdown, {
      props: {
        resource: mockDeep<Resource>({
          name: resourceType === 'folder' ? 'testfolder' : 'testfile',
          extension: resourceType === 'folder' ? '' : 'jpg',
          type: resourceType,
          isFolder: resourceType === 'folder',
          isReceivedShare: () => isReceivedShare
        }),
        existingRole,
        shareId,
        allowSharePermission: true
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: { 'oc-button': true, 'oc-icon': true },
        provide: {
          incomingParentShare: {}
        }
      }
    })
  }
}
