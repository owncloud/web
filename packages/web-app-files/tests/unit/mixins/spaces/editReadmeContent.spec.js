import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import editReadmeContent from '@files/src/mixins/spaces/actions/editReadmeContent.js'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [editReadmeContent]
}
afterEach(() => jest.clearAllMocks())

describe('editReadmeContent', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_editReadmeContent_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when spaceReadmeData does not exist', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editReadmeContent_items[0].isEnabled({
          resources: [{ id: 1 }]
        })
      ).toBe(false)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue
  })
}
