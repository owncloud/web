import { ref } from 'vue'
import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultComponentMocks,
  mount,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import ViewOptions from '../../../src/components/ViewOptions.vue'
import { ViewModeConstants, useRouteQuery, useRouteQueryPersisted } from '../../../src/composables'

jest.mock('../../../src/composables/router', () => ({
  ...jest.requireActual('../../../src/composables/router'),
  useRouteQueryPersisted: jest.fn(),
  useRouteQuery: jest.fn()
}))

const selectors = {
  pageSizeSelect: '.oc-page-size',
  hiddenFilesSwitch: '[data-testid="files-switch-hidden-files"]',
  fileExtensionsSwitch: '[data-testid="files-switch-files-extensions-files"]',
  viewModeSwitchBtns: '.viewmode-switch-buttons',
  tileSizeSlider: '[data-testid="files-tiles-size-slider"]'
}

describe('ViewOptions component', () => {
  describe('pagination', () => {
    it('does not show when disabled', () => {
      const { wrapper } = getWrapper({ props: { hasPagination: false } })
      expect(wrapper.find(selectors.pageSizeSelect).exists()).toBeFalsy()
    })
    it('sets the correct initial files page limit', () => {
      const perPage = '100'
      const { wrapper } = getWrapper({ perPage })
      expect(wrapper.findComponent<any>(selectors.pageSizeSelect).props().selected).toBe(perPage)
    })
    it('sets the correct files page limit', () => {
      const perPage = '100'
      const newItemsPerPage = '500'
      const { wrapper, mocks } = getWrapper({ perPage })
      wrapper.vm.setItemsPerPage(newItemsPerPage)
      expect(mocks.$router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ 'items-per-page': newItemsPerPage })
        })
      )
    })
    it('resets the page to 1 if current page is > 1', () => {
      const perPage = '100'
      const newItemsPerPage = '500'
      const { wrapper, mocks } = getWrapper({ perPage, currentPage: '2' })
      wrapper.vm.setItemsPerPage(newItemsPerPage)
      expect(mocks.$router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ 'items-per-page': newItemsPerPage, page: '1' })
        })
      )
    })
  })
  describe('hidden files toggle', () => {
    it('does not show when disabled', () => {
      const { wrapper } = getWrapper({ props: { hasHiddenFiles: false } })
      expect(wrapper.find(selectors.hiddenFilesSwitch).exists()).toBeFalsy()
    })
    it('toggles the setting to show/hide hidden files', () => {
      const { wrapper, storeOptions } = getWrapper()
      ;(wrapper.findComponent<any>(selectors.hiddenFilesSwitch).vm as any).$emit(
        'update:checked',
        false
      )
      expect(storeOptions.modules.Files.mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
    })
  })
  describe('file extension toggle', () => {
    it('does not show when disabled', () => {
      const { wrapper } = getWrapper({ props: { hasFileExtensions: false } })
      expect(wrapper.find(selectors.fileExtensionsSwitch).exists()).toBeFalsy()
    })
    it('toggles the setting to show/hide file extensions', () => {
      const { wrapper, storeOptions } = getWrapper()
      ;(wrapper.findComponent<any>(selectors.fileExtensionsSwitch).vm as any).$emit(
        'update:checked',
        false
      )
      expect(storeOptions.modules.Files.mutations.SET_FILE_EXTENSIONS_VISIBILITY).toHaveBeenCalled()
    })
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
  describe('tile size slider', () => {
    it('does not show initially', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.tileSizeSlider).exists()).toBeFalsy()
    })
    it('shows if the viewModes include "resource-tiles"', () => {
      const { wrapper } = getWrapper({
        props: { viewModes: [ViewModeConstants.tilesView] }
      })
      expect(wrapper.find(selectors.tileSizeSlider).exists()).toBeTruthy()
    })
    it.each([1, 2, 3, 4, 5, 6])('applies the correct rem size via css', (tileSize) => {
      getWrapper({
        tileSize: tileSize.toString(),
        props: { viewModes: [ViewModeConstants.tilesView] }
      })
      const rootStyle = (document.querySelector(':root') as HTMLElement).style
      expect(rootStyle.getPropertyValue('--oc-size-tiles-resize-step')).toEqual(
        `${tileSize * 10}rem`
      )
    })
  })
})

function getWrapper({
  perPage = '100',
  viewMode = ViewModeConstants.default.name,
  tileSize = '1',
  props = {},
  currentPage = '1'
} = {}) {
  jest.mocked(useRouteQueryPersisted).mockImplementationOnce(() => ref(perPage))
  jest.mocked(useRouteQueryPersisted).mockImplementationOnce(() => ref(viewMode))
  jest.mocked(useRouteQueryPersisted).mockImplementationOnce(() => ref(tileSize))
  jest.mocked(useRouteQuery).mockImplementationOnce(() => ref(currentPage))

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ path: '/files' }) })
  }
  return {
    storeOptions,
    mocks,
    wrapper: mount(ViewOptions, {
      props: { ...props },
      global: {
        mocks,
        provide: mocks,
        stubs: { OcButton: true, OcPageSize: false, OcSelect: true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
