import NewCollaborator from '@files/src/components/SideBar/Shares/Collaborators/NewCollaborator.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import OwnCloud from 'owncloud-sdk'
import VueSelect from 'vue-select'

const localVue = createLocalVue()
localVue.use(VueSelect)
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.prototype.$client = new OwnCloud()
localVue.prototype.$client.init({ baseUrl: 'http://none.de' })
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const addShareTrigger = jest.fn()

const selectors = {
  userInviteLabel: 'label[for="files-share-invite-input"]',
  userInviteHint: '#files-share-invite-hint',
  userInviteSelect: '#files-share-invite',
  userInviteInput: '#files-share-invite-input',
  collaboratorEditOpts: 'collaborators-edit-options-stub',

  cancelButton: '.files-collaborators-collaborator-cancel',
  shareButton: '#files-collaborators-collaborator-save-new-share-button',
  savingInProgress: 'oc-spinner-stub'
}

describe('Edit Collaborator', () => {
  describe('user/group input', () => {
    it('should display the input label', () => {
      const wrapper = getMountedWrapper({
        user: 'user0'
      })

      const userInviteLabel = wrapper.find(selectors.userInviteLabel)

      expect(userInviteLabel.exists()).toBe(true)
      expect(userInviteLabel.text()).toBe('Invite')
    })

    it('should display the user invite input hint', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })

      const userInviteHint = wrapper.find(selectors.userInviteHint)

      expect(userInviteHint.exists()).toBe(true)
      expect(userInviteHint.text()).toBe('Add new person by name, email or federation IDs')
    })

    it('show display the user select input', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })
      const userSelectInput = wrapper.find(selectors.userInviteInput)
      expect(userSelectInput.exists()).toBe(true)
    })

    it('should call Fetch sharees request with correct query from the input', async () => {
      const autoCompleteTrigger = jest.spyOn(NewCollaborator.methods, 'fetchRecipients')

      const wrapper = getMountedWrapper({
        user: 'user0'
      })

      localVue.prototype.$client.shares.getRecipients = () => ({
        exact: {
          users: [],
          groups: [],
          remotes: []
        },
        users: [],
        groups: [],
        remotes: []
      })

      const userSelectInput = wrapper.find(selectors.userInviteInput)

      await userSelectInput.setValue('use')

      // the api request for fetching the user is triggred few seconds after the input is set
      await new Promise(resolve => {
        setTimeout(() => {
          expect(autoCompleteTrigger).toHaveBeenCalledTimes(1)
          expect(autoCompleteTrigger).toHaveBeenCalledWith('use')
          resolve()
        }, 3000)
      })
    })

    it('should show no results when no users or groups are returned', async () => {
      const wrapper = getMountedWrapper({
        user: 'user0'
      })
      localVue.prototype.$client.shares.getRecipients = () => ({
        exact: {
          users: [],
          groups: [],
          remotes: []
        },
        users: [],
        groups: [],
        remotes: []
      })

      const userSelectInput = wrapper.find(selectors.userInviteInput)
      await userSelectInput.setValue('use')

      await new Promise(resolve => {
        setTimeout(() => {
          const select = wrapper.findComponent(VueSelect)
          expect(select.props('options')).toMatchObject([])
          resolve()
        }, 3000)
      })
    })

    it('should display users list in the autocomplete dropdown', async () => {
      const wrapper = getMountedWrapper({
        user: 'user0'
      })

      const users = [
        {
          label: 'user1',
          value: {
            shareType: 0,
            shareWith: 'user1',
            userType: 0
          }
        },
        {
          label: 'user2',
          value: {
            shareType: 0,
            shareWith: 'user2',
            userType: 0
          }
        }
      ]
      localVue.prototype.$client.shares.getRecipients = () => ({
        exact: {
          users: [],
          groups: [],
          remotes: []
        },
        users,
        groups: [],
        remotes: []
      })

      const userSelectInput = wrapper.find(selectors.userInviteInput)
      await userSelectInput.setValue('use')

      await wrapper.vm.$nextTick()

      await new Promise(resolve => {
        setTimeout(() => {
          const select = wrapper.findComponent(VueSelect)
          expect(select.props('options')).toMatchObject(users)
          resolve()
        }, 3000)
      })
    })

    it('should list users and groups in the autocomplete dropdown', async () => {
      const wrapper = getMountedWrapper({
        user: 'user0'
      })

      const users = [
        {
          label: 'user1',
          value: {
            shareType: 0,
            shareWith: 'user1',
            userType: 0
          }
        },
        {
          label: 'user2',
          value: {
            shareType: 0,
            shareWith: 'user2',
            userType: 0
          }
        }
      ]

      const groups = [
        {
          label: 'usergrp',
          value: {
            shareType: 1,
            shareWith: 'usergrp',
            userType: 0
          }
        },
        {
          label: 'usegrp',
          value: {
            shareType: 1,
            shareWith: 'usegrp',
            userType: 0
          }
        }
      ]

      localVue.prototype.$client.shares.getRecipients = () => ({
        exact: {
          users,
          groups,
          remotes: []
        },
        users,
        groups: [],
        remotes: []
      })

      const userSelectInput = wrapper.find(selectors.userInviteInput)
      await userSelectInput.setValue('use')

      await wrapper.vm.$nextTick()

      await new Promise(resolve => {
        setTimeout(() => {
          const select = wrapper.findComponent(VueSelect)

          expect(new Set(select.props('options'))).toMatchObject(new Set([...users, ...groups]))
          resolve()
        }, 3000)
      })
    })

    it('No options should be given in the dropdown if no users are present', async () => {
      const wrapper = getMountedWrapper({
        user: 'user0'
      })

      localVue.prototype.$client.shares.getRecipients = () => ({
        exact: {
          users: [],
          groups: [],
          remotes: []
        },
        users: [],
        groups: [],
        remotes: []
      })

      const userSelectInput = wrapper.find(selectors.userInviteInput)
      await userSelectInput.setValue('use')

      await wrapper.vm.$nextTick()

      await new Promise(resolve => {
        setTimeout(() => {
          const select = wrapper.findComponent(VueSelect)
          expect(select.props('options')).toMatchObject([])
          resolve()
        }, 3000)
      })
    })
  })

  describe('collaborator edit options', () => {
    it('should show the collaborator edit options', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })
      const collaboratorEdit = wrapper.find(selectors.collaboratorEditOpts)
      expect(collaboratorEdit.exists()).toBe(true)
    })

    it('should set empty values for collaborator edit options in the beginning', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })
      const collaboratorEdit = wrapper.find(selectors.collaboratorEditOpts)

      expect(collaboratorEdit.props()).toMatchObject({
        existingRole: undefined,
        collaboratorsPermissions: undefined,
        expirationDate: undefined,
        existingCollaboratorType: null
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render the cancel button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)
      expect(cancelButton.exists()).toBe(true)
      expect(cancelButton.text()).toBe('Cancel')
    })

    it('should render the share button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const shareButton = wrapper.find(selectors.shareButton)
      expect(shareButton.exists()).toBe(true)
      expect(shareButton.attributes().disabled).toBe('true')
      expect(shareButton.text()).toBe('Share')
    })

    it('should call "$_ocCollaborators_newCollaboratorsCancel" method if cancel button is clicked', async () => {
      const cancelTrigger = jest.spyOn(
        NewCollaborator.methods,
        '$_ocCollaborators_newCollaboratorsCancel'
      )

      const wrapper = getMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)

      expect(cancelTrigger).not.toHaveBeenCalled()
      await cancelButton.trigger('click')
      expect(cancelTrigger).toHaveBeenCalledTimes(1)
    })

    it('should call "share" method when share button is clicked', async () => {
      const saveTrigger = jest.spyOn(NewCollaborator.methods, 'share')

      const wrapper = getMountedWrapper({ user: 'user0' })
      const shareButton = wrapper.find(selectors.shareButton)

      await wrapper.setData({
        selectedCollaborators: [
          {
            label: 'User One',
            value: {
              shareType: 0,
              shareWith: 'user1',
              userType: 0
            }
          },
          {
            label: 'User Two',
            value: {
              shareType: 0,
              shareWith: 'user2',
              userType: 0
            }
          }
        ]
      })

      expect(saveTrigger).not.toHaveBeenCalled()
      expect(addShareTrigger).not.toHaveBeenCalled()
      await shareButton.trigger('click')
      expect(saveTrigger).toHaveBeenCalledTimes(1)
      expect(addShareTrigger).toHaveBeenCalledTimes(2)

      expect(addShareTrigger.mock.calls[0][1]).toMatchObject({
        path: '/testfile.jpg',
        shareType: 0,
        permissions: 17,
        shareWith: 'user1'
      })

      expect(addShareTrigger.mock.calls[1][1]).toMatchObject({
        path: '/testfile.jpg',
        shareType: 0,
        permissions: 17,
        shareWith: 'user2'
      })
    })

    it('should not display saving in progress indicator by default', () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(false)
    })

    it('should not display saving in progress indicator when the file sharing is in progress', async () => {
      const wrapper = getMountedWrapper({ user: 'user0' })
      await wrapper.setData({ saving: true })

      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(true)
    })
  })
})

function getResource({ filename = 'testFile', extension = 'txt', type = 'file', owner = 'user0' }) {
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
    downloadURL: '',
    ownerDisplayName: displayNames[owner],
    ownerId: owner,
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true,
    canShare: () => true
  }
}

const capabilities = {
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

const getConfiguration = () => {
  return {
    options: {
      defaultExtension: 'files',
      homeFolder: '',
      disablePreviews: false,
      previewFileExtensions: [],
      sharingRecipientsPerPage: 200,
      hideSearchBar: false
    }
  }
}

const storeOptions = data => {
  let { user, owner } = data
  if (!owner) {
    owner = user
  }

  const buildCollaboratorsArray = (collaborator, idx) => {
    let {
      username,
      fileOwner,
      owner,
      permissions = 17,
      shareType = 0,
      role = 'viewer'
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
      role: roles[role]
    }
  }
  const outgoingCollaboratorsArray = ['sharedUser'].map(buildCollaboratorsArray)

  const storeOpts = {
    state: {
      user: userObj(user)
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          currentFileOutgoingCollaborators: () => outgoingCollaboratorsArray,
          highlightedFile: () => {
            return getResource({ filename: 'testfile', extension: 'jpg', type: 'file' })
          }
        },
        actions: {
          changeShare: jest.fn(),
          addShare: addShareTrigger
        }
      }
    },
    getters: {
      isOcis: () => false,
      user: () => userObj(user),
      capabilities: () => capabilities,
      configuration: getConfiguration
    }
  }

  return storeOpts
}

const roles = {
  viewer: {
    description: 'Download, preview and share',
    label: 'Viewer',
    name: 'viewer',
    permissions: ['read', 'share']
  },

  editor: {
    description: 'Download, preview, edit and share',
    label: 'Editor',
    name: 'editor',
    permissions: ['read', 'write', 'upload', 'share']
  }
}

const displayNames = {
  user0: 'User Zero',
  user1: 'User One',
  user2: 'User Two'
}

const userObj = name => {
  return {
    id: name,
    additionalInfo: null,
    name,
    displayName: displayNames[name],
    displayname: displayNames[name], // FIXME: some values use different property name for display name
    capabilities
  }
}

const getMountOptions = data => {
  return {
    localVue,
    store: createStore(data),
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true,
      'oc-alert': true,
      'recipient-container': true,
      VueSelect
    }
  }
}

function getMountedWrapper(data) {
  return mount(NewCollaborator, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(NewCollaborator, getMountOptions(data))
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
