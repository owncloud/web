import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import EditQuota from '@files/src/mixins/spaces/actions/editQuota.js'
import { buildSpace } from '../../../../src/helpers/resources'
import { createStore } from 'vuex-extensions'

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
    it('should be true when the current user is a manager', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        }
      }
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(true)
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = {
        id: '1',
        quota: {},
        root: {
          permissions: [{ roles: ['viewer'], grantedTo: [{ user: { id: 1 } }] }]
        }
      }
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editQuota_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(false)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    store: createStore(Vuex.Store, {
      modules: {
        user: {
          state: {
            id: 'alice',
            uuid: 1
          }
        }
      }
    })
  })
}
