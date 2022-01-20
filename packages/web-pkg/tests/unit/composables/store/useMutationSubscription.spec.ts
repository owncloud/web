import { MutationPayload } from 'vuex'
import { useMutationSubscription, useStore } from 'web-pkg/src/composables'
import { createWrapper } from './spec'

describe('subscribeMutation', () => {
  it('should be valid', () => {
    expect(useMutationSubscription).toBeDefined()
    expect(useMutationSubscription).toBeInstanceOf(Function)
  })

  it('subscribes to mutations', () => {
    let mutation: MutationPayload
    let callCount = 0
    const wrapper = createWrapper(() => {
      useMutationSubscription(['UPDATE'], (callbackMutation) => {
        mutation = callbackMutation
        callCount += 1
      })

      return { store: useStore() }
    })
    const { store } = wrapper.vm

    store.commit('UPDATE', 5)
    expect(callCount).toBe(1)
    expect(mutation.payload).toBe(5)
    expect(mutation.type).toBe('UPDATE')

    store.dispatch('update', 10)
    expect(callCount).toBe(2)
    expect(mutation.payload).toBe(10)
    expect(mutation.type).toBe('UPDATE')

    store.dispatch('reset')
    expect(callCount).toBe(3)
    expect(mutation.payload).toBe(0)
    expect(mutation.type).toBe('UPDATE')

    wrapper.destroy()
  })
})
