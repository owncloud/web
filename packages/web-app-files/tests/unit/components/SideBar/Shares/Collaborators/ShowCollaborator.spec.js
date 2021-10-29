import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Collaborator from 'packages/web-app-files/src/components/SideBar/Shares/Collaborators/ShowCollaborator.vue'
import stubs from '../../../../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  userAvatarImage: 'avatar-image-stub.sharee-avatar',
  notUserAvatar: 'oc-avatar-item-stub.sharee-avatar',
  collaboratorName: '.collaborator-display-name',
  shareType: '.share-type',
  reshareInformation: '.files-collaborators-collaborator-reshare-information',
  reshareToggleId: 'collaborator-%s-resharer-details-toggle',
  colaboratorRole: '.role-name-text'
}

describe('Collaborator component', () => {
  describe('displays the correct image/icon according to the shareType', () => {
    it('should display users avatar for user shares', () => {
      const wrapper = createWrapper({ shareType: 0 })
      expect(wrapper.find(selectors.userAvatarImage).exists()).toBeTruthy()
      expect(wrapper.find(selectors.notUserAvatar).exists()).toBeFalsy()
    })
    it('should display a group icon for group shares', () => {
      const wrapper = createWrapper({ shareType: 1 })
      expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
      expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
      expect(wrapper.find(selectors.notUserAvatar).attributes().name).toEqual('group')
    })
    it('should display a guest icon for guest shares', () => {
      const wrapper = createWrapper({ shareType: 3 })
      expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
      expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
      expect(wrapper.find(selectors.notUserAvatar).attributes().name).toEqual('guest')
    })
    it('should display a remote icon for remote shares', () => {
      const wrapper = createWrapper({ shareType: 4 })
      expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
      expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
      expect(wrapper.find(selectors.notUserAvatar).attributes().name).toEqual('remote')
    })
  })
  describe('collaborator avatar', () => {
    const wrapper = createWrapper()
    it('sets the userId', () => {
      expect(wrapper.find(selectors.userAvatarImage).attributes('userid')).toEqual('brian')
    })
    it('sets the user-name', () => {
      expect(wrapper.find(selectors.userAvatarImage).attributes('user-name')).toEqual(
        'Brian Murphy'
      )
    })
  })
  describe('collaborator text', () => {
    it('shows the collaborator display name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find(selectors.collaboratorName).text()).toEqual(
        'Brian Murphy (brian@owncloud.com)'
      )
    })
  })
  describe('share information', () => {
    describe('share type', () => {
      it('shows the share type', () => {
        const wrapper = createWrapper()
        expect(wrapper.find(selectors.shareType).text()).toEqual('User')
      })
    })
  })
})

function createWrapper({
  shareType = 0,
  collaborator = {
    name: 'brian',
    displayName: 'Brian Murphy',
    additionalInfo: 'brian@owncloud.com'
  },
  currentUserId = 'carol',
  resharers,
  role = { name: 'viewer' }
} = {}) {
  return mount(Collaborator, {
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: currentUserId }
        },
        isOcis: function () {
          return false
        },
        capabilities: function () {
          return {
            files_sharing: {
              user: {
                expire_date: new Date()
              },
              group: {
                expire_date: new Date()
              }
            }
          }
        }
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: function () {
              return { type: 'folder' }
            }
          },
          actions: {
            changeShare: jest.fn
          }
        }
      }
    }),
    propsData: {
      collaborator: {
        collaborator: collaborator,
        shareType: shareType,
        resharers: resharers,
        role: role
      },
      modifiable: true
    },
    localVue,
    stubs: {
      ...stubs,
      'oc-table-simple': true,
      'oc-tr': true,
      'oc-td': true,
      'oc-tag': true,
      'oc-avatar': true,
      'oc-avatar-item': true,
      'oc-pagination': true,
      'collaborators-edit-options': true,
      'show-collaborator-edit-options': true,
      translate: false
    }
  })
}
