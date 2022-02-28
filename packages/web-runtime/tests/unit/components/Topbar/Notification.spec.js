import { config as testConfig, createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { Store } from 'vuex-mock-store'
import Notifications from 'web-runtime/src/components/Topbar/Notifications.vue'
import stubs from '../../../../../../tests/unit/stubs'
import DesignSystem from 'owncloud-design-system'

const testData = {
  selectors: {
    notificationBell: '#oc-notification-bell',
    ocIconStub: 'oc-icon-stub',
    actionButton: '.oc-ml-s',
    resolveNotificationButton: '#resolve-notification-button',
    link: '.oc-width-1-1 > p > a',
    subject: 'h4',
    message: '.oc-text-small'
  },
  notifications: {
    emptyActions: [
      {
        notification_id: 1,
        subject: 'Test',
        message: 'This is a test message',
        actions: []
      }
    ],
    get singleAction() {
      return [
        {
          ...this.emptyActions[0],
          actions: [
            {
              label: 'Test Action'
            }
          ]
        }
      ]
    },
    twoActiveNotifications: [
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
    ],
    linkActions: [
      {
        link: 'http://test.link',
        actions: []
      }
    ]
  }
}
testConfig.showDeprecationWarnings = false

describe('Notification component', () => {
  const { selectors } = testData

  describe('notification bell', () => {
    it('displays notification bell', () => {
      const bell = wrapperShallowMounted({
        $store: notificationStore(testData.notifications.emptyActions)
      }).find(selectors.notificationBell)

      expect(bell.exists()).toBeTruthy()
      expect(bell.find(selectors.ocIconStub).exists()).toBeTruthy()
      expect(bell.find(selectors.ocIconStub).attributes('name')).toBe('notification-3')
      expect(bell.attributes('aria-label')).toBe('Notifications')
    })
  })

  describe('when active notification contains a message', () => {
    const store = notificationStore(testData.notifications.emptyActions)
    const wrapper = wrapperShallowMounted({
      $store: store
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
      const store = notificationStore(testData.notifications.emptyActions)
      const wrapper = wrapperMounted({ $store: store })

      it('does not display the action button', () => {
        expect(wrapper.find(selectors.actionButton).exists()).toBeFalsy()
      })

      it('displays the resolve notification button', () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeTruthy()
      })

      it('dispatches deleteNotification when resolve notification is clicked', () => {
        const resolveNotificationButton = wrapper.find(selectors.resolveNotificationButton)

        expect(resolveNotificationButton.exists()).toBeTruthy()
        resolveNotificationButton.trigger('click')
        expect(store.dispatch).toHaveBeenCalledTimes(1)
        expect(store.dispatch).toHaveBeenCalledWith('deleteNotification', {
          client: wrapper.$client,
          notification: 1
        })
      })
    })

    describe('when active notification action has an action', () => {
      const executeRequest = jest.fn()
      const store = notificationStore(testData.notifications.singleAction)
      const wrapper = wrapperMounted({ $store: store }, { executeRequest })

      it('displays the action button with action label', () => {
        const actionButton = wrapper.find(selectors.actionButton)

        expect(actionButton.exists()).toBeTruthy()
        expect(actionButton.text()).toBe('Test Action')
      })

      it("doesn't display the resolve notification button", () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeFalsy()
      })

      it('calls executeRequest when action button is clicked', async () => {
        const actionButton = wrapper.find(selectors.actionButton)

        await actionButton.trigger('click')
        expect(executeRequest).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('active notifications links', () => {
    it('does not display link if no link is given', () => {
      const store = notificationStore(testData.notifications.emptyActions)
      const wrapper = wrapperShallowMounted({ $store: store })
      const linkButton = wrapper.find(selectors.link)

      expect(linkButton.exists()).toBeFalsy()
    })

    it('displays link if a link is given', () => {
      const store = notificationStore(testData.notifications.linkActions)
      const wrapper = wrapperShallowMounted({ $store: store })
      const linkButton = wrapper.find(selectors.link)

      expect(linkButton.exists()).toBeTruthy()
      expect(linkButton.text()).toBe('http://test.link')
    })
  })

  describe('when active notification has multiple notifications', () => {
    it('displays all notifications from active notifications', () => {
      const wrapper = wrapperShallowMounted({
        $store: notificationStore(testData.notifications.twoActiveNotifications)
      })
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

function wrapperMounted(mocks, mockMethods) {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)

  return mount(Notifications, {
    localVue,
    mocks,
    ...(mockMethods && { methods: mockMethods })
  })
}

function wrapperShallowMounted(mocks) {
  return shallowMount(Notifications, {
    stubs,
    mocks,
    directives: {
      'oc-tooltip': () => {}
    }
  })
}

function notificationStore(activeNotifications) {
  return new Store({
    getters: {
      activeNotifications
    }
  })
}
