import { shallowMount } from '@vue/test-utils'
import Progress from './OcProgress.vue'

describe('OcProgress', () => {
  it('sets correct classes', () => {
    const wrapper = shallowMount(Progress, {
      propsData: {
        value: 3,
        max: 10,
        variation: 'warning',
        size: 'small'
      }
    })

    expect(wrapper.classes()).toContain('oc-progress-small')
    expect(wrapper.classes()).toContain('oc-progress-warning')
    expect(wrapper).toMatchSnapshot()
  })
})
