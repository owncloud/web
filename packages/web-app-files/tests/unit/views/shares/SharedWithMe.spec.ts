import { mount } from '@vue/test-utils'
import SharedWithMe from '../../../../src/views/shares/SharedWithMe.vue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { createStore } from 'vuex-extensions'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import Vuex from 'vuex'
import { files } from '../../../__fixtures__/files'
import { useResourcesViewDefaults, useSort } from 'web-app-files/src/composables'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ShareStatus } from 'web-client/src/helpers/share'
import { computed, Ref, ref } from '@vue/composition-api'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'

jest.mock('web-app-files/src/composables')

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
          files: [{ ...files[1], status: ShareStatus.pending }]
        })
        expect(wrapper.find('#files-shared-with-me-pending-section').exists()).toBeTruthy()
      })
      it('does not show when no share is pending', () => {
        const { wrapper } = getMountedWrapper({
          files: [{ ...files[1], status: ShareStatus.accepted }]
        })
        expect(wrapper.find('#files-shared-with-me-pending-section').exists()).toBeFalsy()
      })
    })
    describe('accepted', () => {
      it('shows an accepted share', () => {
        const { wrapper } = getMountedWrapper({
          files: [{ ...files[1], status: ShareStatus.accepted }]
        })
        expect(wrapper.find('#files-shared-with-me-accepted-section').exists()).toBeTruthy()
        expect(wrapper.find('#files-shared-with-me-accepted-section').props().items.length).toEqual(
          1
        )
      })
    })
    describe('declined', () => {
      it('shows a declined share', async () => {
        const { wrapper } = getMountedWrapper({
          files: [{ ...files[1], status: ShareStatus.declined }]
        })
        await wrapper.vm.loadResourcesTask.last
        expect(wrapper.find('#files-shared-with-me-declined-section').exists()).toBeTruthy()
        expect(wrapper.find('#files-shared-with-me-declined-section').props().items.length).toEqual(
          1
        )
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
  jest.mocked(useSort).mockImplementation((options) => ({
    items: (options.items as Ref).value,
    sortBy: computed(() => 'name'),
    sortDir: undefined,
    handleSort: jest.fn()
  }))
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: { name: 'files-shares-with-me' }
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const localVue = defaultLocalVue({ compositionApi: true })
  const store = createStore(Vuex.Store, storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(SharedWithMe, {
      localVue,
      mocks: defaultMocks,
      store,
      stubs: defaultStubs
    })
  }
}
