import LoadingIndicator from 'web-pkg/src/components/LoadingIndicator.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

const selectors = {
  loadingIndicator: '#oc-loading-indicator',
  progressStub: 'oc-progress-stub'
}

describe('LoadingIndicator', () => {
  it('should not render when not loading', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.loadingIndicator).exists()).toBeFalsy()
  })
  it('should render when loading', async () => {
    const { wrapper } = getWrapper()
    wrapper.vm.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find(selectors.loadingIndicator).exists()).toBeTruthy()
  })
  describe('indeterminate', () => {
    it('progress bar should be in indeterminate when no progress given', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.isLoading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent<any>(selectors.progressStub).props('indeterminate')).toBeTruthy()
    })
    it('progress bar should not be in indeterminate when progress given', async () => {
      const { wrapper } = getWrapper()
      wrapper.vm.isLoading = true
      wrapper.vm.currentProgress = 50
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent<any>(selectors.progressStub).props('indeterminate')).toBeFalsy()
    })
  })
})

function getWrapper() {
  return {
    wrapper: shallowMount(LoadingIndicator, {
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
