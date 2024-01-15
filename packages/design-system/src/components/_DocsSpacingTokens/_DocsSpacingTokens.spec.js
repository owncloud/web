import { shallowMount } from '@vue/test-utils'
import SpacingTokens from './_DocsSpacingTokens.vue'

describe('SpacingTokens.vue', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(SpacingTokens)

    expect(wrapper.find('.space').exists()).toStrictEqual(true)
  })

  it('should render multiple sizes', () => {
    const wrapper = shallowMount(SpacingTokens)

    expect(wrapper.findAll('.space').length).toBeGreaterThan(2)
  })

  it('should create px sizes for copy pasting', () => {
    const wrapper = shallowMount(SpacingTokens)

    expect(wrapper.find('.space span').exists()).toStrictEqual(true)
  })

  it('should create apply inline styles', () => {
    const wrapper = shallowMount(SpacingTokens)

    expect(wrapper.find('.space').attributes()).toHaveProperty('style')
  })
})
