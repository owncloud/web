import { shallowMount } from '@vue/test-utils'
import stubs from '../../../../../../tests/unit/stubs/index.js'
import NoContentMessage from '../../../../src/components/FilesList/NoContentMessage.vue'

describe('NoContentMessage', () => {
  function getWrapper(slots = {}) {
    return shallowMount(NoContentMessage, {
      slots: slots,
      propsData: { icon: 'mdi-test-icon' },
      stubs: stubs
    })
  }

  describe('icon prop', () => {
    it('should render the provided icon', () => {
      const wrapper = getWrapper()

      const iconEl = wrapper.find('oc-icon-stub')
      expect(iconEl.exists()).toBeTruthy()
      expect(iconEl.attributes().name).toBe('mdi-test-icon')
    })
  })

  describe('named slots', () => {
    it('should render slot html for message', () => {
      const wrapper = getWrapper({
        message: `
        <p class="test message">This is a test message</p>
        `
      })
      const messageDiv = wrapper.findAll('.oc-text-muted').at(0)
      const slotEl = messageDiv.find('p')

      expect(messageDiv.exists()).toBeTruthy()
      expect(slotEl.exists()).toBeTruthy()
      expect(slotEl.attributes().class).toBe('test message')
      expect(slotEl.text()).toBe('This is a test message')
    })

    it('should render slot html for callToAction', () => {
      const wrapper = getWrapper({
        callToAction: `
        <button class="test action">Click here</button>
        `
      })
      const actionDiv = wrapper.findAll('.oc-text-muted').at(1)
      const slotEl = actionDiv.find('button')

      expect(slotEl.exists()).toBeTruthy()
      expect(slotEl.attributes().class).toBe('test action')
      expect(slotEl.text()).toBe('Click here')
    })
  })
})
