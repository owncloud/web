import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
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

const selectors = {
  addPeopleButton: '.files-collaborators-open-add-share-dialog-button',

  ownerAsSelfRow: 'show-collaborator-stub[aria-describedby="collaborator-as-fileowner"]',
  ownerRow: 'show-collaborator-stub[aria-describedby="original-sharing-user"]',

  collaboratorsRow: 'show-collaborator-stub:not([aria-describedby])',
  addCollaboratorDialog: '.files-collaborators-collaborator-add-dialog',
  cannotSharePermissionMsg: 'p[data-testid="files-collaborators-no-reshare-permissions-message"]',
  collaboratorAsOwner: 'p#collaborator-as-fileowner'
}

describe('FileShares', () => {
  describe('Add People Button', () => {
    it('should render add people buttonn', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      const addPeopleButton = wrapper.find(selectors.addPeopleButton)
      expect(addPeopleButton.exists()).toBe(true)
      expect(addPeopleButton.text()).toBe('Add people')
    })

    it('add people button should work', async () => {
      const wrapper = getMountedWrapper({ user: 'user0', collaborators: [] })
      const addPeopleButton = wrapper.find(selectors.addPeopleButton)

      expect(wrapper.vm.currentView).toBe('showCollaborators')
      await addPeopleButton.trigger('click')
      expect(wrapper.vm.currentView).toBe('newCollaborator')

      const addCollaborator = wrapper.find(selectors.addCollaboratorDialog)
      expect(addCollaborator.exists()).toBe(true)
    })
  })

  describe('without any collaborators', () => {
    describe('owner views the shares sidebar', () => {
      it('should should show the user as owner message', () => {
        const wrapper = getShallowMountedWrapper({ user: 'user0', outgoingCollaborators: [] })

        const ownerMsg = wrapper.find(selectors.collaboratorAsOwner)
        expect(ownerMsg.exists()).toBe(true)
        expect(ownerMsg.text()).toBe('You are the file owner')
      })

      it('should render the file owner', () => {
        const wrapper = getShallowMountedWrapper({ user: 'user0', outgoingCollaborators: [] })

        const owner = wrapper.find(selectors.ownerAsSelfRow)
        expect(owner.exists()).toBe(true)

        expect(owner.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user0', displayName: 'User Zero' },
            shareType: 0,
            role: { name: 'owner' }
          },
          modifiable: false,
          firstColumn: true
        })

        const collaborators = wrapper.findAll(selectors.collaboratorsRow)
        expect(collaborators.length).toBe(0)
      })

      it('should show cannot share permission if the owner cannot share', () => {
        const wrapper = getShallowMountedWrapper({
          user: 'user0',
          outgoingCollaborators: [],
          canShare: false
        })

        const noShareMsg = wrapper.find(selectors.cannotSharePermissionMsg)
        expect(noShareMsg.exists()).toBe(true)
        expect(noShareMsg.text()).toBe("You don't have permission to share this file.")
      })
    })
  })

  describe('with Collaborators', () => {
    describe('owner views the shares panel', () => {
      it('should render the file collaborators', () => {
        const wrapper = getShallowMountedWrapper({
          user: 'user0',
          outgoingCollaborators: [
            {
              username: 'user1'
            },
            {
              username: 'user2'
            }
          ]
        })

        const owner = wrapper.find(selectors.ownerAsSelfRow)
        expect(owner.exists()).toBe(true)

        expect(owner.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user0', displayName: 'User Zero' },
            shareType: 0,
            role: { name: 'owner' }
          },
          modifiable: false,
          firstColumn: true
        })

        const collaborators = wrapper.findAll(selectors.collaboratorsRow)
        expect(collaborators.length).toBe(2)

        const collaborator1 = collaborators.at(0)
        expect(collaborator1.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user1', displayName: 'User One' },
            shareType: 0,
            role: roles.viewer
          },
          modifiable: true,
          firstColumn: true
        })

        const collaborator2 = collaborators.at(1)
        expect(collaborator2.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user2', displayName: 'User Two' },
            shareType: 0,
            role: roles.viewer
          },
          modifiable: true,
          firstColumn: true
        })
      })
    })

    describe('sharee views the shares panel', () => {
      it('should render the file collaborators', () => {
        const wrapper = getShallowMountedWrapper({
          user: 'user1',
          incomingCollaborators: [
            {
              fileOwner: 'user0',
              username: 'user1'
            }
          ]
        })

        const owner = wrapper.find(selectors.ownerRow)
        expect(owner.exists()).toBe(true)

        expect(owner.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user0', displayName: 'User Zero' },
            shareType: 0,
            role: { name: 'owner' }
          },
          modifiable: false,
          firstColumn: true
        })

        const collaborators = wrapper.findAll(selectors.collaboratorsRow)
        expect(collaborators.length).toBe(1)

        const collaborator1 = collaborators.at(0)
        expect(collaborator1.props()).toMatchObject({
          collaborator: {
            collaborator: { name: 'user1', displayName: 'User One' },
            shareType: 0,
            role: roles.viewer
          },
          modifiable: false,
          firstColumn: true
        })
      })
    })
  })
})

function getResource({
  filename = 'testFile',
  extension = 'txt',
  type = 'file',
  owner = 'user0',
  canShare = true
}) {
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
    canShare: () => canShare
  }
}

const storeOptions = data => {
  let {
    user,
    outgoingCollaborators = [],
    incomingCollaborators = [],
    owner,
    canShare = true
  } = data
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
  const outgoingCollaboratorsArray = outgoingCollaborators.map(buildCollaboratorsArray)
  const incomingCollaboratorsArray = incomingCollaborators.map(buildCollaboratorsArray)

  const storeOpts = {
    state: {
      user: userObj(user)
    },
    modules: {
      Files: {
        state: {
          incomingShares: incomingCollaboratorsArray,
          incomingSharesLoading: false,
          sharesTree: [],
          appSidebarAccordionContext: {}
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename: 'testfile', extension: 'jpg', type: 'file', canShare })
          },
          currentFileOutgoingCollaborators: () => outgoingCollaboratorsArray,
          currentFileOutgoingSharesLoading: () => false,
          sharesTreeLoading: () => false
        },
        actions: {
          loadCurrentFileOutgoingShares: jest.fn(),
          loadSharesTree: jest.fn(),
          sharesClearState: jest.fn(),
          deleteShare: jest.fn(),
          loadIncomingShares: jest.fn(),
          incomingSharesclearState: jest.fn()
        },
        mutations: {}
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

  return storeOpts
}

function getMountedWrapper(data) {
  return mount(FileShares, {
    localVue,
    store: createStore(data),
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true
    }
  })
}

const roles = {
  viewer: {
    description: 'Download, preview and share',
    label: 'Viewer',
    name: 'viewer',
    permissions: ['read', 'share']
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
    displayname: displayNames[name] // FIXME: some values use different property name for display name
  }
}

function getShallowMountedWrapper(data) {
  return shallowMount(FileShares, {
    localVue,
    store: createStore(data),
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true
    }
  })
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
