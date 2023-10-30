import SharedWithMe from '../../../../src/views/shares/SharedWithMe.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { InlineFilterOption, useSort } from '@ownclouders/web-pkg'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ref } from 'vue'
import { defaultStubs, RouteLocation } from 'web-test-helpers'
import { useSortMock } from 'web-app-files/tests/mocks/useSortMock'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

jest.mock('web-app-files/src/composables')
jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useSort: jest.fn().mockImplementation(() => useSortMock())
}))

describe('SharedWithMe view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('side-bar-stub').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper({ loading: true })
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('does not show the loading spinner after loading finished', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
    })
  })
  describe('filter', () => {
    it('shows the share visibility filter', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('.share-visibility-filter').exists()).toBeTruthy()
      expect(wrapper.find('item-filter-inline-stub').exists()).toBeTruthy()
    })
    it('shows all visible shares', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.findAll('shared-with-me-section-stub').length).toBe(1)
      expect(wrapper.findComponent<any>('shared-with-me-section-stub').props('title')).toEqual(
        'Shares'
      )
    })
    it('shows all hidden shares', async () => {
      const { wrapper } = getMountedWrapper()
      wrapper.vm.setAreHiddenFilesShown(mock<InlineFilterOption>({ name: 'hidden' }))
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('shared-with-me-section-stub').length).toBe(1)
      expect(wrapper.findComponent<any>('shared-with-me-section-stub').props('title')).toEqual(
        'Hidden Shares'
      )
    })
  })
})

function getMountedWrapper({ mocks = {}, loading = false, files = [] } = {}) {
  jest.mocked(useResourcesViewDefaults).mockImplementation(() =>
    useResourcesViewDefaultsMock({
      storeItems: ref(files),
      areResourcesLoading: ref(loading)
    })
  )
  jest.mocked(useSort).mockImplementation((options) => useSortMock({ items: ref(options.items) }))
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-shares-with-me' })
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(SharedWithMe, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        stubs: { ...defaultStubs, itemFilterInline: true }
      }
    })
  }
}
