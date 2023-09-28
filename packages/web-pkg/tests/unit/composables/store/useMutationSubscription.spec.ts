import { MutationPayload } from 'vuex'
import { useMutationSubscription, useStore } from '../../../../src/composables'
import { createStore, getComposableWrapper } from 'web-test-helpers'

describe('subscribeMutation', () => {
  it('should be valid', () => {
    expect(useMutationSubscription).toBeDefined()
    expect(useMutationSubscription).toBeInstanceOf(Function)
  })

  it('subscribes to mutations', () => {
    let mutation: MutationPayload
    let callCount = 0
    const defaultStore = createStore({
      state: {
        value: 0
      },
      mutations: {
        UPDATE(state, value) {
          state.value = value
        }
      },
      actions: {
        update({ commit }, value) {
          commit('UPDATE', value)
        },
        reset({ commit }) {
          commit('UPDATE', 0)
        }
      }
    })
    const wrapper = getComposableWrapper(
      () => {
        useMutationSubscription(['UPDATE'], (callbackMutation) => {
          mutation = callbackMutation
          callCount += 1
        })

        return { store: useStore() }
      },
      { store: defaultStore }
    )

    const { store } = wrapper.vm as any

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

    wrapper.unmount()
  })
})
