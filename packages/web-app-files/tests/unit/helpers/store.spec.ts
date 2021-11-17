import { mount } from '@vue/test-utils'
import { cloneStateObject, useMutationObserver } from '../../../src/helpers/store'
import { localVue } from '../views/views.setup'
import Vuex from 'vuex'

describe('cloneStateObject', () => {
  it('clones object', () => {
    const og = { id: '1', frozen: 'value' }
    const cloned = cloneStateObject(og)

    cloned.frozen = 'updated'

    expect(og.id).toBe('1')
    expect(og.frozen).toBe('value')
    expect(cloned.id).toBe('1')
    expect(cloned.frozen).toBe('updated')
  })
})

describe('useMutationObserver', () => {
  const store = new Vuex.Store({
    state: {
      value: 0
    },
    mutations: {
      UPDATE(state, value) {
        state.value = value
      }
    }
  })
  const callback = jest.fn()
  const component = {
    template: '<div></div>',
    setup() {
      useMutationObserver(['UPDATE'], callback)
      return {
        uid: 'dummy'
      }
    }
  }
  const wrapper = mount(component, {
    localVue,
    store
  })

  it('observes defined store mutations', () => {
    store.commit('UPDATE', 1)

    const { componentInstance, payload } = callback.mock.calls[0][0]
    expect(componentInstance.$data.uid).toBe('dummy')
    expect(callback).toHaveBeenCalledTimes(1)
    expect(payload).toBe(1)
  })

  it('does not observe if instance is unMounted', () => {
    store.commit('UPDATE', 2)

    const { payload } = callback.mock.calls[1][0]
    expect(payload).toBe(2)

    wrapper.destroy()

    store.commit('UPDATE', 3)
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
