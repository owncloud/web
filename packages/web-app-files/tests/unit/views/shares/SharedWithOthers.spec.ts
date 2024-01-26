import SharedWithOthers from '../../../../src/views/shares/SharedWithOthers.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ref } from 'vue'
import { defaultStubs, RouteLocation } from 'web-test-helpers'
import { mock, mockDeep } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { defaultPlugins, mount, defaultComponentMocks } from 'web-test-helpers'
import { ShareResource, ShareTypes } from '@ownclouders/web-client/src/helpers'
import { useSortMock } from '../../../mocks/useSortMock'

vi.mock('web-app-files/src/composables')
vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useSort: vi.fn().mockImplementation(() => useSortMock()),
  queryItemAsString: vi.fn(),
  useRouteQuery: vi.fn(),
  useFileActions: vi.fn()
}))

describe('SharedWithOthers view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('file-side-bar-stub').exists()).toBeTruthy()
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
      it('shows filter if multiple share types are present', () => {
        const { wrapper } = getMountedWrapper({
          files: [
            mock<ShareResource>({ share: { shareType: ShareTypes.user.value } }),
            mock<ShareResource>({ share: { shareType: ShareTypes.group.value } })
          ]
        })
        expect(wrapper.find('.share-type-filter').exists()).toBeTruthy()
      })
      it('does not show filter if only one share type is present', () => {
        const { wrapper } = getMountedWrapper({
          files: [mock<ShareResource>({ share: { shareType: ShareTypes.user.value } })]
        })
        expect(wrapper.find('.share-type-filter').exists()).toBeFalsy()
      })
    })
  })
})

function getMountedWrapper({ mocks = {}, files = [], loading = false } = {}) {
  vi.mocked(useResourcesViewDefaults).mockImplementation(() =>
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

  return {
    mocks: defaultMocks,
    wrapper: mount(SharedWithOthers, {
      global: {
        plugins: [...defaultPlugins()],
        mocks: defaultMocks,
        provide: defaultMocks,
        stubs: { ...defaultStubs, ItemFilter: true }
      }
    })
  }
}
