import SpaceDetails from 'web-pkg/src/components/sideBar/Details/SpaceDetails.vue'
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
  spaceQuota: {
    used: 100,
    total: 1000
  }
}

const spaceShare = {
  id: '1',
  shareType: ShareTypes.space.value,
  collaborator: {
    onPremisesSamAccountName: 'Alice',
    displayName: 'alice'
  },
  role: {
    name: spaceRoleManager.name
  }
}

describe('Details SideBar Panel', () => {
  it('displays the details side panel', () => {
    const { wrapper } = createWrapper(spaceMock)
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function createWrapper(spaceResource) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockImplementation(() => ({ id: 'marie' }))
  storeOptions.modules.runtime.modules.spaces.getters.spaceMembers.mockImplementation(() => [
    spaceShare
  ])
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => spaceResource)
  storeOptions.modules.Files.getters.currentFileOutgoingCollaborators.mockImplementation(() => [
    spaceShare
  ])
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(SpaceDetails, {
      global: {
        plugins: [...defaultPlugins(), store],
        directives: {
          OcTooltip: jest.fn()
        },
        provide: {
          displayedItem: spaceResource
        }
      }
    })
  }
}
