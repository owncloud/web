import { shallowMount } from '@vue/test-utils'
import Tag from './OcTag.vue'

describe('OcTag', () => {
  it('uses correct component when type is specified', () => {
    const wrapper = shallowMount(Tag, {
      propsData: {
        type: 'button'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toMatch('button')
    expect(wrapper).toMatchSnapshot()
  })

  it('emits a click event', async () => {
    const wrapper = shallowMount(Tag, {
      propsData: {
        type: 'a'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted().click).toBeTruthy()
  })
})
