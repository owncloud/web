import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import CompareSaveDialog from '../../../../src/components/sidebar/CompareSaveDialog.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('CompareSaveDialog', () => {
  describe('computed method "unsavedChanges"', () => {
    it('should be false if objects are equal', () => {
      const wrapper = getWrapper({
        propsData: {
          originalObject: { id: '1', displayName: 'jan' },
          compareObject: { id: '1', displayName: 'jan' }
        }
      })
      expect(wrapper.vm.unsavedChanges).toBeFalsy()
    })

    it('should be true if objects are not equal', () => {
      const wrapper = getWrapper({
        propsData: {
          originalObject: { id: '1', displayName: 'jan' },
          compareObject: { id: '1', displayName: 'janina' }
        }
      })
      expect(wrapper.vm.unsavedChanges).toBeTruthy()
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return mount(CompareSaveDialog, {
    localVue,
    directives: {
      translate: jest.fn()
    },
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    propsData: {
      originalObject: {},
      compareObject: {},
      ...propsData
    },
    stubs: {
      'oc-button': true,
      translate: true
    }
  })
}
