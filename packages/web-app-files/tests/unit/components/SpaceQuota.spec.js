import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import SpaceQuota from '@files/src/components/SpaceQuota'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('SpaceQuota component', () => {
  it('renders the space storage quota label', () => {
    const wrapper = getWrapper({ total: 10, used: 1, state: 'normal' })
    expect(wrapper.find('.space-quota').exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
  it.each([
    { state: 'normal', expectedVariation: 'primary' },
    { state: 'nearing', expectedVariation: 'warning' },
    { state: 'critical', expectedVariation: 'warning' },
    { state: 'exceeded', expectedVariation: 'danger' }
  ])('renders the progress variant correctly', (dataSet) => {
    const wrapper = getWrapper({ total: 10, used: 1, state: dataSet.state })
    const progressBar = wrapper.find('.space-quota oc-progress-stub')
    expect(progressBar.exists()).toBeTruthy()
    expect(progressBar.props().variation).toBe(dataSet.expectedVariation)
  })
})

function getWrapper(spaceQuota) {
  return shallowMount(SpaceQuota, {
    localVue,
    propsData: {
      spaceQuota
    }
  })
}
