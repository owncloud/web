import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Collaborator from 'packages/web-app-files/src/components/Collaborators/Collaborator.vue'
import stubs from '../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  userAvatarImage: 'avatar-image-stub.files-collaborators-collaborator-indicator',
  notUserAvatar: 'oc-icon-stub.files-collaborators-collaborator-indicator',
  collaboratorAdditionalInfo: '.files-collaborators-collaborator-additional-info',
  collaboratorName: '.files-collaborators-collaborator-name'
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
      expect(wrapper.find(selectors.notUserAvatar).rootNode.key).toEqual('avatar-group')
    })
    it.each([3, 4, 6])(
      'should display a generic-person icon for any other share types',
      shareType => {
        const wrapper = createWrapper({ shareType: shareType })
        expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
        expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
        expect(wrapper.find(selectors.notUserAvatar).attributes().name).toEqual('person')
        expect(wrapper.find(selectors.notUserAvatar).rootNode.key).toEqual('avatar-generic-person')
      }
    )
  })
  describe('collaborator avatar', () => {
    const wrapper = createWrapper({
      shareType: 0,
      collaborator: {
        name: 'brian',
        displayName: 'Brian Murphy'
      }
    })
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
    it.each`
      shareType | classSuffix
      ${0}      | ${'user'}
      ${1}      | ${'group'}
      ${3}      | ${'group'}
      ${4}      | ${'group'}
      ${6}      | ${'remote'}
    `('sets the correct class', ({ shareType, classSuffix }) => {
      const wrapper = createWrapper({ shareType: shareType })
      expect(
        wrapper.find('.files-collaborators-collaborator-info-' + classSuffix).exists()
      ).toBeTruthy()
    })
    it('shows the collaborator display name', () => {
      const wrapper = createWrapper({
        shareType: 0,
        collaborator: {
          displayName: 'Alice Hansen'
        }
      })
      expect(wrapper.find(selectors.collaboratorName).text()).toEqual('Alice Hansen')
    })
    describe('collaborator is the current user', () => {
      it.each([0, 3, 4, 6])('indicates the current user', shareType => {
        const wrapper = createWrapper({
          shareType: shareType,
          collaborator: {
            name: 'carol'
          },
          currentUserId: 'carol'
        })
        expect(wrapper.find(selectors.collaboratorAdditionalInfo).text()).toEqual('(me)')
      })
      it('does not indicate the current user for group shares', () => {
        const wrapper = createWrapper({
          shareType: 1,
          collaborator: {
            name: 'carol'
          },
          currentUserId: 'carol'
        })
        expect(wrapper.find(selectors.collaboratorAdditionalInfo).exists()).toBeFalsy()
      })
    })
    describe('collaborator is not the current user', () => {
      it.each([0, 3, 4, 6])('does not indicate the current user', shareType => {
        const wrapper = createWrapper({
          shareType: shareType,
          collaborator: {
            name: 'brian'
          },
          currentUserId: 'carol'
        })
        expect(wrapper.find(selectors.collaboratorAdditionalInfo).exists()).toBeFalsy()
      })
    })
    it('shows additional infos about collaborator if set', () => {
      const wrapper = createWrapper({
        shareType: 0,
        collaborator: {
          displayName: 'Alice Hansen',
          additionalInfo: 'alice@owncloud.com'
        },
        currentUserId: 'carol'
      })
      expect(wrapper.find(selectors.collaboratorAdditionalInfo).text()).toEqual(
        'alice@owncloud.com'
      )
    })
    it('does not show additional infos about collaborator if not set', () => {
      const wrapper = createWrapper({
        shareType: 0,
        collaborator: {
          displayName: 'Alice Hansen'
        },
        currentUserId: 'carol'
      })
      expect(wrapper.find(selectors.collaboratorAdditionalInfo).exists()).toBeFalsy()
    })
  })
})

function createWrapper({ shareType, collaborator = {}, currentUserId }) {
  return shallowMount(Collaborator, {
    store: new Vuex.Store({
      getters: {
        user: function() {
          return { id: currentUserId }
        },
        isOcis: function() {
          return false
        }
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: function() {
              return { type: 'folder' }
            }
          }
        }
      }
    }),
    propsData: {
      collaborator: {
        collaborator: collaborator,
        shareType: shareType,
        role: { name: 'viewer' }
      }
    },
    localVue,
    stubs: {
      ...stubs,
      'oc-table-simple': true,
      'oc-tr': true,
      'oc-td': true,
      'oc-tag': true
    }
  })
}
