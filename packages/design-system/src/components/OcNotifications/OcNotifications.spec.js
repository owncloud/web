import OcNotifications from './OcNotifications.vue'
import { shallowMount } from '@vue/test-utils'

describe('OcNotifications', () => {
  function getWrapper(options = {}) {
    return shallowMount(OcNotifications, options)
  }
  describe('position prop', () => {
    it('should not allow values other than top-left, top-center, top-right', () => {
      expect(() => {
        getWrapper({
          propsData: { position: 'not-valid' }
        })
      }).toThrow('[Vue warn]: Invalid prop: custom validator check failed for prop "position".')
    })
    it.each(['top-left', 'top-center', 'top-right'])(
      'should set provided position as class for wrapper',
      (position) => {
        const wrapper = getWrapper({
          propsData: { position: position }
        })
        expect(wrapper.attributes('class')).toContain(`oc-notification-${position}`)
      }
    )
  })
  it('should render provided slot html', () => {
    const wrapper = getWrapper({
      slots: {
        default:
          "<oc-notification-message title='test notification title' message='Testing is good.'/>"
      },
      stubs: {
        OcNotificationMessage: true
      }
    })
    const slotEl = wrapper.find('ocnotificationmessage-stub')
    expect(slotEl.exists()).toBeTruthy()
    expect(slotEl.attributes('title')).toBe('test notification title')
    expect(slotEl.attributes('message')).toBe('Testing is good.')
  })
})
