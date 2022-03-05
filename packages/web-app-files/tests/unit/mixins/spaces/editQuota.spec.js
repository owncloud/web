import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import EditQuota from '@files/src/mixins/spaces/actions/editQuota.js'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [EditQuota]
}

describe('editQuota', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [] })).toBe(false)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue
  })
}
