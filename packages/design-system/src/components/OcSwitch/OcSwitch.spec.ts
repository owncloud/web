import { shallowMount } from '@vue/test-utils'

import Switch from './OcSwitch.vue'

const defaultProps = {
  label: 'Test label'
}

describe('OcSwitch', () => {
  it('can be toggled', async () => {
    const wrapper = shallowMount(Switch, {
      propsData: defaultProps
    })

    await wrapper.find('[data-testid="oc-switch-btn"]').trigger('click')

    expect(wrapper.emitted().change[0][0]).toEqual(true)

    await wrapper.find('[data-testid="oc-switch-btn"]').trigger('click')

    expect(wrapper.emitted().change[0][0]).toEqual(true)
  })
})
