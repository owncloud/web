import SpaceDetails from '../../../../../../src/components/SideBar/Spaces/Details/SpaceDetails.vue'
import { spaceRoleManager, ShareTypes } from 'web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceRoles: {
    manager: [{ id: '1', displayName: 'alice' }],
    editor: [],
    viewer: []
  },
  spaceQuota: {
    used: 100,
    total: 1000
  }
}

const spaceShare = {
  id: '1',
  shareType: ShareTypes.spaceUser.value,
  collaborator: {
    onPremisesSamAccountName: 'Alice',
    displayName: 'alice'
  },
  role: {
    name: spaceRoleManager.name
  }
}

const selectors = {
  spaceDefaultImage: '.space-default-image',
  spaceMembers: '.oc-space-details-sidebar-members'
}

describe('Details SideBar Panel', () => {
  it('displays the details side panel', () => {
    const { wrapper } = createWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('does render the space default image if "showSpaceImage" is false', () => {
    const { wrapper } = createWrapper({ props: { showSpaceImage: false } })
    expect(wrapper.find(selectors.spaceDefaultImage).exists()).toBeTruthy()
  })
  it('does not render share indicators if "showShareIndicators" is false', () => {
    const { wrapper } = createWrapper({
      spaceResource: spaceMock,
      props: { showShareIndicators: false }
    })
    expect(wrapper.find(selectors.spaceMembers).exists()).toBeFalsy()
  })
})

function createWrapper({ spaceResource = spaceMock, props = {} } = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockImplementation(() => ({ id: 'marie', uuid: '1' }))
  storeOptions.modules.runtime.modules.spaces.getters.spaceMembers.mockImplementation(() => [
    spaceShare
  ])
  storeOptions.modules.Files.getters.outgoingCollaborators.mockImplementation(() => [spaceShare])
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(SpaceDetails, {
      props: { ...props },
      global: {
        plugins: [...defaultPlugins(), store],
        provide: { resource: spaceResource }
      }
    })
  }
}
