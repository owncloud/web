import MembersPanel from '../../../../../src/components/Spaces/SideBar/MembersPanel.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'

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
  it('should render all members accordingly to their role assignments', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should filter members accordingly to the entered search term', async () => {
    const userToFilterFor = spaceMock.spaceRoles.editor[0]
    const { wrapper } = getWrapper()
    wrapper.vm.filterTerm = 'ein'
    await wrapper.vm.$nextTick
    expect(wrapper.findAll(selectors.membersRolePanelStub).length).toBe(1)
    expect(
      wrapper.findComponent<any>(selectors.membersRolePanelStub).props().members[0].displayName
    ).toEqual(userToFilterFor.displayName)
  })
  it('should display an empty result if no matching members found', async () => {
    const { wrapper } = getWrapper()
    wrapper.vm.filterTerm = 'no-match'
    await wrapper.vm.$nextTick
    expect(wrapper.findAll(selectors.membersRolePanelStub).length).toBe(0)
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper({ spaceResource = spaceMock } = {}) {
  return {
    wrapper: shallowMount(MembersPanel, {
      global: {
        plugins: [...defaultPlugins()],
        provide: { resource: spaceResource }
      }
    })
  }
}
