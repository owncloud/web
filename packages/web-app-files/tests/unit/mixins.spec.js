import Vuex from 'vuex'
import mixins from '../../src/mixins'
import { createLocalVue, mount } from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('mixins', () => {
  describe('checkIfElementExists', () => {
    const Component = {
      render() {}
    }
    const wrapper = mount(Component, {
      localVue,
      mixins: [mixins],
      store: new Vuex.Store({
        modules: {
          Files: {
            namespaced: true,
            getters: {
              files: () => [{ name: 'file1', size: 1220 }, { name: 'file2' }]
            }
          }
        }
      })
    })
    it('should return the first found element if it exists in store files list', () => {
      expect(wrapper.vm.checkIfElementExists({ name: 'file1' })).toMatchObject({ name: 'file1' })
    })
    it('should return the first found element with provided name if it exists in store files list', () => {
      expect(wrapper.vm.checkIfElementExists('file1')).toMatchObject({ name: 'file1' })
    })
    it("should return undefined if the element doesn't exist in store files list", () => {
      expect(wrapper.vm.checkIfElementExists({ name: 'file3' })).toBe(undefined)
    })
  })
})
