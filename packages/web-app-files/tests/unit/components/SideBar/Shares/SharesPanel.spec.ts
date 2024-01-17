import SharesPanel from 'web-app-files/src/components/SideBar/Shares/SharesPanel.vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const ocLoaderStubSelector = 'oc-loader-stub'

describe('SharesPanel', () => {
  describe('when loading is set to true', () => {
    it('should show the oc loader', () => {
      const { wrapper } = getWrapper({ sharesLoading: true })

      expect(wrapper.find(ocLoaderStubSelector).exists()).toBeTruthy()
      expect(wrapper.find(ocLoaderStubSelector).attributes().arialabel).toBe(
        'Loading list of shares'
      )
    })
  })
  describe('when sharesLoading is set to false', () => {
    it('should not show the oc loader', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find('oc-loader-stub').exists()).toBeFalsy()
    })
  })

  function getWrapper({ sharesLoading = false } = {}) {
    const storeOptions = defaultStoreMockOptions
    const store = createStore(storeOptions)
    return {
      wrapper: shallowMount(SharesPanel, {
        global: {
          plugins: [
            ...defaultPlugins({ piniaOptions: { sharesState: { loading: sharesLoading } } }),
            store
          ],
          provide: {
            activePanel: null,
            displayedItem: {},
            displayedSpace: {},
            spaceMembers: { value: [] }
          }
        }
      })
    }
  }
})
