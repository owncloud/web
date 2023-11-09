import SharedWithOthers from '../../../../src/views/shares/SharedWithOthers.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ref } from 'vue'
import { defaultStubs, RouteLocation } from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'
import { ShareTypes } from '@ownclouders/web-client/src/helpers'
import { useSortMock } from '../../../mocks/useSortMock'

jest.mock('web-app-files/src/composables')
jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useSort: jest.fn().mockImplementation(() => useSortMock()),
  queryItemAsString: jest.fn(),
  useRouteQuery: jest.fn()
}))

describe('SharedWithOthers view', () => {
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
    it('shows the no-content-message after loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('.no-content-message').exists()).toBeTruthy()
    })
    it('shows the files table when files are available', () => {
      const mockedFiles = [mockDeep<Resource>(), mockDeep<Resource>()]
      const { wrapper } = getMountedWrapper({ files: mockedFiles })
      expect(wrapper.find('.no-content-message').exists()).toBeFalsy()
      expect(wrapper.find('resource-table-stub').exists()).toBeTruthy()
      expect(wrapper.findComponent<any>('resource-table-stub').props().resources.length).toEqual(
        mockedFiles.length
      )
    })
  })
  describe('filter', () => {
    describe('share type', () => {
      it('shows filter if more than one share types are present', () => {
        const { wrapper } = getMountedWrapper({
          files: [
            mock<Resource>({ share: { shareType: ShareTypes.user.value } }),
            mock<Resource>({ share: { shareType: ShareTypes.group.value } })
          ]
        })
        expect(wrapper.find('.share-type-filter').exists()).toBeTruthy()
      })
      it('does not show filter if only one share type is present', () => {
        const { wrapper } = getMountedWrapper({
          files: [mock<Resource>({ share: { shareType: ShareTypes.user.value } })]
        })
        expect(wrapper.find('.share-type-filter').exists()).toBeFalsy()
      })
    })
  })
})

function getMountedWrapper({ mocks = {}, files = [], loading = false } = {}) {
  jest.mocked(useResourcesViewDefaults).mockImplementation(() =>
    useResourcesViewDefaultsMock({
      paginatedResources: ref(files),
      areResourcesLoading: ref(loading)
    })
  )
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-shares-with-others' })
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(SharedWithOthers, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        provide: defaultMocks,
        stubs: { ...defaultStubs, ItemFilter: true }
      }
    })
  }
}
