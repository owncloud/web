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
  userAvatarImage: 'avatar-image-stub.files-collaborators-collaborator-indicator',
  notUserAvatar: 'oc-icon-stub.files-collaborators-collaborator-indicator',
  collaboratorAdditionalInfo: '.files-collaborators-collaborator-additional-info',
  collaboratorName: '.files-collaborators-collaborator-name',
  shareType: '.files-collaborators-collaborator-share-type',
  reshareInformation: '.files-collaborators-collaborator-reshare-information',
  reshareToggleId: 'collaborator-%s-resharer-details-toggle',
  collaboratorRole: '.files-collaborators-collaborator-role'
}

const resharers = [
  {
    displayName: 'David Lopez'
  },
  {
    displayName: 'Tim',
    additionalInfo: 'tim@owncloud.com'
  }
]

const getReshareToggleId = function(username) {
  return selectors.reshareToggleId.replace('%s', username)
}

const getReshareDetailsToggleDropSelector = function(username) {
  return 'oc-drop-stub[drop-id="' + getReshareToggleId(username) + '-drop"]'
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
      const wrapper = createWrapper()
      expect(wrapper.find(selectors.collaboratorName).text()).toEqual('Brian Murphy')
    })
    describe('collaborator is the current user', () => {
      it.each([0, 3, 4, 6])('indicates the current user', shareType => {
        const wrapper = createWrapper({
          shareType: shareType,
          currentUserId: 'brian'
        })
        expect(wrapper.find(selectors.collaboratorAdditionalInfo).text()).toEqual('(me)')
      })
      it('does not indicate the current user for group shares', () => {
        const wrapper = createWrapper({
          shareType: 1,
          collaborator: {
            name: 'brian'
          },
          currentUserId: 'brian'
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
          }
        })
        expect(wrapper.find(selectors.collaboratorAdditionalInfo).exists()).toBeFalsy()
      })
    })
    it('shows additional information about the collaborator if set', () => {
      const wrapper = createWrapper()
      expect(wrapper.find(selectors.collaboratorAdditionalInfo).text()).toEqual(
        'brian@owncloud.com'
      )
    })
    it('does not show additional information about the collaborator if not set', () => {
      const wrapper = createWrapper({
        collaborator: {
          displayName: 'Alice Hansen'
        }
      })
      expect(wrapper.find(selectors.collaboratorAdditionalInfo).exists()).toBeFalsy()
    })
  })
  describe('share information', () => {
    describe('share type', () => {
      it('shows the share type', () => {
        const wrapper = createWrapper()
        expect(wrapper.find(selectors.shareType).text()).toEqual('User')
      })
      it('does not show the share type for the owner', () => {
        const wrapper = createWrapper({
          currentUserId: 'brian'
        })
        expect(wrapper.find(selectors.shareType).exists()).toBeFalsy()
      })
      it('shows the group icon for group shares', () => {
        const wrapper = createWrapper({
          shareType: 1
        })
        expect(wrapper.find(selectors.shareType + ' > oc-icon-stub').attributes().name).toEqual(
          'group'
        )
      })
      it.each([0, 2, 3, 4, 5, 6])('shows the person icon for not group shares', shareType => {
        const wrapper = createWrapper({
          shareType: shareType
        })
        expect(wrapper.find(selectors.shareType + ' > oc-icon-stub').attributes().name).toEqual(
          'person'
        )
      })
    })
    describe('reshare information', () => {
      it.each([undefined, 0, null, false, '0', '', []])(
        "does not show information if it's not a reshared share",
        resharers => {
          const wrapper = createWrapper({
            resharers: resharers
          })
          expect(wrapper.find(selectors.reshareInformation).exists()).toBeFalsy()
        }
      )

      // in the next test JSON is used for the examples to prevent `it.each()` to create a table out of the sub-arrays
      // we don't want to have multiple parameters for the test function but a real array
      it.each([
        '[{ "displayName": "" }]',
        '[{ "displayName": 123 }]',
        '[{ "displayName": null }]',
        '[{ "displayName": true }]',
        '[{ "displayName": false }]',
        '[{ "displayName": 123 }, { "displayName": "Peter" }]',
        '[{ "displayName": null }, { "displayName": "Peter" }]',
        '[{ "displayName": "Tom" }, { "displayName": "" }]'
      ])('does not show information if a reshare has invalid data', resharers => {
        const wrapper = createWrapper({
          resharers: JSON.parse(resharers)
        })
        expect(wrapper.find(selectors.reshareInformation).exists()).toBeFalsy()
      })
      describe('reshare information', () => {
        it('is shown for single resharer', () => {
          const wrapper = createWrapper({
            resharers: [resharers[0]]
          })
          expect(wrapper.find('#' + getReshareToggleId('brian')).exists()).toBeTruthy()
          expect(wrapper.find('#' + getReshareToggleId('brian')).attributes().class).toEqual(
            'files-collaborators-collaborator-reshare-information'
          )
          expect(wrapper.find('#' + getReshareToggleId('brian')).text()).toEqual(
            'Shared by David Lopez'
          )
        })
        it('is shown for multiple resharers', () => {
          const wrapper = createWrapper({
            resharers: resharers
          })
          expect(wrapper.find(selectors.reshareInformation).exists()).toBeTruthy()
          expect(wrapper.find(selectors.reshareInformation).attributes().id).toEqual(
            'collaborator-brian-resharer-details-toggle'
          )
          expect(wrapper.find(selectors.reshareInformation).text()).toEqual(
            'Shared by David Lopez, Tim'
          )
        })
        describe('reshare dropdown', () => {
          it('is shown for single resharer', () => {
            const wrapper = createWrapper({
              resharers: [resharers[0]]
            })
            expect(wrapper.find(getReshareDetailsToggleDropSelector('brian')).text()).toMatch(
              /^Shared by\s+David Lopez$/
            )
            expect(
              wrapper
                .find(getReshareDetailsToggleDropSelector('brian'))
                .find('avatar-image-stub')
                .exists()
            ).toBeTruthy()
            expect(
              wrapper
                .find(getReshareDetailsToggleDropSelector('brian'))
                .find('avatar-image-stub')
                .attributes()['user-name']
            ).toEqual('David Lopez')
          })
          it('is shown for multiple resharers', () => {
            const wrapper = createWrapper({
              resharers: resharers
            })
            expect(wrapper.find(getReshareDetailsToggleDropSelector('brian')).text()).toMatch(
              /^Shared by\s+David Lopez\s+Tim tim@owncloud\.com$/
            )
            expect(
              wrapper
                .find(getReshareDetailsToggleDropSelector('brian'))
                .findAll('avatar-image-stub')
            ).toHaveLength(2)
          })
          it('sets the correct attributes', () => {
            const wrapper = createWrapper({
              resharers: [resharers[0]]
            })
            expect(
              wrapper.find(getReshareDetailsToggleDropSelector('brian')).attributes().toggle
            ).toEqual('#' + getReshareToggleId('brian'))
            expect(
              wrapper.find(getReshareDetailsToggleDropSelector('brian')).attributes().mode
            ).toEqual('click')
            expect(
              wrapper.find(getReshareDetailsToggleDropSelector('brian')).attributes()[
                'close-on-click'
              ]
            ).toEqual('')
          })
        })
      })
    })
    describe('role', () => {
      it.each([
        { name: 'viewer', expectedText: 'Viewer' },
        { name: 'editor', expectedText: 'Editor' },
        { name: 'advancedRole', expectedText: 'Custom permissions' },
        { name: 'owner', expectedText: 'Owner' },
        { name: 'resharer', expectedText: 'Resharer' },
        { name: 'invalidRole', expectedText: 'Unknown Role' }
      ])('shows the role label', cases => {
        const wrapper = createWrapper({
          role: { name: cases.name }
        })
        expect(wrapper.find(selectors.collaboratorRole).text()).toEqual(cases.expectedText)
      })

      it.each([
        { name: 'viewer', expectedName: 'remove_red_eye' },
        { name: 'editor', expectedName: 'edit' },
        { name: 'advancedRole', expectedName: 'checklist' },
        { name: 'owner', expectedName: 'key' },
        { name: 'resharer', expectedName: 'key' },
        { name: 'invalidRole', expectedName: 'key' }
      ])('sets the name of the icon', cases => {
        const wrapper = createWrapper({
          role: { name: cases.name }
        })
        expect(
          wrapper.find(selectors.collaboratorRole + ' oc-icon-stub').attributes('name')
        ).toEqual(cases.expectedName)
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
        resharers: resharers,
        role: role
      }
    },
    localVue,
    stubs: {
      ...stubs,
      'oc-table-simple': true,
      'oc-tr': true,
      'oc-td': true,
      'oc-tag': true,
      'oc-pagination': true,
      translate: false
    }
  })
}
