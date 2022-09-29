import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import mockAxios from 'jest-mock-axios'
import VueCompositionAPI from '@vue/composition-api/dist/vue-composition-api'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs'
import Users from '@/__fixtures__/users'
import Collaborators from '@/__fixtures__/collaborators'
import { spaceRoleManager } from 'web-client/src/helpers/share'
import * as reactivityComposables from 'web-pkg/src/composables/reactivity'
import * as routerComposables from 'web-pkg/src/composables/router'
import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'
import { buildSpace } from 'web-client/src/helpers'
import { clientService } from 'web-pkg/src/services'

const localVue = createLocalVue()
localVue.prototype.$clientService = clientService
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(VueCompositionAPI)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

jest.mock('web-pkg/src/composables/reactivity')
jest.mock('web-pkg/src/composables/router')

const user = Users.alice
const collaborators = [Collaborators[0], Collaborators[1]]
const storageId = '1'

const selectors = {
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

    it('reacts on delete events by collaborator list items', async () => {
      const spyOnCollaboratorDeleteTrigger = jest
        .spyOn(FileShares.methods, '$_ocCollaborators_deleteShare_trigger')
        .mockImplementation()
      const wrapper = getMountedWrapper({
        user,
        outgoingCollaborators: collaborators
      })
      wrapper.find(selectors.firstCollaboratorListItem).vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
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
    it('loads space members if a space is given', () => {
      mockAxios.request.mockImplementationOnce(() => {
        return Promise.resolve({
          data: { role: spaceRoleManager.name }
        })
      })

      const spaceMock = buildSpace({
        id: '1',
        driveType: 'project',
        root: {
          permissions: [
            {
              roles: ['manager'],
              grantedTo: [{ user: { id: user.uuid } }]
            }
          ]
        }
      })
      const wrapper = getShallowMountedWrapper({
        user,
        spaces: [spaceMock],
        spaceMembers: [{ id: 1 }]
      })
      expect(wrapper.find('#space-collaborators-list').exists()).toBeTruthy()
    })
    it('does not load space members if no space is given', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        spaceMembers: [{ id: 1 }]
      })

      expect(wrapper.find('#space-collaborators-list').exists()).toBeFalsy()
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
    canShare: () => canShare,
    canDeny: () => false
  }
}

const storeOptions = (data) => {
  const {
    user,
    outgoingCollaborators = [],
    incomingCollaborators = [],
    canShare = true,
    spaces = [],
    spaceMembers = []
  } = data
  return {
    actions: {
      createModal: jest.fn(),
      hideModal: jest.fn(),
      showMessage: jest.fn()
    },
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
          sharesTreeLoading: () => false
        },
        actions: {
          loadSharesTree: jest.fn(),
          deleteShare: jest.fn()
        },
        mutations: {
          SET_HIGHLIGHTED_FILE(state, file) {
            const newFile = getResource(file)
            state.highlightedFile = newFile
          }
        }
      },
      runtime: {
        namespaced: true,
        modules: {
          auth: {
            namespaced: true,
            getters: {
              accessToken: () => 'GFwHKXdsMgoFwt'
            }
          },
          spaces: {
            namespaced: true,
            state: { spaces },
            getters: {
              spaceMembers: () => spaceMembers
            }
          }
        }
      }
    },
    getters: {
      configuration: jest.fn(() => ({
        options: {
          sidebar: {
            shares: {
              showAllOnLoad: false
            }
          }
        },
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

function getMountedWrapper(data) {
  routerComposables.useRouteParam.mockReturnValue(() => storageId)

  return mount(FileShares, {
    localVue,
    provide: {
      incomingParentShare: {}
    },
    setup: () => ({
      currentStorageId: storageId
    }),
    store: createStore(data),
    stubs: {
      ...stubs,
      'oc-button': false
    },
    mocks: {
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

function getShallowMountedWrapper(data, loading = false) {
  reactivityComposables.useDebouncedRef.mockImplementationOnce(() => loading)
  routerComposables.useRouteParam.mockReturnValue(() => storageId)

  return shallowMount(FileShares, {
    localVue,
    setup: () => ({
      currentStorageId: storageId,
      hasResharing: false
    }),
    provide: {
      incomingParentShare: {}
    },
    store: createStore(data),
    stubs: {
      ...stubs,
      'oc-button': true
    },
    mocks: {
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
