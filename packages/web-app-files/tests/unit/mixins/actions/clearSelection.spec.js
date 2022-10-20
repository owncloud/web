import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import clearSelection from 'web-app-files/src/mixins/actions/clearSelection.js'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [clearSelection]
}

describe('clearSelection', () => {
  describe('computed property "$_clearSelection_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [], expectedStatus: false },
        { resources: [{ id: 1 }], expectedStatus: true }
      ])('should be set correctly', (inputData) => {
        const wrapper = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_clearSelection_items[0].isEnabled({ resources })).toBe(
          inputData.expectedStatus
        )
      })
    })
  })

  describe('method "$_clearSelection_trigger"', () => {
    it('should trigger "RESET_SELECTION"', async () => {
      const wrapper = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'RESET_SELECTION')
      const resources = [{ id: 1 }]
      await wrapper.vm.$_clearSelection_trigger({ resources })
      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    store: createStore(Vuex.Store, {
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            RESET_SELECTION: jest.fn()
          }
        }
      }
    })
  })
}
