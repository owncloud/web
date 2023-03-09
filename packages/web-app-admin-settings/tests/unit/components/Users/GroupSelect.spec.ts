import GroupSelect from '../../../../src/components/Users/GroupSelect.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Group } from 'web-client/src/generated'

const groupMock = mock<Group>({ id: '1' })

describe('GroupSelect', () => {
  it('renders the select input', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('emits "selectedOptionChange" on update', () => {
    const group = mock<Group>({ id: '2' })
    const { wrapper } = getWrapper()
    wrapper.vm.onUpdate(group)
    expect(wrapper.emitted().selectedOptionChange).toBeTruthy()
    expect(wrapper.vm.selectedOption).toEqual(group)
  })
})

function getWrapper() {
  return {
    wrapper: shallowMount(GroupSelect, {
      props: {
        selectedGroups: [groupMock],
        groupOptions: [groupMock]
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
