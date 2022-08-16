import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import stubs from 'tests/unit/stubs'
import SizeInfo from '../../../../../src/components/AppBar/SelectedResources/SizeInfo.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'translation.json',
  silent: true
})

const selectedFiles = [
  {
    path: '/folder',
    size: '5'
  },
  {
    path: '/lorem.txt',
    size: '100'
  },
  {
    path: '/sample.pdf',
    size: '200'
  }
]
const componentStubs = { ...stubs, translate: true }

describe('SizeInfo component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when item(s) are selected', () => {
    it.each([
      { selected: [selectedFiles[0]], selectedCount: 1, totalSize: 5 },
      { selected: selectedFiles, selectedCount: 3, totalSize: 305 }
    ])('should have selected count and total size', ({ selected, selectedCount, totalSize }) => {
      const store = createStore({ selected })
      const wrapper = createWrapper({
        store
      })
      const translate = wrapper.find('translate-stub')

      expect(translate.exists()).toBeTruthy()
      expect(translate.props().translateN).toBe(selectedCount)
      expect(translate.props().translateParams.amount).toBe(selectedCount)
      expect(translate.props().translateParams.size).toBe(totalSize + ' B')
      expect(translate.text()).toBe('%{ amount } selected - %{ size }')
    })
    it('should have selected count but not size if item size is NaN', () => {
      const store = createStore({ selected: [{ path: '/some-path', size: NaN }] })

      const wrapper = createWrapper({
        store
      })
      const translate = wrapper.find('translate-stub')

      expect(translate.exists()).toBeTruthy()
      expect(translate.props().translateN).toEqual(1)
      expect(translate.props().translateParams.amount).toEqual(1)
      expect(translate.props().translateParams.size).toBeFalsy()
      expect(translate.text()).toEqual('%{ amount } selected')
    })
    it('should trigger "RESET_SELECTION" if clear button is clicked', () => {
      const spyResetSelection = jest.spyOn(SizeInfo.methods, 'RESET_SELECTION').mockImplementation()
      const store = createStore({ selected: selectedFiles })
      const wrapper = createWrapper({
        store,
        stubs: { ...componentStubs, 'oc-button': false }
      })
      const clearSelectionButton = wrapper.find('button')
      clearSelectionButton.trigger('click')

      expect(spyResetSelection).toHaveBeenCalledTimes(1)
    })
  })
})

function createWrapper(options) {
  return mount(SizeInfo, {
    localVue,
    stubs: componentStubs,
    directives: { 'oc-tooltip': jest.fn() },
    ...options
  })
}

function createStore(state) {
  return new Vuex.Store({
    modules: {
      Files: {
        namespaced: true,
        state: {
          ...state
        },
        getters: {
          selectedFiles: () => state.selected
        }
      }
    }
  })
}
