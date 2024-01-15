import { shallowMount } from '@vue/test-utils'
import FontSize from './_DocsFontSize.vue'

describe('FontSize.vue', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(FontSize)

    expect(wrapper.find('.font').exists()).toStrictEqual(true)
  })

  it('should render multiple sizes', () => {
    const wrapper = shallowMount(FontSize)

    expect(wrapper.findAll('.font').length).toBeGreaterThan(2)
  })

  it('should create px sizes for copy pasting', () => {
    const wrapper = shallowMount(FontSize)

    expect(wrapper.find('.font span').exists()).toStrictEqual(true)
  })

  it('should create apply inline styles', () => {
    const wrapper = shallowMount(FontSize)

    expect(wrapper.find('.font').attributes()).toHaveProperty('style')
  })
})
