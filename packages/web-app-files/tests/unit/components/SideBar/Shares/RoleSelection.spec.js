import RoleSelection from '@files/src/components/SideBar/Shares/RoleSelection.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const existingRoles = {
  viewer: {
    inlineLabel: 'viewer',
    label: 'Viewer',
    name: 'viewer',
    permissions: ['read']
  },
  editor: {
    inlineLabel: 'editor',
    label: 'Editor',
    name: 'editor',
    permissions: ['read', 'update', 'create', 'delete']
  },
  custom: {
    inlineLabel: 'custom permissions',
    label: 'Custom permissions',
    name: 'advancedRole',
    permissions: []
  }
}

const stubs = {
  'oc-button': true,
  'oc-icon': true
}

// needs differentiation between file and folder type?

describe('RoleSelection', () => {
  describe('for file shares', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('when no existing role is present', () => {
      it('renders a button with invite text if no existing role given', () => {
        const wrapper = getShallowMountedWrapper({
          collaboratorId: undefined,
          existingRoles: undefined
        })
        expect(wrapper).toMatchSnapshot()
      })
      it.todo('displays a dropdown with viewer, editor and custom permissions if no custom permissions had been selected')
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
    describe('when an existing role is present', () => {
      it('renders a button with exisiting role if given', () => {
        const wrapper = getShallowMountedWrapper({
          collaboratorId: 'cfa714e8-14dd-4849-83bc-9012fe0e27d6',
          existingRole: existingRoles.viewer
        })
        expect(wrapper).toMatchSnapshot()
      })
      it.todo('displays a dropdown with viewer, editor and custom permissions if no custom permissions had been selected')
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

// function getMountedWrapper(data) {
//   return mount(RoleSelection, {
//     propsData: {
//       existingRole: data.existingRole
//     },
//     localVue,
//     store: createStore(data),
//     stubs: stubs
//   })
// }

function getShallowMountedWrapper(data) {
  return shallowMount(RoleSelection, {
    propsData: {
      collaboratorId: data.collaboratorId,
      existingRole: data.existingRole
    },
    localVue,
    store: createStore(data),
    stubs: stubs
  })
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

const storeOptions = (data) => {
  const storeOpts = {
    modules: {
      Files: {
        state: {
          // incomingSharesLoading: false
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename: 'testfile', extension: 'jpg', type: 'file' })
          }
        },
        mutations: {}
      }
    },
    getters: {
      isOcis: () => false
    }
  }

  return storeOpts
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
