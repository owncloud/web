import { config, createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { Store } from 'vuex-mock-store'
import Notifications from 'web-runtime/src/components/Notifications.vue'
import stubs from '../../../../tests/unit/stubs'
import DesignSystem from 'owncloud-design-system'
const localVue = createLocalVue()
localVue.use(DesignSystem)

config.showDeprecationWarnings = false

const selectors = {
  notificationBell: '#oc-notification-bell',
  ocIconStub: 'oc-icon-stub',
  actionButton: '.oc-ml-s',
  resolveNotificationButton: '#resolve-notification-button',
  link: '.uk-link',
  subject: 'h4',
  message: '.uk-text-small'
}

const defaultNotificationData = {
  notification_id: 1,
  subject: 'Test',
  message: 'This is a test message',
  actions: []
}

function getStoreWithActiveNotifications(activeNotifications) {
  return new Store({
    getters: {
      activeNotifications: activeNotifications
    }
  })
}

function getStoreWithEmptyActions() {
  return getStoreWithActiveNotifications([
    {
      ...defaultNotificationData
    }
  ])
}

function getStoreWithSingleAction() {
  return getStoreWithActiveNotifications([
    {
      ...defaultNotificationData,
      actions: [
        {
          label: 'Test Action'
        }
      ]
    }
  ])
}

function getStoreWithTwoActiveNotifications() {
  return getStoreWithActiveNotifications([
    {
      subject: 'First Notification',
      message: 'This is first test message',
      actions: []
    },
    {
      subject: 'Second Notification',
      message: 'This is second test message',
      actions: []
    }
  ])
}

function getStoreWithLinkActions() {
  return getStoreWithActiveNotifications([
    {
      link: 'http://test.link',
      actions: []
    }
  ])
}

describe('Notification component', () => {
  describe('notification bell', () => {
    const store = getStoreWithEmptyActions()
    const mocks = {
      $store: store
    }
    let wrapper
    beforeEach(() => {
      store.reset()
      wrapper = shallowMount(Notifications, { stubs, mocks })
    })
    it('displays notification bell', () => {
      const bell = wrapper.find(selectors.notificationBell)
      expect(bell.exists()).toBeTruthy()
      expect(bell.find(selectors.ocIconStub).exists()).toBeTruthy()
      expect(bell.find(selectors.ocIconStub).attributes('name')).toBe('bell')
      expect(bell.attributes('uk-tooltip')).toBe('Notifications')
      expect(bell.attributes('aria-label')).toBe('Notifications')
    })
  })
  describe('when active notification contains a message', () => {
    const store = getStoreWithEmptyActions()
    const mocks = {
      $store: store
    }
    let wrapper
    beforeEach(() => {
      store.reset()
      wrapper = shallowMount(Notifications, { stubs, mocks })
    })
    it('displays the notification message', () => {
      const messageElement = wrapper.find(selectors.message)
      expect(messageElement.exists()).toBeTruthy()
      expect(messageElement.text()).toBe('This is a test message')
    })
    it('displays the notification subject', () => {
      const subjectElement = wrapper.find(selectors.subject)
      expect(subjectElement.exists()).toBeTruthy()
      expect(subjectElement.text()).toBe('Test')
    })
  })

  describe('active notifications actions', () => {
    describe('when active notification action is empty', () => {
      let wrapper, store
      beforeEach(() => {
        store = getStoreWithEmptyActions()
        const mocks = { $store: store }
        wrapper = mount(Notifications, {
          localVue,
          mocks
        })
        store.reset()
      })
      it('does not displays action button', () => {
        expect(wrapper.find(selectors.actionButton).exists()).toBeFalsy()
      })
      it('displays the resolve notification button', () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeTruthy()
      })
      it('dispatches deleteNotification when resolve notification is clicked', () => {
        const resolveNotificationButton = wrapper.find(selectors.resolveNotificationButton)
        expect(resolveNotificationButton.exists()).toBeTruthy()
        resolveNotificationButton.trigger('click')
        wrapper.vm.$nextTick(() => {
          expect(store.dispatch).toHaveBeenCalledTimes(1)
          expect(store.dispatch).toHaveBeenCalledWith('deleteNotification', {
            client: localVue.prototype.$client,
            notification: 1
          })
        })
      })
    })
    describe('when active notification action has a action', () => {
      let store, wrapper
      const mockMethods = {
        executeRequest: jest.fn(),
        reloadFilesList: jest.fn()
      }
      beforeEach(() => {
        store = getStoreWithSingleAction()
        store.reset()
        const mocks = { $store: store }
        wrapper = mount(Notifications, {
          localVue,
          methods: mockMethods,
          mocks
        })
      })
      it('displays the action button with action label', () => {
        const actionButton = wrapper.find(selectors.actionButton)
        expect(actionButton.exists()).toBeTruthy()
        expect(actionButton.text()).toBe('Test Action')
      })
      it("doesn't displays the resolve notification button", () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeFalsy()
      })
      it('calls executeRequest when action button is clicked', () => {
        const actionButton = wrapper.find(selectors.actionButton)
        actionButton.trigger('click')
        actionButton.vm.$nextTick(() => {
          expect(mockMethods.executeRequest).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
  describe('active notifications links', () => {
    let store
    afterEach(() => {
      store.reset()
    })
    it('does not display link if no link is given', () => {
      store = getStoreWithEmptyActions()
      const mocks = {
        $store: store
      }
      const wrapper = shallowMount(Notifications, { stubs, mocks })
      const linkButton = wrapper.find(selectors.link)
      expect(linkButton.exists()).toBeFalsy()
    })
    it('displays link if a link is given', () => {
      store = getStoreWithLinkActions()
      const mocks = {
        $store: store
      }
      const wrapper = shallowMount(Notifications, { stubs, mocks })
      const linkButton = wrapper.find(selectors.link)
      expect(linkButton.exists()).toBeTruthy()
      expect(linkButton.text()).toBe('http://test.link')
    })
  })
  describe('when active notification has multiple notifications', () => {
    let store, wrapper
    beforeEach(() => {
      store = getStoreWithTwoActiveNotifications()
      store.reset()
      const mocks = {
        $store: store
      }
      wrapper = shallowMount(Notifications, { stubs, mocks })
    })
    it('displays all notifications from active notifications', () => {
      const subject = wrapper.findAll(selectors.subject)
      const message = wrapper.findAll(selectors.message)
      expect(subject.exists()).toBeTruthy()
      expect(message.exists()).toBeTruthy()
      expect(subject).toHaveLength(2)
      expect(message).toHaveLength(2)
      expect(subject.at(0).text()).toBe('First Notification')
      expect(subject.at(1).text()).toBe('Second Notification')
      expect(message.at(0).text()).toBe('This is first test message')
      expect(message.at(1).text()).toBe('This is second test message')
    })
  })
})
