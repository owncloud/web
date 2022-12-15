import lifecycleMixin from '../../../src/mixins/lifecycleMixin'
import { mount } from 'web-test-helpers'
import { defineComponent } from '@vue/composition-api'

const Component = defineComponent({
  name: 'DummyComponent',
  mixins: [lifecycleMixin],
  data: () => ({
    id: 'dummy'
  }),
  template: '<div v-bind:id="id">{{id}}</div>'
})

describe('livecycleMixin', () => {
  it('handles mounted', async () => {
    const { wrapper } = getWrapper()
    const wrapperComponent = wrapper.findComponent({ name: 'DummyComponent' })

    await wrapper.vm.$nextTick()
    const event = 'mounted'
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  it('handles updated', async () => {
    const { wrapper } = getWrapper()
    const wrapperComponent = wrapper.findComponent({ name: 'DummyComponent' })

    const event = 'updated'
    wrapperComponent.vm.$data.id = event
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  it('handles beforeDestroy', async () => {
    const { wrapper } = getWrapper()
    const wrapperComponent = wrapper.findComponent({ name: 'DummyComponent' })

    const event = 'beforeDestroy'
    wrapperComponent.destroy()
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect(emittedComponent.$el.outerHTML).toBe(wrapperComponent.element.outerHTML)
    expect(emittedEvent).toBe(event)
  })
})

function getWrapper() {
  return {
    wrapper: mount(Component, {})
  }
}
