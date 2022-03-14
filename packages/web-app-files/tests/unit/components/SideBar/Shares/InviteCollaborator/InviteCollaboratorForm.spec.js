import { createLocalVue, mount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import InviteCollaboratorForm from '../../../../../../src/components/SideBar/Shares/InviteCollaborator/InviteCollaboratorForm'
import { ShareTypes } from '../../../../../../src/helpers/share'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueSelect from 'vue-select'
import stubs from '@/tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(DesignSystem)
localVue.use(VueSelect)
localVue.use(Vuex)

const folderMock = {
  type: 'folder',
  isFolder: true,
  ownerId: 'alice',
  ownerDisplayName: 'alice',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  isMounted: jest.fn(() => true),
  name: 'lorem.txt',
  privateLink: 'some-link',
  canShare: jest.fn(() => true),
  path: '/documents'
}

const spaceMock = {
  id: 1,
  type: 'space'
}

describe('InviteCollaboratorForm', () => {
  describe('renders correctly', () => {
    it.todo('renders a select field for share receivers')
    it.todo('renders an inviteDescriptionMessage')
    it.todo('renders a role selector component')
    it.todo('renders an expiration datepicker component')
    it.todo('renders an invite-sharees button')
    it.todo('renders an hidden-announcer')
  })
  describe('behaves correctly', () => {
    it.todo('upon mount fetches recipients')
    it('clicking the invite-sharees button calls the "share"-action', async () => {
      const selectedCollaborators = [
        { shareWith: 'marie', value: { shareType: ShareTypes.user.value }, label: 'label' }
      ]
      const wrapper = getWrapper({ selectedCollaborators })
      const spyTriggerUpload = jest.spyOn(wrapper.vm, 'share')
      const shareBtn = wrapper.find('#new-collaborators-form-create-button')
      expect(shareBtn.exists()).toBeTruthy()

      await shareBtn.trigger('click')
      expect(spyTriggerUpload).toHaveBeenCalledTimes(0)
    })
    it.each([
      { spaceId: undefined, highlightedFile: folderMock },
      { spaceId: undefined, highlightedFile: spaceMock },
      { spaceId: 1, highlightedFile: folderMock }
    ])('calls the "addShare" action', async (dataSet) => {
      const selectedCollaborators = [
        { shareWith: 'marie', value: { shareType: ShareTypes.user.value }, label: 'label' }
      ]
      const wrapper = getWrapper({
        selectedCollaborators,
        spaceId: dataSet.spaceId,
        highlightedFile: dataSet.highlightedFile
      })
      const addShareSpy = jest.spyOn(wrapper.vm, 'addShare')
      await wrapper.vm.share()
      expect(addShareSpy).toBeCalled()
    })
    it.todo('resets focus upon selecting an invitee')
  })
})

function getWrapper({ selectedCollaborators = [], spaceId, highlightedFile = folderMock } = {}) {
  return mount(InviteCollaboratorForm, {
    localVue,
    stubs: {
      'recipient-container': true,
      'role-dropdown': true,
      ...stubs
    },
    data() {
      return {
        selectedCollaborators
      }
    },
    mocks: {
      $route: {
        params: { spaceId }
      }
    },
    store: new Vuex.Store({
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: () => {
              return highlightedFile
            }
          },
          actions: {
            addShare: jest.fn()
          }
        }
      },
      getters: {
        isOcis: () => true,
        getToken: jest.fn(() => 'GFwHKXdsMgoFwt'),
        configuration: jest.fn(() => ({
          server: 'http://example.com/'
        }))
      }
    })
  })
}
