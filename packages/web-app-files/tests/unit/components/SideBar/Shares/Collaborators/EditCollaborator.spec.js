import Editcollaborator from '@files/src/components/SideBar/Shares/Collaborators/EditCollaborator.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import { roles } from '@files/tests/__fixtures__/collaborators.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  error: '.oc-files-collaborators-collaborator-error-alert',
  editHint: '#collaborator-edit-hint',
  collaborator: 'collaborator-stub',
  editOptions: 'collaborators-edit-options-stub',
  cancelButton: '.files-collaborators-collaborator-cancel',
  saveButton: '#files-collaborators-collaborator-save-share-button',
  roleButton: '#files-collaborators-role-button',
  expirationInput: '#files-collaborators-collaborator-expiration-input',
  savingInProgress: 'oc-spinner-stub[arialabel="Saving Share"]'
}

describe('Edit Collaborator', () => {
  describe('Error message', () => {
    it('should display errors when form has errors', async () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      await wrapper.setData({ errors: 'some error' })
      const errorMsg = wrapper.find(selectors.error)
      expect(errorMsg.exists()).toBeTruthy()

      expect(errorMsg).toMatchSnapshot()
    })

    it('should not display errors when the form has no errors', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      const errorMsg = wrapper.find(selectors.error)
      expect(errorMsg.exists()).toBeFalsy()
    })
  })

  describe('Add People Button', () => {
    it('should render edit collaborator hint', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      const editHint = wrapper.find(selectors.editHint)
      expect(editHint.exists()).toBe(true)

      expect(editHint).toMatchSnapshot()
    })

    it('should render current collaborator', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })

      const currentCollaborator = wrapper.find(selectors.collaborator)
      expect(currentCollaborator.exists()).toBe(true)

      expect(currentCollaborator.props()).toMatchObject({
        collaborator: buildCollaboratorsArray(
          {
            fileOwner: 'user0',
            username: 'user1'
          },
          1
        ),
        modifiable: false,
        firstColumn: false
      })
    })

    it('should render collaborator edit options', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })

      const editOptions = wrapper.find(selectors.editOptions)
      expect(editOptions.exists()).toBe(true)

      expect(editOptions.props()).toMatchObject({
        collaboratorsPermissions: {},
        existingCollaboratorType: 'user',
        existingRole: {
          description: 'Download, preview and share',
          label: 'Viewer',
          name: 'viewer',
          permissions: ['read', 'share']
        },
        expirationDate: null
      })
    })
  })

  describe('Action Buttons', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render the cancel button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)
      expect(cancelButton.exists()).toBe(true)
      expect(cancelButton).toMatchSnapshot()
    })

    it('should render the save button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const saveButton = wrapper.find(selectors.saveButton)
      expect(saveButton.exists()).toBe(true)
      expect(saveButton).toMatchSnapshot()
    })

    it('cancel button should work', async () => {
      const cancelTrigger = jest.spyOn(Editcollaborator.methods, '$_ocCollaborators_cancelChanges')

      const wrapper = getMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)

      expect(cancelTrigger).not.toHaveBeenCalled()
      await cancelButton.trigger('click')
      expect(cancelTrigger).toHaveBeenCalledTimes(1)
    })

    it('should set viewer as the default role', () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      const roleSelect = wrapper.find(selectors.roleButton)
      expect(roleSelect.text()).toStrictEqual('Invite as ' + roles.viewer.name)
    })

    it('should call the "$_ocCollaborators_saveChanges" when save button is clicked', async () => {
      const saveTrigger = jest
        .spyOn(Editcollaborator.methods, '$_ocCollaborators_saveChanges')
        .mockImplementation()

      const expires = new Date()
      expires.setDate(expires.getDate() + 2)
      const wrapper = getMountedWrapper({ user: 'user0', expires })
      const saveButton = wrapper.find(selectors.saveButton)

      const expirationDate = new Date()
      // set expiration date 10 days into the future
      expirationDate.setDate(expirationDate.getDate() + 20)

      await wrapper.setData({ expirationDate })
      await wrapper.vm.$nextTick()

      expect(saveTrigger).not.toHaveBeenCalled()
      await saveButton.trigger('click')
      expect(saveTrigger).toHaveBeenCalledTimes(1)
    })

    it('should not display saving in progress indicator by default', () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(false)
    })

    it('should display the loading indicator when saving is in progress', async () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      await wrapper.setData({ saving: true })
      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(true)
    })
  })
})

function buildCollaboratorsArray(collaborator, idx) {
  let {
    username,
    fileOwner,
    owner,
    permissions = 17,
    shareType = 0,
    role = 'viewer',
    expires
  } = collaborator

  if (!owner) {
    owner = fileOwner
  }

  return {
    id: idx,
    key: 'collaborator-' + idx,
    collaborator: userObj(username),
    fileOwner: userObj(fileOwner),
    owner: userObj(owner),
    permissions: permissions || 17,
    shareType: shareType || 0,
    customPermissions: {},
    role: roles[role],
    expires
  }
}

function storeOptions(data) {
  let { user, owner } = data
  if (!owner) {
    owner = user
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
        },
        actions: {
          changeShare: jest.fn()
        }
      }
    },
    getters: {
      isOcis: () => false,
      user: () => userObj(user),
      capabilities: () => {
        return {
          files_sharing: {
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
  const collaborator = buildCollaboratorsArray(
    {
      fileOwner: 'user0',
      username: 'user1',
      expires: data.expires
    },
    1
  )

  return {
    localVue,
    propsData: {
      collaborator
    },
    store: createStore(data),
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true,
      'oc-alert': true
    }
  }
}

function getMountedWrapper(data) {
  return mount(Editcollaborator, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(Editcollaborator, getMountOptions(data))
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
