import { shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import ViewOptions from 'web-app-files/src/components/AppBar/ViewOptions.vue'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import { useRouteQueryPersisted } from 'web-pkg/src/composables/router'
import { ref } from 'vue'

const localVue = defaultLocalVue()
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
  const store = new Vuex.Store(defaultStoreMockOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: shallowMount(ViewOptions, {
      localVue,
      mocks,
      store
    })
  }
}
