import RoleDropdown from '@files/src/components/SideBar/Shares/RoleDropdown.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import { PeopleShareRoles } from '../../../../../src/helpers/share'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  button: '.files-recipient-role-select-btn',
  roles: '.files-recipient-role-drop-list',
  roleButtonPrefix: '#files-recipient-role-drop-btn-',
  customPermissionsDrop: '.files-recipient-custom-permissions-drop'
}

const stubs = {
  'oc-button': true,
  'oc-icon': true
}

const store = new Vuex.Store({
  getters: {
    capabilities: () => {
      return {}
    }
  }
})

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
          const wrapper = getShallowMountedWrapper({
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
          const wrapper = getMountedWrapper({ resourceType: type })
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
            const wrapper = getMountedWrapper({ resourceType: type })
            const customPermissionsDrop = wrapper.find(selectors.customPermissionsDrop)
            const showHideMock = jest.fn()
            customPermissionsDrop.vm.show = showHideMock
            wrapper.vm.$refs.rolesDrop.tippy = { hide: showHideMock }

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
      //       const wrapper = getWrapper()
      //       expect(
      //         wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
      //       ).toBeTruthy()
      //     }
      //   )
      //   it('closes custom permissions drop when they are confirmed', async () => {
      //     const wrapper = getWrapper()
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-confirm"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //   })

      //   it('opens role drop when custom permissions drop is cancelled', async () => {
      //     const wrapper = getWrapper()
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
    describe('when an existing role is present', () => {
      it.each(['folder', 'file'])(
        'renders a button with existing role if given for resource type %s',
        (type) => {
          const wrapper = getShallowMountedWrapper({
            existingRole: PeopleShareRoles.list(type === 'folder')[0]
          })
          expect(wrapper).toMatchSnapshot()
        }
      )
      it.todo(
        'displays a dropdown with viewer, editor and custom permissions if no custom permissions had been selected'
      )
      it.todo('displays a dropdown with custom permissions if they already were selected')
      //   it('opens custom permissions drop when custom permissions item in the roles is selected', async () => {
      //     const wrapper = getWrapper()
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
      //       const wrapper = getWrapper()
      //       expect(
      //         wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
      //       ).toBeTruthy()
      //     }
      //   )
      //   it('closes custom permissions drop when they are confirmed', async () => {
      //     const wrapper = getWrapper()
      //     const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

      //     permissionsDrop.vm.hide = jest.fn()

      //     await wrapper
      //       .find('[data-testid="files-recipient-custom-permissions-drop-confirm"]')
      //       .trigger('click')

      //     expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      //   })

      //   it('opens role drop when custom permissions drop is cancelled', async () => {
      //     const wrapper = getWrapper()
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

function getMountedWrapper(data) {
  return mount(RoleDropdown, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(RoleDropdown, getMountOptions(data))
}

function getMountOptions({ existingRole, shareId, resourceType = 'folder' }) {
  return {
    propsData: {
      resource: getResource({
        filename: resourceType === 'folder' ? 'testfolder' : 'testfile',
        extension: resourceType === 'folder' ? '' : 'jpg',
        type: resourceType
      }),
      existingRole,
      shareId,
      allowSharePermission: true
    },
    store,
    localVue,
    stubs
  }
}

function getResource({ filename = 'testFile', extension = 'txt', type = 'file' }) {
  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    isFolder: type === 'folder',
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    shareTypes: [],
    downloadURL: ''
  }
}
