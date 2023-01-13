import MembersPanel from '../../../../../src/components/Spaces/SideBar/MembersPanel.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'

const spaceMock = mock<SpaceResource>({
  spaceRoles: {
    manager: [{ kind: 'user', displayName: 'admin' }],
    editor: [
      { kind: 'user', displayName: 'einstein' },
      { kind: 'group', displayName: 'physic-haters' }
    ],
    viewer: [{ kind: 'user', displayName: 'marie' }]
  }
})

const selectors = {
  membersRolePanelStub: 'members-role-section-stub'
}

describe('MembersPanel', () => {
  it('should render all members accordingly', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should filter members accordingly', async () => {
    const userToFilterFor = spaceMock.spaceRoles.editor[0]
    const { wrapper } = getWrapper()
    wrapper.vm.filterTerm = 'ein'
    await wrapper.vm.$nextTick
    expect(wrapper.findAll(selectors.membersRolePanelStub).length).toBe(1)
    expect(
      wrapper.findComponent<any>(selectors.membersRolePanelStub).props().members[0].displayName
    ).toEqual(userToFilterFor.displayName)
  })
})

function getWrapper({ spaceResource = spaceMock } = {}) {
  return {
    wrapper: shallowMount(MembersPanel, {
      props: {
        spaceResource
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
