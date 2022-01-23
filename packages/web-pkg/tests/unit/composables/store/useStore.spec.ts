import { useStore } from 'web-pkg/src/composables'
import { createWrapper } from './spec'
import { Store } from 'vuex'

describe('useStore', () => {
  it('should be valid', () => {
    expect(useStore).toBeDefined()

    createWrapper(() => {
      expect(useStore()).toBeInstanceOf(Store)
    })
  })

  it('behaves like Vuex', () => {
    createWrapper(() => {
      const store = useStore()

      expect(store.state.value).toBe(0)

      store.commit('UPDATE', 1)
      expect(store.state.value).toBe(1)

      store.dispatch('update', 2)
      expect(store.state.value).toBe(2)

      store.dispatch('reset')
      expect(store.state.value).toBe(0)
    }).destroy()
  })
})
