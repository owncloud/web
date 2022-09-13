import SpaceMembers from '@files/src/components/SideBar/Shares/SpaceMembers.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import Users from '@/__fixtures__/users'
import { spaceRoleManager, spaceRoleViewer, ShareTypes } from 'web-client/src/helpers/share'
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
const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceQuota: {
    used: 100,
    total: 1000
  }
}

const spaceMembers = [
  {
    id: '1',
    shareType: ShareTypes.space.value,
    collaborator: {
      name: user.id,
      displayName: user.displayname
    },
    role: {
      name: spaceRoleManager.name
    }
  },
  {
    id: '2',
    shareType: ShareTypes.space.value,
    collaborator: {
      onPremisesSamAccountName: 'Einstein',
      displayName: 'einstein'
    },
    role: {
      name: spaceRoleViewer.name
    }
  },
  {
    id: '3',
    shareType: ShareTypes.space.value,
    collaborator: {
      onPremisesSamAccountName: 'Marie',
      displayName: 'marie'
    },
    role: {
      name: spaceRoleManager.name
    }
  }
]

describe('SpaceMembers', () => {
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
        user,
        spaceMembers: [spaceMembers[0]]
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if currentUser can not share', () => {
    it('other shares are listed, but creating/editing shares is not possible', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        spaceMembers: [spaceMembers[1]]
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if currentUser is manager', () => {
    it('allows role edit of the current user if another user is manager', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        spaceMembers
      })
      expect(wrapper).toMatchSnapshot()
    })
    it('does not allow role edit of the current user if they are the only manager', () => {
      const wrapper = getShallowMountedWrapper({
        user,
        spaceMembers: [spaceMembers[0], spaceMembers[1]]
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if currentUser can delete', () => {
    it('reacts on delete events by collaborator list items', async () => {
      const wrapper = getMountedWrapper({
        user,
        spaceMembers
      })

      const spyOnCollaboratorDeleteTrigger = jest.spyOn(
        wrapper.vm,
        '$_ocCollaborators_deleteShare_trigger'
      )
      wrapper
        .find(`div[data-testid="collaborator-user-item-${spaceMembers[0].collaborator.name}"]`)
        .vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
    })
  })
})

const storeOptions = (data, isInLoadingState) => {
  const { user } = data

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
        namespaced: true,
        getters: {
          highlightedFile: () => spaceMock,
          currentFileOutgoingSharesLoading: () => isInLoadingState,
          sharesTreeLoading: () => false
        },
        actions: {
          deleteShare: jest.fn()
        },
        mutations: {
          SET_HIGHLIGHTED_FILE(state, file) {
            state.highlightedFile = spaceMock
          }
        }
      }
    },
    getters: {
      configuration: jest.fn(() => ({
        server: 'http://example.com/',
        currentTheme: {
          general: {
            name: 'some-company'
          }
        }
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

function getShallowMountedWrapper(data, loading = false) {
  const { spaceMembers = [] } = data
  return shallowMount(getComponent(loading), {
    localVue,
    store: createStore(data, loading),
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true
    },
    provide: {
      displayedItem: {
        value: spaceMock
      },
      spaceMembers: { value: spaceMembers }
    }
  })
}

function getMountedWrapper(data, loading = false) {
  const { spaceMembers = [] } = data
  return mount(getComponent(loading), {
    localVue,
    store: createStore(data, loading),
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true,
      'role-dropdown': true,
      'edit-dropdown': true
    },
    mocks: {
      $router: {
        go: jest.fn(),
        push: jest.fn(),
        currentRoute: {
          name: 'some-route',
          query: { page: 1 }
        },
        resolve: (r) => ({ href: r.name })
      }
    },
    provide: {
      displayedItem: {
        value: spaceMock
      },
      spaceMembers: { value: spaceMembers }
    }
  })
}

function createStore(data, loading) {
  return new Vuex.Store(storeOptions(data, loading))
}

function getComponent(loading) {
  return {
    ...SpaceMembers,
    setup: () => ({
      graphClient: {},
      loadSharesTask: {
        isRunning: loading,
        perform: jest.fn()
      }
    })
  }
}
