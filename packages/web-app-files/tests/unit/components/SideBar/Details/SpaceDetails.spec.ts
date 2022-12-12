import SpaceDetails from '../../../../../src/components/SideBar/Details/SpaceDetails.vue'
import stubs from '../../../../../../../tests/unit/stubs'
import { spaceRoleManager, ShareTypes } from 'web-client/src/helpers/share'
import { createStore, defaultPlugins, shallowMount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

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
    expect(wrapper).toMatchSnapshot()
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
        stubs,
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
