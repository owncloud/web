import ViewOptions from 'web-app-files/src/components/AppBar/ViewOptions.vue'
import { useRouteQueryPersisted } from 'web-pkg/src/composables/router'
import { ref } from 'vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

jest.mock('web-pkg/src/composables/router')
const selectors = {
  pageSizeSelect: 'oc-page-size-stub',
  hiddenFilesSwitch: '[data-testid="files-switch-hidden-files"]',
  fileExtensionsSwitch: '[data-testid="files-switch-files-extensions-files"]'
}

describe('ViewOptions component', () => {
  it('sets the correct initial files page limit', () => {
    const perPage = '100'
    const { wrapper } = getWrapper({ perPage })
    expect(wrapper.find(selectors.pageSizeSelect).props().selected).toBe(perPage)
    expect(wrapper).toMatchSnapshot()
  })
  it('toggles the setting to show/hide hidden files', () => {
    const { wrapper, storeOptions } = getWrapper()
    wrapper.find(selectors.hiddenFilesSwitch).vm.$emit('change', false)
    expect(storeOptions.modules.Files.mutations.SET_HIDDEN_FILES_VISIBILITY).toHaveBeenCalled()
  })
  it('toggles the setting to show/hide file extensions', () => {
    const { wrapper, storeOptions } = getWrapper()
    wrapper.find(selectors.fileExtensionsSwitch).vm.$emit('change', false)
    expect(storeOptions.modules.Files.mutations.SET_FILE_EXTENSIONS_VISIBILITY).toHaveBeenCalled()
  })
})

function getWrapper({ perPage = '100' } = {}) {
  jest.mocked(useRouteQueryPersisted).mockImplementation(() => ref(perPage))

  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(ViewOptions, {
      global: {
        mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
