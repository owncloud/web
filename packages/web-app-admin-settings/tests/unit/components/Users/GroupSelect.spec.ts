import GroupSelect from '../../../../src/components/Users/GroupSelect.vue'
import { defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Group } from '@ownclouders/web-client/graph/generated'

const groupMock = mock<Group>({ id: '1', groupTypes: [] })

describe('GroupSelect', () => {
  it('renders the select input', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('correctly maps the read-only state', () => {
    const groupMock = mock<Group>({ id: '1', groupTypes: ['ReadOnly'] })
    const { wrapper } = getWrapper(groupMock)
    expect(wrapper.vm.selectedOptions[0].readonly).toBeTruthy()
  })
  it('emits "selectedOptionChange" on update', () => {
    const group = mock<Group>({ id: '2', groupTypes: [] })
    const { wrapper } = getWrapper()
    wrapper.vm.onUpdate(group)
    expect(wrapper.emitted().selectedOptionChange).toBeTruthy()
    expect(wrapper.vm.selectedOptions).toEqual(group)
  })
})

function getWrapper(group = groupMock) {
  return {
    wrapper: shallowMount(GroupSelect, {
      props: {
        selectedGroups: [group],
        groupOptions: [group]
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
