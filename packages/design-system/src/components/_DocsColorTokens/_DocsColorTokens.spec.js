import { shallowMount } from '@vue/test-utils'
import ColorTokens from './_DocsColorTokens.vue'

describe('ColorTokens.vue', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(ColorTokens)

    expect(wrapper.find('.color').exists()).toStrictEqual(true)
  })

  it('should render multiple colors', () => {
    const wrapper = shallowMount(ColorTokens)

    expect(wrapper.findAll('.color').length).toBeGreaterThan(2)
  })

  it('should create code elements for copy pasting', () => {
    const wrapper = shallowMount(ColorTokens)

    expect(wrapper.find('.color span').exists()).toStrictEqual(true)
  })

  it('should create swatches and apply inline styles', () => {
    const wrapper = shallowMount(ColorTokens)

    console.log(wrapper.find('.color .swatch').attributes())

    expect(wrapper.find('.color .swatch').attributes()).toHaveProperty('style')
  })
})
