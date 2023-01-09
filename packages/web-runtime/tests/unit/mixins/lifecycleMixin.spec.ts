import lifecycleMixin from '../../../src/mixins/lifecycleMixin'
import { mount } from 'web-test-helpers'
import { defineComponent } from 'vue'

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
    expect((emittedComponent as any).$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  // FIXME
  it.skip('handles updated', async () => {
    const { wrapper } = getWrapper()
    const wrapperComponent = wrapper.findComponent({ name: 'DummyComponent' })

    const event = 'updated'
    wrapperComponent.vm.$data.id = event
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect((emittedComponent as any).$el.outerHTML).toBe(wrapperComponent.html())
    expect(emittedEvent).toBe(event)
  })

  it('handles beforeUnmount', async () => {
    const { wrapper } = getWrapper()
    const wrapperComponent = wrapper.findComponent({ name: 'DummyComponent' })

    const event = 'beforeUnmount'
    wrapper.unmount()
    await wrapper.vm.$nextTick()
    const [emittedComponent, emittedEvent] = wrapper.emitted(event)[0]
    expect((emittedComponent as any).$el.outerHTML).toBe(wrapperComponent.element.outerHTML)
    expect(emittedEvent).toBe(event)
  })
})

function getWrapper() {
  return {
    wrapper: mount(Component, {})
  }
}
