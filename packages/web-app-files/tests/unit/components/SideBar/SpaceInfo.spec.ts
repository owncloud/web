import SpaceInfo from 'web-app-files/src/components/SideBar/SpaceInfo.vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceQuota: {
    used: 100
  }
}

const selectors = {
  name: '[data-testid="space-info-name"]',
  subtitle: '[data-testid="space-info-subtitle"]'
}

describe('SpaceInfo', () => {
  it('shows space info', () => {
    const { wrapper } = createWrapper(spaceMock)
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
    expect(wrapper.find(selectors.subtitle).exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper(spaceResource) {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => spaceResource)
  const store = createStore(storeOptions)

  return {
    wrapper: shallowMount(SpaceInfo, {
      global: {
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
