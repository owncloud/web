import GenericTrash from '../../../../src/views/spaces/GenericTrash.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ref } from 'vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'
import { createMockThemeStore } from 'web-test-helpers/src/mocks/pinia'

jest.mock('web-app-files/src/composables')

describe('GenericTrash view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('file-side-bar-stub').exists()).toBeTruthy()
  })
  it('shows the personal space breadcrumb', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs[1].text).toEqual(
      'Personal space'
    )
  })
  it('shows the project space breadcrumb', () => {
    const space = mockDeep<SpaceResource>({ driveType: 'project' })
    const { wrapper } = getMountedWrapper({ props: { space } })
    expect(wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs[1].text).toEqual(
      space.name
    )
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
      const { wrapper } = getMountedWrapper({ files: [mockDeep<Resource>()] })
      expect(wrapper.find('.no-content-message').exists()).toBeFalsy()
      expect(wrapper.find('resource-table-stub').exists()).toBeTruthy()
    })
  })
})

function getMountedWrapper({ mocks = {}, props = {}, files = [], loading = false } = {}) {
  jest.mocked(useResourcesViewDefaults).mockImplementation(() =>
    useResourcesViewDefaultsMock({
      paginatedResources: ref(files),
      areResourcesLoading: ref(loading)
    })
  )
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-trash-generic' })
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const propsData = {
    space: { id: 1, getDriveAliasAndItem: jest.fn(), name: 'Personal space' },
    ...props
  }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(GenericTrash, {
      props: propsData,
      global: {
        plugins: [...defaultPlugins(), store, createMockThemeStore()],
        mocks: defaultMocks,
        stubs: { ...defaultStubs, portal: true }
      }
    })
  }
}
