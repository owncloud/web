import SpaceDetails from '../../../../../../src/components/SideBar/Spaces/Details/SpaceDetails.vue'
import {
  CollaboratorShare,
  ShareRoleNG,
  GraphShareRoleIdMap
} from '@ownclouders/web-client/src/helpers/share'
import { mock } from 'vitest-mock-extended'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

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
  sharedWith: {
    id: 'Alice',
    displayName: 'alice'
  },
  role: mock<ShareRoleNG>({ id: GraphShareRoleIdMap.SpaceManager })
} as CollaboratorShare

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
  return {
    wrapper: shallowMount(SpaceDetails, {
      props: { ...props },
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              userState: { user: { id: '1', onPremisesSamAccountName: 'marie' } },
              spacesState: { spaceMembers: [spaceShare] },
              sharesState: { collaboratorShares: [spaceShare] }
            }
          })
        ],
        provide: { resource: spaceResource }
      }
    })
  }
}
