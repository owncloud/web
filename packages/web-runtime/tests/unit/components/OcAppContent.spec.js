import { shallowMount } from '@vue/test-utils'
import OcAppContent from 'web-runtime/src/components/OcAppContent.vue'

const selectors = {
  appContent: '.oc-app-content'
}

describe('OcAppContent component', () => {
  it('should render provided element in the slot', () => {
    const wrapper = getShallowWrapper()
    const appContent = wrapper.find(selectors.appContent)
    const slotEl = appContent.find('p')

    expect(slotEl.exists()).toBeTruthy()
    expect(slotEl.text()).toEqual('Some content')
  })
})

function getShallowWrapper() {
  return shallowMount(OcAppContent, {
    slots: {
      content: '<p>Some content</p>'
    }
  })
}
