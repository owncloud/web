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
const componentStubs = { ...stubs, translate: true, 'oc-button': false }

describe('SizeInfo component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  jest
    .spyOn(SizeInfo.mixins[0].methods, 'getResourceSize')
    .mockImplementation(size => (isNaN(size) ? '?' : size + ' B'))
  const spyResetSelection = jest.spyOn(SizeInfo.methods, 'RESET_SELECTION').mockImplementation()

  describe('when item(s) are selected', () => {
    it('should have 1 selected count and size if one item is selected', () => {
      const store = createStore({ selected: [selectedFiles[0]] })
      const size = selectedFiles[0].size

      const wrapper = createWrapper({
        store
      })
      const translate = wrapper.find('translate-stub')

      expect(translate.exists()).toBeTruthy()
      expect(translate.props().translateN).toEqual(1)
      expect(translate.props().translateParams.amount).toEqual(1)
      expect(translate.props().translateParams.size).toEqual(size + ' B')
      expect(translate.text()).toEqual('%{ amount } selected item - %{ size }')
    })
    it('should have total number and size of multiple selected items', () => {
      const selectedCount = selectedFiles.length
      let totalSize = 0
      selectedFiles.forEach(file => (totalSize += parseInt(file.size, 10)))

      const store = createStore({ selected: selectedFiles })
      const wrapper = createWrapper({
        store
      })
      const translate = wrapper.find('translate-stub')

      expect(translate.exists()).toBeTruthy()
      expect(translate.props().translateN).toEqual(selectedCount)
      expect(translate.props().translateParams.amount).toEqual(selectedCount)
      expect(translate.props().translateParams.size).toEqual(totalSize + ' B')
      expect(translate.text()).toEqual('%{ amount } selected item - %{ size }')
    })
    it('should have selected count but not size if item size is NaN', () => {
      const store = createStore({ selected: [{ path: selectedFiles[0].path }] })

      const wrapper = createWrapper({
        store
      })
      const translate = wrapper.find('translate-stub')

      expect(translate.exists()).toBeTruthy()
      expect(translate.props().translateN).toEqual(1)
      expect(translate.props().translateParams.amount).toEqual(1)
      expect(translate.props().translateParams.size).toBeFalsy()
      expect(translate.text()).toEqual('%{ amount } selected item')
    })
    it('should trigger "RESET_SELECTION" if clear button is clicked', () => {
      const store = createStore({ selected: selectedFiles })
      const wrapper = createWrapper({
        store
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
        state: {
          ...state
        },
        namespaced: true,
        getters: {
          selectedFiles: () => state.selected
        }
      }
    }
  })
}
