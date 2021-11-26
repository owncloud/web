import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import Delete from '@files/src/mixins/actions/delete.js'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('delete', () => {
  const Component = {
    render() {},
    mixins: [Delete]
  }

  function getWrapper() {
    return mount(Component, {
      localVue,
      mocks: {
        $route: {
          name: 'files-personal'
        },
        $router: []
      }
    })
  }

  describe('computed property "$_delete_items"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canBeDeleted: () => true }], expectedStatus: true },
        { resources: [{ canBeDeleted: () => false }], expectedStatus: false }
      ])('should be set correctly', (inputData) => {
        const wrapper = getWrapper()
        const resources = inputData.resources
        expect(wrapper.vm.$_delete_items[0].isEnabled({ resources })).toBe(inputData.expectedStatus)
      })
    })
  })
})
