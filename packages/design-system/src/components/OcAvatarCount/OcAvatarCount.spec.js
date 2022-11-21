import { shallowMount } from '@vue/test-utils'

import Count from './OcAvatarCount.vue'

describe('OcAvatarCount', () => {
  it('dynamically calculates font size', () => {
    const wrapper = shallowMount(Count, {
      propsData: {
        size: 100,
        count: 2
      }
    })

    expect(wrapper.element.style.fontSize).toMatch('40px')
    expect(wrapper).toMatchSnapshot()
  })
})
