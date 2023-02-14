import SpaceHeader from 'web-app-files/src/components/Spaces/SpaceHeader.vue'
import { buildSpace } from 'web-client/src/helpers'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

describe('SpaceHeader', () => {
  it('should add the "squashed"-class when the sidebar is opened', () => {
    const wrapper = getWrapper({ space: buildSpace({ id: 1 }), sideBarOpen: true })
    expect(wrapper.find('.space-header-squashed').exists()).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe('space image', () => {
    it('should show the default image if no other image is set', () => {
      const wrapper = getWrapper({ space: buildSpace({ id: 1 }) })
      expect(wrapper.find('.space-header-image-default').exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('should show the set image', () => {
      const spaceMock = { spaceImageData: { webDavUrl: '/' } }
      const wrapper = getWrapper({ space: { ...buildSpace({ id: 1 }), ...spaceMock } })
      expect(wrapper.find('.space-header-image-default').exists()).toBeFalsy()
      expect(wrapper.find('.space-header-image img').exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper({ space = {}, sideBarOpen = false }) {
  const mocks = {
    ...defaultComponentMocks(),
    $permissionManager: {
      canEditSpaceQuota: () => true
    }
  }
  const store = createStore(defaultStoreMockOptions)
  return mount(SpaceHeader, {
    props: {
      space,
      sideBarOpen
    },
    global: {
      mocks,
      plugins: [...defaultPlugins(), store],
      stubs: {
        'quota-modal': true
      }
    }
  })
}
