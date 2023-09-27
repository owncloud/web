import SpaceQuota from '@ownclouders/web-pkg/src/components/SpaceQuota.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('SpaceQuota component', () => {
  it('renders the space storage quota label', () => {
    const { wrapper } = getWrapper({ total: 10, used: 1, state: 'normal' })
    expect(wrapper.find('.space-quota').exists()).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it.each([
    { state: 'normal', expectedVariation: 'primary' },
    { state: 'nearing', expectedVariation: 'warning' },
    { state: 'critical', expectedVariation: 'warning' },
    { state: 'exceeded', expectedVariation: 'danger' }
  ])('renders the progress variant correctly', (dataSet) => {
    const { wrapper } = getWrapper({ total: 10, used: 1, state: dataSet.state })
    const progressBar = wrapper.findComponent<any>('.space-quota oc-progress-stub')
    expect(progressBar.exists()).toBeTruthy()
    expect(progressBar.props().variation).toBe(dataSet.expectedVariation)
  })
})

function getWrapper(spaceQuota) {
  return {
    wrapper: shallowMount(SpaceQuota, {
      props: {
        spaceQuota
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
