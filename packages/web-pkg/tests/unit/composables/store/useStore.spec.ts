import { useStore } from 'web-pkg/src/composables'
import { Store } from 'vuex'
import { createStore, getComposableWrapper } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

describe('useStore', () => {
  it('should be valid', () => {
    expect(useStore).toBeDefined()

    const store = createStore(defaultStoreMockOptions)
    getComposableWrapper(
      () => {
        expect(useStore()).toBeInstanceOf(Store)
      },
      { store }
    )
  })

  it('behaves like Vuex', () => {
    const storeOptions = {
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
    }
    const store = createStore(storeOptions)
    getComposableWrapper(
      () => {
        const store = useStore()

        expect(store.state.value).toBe(0)

        store.commit('UPDATE', 1)
        expect(store.state.value).toBe(1)

        store.dispatch('update', 2)
        expect(store.state.value).toBe(2)

        store.dispatch('reset')
        expect(store.state.value).toBe(0)
      },
      { store }
    ).destroy()
  })
})
