import { shallowMount } from '@vue/test-utils'
import AllTokens from './_DocsAllTokens.vue'

describe('AllTokens.vue', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.find('.token').exists()).toStrictEqual(true)
  })

  it('should render multiple tokens', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.findAll('.token').length).toBeGreaterThan(10)
  })

  it('should create code elements for copy pasting', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.find('code.name').exists()).toStrictEqual(true)
  })

  it('should create code elements with original values', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.find('code.type').exists()).toStrictEqual(true)
  })

  it('should create examples of usage', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.find('.example').exists()).toStrictEqual(true)
  })

  it('should apply inline styles', () => {
    const wrapper = shallowMount(AllTokens)

    expect(wrapper.find('.example.color').exists()).toStrictEqual(true)
  })
})
