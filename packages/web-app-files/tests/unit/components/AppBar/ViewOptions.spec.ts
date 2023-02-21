import ViewOptions from 'web-app-files/src/components/AppBar/ViewOptions.vue'
import { useRouteQueryPersisted } from 'web-pkg/src/composables/router'
import { ref } from 'vue'
import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultComponentMocks,
  mount
} from 'web-test-helpers'
import { ViewModeConstants } from 'web-app-files/src/composables'

jest.mock('web-pkg/src/composables/router')
const selectors = {
  pageSizeSelect: '.oc-page-size',
  hiddenFilesSwitch: '[data-testid="files-switch-hidden-files"]',
  fileExtensionsSwitch: '[data-testid="files-switch-files-extensions-files"]',
  viewModeSwitchBtns: '.viewmode-switch-buttons',
  tileSizeSlider: '[data-testid="files-tiles-size-slider"]'
}

describe('ViewOptions component', () => {
  it('sets the correct initial files page limit', () => {
    const perPage = '100'
    const { wrapper } = getWrapper({ perPage })
    expect(wrapper.findComponent<any>(selectors.pageSizeSelect).props().selected).toBe(perPage)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('toggles the setting to show/hide hidden files', () => {
    const { wrapper, storeOptions } = getWrapper()
    ;(wrapper.findComponent<any>(selectors.hiddenFilesSwitch).vm as any).$emit(
      'update:checked',
      false
    )
    expect(storeOptions.modules.Files.mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
  })
  it('toggles the setting to show/hide file extensions', () => {
    const { wrapper, storeOptions } = getWrapper()
    ;(wrapper.findComponent<any>(selectors.fileExtensionsSwitch).vm as any).$emit(
      'update:checked',
      false
    )
    expect(storeOptions.modules.Files.mutations.SET_FILE_EXTENSIONS_VISIBILITY).toHaveBeenCalled()
  })
  describe('view mode switcher', () => {
    it('does not show initially', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.viewModeSwitchBtns).exists()).toBeFalsy()
    })
    it('shows if more than one viewModes are passed', () => {
      const { wrapper } = getWrapper({
        props: { viewModes: [ViewModeConstants.condensedTable, ViewModeConstants.default] }
      })
      expect(wrapper.find(selectors.viewModeSwitchBtns).exists()).toBeTruthy()
    })
  })
  describe('tile resize slider', () => {
    it('does not show initially', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.tileSizeSlider).exists()).toBeFalsy()
    })
    it('shows if viewModes are given and currentViewMode is "resource-tiles"', async () => {
      const { wrapper } = getWrapper({
        props: { viewModes: [ViewModeConstants.tilesView] },
        currentViewMode: 'resource-tiles'
      })

      expect(wrapper.find(selectors.tileSizeSlider).exists()).toBeTruthy()
    })
  })
})

function getWrapper({ perPage = '100', currentViewMode = '', props = {} } = {}) {
  jest.mocked(useRouteQueryPersisted).mockImplementation(() => ref(perPage))

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = { ...defaultComponentMocks(), viewModeCurrent: currentViewMode }
  return {
    storeOptions,
    mocks,
    wrapper: mount(ViewOptions, {
      props: { ...props },
      global: {
        mocks,
        stubs: { OcButton: true, OcPageSize: false, OcSelect: true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
