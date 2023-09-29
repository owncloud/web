import SharedWithMe from '../../../../src/views/shares/SharedWithMe.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { useSort } from '@ownclouders/web-pkg'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { ref } from 'vue'
import { defaultStubs, RouteLocation } from 'web-test-helpers'
import { useSortMock } from 'web-app-files/tests/mocks/useSortMock'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
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
  describe('sections', () => {
    it('always shows the "accepted"- and "declined"-sections', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('#files-shared-with-me-accepted-section').exists()).toBeTruthy()
      expect(wrapper.find('#files-shared-with-me-declined-section').exists()).toBeTruthy()
    })
    describe('pending', () => {
      it('shows when a share is pending', () => {
        const { wrapper } = getMountedWrapper({
          files: [mockDeep<Resource>({ status: ShareStatus.pending })]
        })
        expect(wrapper.find('#files-shared-with-me-pending-section').exists()).toBeTruthy()
      })
      it('does not show when no share is pending', () => {
        const { wrapper } = getMountedWrapper({
          files: [mockDeep<Resource>({ status: ShareStatus.accepted })]
        })
        expect(wrapper.find('#files-shared-with-me-pending-section').exists()).toBeFalsy()
      })
    })
    describe('accepted', () => {
      it('shows an accepted share', () => {
        const { wrapper } = getMountedWrapper({
          files: [mockDeep<Resource>({ status: ShareStatus.accepted })]
        })
        expect(wrapper.find('#files-shared-with-me-accepted-section').exists()).toBeTruthy()
        expect(
          wrapper.findComponent<any>('#files-shared-with-me-accepted-section').props().items.length
        ).toEqual(1)
      })
    })
    describe('declined', () => {
      it('shows a declined share', async () => {
        const { wrapper } = getMountedWrapper({
          files: [mockDeep<Resource>({ status: ShareStatus.declined })]
        })
        await wrapper.vm.loadResourcesTask.last
        expect(wrapper.find('#files-shared-with-me-declined-section').exists()).toBeTruthy()
        expect(
          wrapper.findComponent<any>('#files-shared-with-me-declined-section').props().items.length
        ).toEqual(1)
      })
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
        stubs: defaultStubs
      }
    })
  }
}
