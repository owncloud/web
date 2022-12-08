import { shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import FileShares from 'web-app-files/src/components/SideBar/Shares/FileShares.vue'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'

const localVue = defaultLocalVue()

const Collaborators = [
  {
    shareType: 0,
    id: 'f5c28709-b921-4ec8-b39a-4c243709b514',
    collaborator: {
      name: 'einstein',
      displayName: 'Albert Einstein',
      additionalInfo: 'einstein@example.org'
    },
    owner: {
      name: 'admin',
      displayName: 'Admin',
      additionalInfo: 'admin@example.org'
    },
    fileOwner: {
      name: 'admin',
      displayName: 'Admin',
      additionalInfo: 'admin@example.org'
    },
    file: {},
    stime: '1639152810',
    permissions: 15,
    path: "/Neuer Ordner-'singe'",
    key: 'collaborator-f5c28709-b921-4ec8-b39a-4c243709b514'
  }
]
const collaborators = [Collaborators[0]]

describe('FileShares', () => {
  describe('invite collaborator form', () => {
    it('renders the form when the resource can be shared', () => {
      const resource = mockDeep<Resource>({ isReceivedShare: () => false, canShare: () => true })
      const wrapper = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the resource can not be shared', () => {
      const resource = mockDeep<Resource>({ isReceivedShare: () => false, canShare: () => false })
      const wrapper = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
    it('does render the form when the resource is a received share and re-sharing is enabled', () => {
      const resource = mockDeep<Resource>({ isReceivedShare: () => true, canShare: () => true })
      const wrapper = getWrapper({ resource })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeTruthy()
    })
    it('does not render the form when the resource is a received share and re-sharing is disabled', () => {
      const resource = mockDeep<Resource>({ isReceivedShare: () => true, canShare: () => true })
      const wrapper = getWrapper({ resource, hasReSharing: false })
      expect(wrapper.find('invite-collaborator-form-stub').exists()).toBeFalsy()
    })
  })

  describe('collaborators present', () => {
    it('renders sharedWithLabel and sharee list', () => {
      const wrapper = getWrapper({ collaborators })
      expect(wrapper.find('#files-collaborators-list').exists()).toBeTruthy()
      expect(wrapper.findAll('#files-collaborators-list li').length).toBe(collaborators.length)
      expect(wrapper).toMatchSnapshot()
    })
    it('reacts on delete events by collaborator list items', async () => {
      const spyOnCollaboratorDeleteTrigger = jest
        .spyOn((FileShares as any).methods, '$_ocCollaborators_deleteShare_trigger')
        .mockImplementation()
      const wrapper = getWrapper({ collaborators })
      wrapper.find('collaborator-list-item-stub').vm.$emit('onDelete')
      await wrapper.vm.$nextTick()
      expect(spyOnCollaboratorDeleteTrigger).toHaveBeenCalledTimes(1)
    })
    it('correctly passes the shared parent route to the collaborator list item', () => {
      const collaborator = { ...collaborators[0], indirect: true }
      const sharesTree = { [collaborator.path]: {} }
      const wrapper = getWrapper({ collaborators: [collaborator], sharesTree })
      expect(wrapper.find('collaborator-list-item-stub').props().sharedParentRoute).toBeDefined()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('current space', () => {
    it('loads space members if a space is given and the current user is member', () => {
      const user = { id: '1' }
      const space = mockDeep<SpaceResource>({ driveType: 'project' })
      const spaceMembers = [{ collaborator: { name: user.id } }, { collaborator: { name: '2' } }]
      const collaborator = {
        ...collaborators[0],
        collaborator: { ...collaborators[0].collaborator, name: user.id }
      }
      const wrapper = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#space-collaborators-list').exists()).toBeTruthy()
      expect(wrapper.findAll('#space-collaborators-list li').length).toBe(spaceMembers.length)
      expect(wrapper).toMatchSnapshot()
    })
    it('does not load space members if a space is given but the current user not a member', () => {
      const user = { id: '1' }
      const space = mockDeep<SpaceResource>({ driveType: 'project' })
      const spaceMembers = [{ collaborator: { name: `${user}-2` } }]
      const collaborator = {
        ...collaborators[0],
        collaborator: { ...collaborators[0].collaborator, name: user.id }
      }
      const wrapper = getWrapper({ space, collaborators: [collaborator], user, spaceMembers })
      expect(wrapper.find('#space-collaborators-list').exists()).toBeFalsy()
    })
  })
})

function getWrapper({
  resource = mockDeep<Resource>({ isReceivedShare: () => false, canShare: () => true }),
  hasReSharing = true,
  space = mockDeep<SpaceResource>(),
  collaborators = [],
  sharesTree = {},
  spaceMembers = [],
  user = { id: '1' }
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: { user },
    getters: {
      ...defaultStoreMockOptions.getters,
      user: () => user,
      capabilities: jest.fn(() => ({
        files_sharing: { resharing: hasReSharing }
      })),
      configuration: jest.fn(() => ({
        options: { sidebar: { shares: { showAllOnLoad: true } } }
      }))
    }
  }
  storeOptions.modules.Files.state.sharesTree = sharesTree
  storeOptions.modules.runtime.modules.spaces.getters.spaceMembers.mockImplementation(
    () => spaceMembers
  )
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => resource)
  storeOptions.modules.Files.getters.currentFileOutgoingCollaborators.mockImplementation(
    () => collaborators
  )
  const store = new Vuex.Store(storeOptions)
  return shallowMount(FileShares, {
    localVue,
    provide: {
      incomingParentShare: {}
    },
    store,
    stubs: {
      ...defaultStubs,
      'oc-button': true,
      'invite-collaborator-form': true,
      'collaborator-list-item': true
    },
    propsData: { space },
    mocks: defaultComponentMocks()
  })
}
