import { createLocalVue, shallowMount } from '@vue/test-utils'
import lifecycleMixin from '../../src/mixins/lifecycleMixin'

const localVue = createLocalVue()
localVue.mixin(lifecycleMixin)
const wrapper = shallowMount(
  {
    name: 'dummy',
    data: () => ({
      id: 'dummy'
    }),
    template: '<div v-bind:id="id">{{id}}</div>'
  },
  {
    localVue
  }
)
const wrapperComponent = wrapper.findComponent({ name: 'dummy' })

describe('livecycleMixin', () => {
  it('handles mounted', async () => {
    await wrapper.vm.$nextTick()
    const event = 'mounted'
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  it('handles updated', async () => {
    const event = 'updated'
    wrapperComponent.vm.$data.id = event
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  it('handles beforeDestroy', async () => {
    const event = 'beforeDestroy'
    wrapperComponent.destroy()
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.element.outerHTML)
    expect(emittedEvent).toBe(event)
  })
})
