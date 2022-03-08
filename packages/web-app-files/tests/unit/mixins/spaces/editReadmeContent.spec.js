import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import editReadmeContent from '@files/src/mixins/spaces/actions/editReadmeContent.js'
import { buildSpace } from '../../../../src/helpers/resources'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [editReadmeContent]
}
afterEach(() => jest.clearAllMocks())

describe('editReadmeContent', () => {
  describe('isEnabled property', () => {
    it('should be true for space managers', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] },
        special: [{ specialFolder: { name: 'readme' } }]
      }

      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editReadmeContent_items[0].isEnabled({
          resources: [buildSpace(spaceMock)]
        })
      ).toBe(true)
    })
    it('should be false when not resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_editReadmeContent_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when spaceReadmeData does not exist', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] }
      }

      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editReadmeContent_items[0].isEnabled({
          resources: [buildSpace(spaceMock)]
        })
      ).toBe(false)
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['viewer'], grantedTo: [{ user: { id: 1 } }] }] }
      }

      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_editReadmeContent_items[0].isEnabled({
          resources: [buildSpace(spaceMock)]
        })
      ).toBe(false)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    store: new Vuex.Store({
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
