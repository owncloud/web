import MembersRoleSection from '../../../../../src/components/Spaces/SideBar/MembersRoleSection.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { SpaceRole } from '@ownclouders/web-client/src/helpers'

describe('MembersRoleSection', () => {
  it('should render all members accordingly', () => {
    const members = [
      mock<SpaceRole>({ kind: 'user', displayName: 'einstein' }),
      mock<SpaceRole>({ kind: 'group', displayName: 'physic-lovers' })
    ]
    const { wrapper } = getWrapper({ members })
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper({ members = [] } = {}) {
  return {
    wrapper: shallowMount(MembersRoleSection, {
      props: {
        members
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
