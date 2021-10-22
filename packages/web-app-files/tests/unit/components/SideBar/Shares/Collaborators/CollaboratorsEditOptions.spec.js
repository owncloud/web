import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import Vuex from 'vuex'

import EditOptions from '@files/src/components/SideBar/Shares/Collaborators/CollaboratorsEditOptions.vue'
import VueSelect from 'vue-select'
import GetTextPlugin from 'vue-gettext'

import { roles } from '@files/tests/__fixtures__/collaborators.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

function getWrapper() {
  return mount(EditOptions, {
    localVue,
    store: new Vuex.Store({
      getters: {
        capabilities: () => ({
          files_sharing: { user: { expire_date: null } }
        }),
        isOcis: () => false
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: () => ({ type: 'folder' })
          }
        }
      }
    }),
    stubs: { translate: true }
  })
}

const selectors = {
  roleButton: '#files-collaborators-role-button',
  roleSelect: '.files-collaborators-role-button-wrapper',
  expirationDate: '.files-recipient-expiration-datepicker',
  permissionCheckbox: '.files-collaborators-permission-checkbox',
  translateStub: 'translate-stub',
  fileRecipientrolesDrop: '[data-testid="files-recipient-roles-drop"]',
  fileRecipientCustomPermissionDrop: '[data-testid="files-recipient-custom-permissions-drop"]',
  customPermissionDrop: '[data-testid="files-recipient-custom-permissions-drop"]',
  advancedRoleDropButton: '[data-testid="files-recipient-role-drop-btn-advancedRole"]',
  customPermissionDropConfirm: '[data-testid="files-recipient-custom-permissions-drop-confirm"]',
  customPermissionDropCancel: '[data-testid="files-recipient-custom-permissions-drop-cancel"]'
}

describe('CollaboratorsEditOptions component', () => {
  describe('Role selection dropdown', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('opens custom permissions drop when custom permissions item in the roles is selected', async () => {
      const wrapper = getWrapper()
      const advancedPermissionsDrop = wrapper.find(selectors.customPermissionDrop)
      const showHideMock = jest.fn()
      advancedPermissionsDrop.vm.show = showHideMock
      wrapper.vm.$refs.rolesDrop.tippy = { hide: showHideMock }

      await wrapper.find(selectors.advancedRoleDropButton).trigger('click')

      expect(showHideMock).toHaveBeenCalledTimes(2)
    })

    it('closes custom permissions drop when they are confirmed', async () => {
      const wrapper = getWrapper()
      const permissionsDrop = wrapper.find(selectors.customPermissionDrop)

      permissionsDrop.vm.hide = jest.fn()

      await wrapper.find(selectors.customPermissionDropConfirm).trigger('click')

      expect(permissionsDrop.vm.hide).toHaveBeenCalled()
    })

    it('opens role drop when custom permissions drop is cancelled', async () => {
      const wrapper = getWrapper()
      const rolesDrop = wrapper.find(selectors.fileRecipientrolesDrop)
      const permissionsDrop = wrapper.find(selectors.fileRecipientCustomPermissionDrop)

      rolesDrop.vm.show = jest.fn()
      permissionsDrop.vm.hide = jest.fn()

      await wrapper.find(selectors.customPermissionDropCancel).trigger('click')

      expect(permissionsDrop.vm.hide).toHaveBeenCalled()
      expect(rolesDrop.vm.show).toHaveBeenCalled()
    })

    it.each(['update', 'create', 'delete', 'share'])(
      'displays custom permission %s in the custom permissions drop',
      (permission) => {
        const wrapper = getWrapper()
        expect(
          wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
        ).toBeTruthy()
      }
    )
  })

  describe('Role Selection', () => {
    it('should render default role in the select input if no value is set to the role prop', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })
      const roleButton = wrapper.find(selectors.roleButton)
      const translate = roleButton.find('translate-stub')
      expect(translate.props('translateParams')).toMatchObject({ name: roles.viewer.name })
      expect(wrapper.vm.selectedRole).toMatchObject(roles.viewer)
    })

    it('should set the role according to the provided prop', () => {
      const wrapper = getMountedWrapper({
        user: 'user0',
        role: 'editor'
      })
      const roleButton = wrapper.find(selectors.roleButton)
      expect(roleButton).toMatchSnapshot()
      expect(wrapper.vm.selectedRole).toMatchObject(roles.editor)
    })

    it('should change the role when new role is selected', async () => {
      const wrapper = getMountedWrapper({
        user: 'user0',
        role: 'viewer'
      })
      let roleButton = wrapper.find(selectors.roleButton)
      expect(wrapper.vm.selectedRole).toMatchObject(roles.viewer)
      expect(roleButton).toMatchSnapshot()

      await wrapper.setData({ selectedRole: roles.editor })
      roleButton = wrapper.find(selectors.roleButton)
      expect(wrapper.vm.selectedRole).toMatchObject(roles.editor)
      expect(roleButton).toMatchSnapshot()
    })

    it('should show custom permissions when advanced permission is set', () => {
      const wrapper = getMountedWrapper({
        user: 'user0',
        role: 'advancedPermissions'
      })
      const roleButton = wrapper.find(selectors.roleButton)
      expect(roleButton).toMatchSnapshot()
      expect(wrapper.vm.selectedRole).toMatchObject(roles.advancedPermissions)
    })
  })

  describe('Expire Date picker', () => {
    it('should not show expiry date input when disabled', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0',
        shareCapabilities: {
          user: {},
          group: {}
        }
      })

      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.exists()).toBeFalsy()
    })

    it('should render expiration date picker when the expiration date is enabled', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })

      const minDate = new Date()
      minDate.setDate(minDate.getDate() + 1) // min date should be one day ahead of current date

      const expireDate = wrapper.find(selectors.expirationDate)

      expect(expireDate.exists()).toBeTruthy()
      expect(expireDate.attributes()).toMatchObject({
        'min-date': minDate.toString()
      })
    })

    it('should set date field as required when expiration date is enforced', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0',
        shareCapabilities: {
          user: {
            expire_date: {
              enabled: true,
              enforced: true
            }
          },
          group: {
            expire_date: {
              enabled: true
            }
          }
        }
      })
      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.attributes()).toMatchObject({
        'is-required': 'true'
      })
    })

    it('should set min and max date based on expiration date is enforced', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0',
        shareCapabilities: {
          user: {
            expire_date: {
              enabled: true,
              enforced: true,
              days: 5
            }
          },
          group: {
            expire_date: {
              enabled: true
            }
          }
        }
      })
      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.exists()).toBeTruthy()

      const minDate = new Date()
      minDate.setDate(minDate.getDate() + 1) // min date should be one day ahead of current date
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 5)
      expect(expireDate.attributes()).toMatchObject({
        'min-date': minDate.toString(),
        'max-date': maxDate.toString()
      })
    })

    it('should set the expiration date according to the expirationDate prop passed to the component', () => {
      const expirationDate = new Date()
      // set expiration date 10 days into the future
      expirationDate.setDate(expirationDate.getDate() + 10)

      const wrapper = getMountedWrapper({
        user: 'user0',
        expirationDate,
        type: 'user'
      })

      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.exists()).toBeTruthy()

      expect(wrapper.vm.enteredExpirationDate).toBe(expirationDate)
    })
  })
})

function storeOptions(data) {
  let { user, shareCapabilities } = data

  if (!shareCapabilities) {
    shareCapabilities = {
      user: {
        expire_date: {
          enabled: true,
          days: 10
        }
      },
      group: {
        expire_date: {
          enabled: true,
          days: 10
        }
      }
    }
  }

  return {
    state: {
      user: userObj(user)
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return { type: 'file' }
          }
        }
      }
    },
    getters: {
      isOcis: () => false,
      user: () => userObj(user),
      capabilities: () => {
        return {
          files_sharing: shareCapabilities
        }
      }
    }
  }
}

function userObj(name) {
  const displayNames = {
    user0: 'User Zero',
    user1: 'User One',
    user2: 'User Two'
  }

  return {
    id: name,
    additionalInfo: null,
    name,
    displayName: displayNames[name]
  }
}

function getMountOptions(data) {
  const { expirationDate, role, permissions, type } = data

  return {
    localVue,
    store: createStore(data),
    propsData: {
      expirationDate,
      existingRole: roles[role],
      collaboratorsPermissions: permissions,
      existingCollaboratorType: type
    },
    stubs: {
      'vue-select': VueSelect,
      'oc-datepicker': true,
      'oc-drop': true
    }
  }
}

function getMountedWrapper(data) {
  return mount(EditOptions, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(EditOptions, getMountOptions(data))
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
