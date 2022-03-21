import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import Users from '@/__fixtures__/users'
import Collaborators from '@/__fixtures__/collaborators'
import mockAxios from 'jest-mock-axios'
import { spaceRoleManager } from '../../../../../src/helpers/share'
import VueCompositionAPI from '@vue/composition-api/dist/vue-composition-api'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(VueCompositionAPI)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const user = Users.alice
const collaborators = [Collaborators[0], Collaborators[1]]

const selectors = {
  showCollaboratorButton: 'button[data-testid="collaborators-show-people"]',
  firstCollaboratorListItem: `div[data-testid="collaborator-user-item-${Collaborators[0].collaborator.name}"]`
}

describe('FileShares', () => {
  it('renders loading spinner while loading', () => {
    const wrapper = getShallowMountedWrapper(
      {
        user
      },
      true
    )
    expect(wrapper).toMatchSnapshot()
  })

  describe('if currentUser can share', () => {
    it('initially renders add people dialog', () => {
      const wrapper = getShallowMountedWrapper({
        user
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if currentUser can not share', () => {
    it('initially renders no share permission message', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        canShare: false
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if there are no collaborators', () => {
    it('does not render avatar wrapper or collaborator list', () => {
      const wrapper = getShallowMountedWrapper({
        user
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if there are collaborators present', () => {
    it('renders sharedWithLabel and sharee list', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        outgoingCollaborators: collaborators
      })
      expect(wrapper).toMatchSnapshot()
    })

    it('can toggle the collaborators list by clicking the avatar wrapper button', async () => {
      const wrapper = getMountedWrapper({
        user,
        outgoingCollaborators: collaborators
      })
      const button = wrapper.find(selectors.showCollaboratorButton)
      expect(wrapper.vm.showShareesList).toBe(true)
      await button.trigger('click')
      expect(wrapper.vm.showShareesList).toBe(false)
      await button.trigger('click')
      expect(wrapper.vm.showShareesList).toBe(true)
    })

    it('reacts on delete events by collaborator list items', async () => {
      const spyOnCollaboratorDelete = jest
        .spyOn(FileShares.methods, '$_ocCollaborators_deleteShare')
        .mockImplementation()
      const wrapper = getMountedWrapper({
        user,
        outgoingCollaborators: collaborators
      })
      wrapper.find(selectors.firstCollaboratorListItem).vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDelete).toHaveBeenCalledTimes(1)
    })
    it('reloads shares if highlighted file is changed', async () => {
      const spyOnReloadShares = jest
        .spyOn(FileShares.methods, '$_reloadShares')
        .mockImplementation()
      const wrapper = getMountedWrapper({
        user,
        outgoingCollaborators: collaborators
      })
      wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', { name: 'testfile2' })
      await wrapper.vm.$nextTick()
      expect(spyOnReloadShares).toHaveBeenCalledTimes(1)
    })
    it('correctly passes the shared parent route to the collaborator list item', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        outgoingCollaborators: [{ ...Collaborators[0], indirect: true }]
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('current space', () => {
    afterEach(() => {
      mockAxios.reset()
    })
    it('loads space members if a space is given', async () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] }
      }
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: spaceMock
        })
      })
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: { role: spaceRoleManager.name }
        })
      })

      const wrapper = getShallowMountedWrapper({ user })

      await wrapper.vm.loadSpaceTask.last
      await wrapper.vm.loadSpaceMembersTask.last
      expect(wrapper.vm.spaceMembers.length).toBe(1)
      expect(wrapper.find('#space-collaborators-list').exists()).toBeTruthy()
    })
    it('does not load space members if no space is given', () => {
      const wrapper = getShallowMountedWrapper({
        user
      })

      expect(wrapper.vm.spaceMembers.length).toBe(0)
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
    isFolder: type === 'folder',
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    shareTypes: [],
    downloadURL: '',
    ownerDisplayName: owner.displayname,
    ownerId: owner.id,
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true,
    canShare: () => canShare
  }
}

const storeOptions = (data) => {
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

  return {
    state: {
      user
    },
    modules: {
      Files: {
        state: {
          incomingShares: incomingCollaborators,
          sharesTree: { [Collaborators[0].path]: [Collaborators[0]] }
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename: 'testfile', extension: 'jpg', type: 'file', canShare })
          },
          currentFileOutgoingCollaborators: () => outgoingCollaborators,
          currentFileOutgoingSharesLoading: () => false,
          sharesTreeLoading: () => false
        },
        actions: {
          loadCurrentFileOutgoingShares: jest.fn(),
          loadIncomingShares: jest.fn(),
          loadSharesTree: jest.fn(),
          deleteShare: jest.fn()
        },
        mutations: {
          SET_HIGHLIGHTED_FILE(state, file) {
            const newFile = getResource(file)
            state.highlightedFile = newFile
          }
        }
      }
    },
    getters: {
      getToken: jest.fn(() => 'GFwHKXdsMgoFwt'),
      configuration: jest.fn(() => ({
        server: 'http://example.com/'
      })),
      user: () => user,
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

function getMountedWrapper(data, loading = false) {
  return mount(FileShares, {
    localVue,
    store: createStore(data),
    mocks: {
      sharesLoading: loading,
      $route: {
        params: { storageId: 1 }
      },
      $router: {
        currentRoute: { name: 'some-route' },
        resolve: (r) => {
          return {
            href: r.name
          }
        }
      }
    },
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true
    }
  })
}

function getShallowMountedWrapper(data, loading = false) {
  return shallowMount(FileShares, {
    localVue,
    store: createStore(data),
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true
    },
    mocks: {
      sharesLoading: loading,
      $route: {
        params: {
          storageId: 1
        }
      },
      $router: {
        currentRoute: { name: 'some-route' },
        resolve: (r) => {
          return {
            href: r.name
          }
        }
      }
    }
  })
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
