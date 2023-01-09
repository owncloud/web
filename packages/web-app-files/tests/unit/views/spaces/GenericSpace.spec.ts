import GenericSpace from '../../../../src/views/spaces/GenericSpace.vue'
import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { useResourcesViewDefaultsMock } from 'web-app-files/tests/mocks/useResourcesViewDefaultsMock'
import { ref } from 'vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'

jest.mock('web-app-files/src/composables')

describe('GenericSpace view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('side-bar-stub').exists()).toBeTruthy()
  })
  describe('space header', () => {
    it('does not render the space header in the personal space', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('space-header-stub').exists()).toBeFalsy()
    })
    it('does not render the space header in a nested project space', () => {
      const { wrapper } = getMountedWrapper({
        props: {
          item: '/someFolder',
          space: mock<SpaceResource>({ driveType: 'project' })
        }
      })
      expect(wrapper.find('space-header-stub').exists()).toBeFalsy()
    })
    it('renders the space header on a space frontpage', () => {
      const { wrapper } = getMountedWrapper({
        props: {
          space: mock<SpaceResource>({ driveType: 'project' })
        }
      })
      expect(wrapper.find('space-header-stub').exists()).toBeTruthy()
    })
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
      const { wrapper } = getMountedWrapper({ files: [mock<Resource>()] })
      expect(wrapper.find('.no-content-message').exists()).toBeFalsy()
      expect(wrapper.find('resource-table-stub').exists()).toBeTruthy()
    })
  })
  describe('breadcrumbs', () => {
    it.each([
      { driveType: 'personal', expectedItems: 1 },
      { driveType: 'project', expectedItems: 2 },
      { driveType: 'share', expectedItems: 3 }
    ])('include root item(s)', (data) => {
      const { driveType } = data
      const space = { id: 1, getDriveAliasAndItem: jest.fn(), driveType }
      const { wrapper } = getMountedWrapper({ files: [mockDeep<Resource>()], props: { space } })
      expect(wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs.length).toBe(
        data.expectedItems
      )
    })
    it('include the root item and the current folder', () => {
      const folderName = 'someFolder'
      const { wrapper } = getMountedWrapper({
        files: [mockDeep<Resource>()],
        props: { item: `/${folderName}` }
      })
      expect(wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs.length).toBe(2)
      expect(wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs[1].text).toEqual(
        folderName
      )
    })
    it('omit the "page"-query of the current route', () => {
      const currentRoute = { name: 'files-spaces-generic', path: '/', query: { page: '2' } }
      const { wrapper } = getMountedWrapper({
        files: [mockDeep<Resource>()],
        props: { item: 'someFolder' },
        currentRoute
      })
      const breadCrumbItem = wrapper.findComponent<any>('app-bar-stub').props().breadcrumbs[0]
      expect(breadCrumbItem.to.query.page).toBeUndefined()
    })
  })
  describe('loader task', () => {
    it('re-loads the resources on item change', async () => {
      const loaderSpy = jest.spyOn((GenericSpace as any).methods, 'performLoaderTask')
      const { wrapper } = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(loaderSpy).toHaveBeenCalledTimes(1)
      wrapper.setProps({ item: 'newItem' })
      await wrapper.vm.loadResourcesTask.last
      expect(loaderSpy).toHaveBeenCalledTimes(2)
    })
    it('re-loads the resources on space change', async () => {
      const loaderSpy = jest.spyOn((GenericSpace as any).methods, 'performLoaderTask')
      const { wrapper } = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(loaderSpy).toHaveBeenCalledTimes(1)
      wrapper.setProps({ space: mockDeep<SpaceResource>() })
      await wrapper.vm.loadResourcesTask.last
      expect(loaderSpy).toHaveBeenCalledTimes(2)
    })
  })
})

function getMountedWrapper({
  mocks = {},
  props = {},
  files = [],
  loading = false,
  currentRoute = { name: 'files-spaces-generic', path: '/' }
} = {}) {
  jest.mocked(useResourcesViewDefaults).mockImplementation(() =>
    useResourcesViewDefaultsMock({
      paginatedResources: ref(files),
      areResourcesLoading: ref(loading)
    })
  )
  const defaultMocks = {
    ...defaultComponentMocks({ currentRoute }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const propsData = {
    space: { id: 1, getDriveAliasAndItem: jest.fn(), name: 'Personal space' },
    item: '/',
    ...props
  }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(GenericSpace, {
      props: propsData,
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        stubs: defaultStubs
      }
    })
  }
}
